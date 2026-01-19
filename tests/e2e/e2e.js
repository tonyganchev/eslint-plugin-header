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

const { execSync } = require("child_process");
const assert = require("assert");
const fs = require("fs");
const path = require("path");

describe("E2E", () => {

    const rootDir = path.resolve(__dirname, "../../");
    const fixturePath = path.resolve(__dirname, "project");
    let tarballPath;

    before(() => {
        const packOutput = execSync("npm pack", { cwd: rootDir, encoding: "utf8" }).trim();
        tarballPath = path.resolve(rootDir, packOutput);

        execSync(`npm install ${tarballPath} --no-save`, { cwd: fixturePath });
    });

    after(() => {
        if (fs.existsSync(tarballPath)) {
            fs.unlinkSync(tarballPath);
        };
    });

    for (const [cmdLine, envVars] of [
        ["npx eslint@7 -c .eslintrc.json --no-eslintrc", {}],
        [
            "npx eslint@8 -c .eslintrc.json --no-eslintrc",
            { ESLINT_USE_FLAT_CONFIG: "false" }
        ],
        ["npx eslint@9 -c eslint.config.mjs --no-config-lookup", {}],
        ["npx eslint@10.0.0-rc.0 -c eslint.config.mjs --no-config-lookup", {}]
    ]) {

        it(`ESLint ${cmdLine} completes with errors`, () => {

            let output;
            try {
                // Run npx eslint@8 inside the specific fixture directory We use
                // `--format=json` for easier programmatic assertions.
                execSync(`${cmdLine} --format=json *.js`, {
                    cwd: fixturePath,
                    encoding: "utf8",
                    env: {
                        ...process.env,
                        ...envVars
                    },
                    stdio: ["ignore", "pipe", "pipe"]
                });
                assert.fail("Error expected");
            } catch(error) {
                output = error.stdout.toString();
            }

            let results;
            try {
                results = JSON.parse(output);
            } catch {
                assert.fail("'" + output + "'");
            }

            assert.strictEqual(results.length, 1);
            const indexResult = results[0];
            assert.strictEqual(
                indexResult.filePath,
                path.resolve(fixturePath, "index.js"));
            assert.strictEqual(indexResult.errorCount, 1);
            assert.strictEqual(indexResult.fatalErrorCount, 0);
            assert.strictEqual(indexResult.warningCount, 0);
            assert.strictEqual(indexResult.fixableErrorCount, 1);
            assert.strictEqual(indexResult.fixableWarningCount, 0);
            assert.strictEqual(indexResult.messages.length, 1);
            const msg = indexResult.messages[0];

            assert.strictEqual(msg.ruleId, "@tony.ganchev/header/header");
            assert.strictEqual(msg.severity, 2);
            assert.strictEqual(msg.message,
                "header line does not match expected after this position; "
                    + "expected: y Ganchev");
            assert.strictEqual(msg.line, 2);
            assert.strictEqual(msg.column, 7);
            assert.strictEqual(msg.messageId, "headerLineMismatchAtPos");
            assert.strictEqual(msg.endLine, 2);
            assert.strictEqual(msg.endColumn, 16);
        });
    }
});
