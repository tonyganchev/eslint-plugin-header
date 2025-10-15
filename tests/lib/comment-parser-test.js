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

/* eslint-env mocha */
"use strict";

var assert = require("assert");
var commentParser = require("../../lib/comment-parser");

describe("comment parser", function() {
    it("parses block comments", function() {
        var result = commentParser("/* pass1\n pass2 */  ");
        assert.deepEqual(result, ["block", " pass1\n pass2 "]);
    });

    it("throws an error when a block comment isn't ended", function() {
        assert.throws(function() {
            commentParser("/* fail");
        });
    });

    it("parses line comments", function() {
        var result = commentParser("// pass1\n// pass2\n  ");
        assert.deepEqual(result, ["line", [" pass1", " pass2"]]);
    });
});
