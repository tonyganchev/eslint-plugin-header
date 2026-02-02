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

/** @type {import('json-schema').JSONSchema4} */
const schema = Object.freeze({
    $ref: "#/definitions/options",
    definitions: {
        commentType: {
            type: "string",
            enum: [commentTypeOptions.block, commentTypeOptions.line],
            description: "Type of comment to expect as the header."
        },
        regExp: {
            type: "object",
            properties: {
                source: { type: "string" }
            },
            required: ["source"],
            additionalProperties: true,
        },
        line: {
            anyOf: [
                { type: "string" },
                { $ref: "#/definitions/regExp" },
                {
                    type: "object",
                    properties: {
                        pattern: {
                            anyOf: [
                                { type: "string" },
                                { $ref: "#/definitions/regExp" },
                            ]
                        },
                        template: { type: "string" }
                    },
                    required: ["pattern"],
                    additionalProperties: false
                }
            ]
        },
        headerLines: {
            anyOf: [
                { $ref: "#/definitions/line" },
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
        lineEndings: {
            type: "string",
            enum: [lineEndingOptions.unix, lineEndingOptions.windows, lineEndingOptions.os],
            description: "Line endings to use when aut-fixing the violations. Defaults to 'os' which means 'same as " +
            "system'."
        },
        settings: {
            type: "object",
            properties: {
                lineEndings: { $ref: "#/definitions/lineEndings" },
            },
            additionalProperties: false
        },
        fileBasedHeader: {
            type: "object",
            properties: {
                file: {
                    type: "string",
                    description: "Name of a file relative to the current directory (no back-tracking) that contains " +
                        "the header template. It should contain a single block comment or a contiguous number of " +
                        "line comments."
                },
                encoding: {
                    type: "string",
                    description: "Character encoding to use when parsing the file. Valid values are all encodings " +
                        "that can be passed to `fs.readFileSync()`. If not specified, 'utf8' would be used."
                    // NOTE: default value not supported by the ajv schema
                    //       validator and there is no way to fix it through the
                    //       plugin's `meta.defaultOptions`.
                }
            },
            required: ["file"],
            additionalProperties: false
        },
        inlineHeader: {
            type: "object",
            properties: {
                commentType: { $ref: "#/definitions/commentType" },
                lines: {
                    type: "array",
                    items: { $ref: "#/definitions/line" },
                    description: "List of each line of the header - each being a string to match exactly or a " +
                        "combination of a regex pattern to match and an optional template string as the fix."
                }
            },
            required: ["commentType", "lines"],
            additionalProperties: false
        },
        trailingEmptyLines: {
            type: "object",
            properties: {
                minimum: {
                    type: "number",
                    description: "Number of empty lines required after the header. Defaults to 1.",
                }
            },
            additionalProperties: false,
            description: "Configuration for how to validate and fix the set of empty lines after the header."
        },
        newOptions: {
            type: "object",
            properties: {
                header: {
                    anyOf: [
                        { $ref: "#/definitions/fileBasedHeader" },
                        { $ref: "#/definitions/inlineHeader" }
                    ]
                },
                lineEndings: { $ref: "#/definitions/lineEndings" },
                trailingEmptyLines: { $ref: "#/definitions/trailingEmptyLines" }
            },
            required: ["header"],
            additionalProperties: false,
            description: "Object-based extensible configuration format to use with the `header` rule."
        },
        options: {
            anyOf: [
                {
                    type: "array",
                    minItems: 1,
                    maxItems: 1,
                    items: { $ref: "#/definitions/newOptions" }
                },
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
