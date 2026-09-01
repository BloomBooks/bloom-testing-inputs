/* eslint-env node */
/* global console, process */
// Enforces the size budgets described in README.md so this plain-git repo stays
// clonable without Git LFS. Budgets can be overridden per collection in
// manifest.json ("budgets": { "maxFileBytes", "maxBookFolderBytes" }).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const collectionsRoot = path.join(repoRoot, "collections");

const DEFAULT_MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB
const DEFAULT_MAX_BOOK_FOLDER_BYTES = 50 * 1024 * 1024; // 50 MB

const manifest = JSON.parse(
    fs.readFileSync(path.join(repoRoot, "manifest.json"), "utf8"),
);

const mb = (bytes) => (bytes / (1024 * 1024)).toFixed(1) + " MB";

const walkFiles = (dir) => {
    const results = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) results.push(...walkFiles(full));
        else results.push(full);
    }
    return results;
};

const problems = [];
const collectionNames = fs
    .readdirSync(collectionsRoot, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name);

for (const collectionName of collectionNames) {
    const entry = manifest.collections[collectionName];
    if (!entry) {
        problems.push(
            `collections/${collectionName} has no entry in manifest.json`,
        );
        continue;
    }
    const budgets = entry.budgets ?? {};
    const maxFileBytes = budgets.maxFileBytes ?? DEFAULT_MAX_FILE_BYTES;
    const maxBookFolderBytes =
        budgets.maxBookFolderBytes ?? DEFAULT_MAX_BOOK_FOLDER_BYTES;

    const collectionDir = path.join(collectionsRoot, collectionName);
    for (const entry2 of fs.readdirSync(collectionDir, {
        withFileTypes: true,
    })) {
        const full = path.join(collectionDir, entry2.name);
        const files = entry2.isDirectory() ? walkFiles(full) : [full];
        let folderTotal = 0;
        for (const file of files) {
            const size = fs.statSync(file).size;
            folderTotal += size;
            if (size > maxFileBytes) {
                problems.push(
                    `${path.relative(repoRoot, file)} is ${mb(size)}; the per-file budget is ${mb(maxFileBytes)}`,
                );
            }
        }
        if (entry2.isDirectory() && folderTotal > maxBookFolderBytes) {
            problems.push(
                `${path.relative(repoRoot, full)} totals ${mb(folderTotal)}; the per-book-folder budget is ${mb(maxBookFolderBytes)}`,
            );
        }
    }
}

for (const name of Object.keys(manifest.collections)) {
    if (!collectionNames.includes(name)) {
        problems.push(
            `manifest.json lists "${name}" but collections/${name} does not exist`,
        );
    }
}

if (problems.length > 0) {
    console.error("Size/manifest check failed:");
    for (const p of problems) console.error("  - " + p);
    process.exitCode = 1;
} else {
    console.log(
        `Size/manifest check passed for ${collectionNames.length} collection(s).`,
    );
}
