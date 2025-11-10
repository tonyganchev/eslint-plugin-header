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

/**
 * @enum {string}
 */
const lineEndingOptions = Object.freeze({
    os: "os",
    unix: "unix",
    windows: "windows",
});

/**
 * @enum {string}
 */
const commentTypeOptions = Object.freeze({
    block: "block",
    line: "line"
});

const schema = Object.freeze({
    $ref: "#/definitions/options",
    definitions: {
        commentType: {
            type: "string",
            enum: [commentTypeOptions.block, commentTypeOptions.line]
        },
        line: {
            anyOf: [
                {
                    type: "string"
                },
                {
                    type: "object",
                    properties: {
                        pattern: {
                            type: "string"
                        },
                        template: {
                            type: "string"
                        }
                    },
                    required: ["pattern"],
                    additionalProperties: false
                }
            ]
        },
        headerLines: {
            anyOf: [
                {
                    $ref: "#/definitions/line"
                },
                {
                    type: "array",
                    items: {
                        $ref: "#/definitions/line"
                    }
                }
            ]
        },
        numNewlines: {
            type: "integer",
            minimum: 0
        },
        settings: {
            type: "object",
            properties: {
                lineEndings: {
                    type: "string",
                    enum: [lineEndingOptions.unix, lineEndingOptions.windows]
                }
            },
            additionalProperties: false
        },
        options: {
            anyOf: [
                {
                    type: "array",
                    minItems: 1,
                    maxItems: 2,
                    items: [
                        { type: "string" },
                        { $ref: "#/definitions/settings" }
                    ]
                },
                {
                    type: "array",
                    minItems: 2,
                    maxItems: 3,
                    items: [
                        { $ref: "#/definitions/commentType" },
                        { $ref: "#/definitions/headerLines" },
                        { $ref: "#/definitions/settings" }
                    ]
                },
                {
                    type: "array",
                    minItems: 3,
                    maxItems: 4,
                    items: [
                        { $ref: "#/definitions/commentType" },
                        { $ref: "#/definitions/headerLines" },
                        { $ref: "#/definitions/numNewlines" },
                        { $ref: "#/definitions/settings" }
                    ]
                }
            ]
        }
    }
});

module.exports = { lineEndingOptions, commentTypeOptions, schema };
