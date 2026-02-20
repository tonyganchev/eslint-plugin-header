/*
 * MIT License
 *
 * Copyright (c) 2025-present Tony Ganchev and contributors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the “Software”), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

"use strict";

const assert = require("node:assert");
const { execFileSync } = require("node:child_process");
const { existsSync, renameSync, unlinkSync, writeFileSync } = require("node:fs");
const { resolve } = require("node:path");

describe("E2E", () => {

    const rootDir = resolve(__dirname, "../../");
    const fixturePath = resolve(__dirname, "project");
    const tarballPath = resolve(rootDir, "test-plugin.tgz");

    before(() => {
        const packOutput = execFileSync("pnpm", ["pack", "--json"], {
            cwd: rootDir,
            encoding: "utf8",
            shell: true
        }).trim();
        const outputObj = JSON.parse(packOutput);
        renameSync(resolve(rootDir, outputObj.filename), tarballPath);
    });

    after(() => {
        if (existsSync(tarballPath)) {
            unlinkSync(tarballPath);
        }
    });

    const testCases = [
        {
            name: "eslint@7",
            deps: ["eslint@7"],
            args: ["-c", ".eslintrc.json", "--no-eslintrc"],
            env: {}
        },
        {
            name: "eslint@8",
            deps: ["eslint@8"],
            args: ["-c", ".eslintrc.json", "--no-eslintrc"],
            env: { ESLINT_USE_FLAT_CONFIG: "false" }
        },
        {
            name: "eslint@9",
            deps: ["eslint@9", "jiti"],
            args: ["-c", "eslint.config.ts", "--no-config-lookup"],
            env: {}
        },
        {
            name: "eslint@10",
            deps: ["eslint@10", "jiti"],
            args: ["-c", "eslint.config.ts", "--no-config-lookup"],
            env: {}
        }
    ];

    for (const { name, deps, args, env } of testCases) {

        it(`Runs ${name} ${args} and completes with one lint violation`, () => {
            writeFileSync(resolve(fixturePath, "package.json"),
                JSON.stringify({
                    name: "test-project",
                    private: true
                }));
            execFileSync("pnpm", ["install", ...deps, tarballPath, "--no-frozen-lockfile"], {
                cwd: fixturePath,
                shell: true,
                stdio: "inherit",
            });

            let output;
            try {
                execFileSync("pnpm", ["eslint", ...args, "--format=json", "."], {
                    cwd: fixturePath,
                    encoding: "utf8",
                    env: { ...process.env, ...env },
                    stdio: ["ignore", "pipe", "pipe"],
                    shell: true
                });
                assert.fail("Error expected (lint violation)");
            } catch(error) {
                if (!error.stdout) {
                    console.error(error.stderr?.toString());
                    throw error;
                }
                output = error.stdout.toString();
            }

            const results = JSON.parse(output);
            assert.ok(results.length > 0, "Should have lint results");
        });
    }
});
