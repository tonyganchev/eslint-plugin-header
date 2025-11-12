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

const { generateInvalidTestCaseNames } = require("../../../lib/rules/test-utils");
const td = require("testdouble");
// This needs to be called before any required module requires the `os` package.
const os = td.replace("os");

const rule = require("../../../lib/rules/header");
const { RuleTester } = require("eslint");

const ruleTester = new RuleTester();

describe("legacy config", () => {
    ruleTester.run("header", rule, {
        valid: [
            {
                code: "/*\n * Copyright (c) 2015\n * My Company\n */\n",
                options: ["block", "\n * Copyright (c) 2015\n * My Company\n "]
            },
            {
                code: "/*\n * Copyright (c) 2015\n * My Company\n */\n",
                options: ["block", ["", " * Copyright (c) 2015", " * My Company", " "]]
            },
            {
                code: "/*\n * Copyright (c) 2015\n * My Company\n */\n",
                options: ["block", { pattern: "\\n \\* Copyright \\(c\\) 2015\\n \\* My Company\\n " }]
            },
            {
                code: "/*\n * Copyright (c) 2015\n * My Company\n */\n",
                options: ["block", ["", { pattern: " \\* Copyright \\(c\\) 2015" }, " * My Company", " "]]
            },
            {
                code: "/*\n * Copyright (c) 2015\n * My Company\n */\n",
                options: ["block", ["", { pattern: " \\* Copyright \\(c\\) (\\d{4}-)?\\d{4}" }, " * My Company", " "]]
            },
            {
                code: "// Copyright (c) 2015\n// My Company\n",
                options: ["line", " Copyright (c) 2015\n My Company"]
            },
            {
                code: "// Copyright (c) 2015\n// My Company\n",
                options: ["line", [" Copyright (c) 2015", " My Company"]]
            },
            {
                code: "// Copyright (c) 2015\n// My Company\n",
                options: ["line", { pattern: " Copyright \\(c\\) 2015\\n My Company" }]
            },
            {
                code: "// Copyright (c) 2015\n// My Company\n",
                options: ["line", [{ pattern: " Copyright \\(c\\) 2015" }, " My Company"]]
            },
            {
                code: "// Copyright (c) 2020\n// My Company\n",
                options: ["line", [{ pattern: " Copyright \\(c\\) (\\d{4}-)?\\d{4}" }, " My Company"]],
            },
            {
                code: "/*Copyright 2015, My Company*/\nconsole.log(1);",
                options: ["block", "Copyright 2015, My Company"]
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
                code: "/*\nCopyright 2015\nMy Company\n*/\nconsole.log(1)",
                options: ["tests/support/block.js"]
            },
            {
                code: "/*\nCopyright 2015\nMy Company\n*/\nconsole.log(1)",
                options: ["tests/support/block.js", { lineEndings: "unix" }]
            },
            {
                code: "// Copyright 2017",
                options: ["line", { pattern: "^ Copyright \\d+$" }, 0]
            },
            {
                code: "// Copyright 2017\n// Author: abc@example.com",
                options: ["line", [{ pattern: "^ Copyright \\d+$" }, { pattern: "^ Author: \\w+@\\w+\\.\\w+$" }], 0]
            },
            {
                code: "/* Copyright 2017\n Author: abc@example.com */",
                options: ["block", { pattern: "^ Copyright \\d{4}\\n Author: \\w+@\\w+\\.\\w+ $" }, 0]
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
                code: [
                    "/**",
                    " * Copyright",
                    " */",
                    "console.log(1)"
                ].join("\n"),
                options: ["block", [
                    "*",
                    " * Copyright",
                    " "
                ], 0]
            },
            {
                code: "//Copyright 2018\r\n//My Company\r\n/* DOCS */",
                options: ["line", ["Copyright 2018", "My Company"]]
            },
            {
                code: "/*Copyright 2018\r\nMy Company*/\r\nconsole.log(1)",
                options: ["block", ["Copyright 2018", "My Company"], { lineEndings: "windows" }]
            },
            {
                code: [
                    "/*************************",
                    " * Copyright 2015",
                    " * My Company",
                    " *************************/",
                    "console.log(1)"
                ].join("\n"),
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
                // TODD: should fail during validation.
                code: "/*Copyright 2020, My Company*/\nconsole.log(1);",
                options: ["block", "Copyright 2020, My Company", 1, {}],
            },
        ],
        invalid: [
        ]
    });
});

describe("unix", () => {
    beforeEach(() => {
        os.EOL = "\n";
    });
    ruleTester.run("header", rule, {
        valid: [
            {
                code: "/*Copyright 2015, My Company*/\nconsole.log(1);",
                options: [{
                    header: {
                        commentType: "block",
                        lines: ["Copyright 2015, My Company"]
                    }
                }]
            },
            {
                code: "//Copyright 2015, My Company\nconsole.log(1);",
                options: [{
                    header: {
                        commentType: "line",
                        lines: ["Copyright 2015, My Company"]
                    }
                }]
            },
            {
                code: "/*Copyright 2015, My Company*/",
                options: [{
                    header: {
                        commentType: "block",
                        lines: ["Copyright 2015, My Company"]
                    },
                    trailingEmptyLines: {
                        minimum: 0
                    }
                }]
            },
            {
                code: "//Copyright 2015\n//My Company\nconsole.log(1)",
                options: [{
                    header: {
                        commentType: "line",
                        lines: ["Copyright 2015\nMy Company"]
                    }
                }]
            },
            {
                code: "//Copyright 2015\n//My Company\nconsole.log(1)",
                options: [{
                    header: {
                        commentType: "line",
                        lines: ["Copyright 2015", "My Company"]
                    }
                }]
            },
            {
                code: "/*Copyright 2015\nMy Company*/\nconsole.log(1)",
                options: [{
                    header: {
                        commentType: "block",
                        lines: ["Copyright 2015", "My Company"]
                    }
                }]
            },
            {
                code: [
                    "/*************************",
                    " * Copyright 2015",
                    " * My Company",
                    " *************************/",
                    "console.log(1)"
                ].join("\n"),
                options: [{
                    header: {
                        commentType: "block",
                        lines: [
                            "************************",
                            " * Copyright 2015",
                            " * My Company",
                            " ************************"
                        ]
                    }
                }]
            },
            {
                code: "//Copyright 2015\n//My Company\n/* DOCS */",
                options: [{
                    header: {
                        commentType: "line",
                        lines: ["Copyright 2015\nMy Company"],
                    }
                }]
            },
            {
                code: "// Copyright 2017",
                options: [{
                    header: {
                        commentType: "line",
                        lines: [{ pattern: "^ Copyright \\d+$" }]
                    },
                    trailingEmptyLines: {
                        minimum: 0
                    }
                }]
            },
            {
                code: "// Copyright 2017\n// Author: abc@example.com",
                options: [{
                    header: {
                        commentType: "line",
                        lines: [
                            { pattern: "^ Copyright \\d+$" },
                            { pattern: "^ Author: \\w+@\\w+\\.\\w+$" }
                        ]
                    },
                    trailingEmptyLines: {
                        minimum: 0
                    }
                }]
            },
            {
                code: "/* Copyright 2017\n Author: abc@example.com */",
                options: [{
                    header: {
                        commentType: "block",
                        lines: [{ pattern: "^ Copyright \\d{4}\\n Author: \\w+@\\w+\\.\\w+ $" }]
                    },
                    trailingEmptyLines: {
                        minimum: 0
                    }
                }]
            },
            {
                code: "#!/usr/bin/env node\n/**\n * Copyright\n */",
                options: [{
                    header: {
                        commentType: "block",
                        lines: [
                            "*",
                            " * Copyright",
                            " "
                        ],
                    },
                    trailingEmptyLines: {
                        minimum: 0
                    }
                }]
            },
            {
                code: "// Copyright 2015\r\n// My Company\r\nconsole.log(1)",
                options: [{
                    header: {
                        file: "tests/support/line.js"
                    }
                }]
            },
            {
                code: "//Copyright 2018\r\n//My Company\r\n/* DOCS */",
                options: [{
                    header: {
                        commentType: "line",
                        lines: ["Copyright 2018", "My Company"]
                    }
                }]
            },
            {
                code: "/*Copyright 2018\r\nMy Company*/\r\nconsole.log(1)",
                options: [{
                    header: {
                        commentType: "block",
                        lines: ["Copyright 2018", "My Company"],
                    },
                    lineEndings: "windows"
                }]
            },
            {
                code: "/*Copyright 2018\nMy Company*/\nconsole.log(1)",
                options: [{
                    header: {
                        commentType: "block",
                        lines: ["Copyright 2018", "My Company"],
                    },
                    lineEndings: "unix"
                }]
            },
            {
                code: [
                    "/*************************",
                    " * Copyright 2015",
                    " * My Company",
                    " *************************/",
                    "console.log(1)"
                ].join("\n"),
                options: [{
                    header: {
                        commentType: "block",
                        lines: [
                            "************************",
                            { pattern: " \\* Copyright \\d{4}" },
                            " * My Company",
                            " ************************"
                        ]
                    }
                }]
            },
            {
                code: "/*Copyright 2020, My Company*/\nconsole.log(1);",
                options: [{
                    header: {
                        commentType: "block",
                        lines: ["Copyright 2020, My Company"]
                    },
                    trailingEmptyLines: {
                        minimum: 1
                    }
                }],
            },
            {
                code: "/*Copyright 2020, My Company*/\n\nconsole.log(1);",
                options: [{
                    header: {
                        commentType: "block",
                        lines: ["Copyright 2020, My Company"]
                    },
                    trailingEmptyLines: {
                        minimum: 2
                    }
                }],
            },
            {
                code: "/*Copyright 2020, My Company*/\n\n// Log number one\nconsole.log(1);",
                options: [{
                    header: {
                        commentType: "block",
                        lines: ["Copyright 2020, My Company"]
                    },
                    trailingEmptyLines: {
                        minimum: 2
                    }
                }],
            },
            {
                code: "/*Copyright 2020, My Company*/\n\n/*Log number one*/\nconsole.log(1);",
                options: [{
                    header: {
                        commentType: "block",
                        lines: ["Copyright 2020, My Company"]
                    },
                    trailingEmptyLines: {
                        minimum: 2
                    }
                }],
            },
            {
                code: "/**\n * Copyright 2020\n * My Company\n **/\n\n/*Log number one*/\nconsole.log(1);",
                options: [{
                    header: {
                        commentType: "block",
                        lines: ["*\n * Copyright 2020\n * My Company\n *"]
                    },
                    trailingEmptyLines: {
                        minimum: 2
                    }
                }],
            },
            {
                code: "#!/usr/bin/env node\r\n/**\r\n * Copyright\r\n */",
                options: [{
                    header: {
                        commentType: "block",
                        lines: [
                            "*",
                            " * Copyright",
                            " "
                        ]
                    },
                    trailingEmptyLines: {
                        minimum: 0
                    }
                }]
            },
        ],
        invalid: generateInvalidTestCaseNames([
            {
                code: "console.log(1);",
                options: [{
                    header: {
                        commentType: "block",
                        lines: ["Copyright 2015, My Company"]
                    }
                }],
                errors: [
                    { message: "missing header" }
                ],
                output: "/*Copyright 2015, My Company*/\nconsole.log(1);"
            },
            {
                code: "console.log(1);",
                options: [{
                    header: {
                        commentType: "block",
                        lines: ["Copyright 2015, My Company"]
                    },
                    lineEndings: "unix"
                }],
                errors: [
                    { message: "missing header" }
                ],
                output: "/*Copyright 2015, My Company*/\nconsole.log(1);"
            },
            {
                code: "console.log(1);",
                options: [{
                    header: {
                        commentType: "block",
                        lines: ["Copyright 2015, My Company"]
                    },
                    lineEndings: "windows"
                }],
                errors: [
                    { message: "missing header" }
                ],
                output: "/*Copyright 2015, My Company*/\r\nconsole.log(1);"
            },
            {
                code: "//Copyright 2014, My Company\nconsole.log(1);",
                options: [{
                    header: {
                        commentType: "block",
                        lines: [{ pattern: "Copyright 2015" }, "My Company"]
                    }
                }],
                errors: [
                    {
                        message: "header should be a block comment",
                        column: 1,
                        endColumn: 29,
                        endLine: 1,
                        line: 1
                    }
                ],
            },
            {
                code: "//Copyright 2014, My Company\nconsole.log(1);",
                options: [{
                    header: {
                        commentType: "block",
                        lines: ["Copyright 2015, My Company"]
                    }
                }],
                errors: [
                    {
                        message: "header should be a block comment",
                        column: 1,
                        endColumn: 29,
                        endLine: 1,
                        line: 1
                    }
                ],
                output: "/*Copyright 2015, My Company*/\nconsole.log(1);",
            },
            {
                code: "//Copyright 2014, My Company\nconsole.log(1);",
                options: [{
                    header: {
                        commentType: "block",
                        lines: ["Copyright 2015, My Company"]
                    },
                    lineEndings: "unix"
                }],
                errors: [
                    {
                        message: "header should be a block comment",
                        column: 1,
                        endColumn: 29,
                        endLine: 1,
                        line: 1
                    }
                ],
                output: "/*Copyright 2015, My Company*/\nconsole.log(1);"
            },
            {
                code: "//Copyright 2014, My Company\r\nconsole.log(1);",
                options: [{
                    header: {
                        commentType: "block",
                        lines: ["Copyright 2015, My Company"]
                    },
                    lineEndings: "windows"
                }],
                errors: [
                    {
                        message: "header should be a block comment",
                        column: 1,
                        endColumn: 29,
                        endLine: 1,
                        line: 1
                    }
                ],
                output: "/*Copyright 2015, My Company*/\r\nconsole.log(1);"
            },
            {
                code: "/*Copyright 2014, My Company*/\nconsole.log(1);",
                options: [{
                    header: {
                        commentType: "line",
                        lines: ["Copyright 2015, My Company"]
                    }
                }],
                errors: [
                    {
                        message: "header should be a line comment",
                        column: 1,
                        endColumn: 31,
                        endLine: 1,
                        line: 1
                    }
                ],
                output: "//Copyright 2015, My Company\nconsole.log(1);"
            },
            {
                code: "/*Copyright 2014, My Company*/\nconsole.log(1);",
                options: [{
                    header: {
                        commentType: "block",
                        lines: ["Copyright 2015, My Company"]
                    }
                }],
                errors: [
                    { message: "incorrect header" }
                ],
                output: "/*Copyright 2015, My Company*/\nconsole.log(1);"
            },
            {
                // Test extra line in comment
                code: "/*Copyright 2015\nMy Company\nExtra*/\nconsole.log(1);",
                options: [{
                    header: {
                        commentType: "block",
                        lines: ["Copyright 2015", "My Company"]
                    }
                }],
                errors: [
                    { message: "incorrect header" }
                ],
                output: "/*Copyright 2015\nMy Company*/\nconsole.log(1);"
            },
            {
                code: "/*Copyright 2015\n*/\nconsole.log(1);",
                options: [{
                    header: {
                        commentType: "block",
                        lines: ["Copyright 2015", "My Company"]
                    }
                }],
                errors: [
                    { message: "incorrect header" }
                ],
                output: "/*Copyright 2015\nMy Company*/\nconsole.log(1);"
            },
            {
                code: "//Copyright 2014\n//My Company\nconsole.log(1)",
                options: [{
                    header: {
                        commentType: "line",
                        lines: ["Copyright 2015\nMy Company"]
                    }
                }],
                errors: [
                    { message: "incorrect header" }
                ],
                output: "//Copyright 2015\n//My Company\nconsole.log(1)"
            },
            {
                code: "//Copyright 2014\n//My Company\nconsole.log(1)",
                options: [{
                    header: {
                        commentType: "line",
                        lines: [{ pattern: "Copyright 2015" }, "My Company"]
                    }
                }],
                errors: [
                    { message: "incorrect header" }
                ],
            },
            {
                code: "//Copyright 2014\nconsole.log(1)",
                options: [{
                    header: {
                        commentType: "line",
                        lines: [{ pattern: "Copyright 2015" }, "My Company"]
                    }
                }],
                errors: [
                    { message: "incorrect header" }
                ],
            },
            {
                code: "//Copyright 2015",
                options: [{
                    header: {
                        commentType: "line",
                        lines: ["Copyright 2015\nMy Company"]
                    }
                }],
                errors: [
                    { message: "incorrect header" }
                ],
                output: "//Copyright 2015\n//My Company\n"
            },
            {
                code: "// Copyright 2017 trailing",
                options: [{
                    header: {
                        commentType: "line",
                        lines: [{ pattern: "^ Copyright \\d+$" }],
                    }
                }],
                errors: [
                    { message: "incorrect header" }
                ]
            },
            {
                code: "// Copyright 2017 trailing",
                options: [{
                    header: {
                        commentType: "line",
                        lines: [{ pattern: "^ Copyright \\d+$", template: " Copyright 2018" }],
                    }
                }],
                errors: [
                    { message: "incorrect header" }
                ],
                output: "// Copyright 2018\n"
            },
            {
                code: "// Copyright 2017 trailing\n// Someone",
                options: [{
                    header: {
                        commentType: "line",
                        lines: [{ pattern: "^ Copyright \\d+$", template: " Copyright 2018" }, " My Company"]
                    }
                }],
                errors: [
                    { message: "incorrect header" }
                ],
                output: "// Copyright 2018\n// My Company\n"
            },
            {
                code: "// Copyright 2017\n// Author: ab-c@example.com",
                options: [{
                    header: {
                        commentType: "line",
                        lines: [{ pattern: "Copyright \\d+" }, { pattern: "^ Author: \\w+@\\w+\\.\\w+$" }]
                    }
                }],
                errors: [
                    { message: "incorrect header" }
                ]
            },
            {
                code: "/* Copyright 2017-01-02\n Author: abc@example.com */",
                options: [{
                    header: {
                        commentType: "block",
                        lines: [{ pattern: "^ Copyright \\d+\\n Author: \\w+@\\w+\\.\\w+ $" }],
                    }
                }],
                errors: [
                    { message: "incorrect header" }
                ]
            },
            {
                code: [
                    "/*************************",
                    " * Copyright 2015",
                    " * All your base are belong to us!",
                    " *************************/",
                    "console.log(1)"
                ].join("\n"),
                options: [{
                    header: {
                        commentType: "block",
                        lines: [
                            "************************",
                            { pattern: " \\* Copyright \\d{4}", template: " * Copyright 2019" },
                            " * My Company",
                            " ************************"
                        ]
                    }
                }],
                errors: [
                    { message: "incorrect header" }
                ],
                output: [
                    "/*************************",
                    " * Copyright 2019",
                    " * My Company",
                    " *************************/",
                    "console.log(1)"
                ].join("\n")
            },
            {
                code: "/*Copyright 2020, My Company*/console.log(1);",
                options: [{
                    header: {
                        commentType: "block",
                        lines: ["Copyright 2020, My Company"]
                    },
                    trailingEmptyLines: {
                        minimum: 2
                    }
                }],
                errors: [
                    {
                        message: "not enough newlines after header: expected: 2, actual: 0",
                        column: 31,
                        endColumn: 32,
                        endLine: 1,
                        line: 1
                    }
                ],
                output: "/*Copyright 2020, My Company*/\n\nconsole.log(1);"
            },
            {
                code: "/*Copyright 2020, My Company*/console.log(1);",
                options: [{
                    header: {
                        commentType: "block",
                        lines: ["Copyright 2020, My Company"]
                    },
                    trailingEmptyLines: {
                        minimum: 1
                    }
                }],
                errors: [
                    {
                        message: "not enough newlines after header: expected: 1, actual: 0",
                        column: 31,
                        endColumn: 32,
                        endLine: 1,
                        line: 1,
                    }
                ],
                output: "/*Copyright 2020, My Company*/\nconsole.log(1);"
            },
            {
                code: "//Copyright 2020\n//My Company\nconsole.log(1);",
                options: [{
                    header: {
                        commentType: "line",
                        lines: ["Copyright 2020", "My Company"]
                    },
                    trailingEmptyLines: {
                        minimum: 2
                    }
                }],
                errors: [
                    {
                        message: "not enough newlines after header: expected: 2, actual: 1",
                        column: 13,
                        endColumn: 1,
                        endLine: 3,
                        line: 2,
                    }
                ],
                output: "//Copyright 2020\n//My Company\n\nconsole.log(1);"
            },
            {
                code: "//Copyright 2020\n//My Company\nconsole.log(1);",
                options: [{
                    header: {
                        commentType: "line",
                        lines: [{ pattern: "Copyright 2020" }, "My Company"]
                    },
                    trailingEmptyLines: {
                        minimum: 2
                    }
                }],
                errors: [
                    {
                        message: "not enough newlines after header: expected: 2, actual: 1",
                        column: 13,
                        endColumn: 1,
                        endLine: 3,
                        line: 2,
                    }
                ],
                output: "//Copyright 2020\n//My Company\n\nconsole.log(1);",
            },
            {
                code: "/*Copyright 2020, My Company*/\nconsole.log(1);\n//Comment\nconsole.log(2);\n//Comment",
                options: [{
                    header: {
                        commentType: "block",
                        lines: ["Copyright 2020, My Company"]
                    },
                    trailingEmptyLines: {
                        minimum: 2
                    }
                }],
                errors: [
                    {
                        message: "not enough newlines after header: expected: 2, actual: 1",
                        column: 31,
                        endColumn: 1,
                        endLine: 2,
                        line: 1,
                    }
                ],
                output: "/*Copyright 2020, My Company*/\n\nconsole.log(1);\n//Comment\nconsole.log(2);\n//Comment"
            },
            {
                code: "/*Copyright 2020, My Company*/\nconsole.log(1);\n//Comment\nconsole.log(2);\n//Comment",
                options: [{
                    header: {
                        commentType: "block",
                        lines: [{ pattern: "Copyright 2020, My Company" }]
                    },
                    trailingEmptyLines: {
                        minimum: 2
                    }
                }],
                errors: [
                    {
                        message: "not enough newlines after header: expected: 2, actual: 1",
                        column: 31,
                        endColumn: 1,
                        endLine: 2,
                        line: 1,

                    }
                ],
                output: "/*Copyright 2020, My Company*/\n\nconsole.log(1);\n//Comment\nconsole.log(2);\n//Comment",
            },
            {
                code: "//Copyright 2020\n//My Company\nconsole.log(1);\n//Comment\nconsole.log(2);\n//Comment",
                options: [{
                    header: {
                        commentType: "line",
                        lines: ["Copyright 2020", "My Company"],
                    },
                    lineEndings: "unix",
                    trailingEmptyLines: {
                        minimum: 2
                    }
                }],
                errors: [
                    {
                        message: "not enough newlines after header: expected: 2, actual: 1",
                        column: 13,
                        endColumn: 1,
                        endLine: 3,
                        line: 2,
                    }
                ],
                output: "//Copyright 2020\n//My Company\n\nconsole.log(1);\n//Comment\nconsole.log(2);\n//Comment"
            },
            {
                code: [
                    "//Copyright 2020",
                    "//My Company",
                    "console.log(1);",
                    "//Comment",
                    "console.log(2);",
                    "//Comment"
                ].join("\r\n"),
                options: [{
                    header: {
                        commentType: "line",
                        lines: ["Copyright 2020", "My Company"],
                    },
                    lineEndings: "windows",
                    trailingEmptyLines: {
                        minimum: 2
                    }
                }],
                errors: [
                    {
                        message: "not enough newlines after header: expected: 2, actual: 1",
                        column: 13,
                        endColumn: 1,
                        endLine: 3,
                        line: 2,
                    }
                ],
                output: [
                    "//Copyright 2020",
                    "//My Company",
                    "",
                    "console.log(1);",
                    "//Comment",
                    "console.log(2);",
                    "//Comment"
                ].join("\r\n")
            },
            {
                code: "//Copyright 2020\n//My Company\nconsole.log(1);\n//Comment\nconsole.log(2);\n//Comment",
                options: [{
                    header: {
                        commentType: "line",
                        lines: ["Copyright 2020", "My Company"]
                    },
                    trailingEmptyLines: {
                        minimum: 2
                    }
                }],
                errors: [
                    {
                        message: "not enough newlines after header: expected: 2, actual: 1",
                        column: 13,
                        endColumn: 1,
                        endLine: 3,
                        line: 2,
                    }
                ],
                output: "//Copyright 2020\n//My Company\n\nconsole.log(1);\n//Comment\nconsole.log(2);\n//Comment"
            },
            {
                code: "\n\n\n\n\nconsole.log(1);",
                options: [{
                    header: {
                        commentType: "line",
                        lines: ["Copyright 2020", "My Company"]
                    },
                    trailingEmptyLines: {
                        minimum: 2
                    }
                }],
                errors: [
                    { message: "missing header" }
                ],
                output: "//Copyright 2020\n//My Company\n\n\n\n\nconsole.log(1);"
            },
            {
                code: "\n\n\n\n\nconsole.log(1);",
                options: [{
                    header: {
                        commentType: "block",
                        lines: ["", " * Copyright 2020", " * My Company", " "]
                    },
                    trailingEmptyLines: {
                        minimum: 2
                    }
                }],
                errors: [
                    { message: "missing header" }
                ],
                output: "/*\n * Copyright 2020\n * My Company\n */\n\n\n\n\nconsole.log(1);"
            },
            {
                code: "//Copyright 2020 My Company\nconsole.log(1);",
                options: [{
                    header: {
                        commentType: "line",
                        lines: ["Copyright 2020 My Company"]
                    },
                    trailingEmptyLines: {
                        minimum: 3
                    }
                }],
                errors: [
                    {
                        message: "not enough newlines after header: expected: 3, actual: 1",
                        column: 28,
                        endColumn: 1,
                        endLine: 2,
                        line: 1,
                    }
                ],
                output: "//Copyright 2020 My Company\n\n\nconsole.log(1);"
            },
            {
                code: "\n\n\n\nconsole.log(1);",
                options: [{
                    header: {
                        commentType: "line",
                        lines: ["Copyright 2020", "My Company"]
                    },
                    trailingEmptyLines: {
                        minimum: 2
                    }
                }],
                errors: [
                    { message: "missing header" }
                ],
                output: "//Copyright 2020\n//My Company\n\n\n\nconsole.log(1);"
            },
            {
                code: "#!/usr/bin/env node\nconsole.log(1);",
                options: [{
                    header: {
                        commentType: "line",
                        lines: [" Copyright"]
                    }
                }],
                errors: [
                    { message: "missing header" },
                ],
                output: "#!/usr/bin/env node\n// Copyright\nconsole.log(1);",
            },
            {
                code: "#!/usr/bin/env node\n\n\nconsole.log(1);",
                options: [{
                    header: {
                        commentType: "line",
                        lines: [" Copyright"]
                    }
                }],
                errors: [
                    { message: "missing header" },
                ],
                output: "#!/usr/bin/env node\n// Copyright\n\nconsole.log(1);",
            },
            {
                code: "#!/usr/bin/env node\n\n// My Company\nconsole.log(1);",
                options: [{
                    header: {
                        commentType: "line",
                        lines: [" Copyright"]
                    }
                }],
                errors: [
                    { message: "missing header" },
                ],
                output: "#!/usr/bin/env node\n// Copyright\n// My Company\nconsole.log(1);",
            },
            {
                code: "#!/usr/bin/env node\n\n\n/* Copyright */\nconsole.log(1);",
                options: [{
                    header: {
                        commentType: "block",
                        lines: [" Copyright "]
                    }
                }],
                errors: [
                    { message: "missing header" },
                ],
                output: "#!/usr/bin/env node\n/* Copyright */\n\n/* Copyright */\nconsole.log(1);",
            },
            {
                code: "#!/usr/bin/env node\n/* My Company */\nconsole.log(1);",
                options: [{
                    header: {
                        commentType: "block",
                        lines: [" Copyright "]
                    }
                }],
                errors: [
                    { message: "incorrect header" },
                ],
                output: "#!/usr/bin/env node\n/* Copyright */\nconsole.log(1);",
            },
            {
                code: "#!/usr/bin/env node\n/* Copyright */\nconsole.log(1);",
                options: [{
                    header: {
                        commentType: "line",
                        lines: [" Copyright"]
                    }
                }],
                errors: [
                    {
                        message: "header should be a line comment",
                        column: 1,
                        endColumn: 16,
                        endLine: 2,
                        line: 2
                    },
                ],
                output: "#!/usr/bin/env node\n// Copyright\nconsole.log(1);",
            },
            {
                code: "#!/usr/bin/env node",
                options: [{
                    header: {
                        commentType: "line",
                        lines: [" Copyright"]
                    }
                }],
                errors: [
                    { message: "missing header" },
                ],
                output: "#!/usr/bin/env node\n// Copyright\n",
            },
            {
                code: "#!/usr/bin/env node",
                options: [{
                    header: {
                        commentType: "block",
                        lines: [" Copyright "]
                    }
                }],
                errors: [
                    { message: "missing header" },
                ],
                output: "#!/usr/bin/env node\n/* Copyright */\n",
            }
        ])
    });
});
describe("windows", () => {
    beforeEach(() => {
        os.EOL = "\r\n";
    });
    ruleTester.run("header", rule, {
        valid: [
            {
                code: "/*Copyright 2015, My Company*/\nconsole.log(1);",
                options: [{
                    header: {
                        commentType: "block",
                        lines: ["Copyright 2015, My Company"]
                    }
                }]
            },
            {
                code: "//Copyright 2015, My Company\nconsole.log(1);",
                options: [{
                    header: {
                        commentType: "line",
                        lines: ["Copyright 2015, My Company"]
                    }
                }]
            },
            {
                code: "/*Copyright 2015, My Company*/",
                options: [{
                    header: {
                        commentType: "block",
                        lines: ["Copyright 2015, My Company"]
                    },
                    trailingEmptyLines: {
                        minimum: 0
                    }
                }]
            },
            {
                code: "//Copyright 2015\n//My Company\nconsole.log(1)",
                options: [{
                    header: {
                        commentType: "line",
                        lines: ["Copyright 2015\nMy Company"]
                    }
                }]
            },
            {
                code: "//Copyright 2015\n//My Company\nconsole.log(1)",
                options: [{
                    header: {
                        commentType: "line",
                        lines: ["Copyright 2015", "My Company"]
                    }
                }]
            },
            {
                code: "/*Copyright 2015\nMy Company*/\nconsole.log(1)",
                options: [{
                    header: {
                        commentType: "block",
                        lines: ["Copyright 2015", "My Company"]
                    }
                }]
            },
            {
                code: [
                    "/*************************",
                    " * Copyright 2015",
                    " * My Company",
                    " *************************/",
                    "console.log(1)"
                ].join("\n"),
                options: [{
                    header: {
                        commentType: "block",
                        lines: [
                            "************************",
                            " * Copyright 2015",
                            " * My Company",
                            " ************************"
                        ]
                    }
                }]
            },
            {
                code: "/*\nCopyright 2015\nMy Company\n*/\nconsole.log(1)",
                options: [{
                    header: {
                        file: "tests/support/block.js"
                    }
                }]
            },
            {
                code: "// Copyright 2015\n// My Company\nconsole.log(1)",
                options: [{
                    header: {
                        file: "tests/support/line.js"
                    }
                }]
            },
            {
                code: "//Copyright 2015\n//My Company\n/* DOCS */",
                options: [{
                    header: {
                        commentType: "line",
                        lines: ["Copyright 2015\nMy Company"]
                    }
                }]
            },
            {
                code: "// Copyright 2017",
                options: [{
                    header: {
                        commentType: "line",
                        lines: [{ pattern: "^ Copyright \\d+$" }]
                    },
                    trailingEmptyLines: {
                        minimum: 0
                    }
                }]
            },
            {
                code: "// Copyright 2017\n// Author: abc@example.com",
                options: [{
                    header: {
                        commentType: "line",
                        lines: [{ pattern: "^ Copyright \\d+$" }, { pattern: "^ Author: \\w+@\\w+\\.\\w+$" }]
                    },
                    trailingEmptyLines: {
                        minimum: 0
                    }
                }]
            },
            {
                code: "/* Copyright 2017\n Author: abc@example.com */",
                options: [{
                    header: {
                        commentType: "block",
                        lines: [{ pattern: "^ Copyright \\d{4}\\n Author: \\w+@\\w+\\.\\w+ $" }]
                    },
                    trailingEmptyLines: {
                        minimum: 0
                    }
                }]
            },
            {
                code: "#!/usr/bin/env node\n/**\n * Copyright\n */",
                options: [{
                    header: {
                        commentType: "block",
                        lines: [
                            "*",
                            " * Copyright",
                            " "
                        ],
                    },
                    trailingEmptyLines: {
                        minimum: 0
                    }
                }]
            },
            {
                code: "// Copyright 2015\r\n// My Company\r\nconsole.log(1)",
                options: [{
                    header: {
                        file: "tests/support/line.js"
                    }
                }]
            },
            {
                code: "//Copyright 2018\r\n//My Company\r\n/* DOCS */",
                options: [{
                    header: {
                        commentType: "line",
                        lines: ["Copyright 2018", "My Company"]
                    }
                }]
            },
            {
                code: "/*Copyright 2018\r\nMy Company*/\r\nconsole.log(1)",
                options: [{
                    header: {
                        commentType: "block",
                        lines: ["Copyright 2018", "My Company"],
                    },
                    lineEndings: "windows"
                }]
            },
            {
                code: "/*Copyright 2018\nMy Company*/\nconsole.log(1)",
                options: [{
                    header: {
                        commentType: "block",
                        lines: ["Copyright 2018", "My Company"],
                    },
                    lineEndings: "unix"
                }]
            },
            {
                code: [
                    "/*************************",
                    " * Copyright 2015",
                    " * My Company",
                    " *************************/",
                    "console.log(1)"
                ].join("\n"),
                options: [{
                    header: {
                        commentType: "block",
                        lines: [
                            "************************",
                            { pattern: " \\* Copyright \\d{4}" },
                            " * My Company",
                            " ************************"
                        ]
                    }
                }]
            },
            {
                code: "/*Copyright 2020, My Company*/\nconsole.log(1);",
                options: [{
                    header: {
                        commentType: "block",
                        lines: ["Copyright 2020, My Company"]
                    },
                    trailingEmptyLines: {
                        minimum: 1
                    }
                }]
            },
            {
                code: "/*Copyright 2020, My Company*/\n\nconsole.log(1);",
                options: [{
                    header: {
                        commentType: "block",
                        lines: ["Copyright 2020, My Company"]
                    },
                    trailingEmptyLines: {
                        minimum: 2
                    }
                }]
            },
            {
                code: "/*Copyright 2020, My Company*/\n\n// Log number one\nconsole.log(1);",
                options: [{
                    header: {
                        commentType: "block",
                        lines: ["Copyright 2020, My Company"]
                    },
                    trailingEmptyLines: {
                        minimum: 2
                    }
                }],
            },
            {
                code: "/*Copyright 2020, My Company*/\n\n/*Log number one*/\nconsole.log(1);",
                options: [{
                    header: {
                        commentType: "block",
                        lines: ["Copyright 2020, My Company"]
                    },
                    trailingEmptyLines: {
                        minimum: 2
                    }
                }],
            },
            {
                code: "/**\n * Copyright 2020\n * My Company\n **/\n\n/*Log number one*/\nconsole.log(1);",
                options: [{
                    header: {
                        commentType: "block",
                        lines: ["*\n * Copyright 2020\n * My Company\n *"]
                    },
                    trailingEmptyLines: {
                        minimum: 2
                    }
                }],
            },
            {
                code: "#!/usr/bin/env node\r\n/**\r\n * Copyright\r\n */",
                options: [{
                    header: {
                        commentType: "block",
                        lines: [
                            "*",
                            " * Copyright",
                            " "
                        ]
                    },
                    trailingEmptyLines: {
                        minimum: 0
                    }
                }]
            },
        ],
        invalid: generateInvalidTestCaseNames([
            {
                code: "console.log(1);",
                options: [{
                    header: {
                        commentType: "block",
                        lines: ["Copyright 2015, My Company"]
                    }
                }],
                errors: [
                    { message: "missing header" }
                ],
                output: "/*Copyright 2015, My Company*/\r\nconsole.log(1);"
            },
            {
                code: "console.log(1);",
                options: [{
                    header: {
                        commentType: "block",
                        lines: ["Copyright 2015, My Company"]
                    },
                    lineEndings: "unix"
                }],
                errors: [
                    { message: "missing header" }
                ],
                output: "/*Copyright 2015, My Company*/\nconsole.log(1);"
            },
            {
                code: "console.log(1);",
                options: [{
                    header: {
                        commentType: "block",
                        lines: ["Copyright 2015, My Company"]
                    },
                    lineEndings: "windows"
                }],
                errors: [
                    { message: "missing header" }
                ],
                output: "/*Copyright 2015, My Company*/\r\nconsole.log(1);"
            },
            {
                code: "//Copyright 2014, My Company\r\nconsole.log(1);",
                options: [{
                    header: {
                        commentType: "block",
                        lines: [{ pattern: "Copyright 2015" }, "My Company"]
                    }
                }],
                errors: [
                    {
                        message: "header should be a block comment",
                        column: 1,
                        endColumn: 29,
                        endLine: 1,
                        line: 1
                    }
                ],
            },
            {
                code: "//Copyright 2014, My Company\r\nconsole.log(1);",
                options: [{
                    header: {
                        commentType: "block",
                        lines: ["Copyright 2015, My Company"]
                    }
                }],
                errors: [
                    {
                        message: "header should be a block comment",
                        column: 1,
                        endColumn: 29,
                        endLine: 1,
                        line: 1
                    }
                ],
                output: "/*Copyright 2015, My Company*/\r\nconsole.log(1);"
            },
            {
                code: "//Copyright 2014, My Company\nconsole.log(1);",
                options: [{
                    header: {
                        commentType: "block",
                        lines: ["Copyright 2015, My Company"]
                    },
                    lineEndings: "unix"
                }],
                errors: [
                    {
                        message: "header should be a block comment",
                        column: 1,
                        endColumn: 29,
                        endLine: 1,
                        line: 1
                    }
                ],
                output: "/*Copyright 2015, My Company*/\nconsole.log(1);"
            },
            {
                code: "//Copyright 2014, My Company\r\nconsole.log(1);",
                options: [{
                    header: {
                        commentType: "block",
                        lines: ["Copyright 2015, My Company"]
                    },
                    lineEndings: "windows"
                }],
                errors: [
                    {
                        message: "header should be a block comment",
                        column: 1,
                        endColumn: 29,
                        endLine: 1,
                        line: 1
                    }
                ],
                output: "/*Copyright 2015, My Company*/\r\nconsole.log(1);"
            },
            {
                code: "/*Copyright 2014, My Company*/\r\nconsole.log(1);",
                options: [{
                    header: {
                        commentType: "line",
                        lines: ["Copyright 2015, My Company"]
                    }
                }],
                errors: [
                    {
                        message: "header should be a line comment",
                        column: 1,
                        endColumn: 31,
                        endLine: 1,
                        line: 1
                    }
                ],
                output: "//Copyright 2015, My Company\r\nconsole.log(1);"
            },
            {
                code: "/*Copyright 2014, My Company*/\r\nconsole.log(1);",
                options: [{
                    header: {
                        commentType: "block",
                        lines: ["Copyright 2015, My Company"]
                    }
                }],
                errors: [
                    { message: "incorrect header" }
                ],
                output: "/*Copyright 2015, My Company*/\r\nconsole.log(1);"
            },
            {
                // Test extra line in comment
                code: "/*Copyright 2015\r\nMy Company\r\nExtra*/\r\nconsole.log(1);",
                options: [{
                    header: {
                        commentType: "block",
                        lines: ["Copyright 2015", "My Company"]
                    }
                }],
                errors: [
                    { message: "incorrect header" }
                ],
                output: "/*Copyright 2015\r\nMy Company*/\r\nconsole.log(1);"
            },
            {
                code: "/*Copyright 2015\r\n*/\r\nconsole.log(1);",
                options: [{
                    header: {
                        commentType: "block",
                        lines: ["Copyright 2015", "My Company"]
                    }
                }],
                errors: [
                    { message: "incorrect header" }
                ],
                output: "/*Copyright 2015\r\nMy Company*/\r\nconsole.log(1);"
            },
            {
                code: "//Copyright 2014\r\n//My Company\r\nconsole.log(1)",
                options: [{
                    header: {
                        commentType: "line",
                        lines: ["Copyright 2015\r\nMy Company"]
                    }
                }],
                errors: [
                    { message: "incorrect header" }
                ],
                output: "//Copyright 2015\r\n//My Company\r\nconsole.log(1)"
            },
            {
                code: "//Copyright 2014\r\n//My Company\r\nconsole.log(1)",
                options: [{
                    header: {
                        commentType: "line",
                        lines: [{ pattern: "Copyright 2015" }, "My Company"]
                    }
                }],
                errors: [
                    { message: "incorrect header" }
                ],
            },
            {
                code: "//Copyright 2014\r\nconsole.log(1)",
                options: [{
                    header: {
                        commentType: "line",
                        lines: [{ pattern: "Copyright 2015" }, "My Company"]
                    }
                }],
                errors: [
                    { message: "incorrect header" }
                ],
            },
            {
                code: "//Copyright 2015",
                options: [{
                    header: {
                        commentType: "line",
                        lines: ["Copyright 2015\r\nMy Company"]
                    }
                }],
                errors: [
                    { message: "incorrect header" }
                ],
                output: "//Copyright 2015\r\n//My Company\r\n"
            },
            {
                code: "// Copyright 2017 trailing",
                options: [{
                    header: {
                        commentType: "line",
                        lines: [{ pattern: "^ Copyright \\d+$" }],
                    }
                }],
                errors: [
                    { message: "incorrect header" }
                ]
            },
            {
                code: "// Copyright 2017 trailing",
                options: [{
                    header: {
                        commentType: "line",
                        lines: [{ pattern: "^ Copyright \\d+$", template: " Copyright 2018" }],
                    }
                }],
                errors: [
                    { message: "incorrect header" }
                ],
                output: "// Copyright 2018\r\n"
            },
            {
                code: "// Copyright 2017 trailing\r\n// Someone",
                options: [{
                    header: {
                        commentType: "line",
                        lines: [{ pattern: "^ Copyright \\d+$", template: " Copyright 2018" }, " My Company"]
                    }
                }],
                errors: [
                    { message: "incorrect header" }
                ],
                output: "// Copyright 2018\r\n// My Company\r\n"
            },
            {
                code: "// Copyright 2017\r\n// Author: ab-c@example.com",
                options: [{
                    header: {
                        commentType: "line",
                        lines: [{ pattern: "Copyright \\d+" }, { pattern: "^ Author: \\w+@\\w+\\.\\w+$" }]
                    }
                }],
                errors: [
                    { message: "incorrect header" }
                ]
            },
            {
                code: "/* Copyright 2017-01-02\r\n Author: abc@example.com */",
                options: [{
                    header: {
                        commentType: "block",
                        lines: [{ pattern: "^ Copyright \\d+\\r\\n Author: \\w+@\\w+\\.\\w+ $" }],
                    }
                }],
                errors: [
                    { message: "incorrect header" }
                ]
            },
            {
                code: [
                    "/*************************",
                    " * Copyright 2015",
                    " * All your base are belong to us!",
                    " *************************/",
                    "console.log(1)"
                ].join("\r\n"),
                options: [{
                    header: {
                        commentType: "block",
                        lines: [
                            "************************",
                            { pattern: " \\* Copyright \\d{4}", template: " * Copyright 2019" },
                            " * My Company",
                            " ************************"
                        ]
                    }
                }],
                errors: [
                    { message: "incorrect header" }
                ],
                output: [
                    "/*************************",
                    " * Copyright 2019",
                    " * My Company",
                    " *************************/",
                    "console.log(1)"
                ].join("\r\n")
            },
            {
                code: "/*Copyright 2020, My Company*/console.log(1);",
                options: [{
                    header: {
                        commentType: "block",
                        lines: ["Copyright 2020, My Company"]
                    },
                    trailingEmptyLines: {
                        minimum: 2
                    }
                }],
                errors: [
                    {
                        message: "not enough newlines after header: expected: 2, actual: 0",
                        column: 31,
                        endColumn: 32,
                        endLine: 1,
                        line: 1,
                    }
                ],
                output: "/*Copyright 2020, My Company*/\r\n\r\nconsole.log(1);"
            },
            {
                code: "/*Copyright 2020, My Company*/console.log(1);",
                options: [{
                    header: {
                        commentType: "block",
                        lines: ["Copyright 2020, My Company"]
                    },
                    trailingEmptyLines: {
                        minimum: 1
                    }
                }],
                errors: [
                    {
                        message: "not enough newlines after header: expected: 1, actual: 0",
                        column: 31,
                        endColumn: 32,
                        endLine: 1,
                        line: 1,
                    }
                ],
                output: "/*Copyright 2020, My Company*/\r\nconsole.log(1);"
            },
            {
                code: "//Copyright 2020\r\n//My Company\r\nconsole.log(1);",
                options: [{
                    header: {
                        commentType: "line",
                        lines: ["Copyright 2020", "My Company"]
                    },
                    trailingEmptyLines: {
                        minimum: 2
                    }
                }],
                errors: [
                    {
                        message: "not enough newlines after header: expected: 2, actual: 1",
                        column: 13,
                        endColumn: 1,
                        endLine: 3,
                        line: 2,
                    }
                ],
                output: "//Copyright 2020\r\n//My Company\r\n\r\nconsole.log(1);"
            },
            {
                code: "//Copyright 2020\n//My Company\nconsole.log(1);",
                options: [{
                    header: {
                        commentType: "line",
                        lines: [{ pattern: "Copyright 2020" }, "My Company"]
                    },
                    trailingEmptyLines: {
                        minimum: 2
                    }
                }],
                errors: [
                    {
                        message: "not enough newlines after header: expected: 2, actual: 1",
                        column: 13,
                        endColumn: 1,
                        endLine: 3,
                        line: 2,
                    }
                ],
                output: "//Copyright 2020\n//My Company\r\n\nconsole.log(1);"
            },
            {
                code: "/*Copyright 2020, My Company*/\r\nconsole.log(1);\r\n//Comment\r\nconsole.log(2);\r\n//Comment",
                options: [{
                    header: {
                        commentType: "block",
                        lines: ["Copyright 2020, My Company"]
                    },
                    trailingEmptyLines: {
                        minimum: 2
                    }
                }],
                errors: [
                    {
                        message: "not enough newlines after header: expected: 2, actual: 1",
                        column: 31,
                        endColumn: 1,
                        endLine: 2,
                        line: 1,
                    }
                ],
                output: [
                    "/*Copyright 2020, My Company*/",
                    "",
                    "console.log(1);",
                    "//Comment",
                    "console.log(2);",
                    "//Comment"
                ].join("\r\n")
            },
            {
                code: "//Copyright 2020\n//My Company\nconsole.log(1);\n//Comment\nconsole.log(2);\n//Comment",
                options: [{
                    header: {
                        commentType: "line",
                        lines: ["Copyright 2020", "My Company"],
                    },
                    lineEndings: "unix",
                    trailingEmptyLines: {
                        minimum: 2
                    }
                }],
                errors: [
                    {
                        message: "not enough newlines after header: expected: 2, actual: 1",
                        column: 13,
                        endColumn: 1,
                        endLine: 3,
                        line: 2,
                    }
                ],
                output: "//Copyright 2020\n//My Company\n\nconsole.log(1);\n//Comment\nconsole.log(2);\n//Comment"
            },
            {
                code: "/*Copyright 2020, My Company*/\r\nconsole.log(1);\r\n//Comment\r\nconsole.log(2);\r\n//Comment",
                options: [{
                    header: {
                        commentType: "block",
                        lines: [{ pattern: "Copyright 2020, My Company" }]
                    },
                    trailingEmptyLines: {
                        minimum: 2
                    }
                }],
                errors: [
                    { message: "not enough newlines after header: expected: 2, actual: 1" }
                ],
                output: [
                    "/*Copyright 2020, My Company*/",
                    "",
                    "console.log(1);",
                    "//Comment",
                    "console.log(2);",
                    "//Comment"
                ].join("\r\n")
            },
            {
                code: [
                    "//Copyright 2020",
                    "//My Company",
                    "console.log(1);",
                    "//Comment",
                    "console.log(2);",
                    "//Comment"
                ].join("\r\n"),
                options: [{
                    header: {
                        commentType: "line",
                        lines: ["Copyright 2020", "My Company"],
                    },
                    lineEndings: "windows",
                    trailingEmptyLines: {
                        minimum: 2
                    }
                }],
                errors: [
                    {
                        message: "not enough newlines after header: expected: 2, actual: 1",
                        column: 13,
                        endColumn: 1,
                        endLine: 3,
                        line: 2,
                    }
                ],
                output: [
                    "//Copyright 2020",
                    "//My Company",
                    "",
                    "console.log(1);",
                    "//Comment",
                    "console.log(2);",
                    "//Comment"
                ].join("\r\n")
            },
            {
                code: [
                    "//Copyright 2020",
                    "//My Company",
                    "console.log(1);",
                    "//Comment",
                    "console.log(2);",
                    "//Comment"
                ].join("\r\n"),
                options: [{
                    header: {
                        commentType: "line",
                        lines: ["Copyright 2020", "My Company"]
                    },
                    trailingEmptyLines: {
                        minimum: 2
                    }
                }],
                errors: [
                    {
                        message: "not enough newlines after header: expected: 2, actual: 1",
                        column: 13,
                        endColumn: 1,
                        endLine: 3,
                        line: 2,
                    }
                ],
                output: [
                    "//Copyright 2020",
                    "//My Company",
                    "",
                    "console.log(1);",
                    "//Comment",
                    "console.log(2);",
                    "//Comment"
                ].join("\r\n")
            },
            {
                code: "\r\n\r\n\r\n\r\n\r\nconsole.log(1);",
                options: [{
                    header: {
                        commentType: "line",
                        lines: ["Copyright 2020", "My Company"]
                    },
                    trailingEmptyLines: {
                        minimum: 7
                    }
                }],
                errors: [
                    { message: "missing header" }
                ],
                output: "//Copyright 2020\r\n//My Company\r\n\r\n\r\n\r\n\r\n\r\n\r\nconsole.log(1);"
            },
            {
                code: "\r\n\r\n\r\n\r\n\r\nconsole.log(1);",
                options: [{
                    header: {
                        commentType: "block",
                        lines: ["", " * Copyright 2020", " * My Company", " "]
                    },
                    trailingEmptyLines: {
                        minimum: 2
                    }
                }],
                errors: [
                    { message: "missing header" }
                ],
                output: "/*\r\n * Copyright 2020\r\n * My Company\r\n */\r\n\r\n\r\n\r\n\r\nconsole.log(1);"
            },
            {
                code: "//Copyright 2020 My Company\r\nconsole.log(1);",
                options: ["line", "Copyright 2020 My Company", 3],
                errors: [
                    {
                        message: "not enough newlines after header: expected: 3, actual: 1",
                        column: 28,
                        endColumn: 1,
                        endLine: 2,
                        line: 1,
                    }
                ],
                output: "//Copyright 2020 My Company\r\n\r\n\r\nconsole.log(1);"
            },
            {
                code: "//Copyright 2020 My Company\r\nconsole.log(1);",
                options: ["line", ["Copyright 2020 My Company"], 3],
                errors: [
                    {
                        message: "not enough newlines after header: expected: 3, actual: 1",
                        column: 28,
                        endColumn: 1,
                        endLine: 2,
                        line: 1,
                    }
                ],
                output: "//Copyright 2020 My Company\r\n\r\n\r\nconsole.log(1);"
            },
            {
                code: "\r\n\r\n\r\n\r\n\r\nconsole.log(1);",
                options: [{
                    header: {
                        commentType: "line",
                        lines: ["Copyright 2020", "My Company"]
                    },
                    trailingEmptyLines: {
                        minimum: 2
                    }
                }],
                errors: [
                    { message: "missing header" }
                ],
                output: "//Copyright 2020\r\n//My Company\r\n\r\n\r\n\r\n\r\nconsole.log(1);"
            },
            {
                code: "#!/usr/bin/env node\r\nconsole.log(1);",
                options: [{
                    header: {
                        commentType: "line",
                        lines: [" Copyright"]
                    }
                }],
                errors: [
                    { message: "missing header" },
                ],
                output: "#!/usr/bin/env node\r\n// Copyright\r\nconsole.log(1);",
            },
            {
                code: "#!/usr/bin/env node\r\n\r\n\r\nconsole.log(1);",
                options: [{
                    header: {
                        commentType: "line",
                        lines: [" Copyright"]
                    }
                }],
                errors: [
                    { message: "missing header" },
                ],
                output: "#!/usr/bin/env node\r\n// Copyright\r\n\r\nconsole.log(1);",
            },
            {
                code: "#!/usr/bin/env node",
                options: [{
                    header: {
                        commentType: "line",
                        lines: [" Copyright"]
                    }
                }],
                errors: [
                    { message: "missing header" },
                ],
                output: "#!/usr/bin/env node\r\n// Copyright\r\n",
            },
            {
                code: "#!/usr/bin/env node",
                options: [{
                    header: {
                        commentType: "block",
                        lines: [" Copyright "]
                    }
                }],
                errors: [
                    { message: "missing header" },
                ],
                output: "#!/usr/bin/env node\r\n/* Copyright */\r\n",
            }
        ])
    });
});
