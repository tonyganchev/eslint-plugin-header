/**
 * @file Parsing utility for JavaScript comments to get text content and type.
 * @copyright Copyright (c) 2015-present Stuart Knightley and contributors
 * @copyright Copyright (c) 2025-2026 Tony Ganchev
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

/**
 * @import { CommentType, Language } from './rules/header'
 */

/**
 * Parses a line or block comment and returns the type of comment and an array
 * of content lines.
 *
 * This is a really simple and dumb parser, that looks just for a
 * single kind of comment. It won't detect multiple block comments.
 * @param {string} commentText Content to parse.
 * @param {Language} language The language
 * configuration.
 * @returns {[CommentType, string[]]} Comment type and
 * content.
 * @throws {Error} If `commentText` starts with an unrecognized comment token.
 */
module.exports = function commentParser(commentText, language) {
    assert.strictEqual(typeof commentText, "string");
    assert.ok(language);

    const text = commentText.trim();
    const lc = language.lineComment;
    const bc = language.blockComment;

    if (lc && text.startsWith(lc.startDelimiter)) {
        return [
            "line",
            text.split(/\r?\n/).map((line) => line.substring(lc.startDelimiter.length))
        ];
    } else if (bc && text.startsWith(bc.startDelimiter) && text.endsWith(bc.endDelimiter)) {
        return [
            "block",
            text.substring(bc.startDelimiter.length, text.length - bc.endDelimiter.length).split(/\r?\n/)
        ];
    } else {
        throw new Error(
            "Could not parse comment file: the file must contain a comment " +
            "that matches the supplied language delimiters."
        );
    }
};
