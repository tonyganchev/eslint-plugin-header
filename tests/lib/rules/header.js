/*
 * MIT License
 *
 * Copyright (c) 2015-present Stuart Knightley and contributors
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

const td = require("testdouble");
// This needs to be called before any required module requires the `os` package.
const os = td.replace("os");

const rule = require("../../../lib/rules/header");
const { RuleTester } = require("eslint");

const ruleTester = new RuleTester();

describe("unix", () => {
    beforeEach(() => {
        os.EOL = "\n";
    });
    ruleTester.run("header", rule, {
        valid: [
            {
                code: "/*Copyright 2015, My Company*/\nconsole.log(1);",
                options: ["block", "Copyright 2015, My Company"]
            },
            {
                code: "//Copyright 2015, My Company\nconsole.log(1);",
                options: ["line", "Copyright 2015, My Company"]
            },
            {
                code: "/*Copyright 2015, My Company*/",
                options: ["block", "Copyright 2015, My Company", 0]
            },
            {
                code: "//Copyright 2015\n//My Company\nconsole.log(1)",
                options: ["line", "Copyright 2015\nMy Company"]
            },
            {
                code: "//Copyright 2015\n//My Company\nconsole.log(1)",
                options: ["line", ["Copyright 2015", "My Company"]]
            },
            {
                code: "/*Copyright 2015\nMy Company*/\nconsole.log(1)",
                options: ["block", ["Copyright 2015", "My Company"]]
            },
            {
                code: "/*************************\n * Copyright 2015\n * My Company\n *************************/\nconsole.log(1)",
                options: ["block", [
                    "************************",
                    " * Copyright 2015",
                    " * My Company",
                    " ************************"
                ]]
            },
            {
                code: "/*\nCopyright 2015\nMy Company\n*/\nconsole.log(1)",
                options: ["tests/support/block.js"]
            },
            {
                code: "// Copyright 2015\n// My Company\nconsole.log(1)",
                options: ["tests/support/line.js"]
            },
            {
                code: "//Copyright 2015\n//My Company\n/* DOCS */",
                options: ["line", "Copyright 2015\nMy Company"]
            },
            {
                code: "// Copyright 2017",
                options: ["line", {pattern: "^ Copyright \\d+$"}, 0]
            },
            {
                code: "// Copyright 2017\n// Author: abc@example.com",
                options: ["line", [{pattern: "^ Copyright \\d+$"}, {pattern: "^ Author: \\w+@\\w+\\.\\w+$"}], 0]
            },
            {
                code: "/* Copyright 2017\n Author: abc@example.com */",
                options: ["block", {pattern: "^ Copyright \\d{4}\\n Author: \\w+@\\w+\\.\\w+ $"}, 0]
            },
            {
                code: "#!/usr/bin/env node\n/**\n * Copyright\n */",
                options: ["block", [
                    "*",
                    " * Copyright",
                    " "
                ], 0]
            },
            {
                code: "// Copyright 2015\r\n// My Company\r\nconsole.log(1)",
                options: ["tests/support/line.js"]
            },
            {
                code: "//Copyright 2018\r\n//My Company\r\n/* DOCS */",
                options: ["line", ["Copyright 2018", "My Company"]]
            },
            {
                code: "/*Copyright 2018\r\nMy Company*/\r\nconsole.log(1)",
                options: ["block", ["Copyright 2018", "My Company"], {"lineEndings": "windows"}]
            },
            {
                code: "/*Copyright 2018\nMy Company*/\nconsole.log(1)",
                options: ["block", ["Copyright 2018", "My Company"], {"lineEndings": "unix"}]
            },
            {
                code: "/*************************\n * Copyright 2015\n * My Company\n *************************/\nconsole.log(1)",
                options: ["block", [
                    "************************",
                    { pattern: " \\* Copyright \\d{4}" },
                    " * My Company",
                    " ************************"
                ]]
            },
            {
                code: "/*Copyright 2020, My Company*/\nconsole.log(1);",
                options: ["block", "Copyright 2020, My Company", 1],
            },
            {
                code: "/*Copyright 2020, My Company*/\n\nconsole.log(1);",
                options: ["block", "Copyright 2020, My Company", 2],
            },
            {
                code: "/*Copyright 2020, My Company*/\n\n// Log number one\nconsole.log(1);",
                options: ["block", "Copyright 2020, My Company", 2],
            },
            {
                code: "/*Copyright 2020, My Company*/\n\n/*Log number one*/\nconsole.log(1);",
                options: ["block", "Copyright 2020, My Company", 2],
            },
            {
                code: "/**\n * Copyright 2020\n * My Company\n **/\n\n/*Log number one*/\nconsole.log(1);",
                options: ["block", "*\n * Copyright 2020\n * My Company\n *", 2],
            },
            {
                code: "#!/usr/bin/env node\r\n/**\r\n * Copyright\r\n */",
                options: ["block", [
                    "*",
                    " * Copyright",
                    " "
                ], 0]
            }
        ],
        invalid: [
            {
                code: "console.log(1);",
                options: ["block", "Copyright 2015, My Company"],
                errors: [
                    {message: "missing header"}
                ],
                output: "/*Copyright 2015, My Company*/\nconsole.log(1);"
            },
            {
                code: "//Copyright 2014, My Company\nconsole.log(1);",
                options: ["block", "Copyright 2015, My Company"],
                errors: [
                    {message: "header should be a block comment"}
                ],
                output: "/*Copyright 2015, My Company*/\nconsole.log(1);"
            },
            {
                code: "/*Copyright 2014, My Company*/\nconsole.log(1);",
                options: ["line", "Copyright 2015, My Company"],
                errors: [
                    {message: "header should be a line comment"}
                ],
                output: "//Copyright 2015, My Company\nconsole.log(1);"
            },
            {
                code: "/*Copyright 2014, My Company*/\nconsole.log(1);",
                options: ["block", "Copyright 2015, My Company"],
                errors: [
                    {message: "incorrect header"}
                ],
                output: "/*Copyright 2015, My Company*/\nconsole.log(1);"
            },
            {
                // Test extra line in comment
                code: "/*Copyright 2015\nMy Company\nExtra*/\nconsole.log(1);",
                options: ["block", ["Copyright 2015", "My Company"]],
                errors: [
                    {message: "incorrect header"}
                ],
                output: "/*Copyright 2015\nMy Company*/\nconsole.log(1);"
            },
            {
                code: "/*Copyright 2015\n*/\nconsole.log(1);",
                options: ["block", ["Copyright 2015", "My Company"]],
                errors: [
                    {message: "incorrect header"}
                ],
                output: "/*Copyright 2015\nMy Company*/\nconsole.log(1);"
            },
            {
                code: "//Copyright 2014\n//My Company\nconsole.log(1)",
                options: ["line", "Copyright 2015\nMy Company"],
                errors: [
                    {message: "incorrect header"}
                ],
                output: "//Copyright 2015\n//My Company\nconsole.log(1)"
            },
            {
                code: "//Copyright 2015",
                options: ["line", "Copyright 2015\nMy Company"],
                errors: [
                    {message: "incorrect header"}
                ],
                output: "//Copyright 2015\n//My Company\n"
            },
            {
                code: "// Copyright 2017 trailing",
                options: ["line", {pattern: "^ Copyright \\d+$"}],
                errors: [
                    {message: "incorrect header"}
                ]
            },
            {
                code: "// Copyright 2017 trailing",
                options: ["line", {pattern: "^ Copyright \\d+$", template: " Copyright 2018"}],
                errors: [
                    {message: "incorrect header"}
                ],
                output: "// Copyright 2018\n"
            },
            {
                code: "// Copyright 2017 trailing\n// Someone",
                options: ["line", [{pattern: "^ Copyright \\d+$", template: " Copyright 2018"}, " My Company"]],
                errors: [
                    {message: "incorrect header"}
                ],
                output: "// Copyright 2018\n// My Company\n"
            },
            {
                code: "// Copyright 2017\n// Author: ab-c@example.com",
                options: ["line", [{pattern: "Copyright \\d+"}, {pattern: "^ Author: \\w+@\\w+\\.\\w+$"}]],
                errors: [
                    {message: "incorrect header"}
                ]
            },
            {
                code: "/* Copyright 2017-01-02\n Author: abc@example.com */",
                options: ["block", {pattern: "^ Copyright \\d+\\n Author: \\w+@\\w+\\.\\w+ $"}],
                errors: [
                    {message: "incorrect header"}
                ]
            },
            {
                code: "/*************************\n * Copyright 2015\n * All your base are belong to us!\n *************************/\nconsole.log(1)",
                options: ["block", [
                    "************************",
                    { pattern: " \\* Copyright \\d{4}", template: " * Copyright 2019" },
                    " * My Company",
                    " ************************"
                ]],
                errors: [
                    {message: "incorrect header"}
                ],
                output: "/*************************\n * Copyright 2019\n * My Company\n *************************/\nconsole.log(1)"
            },
            {
                code: "/*Copyright 2020, My Company*/console.log(1);",
                options: ["block", "Copyright 2020, My Company", 2],
                errors: [
                    {message: "no newline after header"}
                ],
                output: "/*Copyright 2020, My Company*/\n\nconsole.log(1);"
            },
            {
                code: "/*Copyright 2020, My Company*/console.log(1);",
                options: ["block", "Copyright 2020, My Company", 1],
                errors: [
                    {message: "no newline after header"}
                ],
                output: "/*Copyright 2020, My Company*/\nconsole.log(1);"
            },
            {
                code: "//Copyright 2020\n//My Company\nconsole.log(1);",
                options: ["line", ["Copyright 2020", "My Company"], 2],
                errors: [
                    {message: "no newline after header"}
                ],
                output: "//Copyright 2020\n//My Company\n\nconsole.log(1);"
            },
            {
                code: "/*Copyright 2020, My Company*/\nconsole.log(1);\n//Comment\nconsole.log(2);\n//Comment",
                options: ["block", "Copyright 2020, My Company", 2],
                errors: [
                    {message: "no newline after header"}
                ],
                output: "/*Copyright 2020, My Company*/\n\nconsole.log(1);\n//Comment\nconsole.log(2);\n//Comment"
            },
            {
                code: "//Copyright 2020\n//My Company\nconsole.log(1);\n//Comment\nconsole.log(2);\n//Comment",
                options: ["line", ["Copyright 2020", "My Company"], 2],
                errors: [
                    {message: "no newline after header"}
                ],
                output: "//Copyright 2020\n//My Company\n\nconsole.log(1);\n//Comment\nconsole.log(2);\n//Comment"
            }
        ]
    });
});
