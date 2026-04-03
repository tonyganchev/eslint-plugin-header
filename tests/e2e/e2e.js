/**
 * @file E2E tests for the `header` rule. Contains a collection of smoke tests
 * to verify the basic behavior of the rule across multiple ESLint versions.
 * @copyright Copyright (c) 2026 Tony Ganchev
 * @license MIT
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

    /**
     * Runs the tool and returns the results.
     * @param {string[]} deps Dependencies to install.
     * @param {string[]} args Arguments to pass to the tool.
     * @param {Record<string, string>} env Environment variables to set.
     * @returns {JSON} The results of the tool run.
     * @throws {Error} If the error trown by the tool has no stdout.
     */
    function runTool(deps, args, env) {
        const lockPath = resolve(fixturePath, "pnpm-lock.yaml");

        if (existsSync(lockPath)) {
            unlinkSync(lockPath);
        }
        writeFileSync(resolve(fixturePath, "package.json"),
            JSON.stringify({
                name: "test-project",
                private: true
            }));
        execFileSync("pnpm", ["install", ...deps, tarballPath], {
            cwd: fixturePath,
            shell: true,
            stdio: "inherit",
        });

        let results;
        try {
            execFileSync("pnpm", ["eslint", ...args, "--format=json", "."], {
                cwd: fixturePath,
                encoding: "utf8",
                env: { ...process.env, ...env },
                stdio: ["ignore", "pipe", "pipe"],
                shell: true
            });
            assert.fail("Error expected (lint violation)");
        } catch (error) {
            if (!error.stdout) {
                console.error(error.stderr?.toString());
                throw error;
            }
            const output = error.stdout.toString();
            results = JSON.parse(output);
            // console.log(JSON.stringify(results, null, "    "));
        }
        return results;
    }

    /**
     * Validates that the violation is the expected one.
     * @param {JSON} violation The violation to validate.
     * @param {string} fileName The expected file name.
     * @param {string} errorMessage The expected error message.
     */
    function validateViolation(violation, fileName, errorMessage) {
        assert.strictEqual(violation.filePath, resolve(__dirname, "project", fileName));
        assert.strictEqual(violation.messages.length, 1);
        const msg = violation.messages[0];
        assert.strictEqual(msg.ruleId, "@tony.ganchev/header/header");
        assert.strictEqual(msg.message, errorMessage);
        assert.ok(msg.fix.text, "Fix text exists.");
    }

    const hierarchicalConfigTestCase = [
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
    ];

    for (const { name, deps, args, env } of hierarchicalConfigTestCase) {

        it(`Runs ${name} ${args} and completes with one lint violation`, () => {
            const results = runTool(deps, args, env);

            assert.strictEqual(results.length, 1);

            validateViolation(
                results[0],
                "index.ts",
                "header line does not match expected after this position; expected: 'y Ganchev'");
        });
    }

    const flatConfigTestCases = [
        {
            name: "eslint@9",
            deps: ["eslint@9"],
            args: ["-c", "eslint.config.ts", "--no-config-lookup"],
            env: {}
        },
        {
            name: "eslint@10",
            deps: ["eslint@10"],
            args: ["-c", "eslint.config.ts", "--no-config-lookup"],
            env: {}
        }
    ];

    for (const { name, deps, args, env } of flatConfigTestCases) {

        it(`Runs ${name} ${args} and completes with one lint violation`, () => {
            const results =
                runTool([...deps, "jiti", "@eslint/css", "@eslint/markdown", "@html-eslint/eslint-plugin"], args, env);

            assert.strictEqual(results.length, 4);

            validateViolation(
                results[0],
                "README.md",
                "header line does not match expected after this position; expected: '85 '");

            validateViolation(
                results[1],
                "index.css",
                "header line does not match expected after this position; expected: '85 '");

            validateViolation(
                results[2],
                "index.html",
                "header line does not match expected after this position; expected: '85 '");

            validateViolation(
                results[3],
                "index.ts",
                "header line does not match expected after this position; expected: 'y Ganchev'");
        });
    }

    it("Runs oxlint and completes with one lint violation", () => {
        const lockPath = resolve(fixturePath, "pnpm-lock.yaml");

        if (existsSync(lockPath)) {
            unlinkSync(lockPath);
        }
        writeFileSync(resolve(fixturePath, "package.json"),
            JSON.stringify({
                name: "test-project",
                private: true
            }));

        execFileSync("pnpm", ["install", "oxlint", tarballPath], {
            cwd: fixturePath,
            shell: true,
            stdio: "inherit",
        });

        try {
            execFileSync("pnpm", ["oxlint", ".", "--format", "json"], {
                cwd: fixturePath,
                encoding: "utf8",
                stdio: ["ignore", "pipe", "pipe"],
                shell: true
            });
            assert.fail("Error expected (lint violation)");
        } catch (error) {
            if (!error.stdout) {
                console.error(error.stderr?.toString());
                throw error;
            }
            const output = error.stdout.toString();
            const results = JSON.parse(output);
            assert.strictEqual(results.number_of_files, 2);
            const diagnostics = results.diagnostics;
            assert.strictEqual(diagnostics.length, 1);
            const diag = diagnostics[0];
            assert.strictEqual(diag.code, "@tony.ganchev/header(header)");
            assert.strictEqual(
                diag.message,
                "header line does not match expected after this position; expected: 'y Ganchev'");
            assert.strictEqual(diag.filename, "index.ts");
        }
    });
});
