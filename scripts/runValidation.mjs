/* eslint-env node */
/* global console, process */
// Runs every check this repo has: the Bloom book DOM validator over each book's
// .htm file, then the size/manifest budget check. CI calls this; run it locally
// with `pnpm validate` before pushing.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const collectionsRoot = path.join(repoRoot, "collections");

const findBookHtmFiles = (dir) => {
    const results = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) results.push(...findBookHtmFiles(full));
        else if (/\.htm$/i.test(entry.name)) results.push(full);
    }
    return results;
};

const bookFiles = findBookHtmFiles(collectionsRoot);
if (bookFiles.length === 0) {
    console.error("No .htm book files found under collections/.");
    process.exit(1);
}

let failed = false;
const run = (label, args) => {
    console.log(`\n=== ${label} ===`);
    try {
        execFileSync(process.execPath, args, { stdio: "inherit" });
    } catch {
        failed = true;
    }
};

run("Bloom book DOM validation", [
    path.join(__dirname, "validateBloomBook.mjs"),
    ...bookFiles,
]);
run("Size and manifest check", [path.join(__dirname, "checkSizeBudget.mjs")]);

process.exit(failed ? 1 : 0);
