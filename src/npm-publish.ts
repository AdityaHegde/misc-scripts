#!/usr/bin/env node

import {readFileSync, writeFileSync} from "fs";
import semver from "semver";
import {execSync} from "child_process";

const PACKAGE_JSON_FILE = "./package.json";

const packageJsonString = readFileSync(PACKAGE_JSON_FILE).toString();
const packageJson = JSON.parse(packageJsonString);
const currentVersion = packageJson.version;

const execSyncToStdout = cmd => execSync(cmd, { stdio: "inherit" });

// make sure we have built and test the package
execSyncToStdout(`npm run build`);
execSyncToStdout(`npm test`);
// generate the docs
execSyncToStdout(`npm run docs --if-present`);

// increment the patch
const newVersion = semver.inc(currentVersion, "patch");

console.log(`Updating package version to ${newVersion}`);
writeFileSync(PACKAGE_JSON_FILE, packageJsonString
  .replace(`"version": "${currentVersion}",`, `"version": "${newVersion}",`));

console.log("Pushing updated package.json to git");
execSyncToStdout(`git checkout main`);
execSyncToStdout(`git add -A`);
execSyncToStdout(`git commit`);
execSyncToStdout(`git push origin main`);

console.log("Tagging the version on git");
execSyncToStdout(`git tag -a v${currentVersion} -m "Release v${currentVersion}"`);

console.log("Publishing the package to npm");
execSyncToStdout("npm publish --access public");
