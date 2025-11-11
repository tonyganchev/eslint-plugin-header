/*
 * MIT License
 *
 * Copyright (c) 2015-present Stuart Knightley, Tony Ganchev, and contributors
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

const assert = require("assert");

/**
 * Parses a line or block comment and returns the type of comment and an array
 * of content lines.
 *
 * This is a really simple and dumb parser, that looks just for a
 * single kind of comment. It won't detect multiple block comments.
 * @param {string} commentText comment text.
 * @returns {['block' | 'line', string[]]} comment type and comment content
 *                                         broken into lines.
 */
module.exports = function commentParser(commentText) {
    assert.strictEqual(typeof commentText, "string");
    const text = commentText.trim();

    if (text.startsWith("//")) {
        return [
            "line",
            text.split(/\r?\n/).map((line) => line.substring(2))
        ];
    } else if (text.startsWith("/*") && text.endsWith("*/")) {
        return ["block", text.substring(2, text.length - 2).split(/\r?\n/)];
    } else {
        throw new Error(
            "Could not parse comment file: the file must contain either just line comments (//) or a single block " +
                "comment (/* ... */)");
    }
};
