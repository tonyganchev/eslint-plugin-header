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

/**
 * @typedef {import('eslint').RuleTester.InvalidTestCase} InvalidTestCase
 */

/**
 * Escapes CR and LF characters in strings in order to show a multiline string
 * on a single line.
 * @param {string} str the multiline string to encode.
 * @returns {string} resulting single-line string.
 */
function encodeEols(str) {
    return str.replaceAll("\r\n", "\\r\\n").replaceAll("\n", "\\n");
}

module.exports = {
    /**
     * Generate test case names based on input and output.
     * @param {InvalidTestCase[]} invalidTests test cases to improve.
     * @returns {InvalidTestCase[]} modified input test cases with the names
     *                              modified.
     */
    generateInvalidTestCaseNames: function(invalidTests) {
        let i = 1;
        for (const testCase of invalidTests) {
            testCase.name = "" + i++ + ": " + testCase.errors?.[0]?.message + " - [";
            if (testCase.options?.length > 2 && typeof testCase.options[2] === "number") {
                testCase.name += " " + testCase.options[2];
            }
            const lastOption = testCase.options?.slice(-1)[0];
            if (typeof lastOption === "object" && Object.prototype.hasOwnProperty.call(lastOption, "lineEndings")) {
                testCase.name += " " + lastOption.lineEndings;
            }
            if (
                testCase.options?.length >= 2
                && (
                    typeof testCase.options[1] !== "object"
                    || !Object.prototype.hasOwnProperty.call(testCase.options[1], "lineEndings")
                )
            ) {
                testCase.name += " " + testCase.options[0];
            }
            assert.strictEqual(typeof testCase.code, "string", JSON.stringify(testCase));
            testCase.name += " ] - " + encodeEols(testCase.code);
        }
        return invalidTests;
    }
};
