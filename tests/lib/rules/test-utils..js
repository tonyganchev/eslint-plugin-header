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
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
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

const assert = require("assert");
const { generateInvalidTestCaseNames } = require("../../../lib/rules/test-utils");

/**
 * @typedef {import('eslint').RuleTester.InvalidTestCase} InvalidTestCase
 */
describe("generateInvalidTestCaseNames", () => {
    it("when empty test case list is passed an empty test list is returned", () => {
        assert.deepEqual(generateInvalidTestCaseNames([]), []);
    });
    /**
     * @type {[InvalidTestCase, string][]}
     */
    const testCases = [
        [
            {
                code: "someCode();",
                errors: [
                    { message: "incorrect header" }
                ],
            },
            "incorrect header - [ ] - someCode();"
        ],
        [
            {
                code: "someCode();\nsomeOtherCode();",
                errors: [
                    { message: "incorrect header" }
                ],
            },
            "incorrect header - [ ] - someCode();\\nsomeOtherCode();"
        ],
        [
            {
                code: "someCode();\r\nsomeOtherCode();",
                errors: [
                    { message: "incorrect header" }
                ],
            },
            "incorrect header - [ ] - someCode();\\r\\nsomeOtherCode();"
        ],
        [
            {
                code: "someCode();\nsomeOtherCode();\r\nevenMore(code);\nitIsNotFunny()\npleaseStopIt();\r\niAmSerious();",
                errors: [
                    { message: "incorrect header" }
                ],
            },
            "incorrect header - [ ] - someCode();\\nsomeOtherCode();\\r\\nevenMore(code);\\nitIsNotFunny()\\npleaseStopIt();\\r\\niAmSerious();"
        ],
        [
            {
                code: "someCode();",
                errors: [
                    { message: "incorrect header" }
                ],
                options: ["foo"]
            },
            "incorrect header - [ ] - someCode();"
        ],
        [
            {
                code: "someCode();",
                errors: [
                    { message: "incorrect header" }
                ],
                options: ["header.js", { lineEndings: "windows" }]
            },
            "incorrect header - [ windows ] - someCode();"
        ],
        [
            {
                code: "someCode();",
                errors: [
                    { message: "incorrect header" }
                ],
                options: ["line", ["Copyright 2025", "My Company"], { lineEndings: "unix" }]
            },
            "incorrect header - [ unix line ] - someCode();"
        ],
        [
            {
                code: "someCode();",
                errors: [
                    { message: "missing header" }
                ],
                options: ["line", "Copyright 2025 My Company", 10]
            },
            "missing header - [ 10 line ] - someCode();"
        ],
        [
            {
                code: "someCode();",
                errors: [
                    { message: "missing header" }
                ],
                options: ["line", "Copyright 2025 My Company", 10, { lineEndings: "windows" }]
            },
            "missing header - [ 10 windows line ] - someCode();"
        ],
    ];
    for (const [testCaseDef, expectedName] of testCases) {
        it(expectedName + " is the name for " + JSON.stringify(testCaseDef), () => {
            const modifiedTestCase = generateInvalidTestCaseNames([testCaseDef])[0];
            assert.equal(modifiedTestCase.name, expectedName);
        });
    }
});
