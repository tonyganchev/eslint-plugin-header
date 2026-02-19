# Migrating from _eslint-plugin-headers_

The document explains how to migrate from
[eslint-plugin-headers](https://github.com/robmisasi/eslint-plugin-headers)
to _\@tony.ganchev/eslint-plugin-header_.

## Table of Contents

1. [Table of Contents](#table-of-contents)
2. [Before we Begin](#before-we-begin)
3. [Basic Example](#basic-example)
   1. [No New Lines](#no-new-lines)
   2. [Regular multi-line comment](#regular-multi-line-comment)
4. [Line Comments](#line-comments)
5. [File-based config](#file-based-config)
6. [Handling of Existing Headers](#handling-of-existing-headers)
7. [Variables and Substitution](#variables-and-substitution)
   1. [Variable Matching](#variable-matching)
   2. [Variable Substitution](#variable-substitution)
8. [Shebangs](#shebangs)

## Before we Begin

The document is structured broken down into configuration use-cases. For each we
present configurations for both plugins within the same ESLint config - the same
way we tested them out.

We follow the official documentation of _eslint-plugin-headers_ and add specific
corner cases to further illustrate more intricate details.

We are not covering legacy ESLint JSON-based config to keep the guide concise.

## Basic Example

```js
/**
 * Copyright 2024. All rights reserved.
 */
console.log('Hello!');
```

The code above can be validated by the following configs:

```ts
import header, { HeaderOptions, HeaderRuleConfig } from "@tony.ganchev/eslint-plugin-header";
import headers from "eslint-plugin-headers";
import { defineConfig } from "eslint/config";

export default defineConfig([
    {
        files: ["**/*.js"],
        plugins: {
            headers,
            "@tony.ganchev": header,
            "@tony.ganchev2": header
        },
        rules: {
            "headers/header-format": [
                "error",
                {
                    source: "string",
                    content: "Copyright 2024. All rights reserved."
                }
            ],
            "@tony.ganchev/header": [
                // multi-line config
                "error",
                {
                    header: {
                        commentType: "block",
                        lines: [
                            "*",
                            " * Copyright 2024. All rights reserved.",
                            " "
                        ]
                    }
                } as HeaderOptions
            ] as HeaderRuleConfig,
            "@tony.ganchev2/header": [
                "error",
                // single-string config
                {
                    header: {
                        commentType: "block",
                        lines: ["*\n * Copyright 2024. All rights reserved.\n "]
                    }
                } as HeaderOptions
            ] as HeaderRuleConfig
        }
    },
]);

```

Important things to note:

- By default, _eslint-plugin-headers_ assumes block comments and particularly
  _JSDoc_ comments. It also assumes that the multiline format follows the
  general JavaDoc standards by prepending each line in the middle with ` * ` and
  having an empty space before the closing `*/`.
- On the contrary, _\@tony.ganchev/_eslint-plugin-header_ validates all
  characters between `/*` and `*/` allowing the configuration to remain simple
  by not implementing multiple multiline comment styles and leaving the exact format to be described in the header template.
- _\@tony.ganchev/_eslint-plugin-header_ assumes 1 trailing empty line by
  default. _eslint-plugin-headers_ does not enforce any without explicit
  configuration. This would be made clear in the subsequent example.
- Two versions of the config were provided for
  _\@tony.ganchev/_eslint-plugin-header_ to show the different ways
  configuration could be done varying between conciseness and readability.

### No New Lines

If the above example code had the first statement start from the same line as the closing delimiter of the header like this:

```js
/**
 * Copyright 2024. All rights reserved.
 */console.log('Hello!');
```

... this would still pass with the _eslint-plugin-headers_ configuration but
would fail with the _\@tony.ganchev/_eslint-plugin-header_ configuration. To address this, you need to add `trailingEmptyLines.minimum` configuration:

```ts
import header, { HeaderOptions, HeaderRuleConfig } from "@tony.ganchev/eslint-plugin-header";
import headers from "eslint-plugin-headers";
import { defineConfig } from "eslint/config";

export default defineConfig([
    {
        files: ["**/*.js"],
        plugins: {
            headers,
            "@tony.ganchev": header
        },
        rules: {
            "headers/header-format": [
                "error",
                {
                    source: "string",
                    // style: "jsdoc", --> default
                    content: "Copyright 2024. All rights reserved."
                }
            ],
            "@tony.ganchev/header": [
                // multi-line config
                "error",
                {
                    header: {
                        commentType: "block",
                        lines: [
                            "*",
                            " * Copyright 2024. All rights reserved.",
                            " "
                        ]
                    },
                    trailingEmptyLines: {
                        minimum: 0
                    }
                } as HeaderOptions
            ] as HeaderRuleConfig
        }
    },
]);
```

If you want to enforce two empty lines in both projects, do the following:

```ts
import header, { HeaderOptions, HeaderRuleConfig } from "@tony.ganchev/eslint-plugin-header";
import headers from "eslint-plugin-headers";
import { defineConfig } from "eslint/config";

export default defineConfig([
    {
        files: ["**/*.js"],
        plugins: {
            headers,
            "@tony.ganchev": header
        },
        rules: {
            "headers/header-format": [
                "error",
                {
                    source: "string",
                    // style: "jsdoc", --> default
                    content: "Copyright 2024. All rights reserved.",
                    trailingNewlines: 2
                }
            ],
            "@tony.ganchev/header": [
                // multi-line config
                "error",
                {
                    header: {
                        commentType: "block",
                        lines: [
                            "*",
                            " * Copyright 2024. All rights reserved.",
                            " "
                        ]
                    },
                    trailingEmptyLines: {
                        minimum: 2
                    }
                } as HeaderOptions
            ] as HeaderRuleConfig
        }
    },
]);
```

### Regular multi-line comment

Let's see what we need to do to validate the following copyright:

```js
/*
 * Copyright 2024. All rights reserved.
 */
console.log('Hello!');
```

The configuration to enforce this header would be:

```ts
import header, { HeaderOptions, HeaderRuleConfig } from "@tony.ganchev/eslint-plugin-header";
import headers from "eslint-plugin-headers";
import { defineConfig } from "eslint/config";

export default defineConfig([
    {
        files: ["**/*.js"],
        plugins: {
            headers,
            "@tony.ganchev": header
        },
        rules: {
            "headers/header-format": [
                "error",
                {
                    source: "string",
                    content: "Copyright 2024. All rights reserved.",
                    blockPrefix: "\n" // default "*\n"
                }
            ],
            "@tony.ganchev/header": [
                "error",
                {
                    header: {
                        commentType: "block",
                        lines: [
                            "",
                            " * Copyright 2024. All rights reserved.",
                            " "
                        ]
                    }
                } as HeaderOptions
            ] as HeaderRuleConfig
        }
    },
]);
```

`blockPrefix` value overrides the default JSDoc prefix of `*\n`.

Now, suppose we want to have a multiline comment that ignores the leading as in:

```js
/* Copyright 2024
   All rights reserved */
console.log('Hello!');
```

The configuration necessary for both plugins is shown below:

```ts
import header, { HeaderOptions, HeaderRuleConfig } from "@tony.ganchev/eslint-plugin-header";
import headers from "eslint-plugin-headers";
import { defineConfig } from "eslint/config";

export default defineConfig([
    {
        files: ["**/*.js"],
        plugins: {
            headers,
            "@tony.ganchev": header
        },
        rules: {
            "headers/header-format": [
                "error",
                {
                    source: "string",
                    content: "Copyright 2024\n   All rights reserved",
                    blockPrefix: " ", // default "*\n"
                    blockSuffix: " ", // default "\n "
                    linePrefix: "", // default " * "
                }
            ],
            "@tony.ganchev/header": [
                "error",
                {
                    header: {
                        commentType: "block",
                        lines: [
                            " Copyright 2024",
                            "   All rights reserved ",
                        ]
                    }
                } as HeaderOptions
            ] as HeaderRuleConfig
        }
    },
]);
```

Things to note:

- _\@tony.ganchev/_eslint-plugin-header_ assumes all characters within the
  comment delimiters should be validated as part of the header without
  attempting to be smart.
- With _eslint-plugin-headers_ basically the user needs to assume turn off all
  the "smart" features so that validation again devolves to whitespace counting.
- Major difference that helps in the migration to
  _\@tony.ganchev/eslint-plugin-header_ is that the latter offers significantly
  improved error reporting and targeted auto-fixes allowing you to gradually
  progress to building the right validation pattern.

## Line Comments

```js
// Copyright 2024
// All rights reserved 
console.log('Hello!');
```

```ts
import header, { HeaderOptions, HeaderRuleConfig } from "@tony.ganchev/eslint-plugin-header";
import headers from "eslint-plugin-headers";
import { defineConfig } from "eslint/config";

export default defineConfig([
    {
        files: ["**/*.js"],
        plugins: {
            headers,
            "@tony.ganchev": header
        },
        rules: {
            "headers/header-format": [
                "error",
                {
                    source: "string",
                    style: "line",
                    content: "Copyright 2024\nAll rights reserved"
                }
            ],
            "@tony.ganchev/header": [
                "error",
                {
                    header: {
                        commentType: "line",
                        lines: [
                            " Copyright 2024",
                            " All rights reserved "
                        ]
                    }
                } as HeaderOptions
            ] as HeaderRuleConfig
        }
    },
]);
```

Again, _eslint-plugin-headers_ assumes leading spaces for each comment line, so
we need to make some changes if we need to validate the header below:

```js
//Copyright 2024
//All rights reserved
console.log('Hello!');
```

Ths config:

```ts
import header, { HeaderOptions, HeaderRuleConfig } from "@tony.ganchev/eslint-plugin-header";
import headers from "eslint-plugin-headers";
import { defineConfig } from "eslint/config";

export default defineConfig([
    {
        files: ["**/*.js"],
        plugins: {
            headers,
            "@tony.ganchev": header
        },
        rules: {
            "headers/header-format": [
                "error",
                {
                    source: "string",
                    style: "line",
                    content: "Copyright 2024\nAll rights reserved",
                    linePrefix: "" // default " "
                }
            ],
            "@tony.ganchev/header": [
                "error",
                {
                    header: {
                        commentType: "line",
                        lines: [
                            "Copyright 2024",
                            "All rights reserved"
                        ]
                    }
                } as HeaderOptions
            ] as HeaderRuleConfig
        }
    },
]);
```

Note also that _eslint-plugin-headers_ is more forgiving of trailing spaces
while _\@tony.ganchev/eslint-plugin-header_ would fail validation.

## File-based config

Note that the documentation of _eslint-plugin-headers_ only mentions the possibility of using file-defined header template. From playing with the feature
we see that the format for the template is different from the one for
_\@tony.ganchev/eslint-plugin-header_. While the latter expects a comment block
in a valid JavaScript file, the former expects only the content:

_header.template_ in use by _eslint-plugin-headers_:

```text
Copyright 2024
All rights reserved
```

_header.js.template_ in use by _\@tony.ganchev/eslint-plugin-header_:

```js
//Copyright 2024
//All rights reserved
```

ESLint configuration:

```ts
import header, { HeaderOptions, HeaderRuleConfig } from "@tony.ganchev/eslint-plugin-header";
import headers from "eslint-plugin-headers";
import { defineConfig } from "eslint/config";

export default defineConfig([
    {
        files: ["**/*.js"],
        plugins: {
            headers,
            "@tony.ganchev": header
        },
        rules: {
            "headers/header-format": [
                "error",
                {
                    source: "file",
                    style: "line",
                    path: "header.template",
                    linePrefix: ""
                }
            ],
            "@tony.ganchev/header": [
                "error",
                {
                    header: {
                        file: "header.js.template"
                    }
                } as HeaderOptions
            ] as HeaderRuleConfig
        }
    },
]);
```

## Handling of Existing Headers

_eslint-plugin-headers_'s documentation has an example of autofixing within an
existing header carrying arbitrary number of JSDoc directives.
_\@tony.ganchev/eslint-plugin-header_ does no support autofixing headers with
arbitrary number of lines but can be configured to validate it.

To be clear we need to validate both ...

```js
/**
 * Copyright 2024. All rights reserved.
 */
module.exports = 42;
```

... and ...

```js
/**
 * Copyright 2024. All rights reserved.
 * 
 * @fileoverview This file contains a magic number.
 * @author Rob Misasi
 */
module.exports = 42;
```

The configuration needed to do this:

```ts
import header, { HeaderOptions, HeaderRuleConfig } from "@tony.ganchev/eslint-plugin-header";
import headers from "eslint-plugin-headers";
import { defineConfig } from "eslint/config";

export default defineConfig([
    {
        files: ["**/*.js"],
        plugins: {
            headers,
            "@tony.ganchev": header
        },
        rules: {
            "headers/header-format": [
                "error",
                {
                    source: "string",
                    content: "Copyright 2024. All rights reserved.",
                }
            ],
            "@tony.ganchev/header": [
                "error",
                {
                    header: {
                        commentType: "block",
                        lines: [
                            // eslint-disable-next-line @stylistic/max-len
                            /^\*\r?\n \* Copyright 2024\. All rights reserved\.\r?\n( \*\r?\n \* @\w+ .*\r?\n( \* .*\r?\n)*)* $/
                        ]
                    }
                } as HeaderOptions
            ] as HeaderRuleConfig
        }
    },
]);
```

The regular expression looks complex because it supports multi-line JSDoc
directives.

## Variables and Substitution

_eslint-plugin-headers_ offers the ability to match variables and replace them
in autofixes. While _\@tony.ganchev/eslint-plugin-header_ does not offer 1:1
feature parity here, all of the behaviors demonstrated are supported out of the box.

### Variable Matching

Suppose we want to match the year and company to the correct formats in the following example:

```js
/**
 * Copyright 1985 Contemporary Org. All rights reserved.
 */
module.exports = 42;
```

The configuration is straightforward and is again achieved through a regular
expression.

```ts
import header, { HeaderOptions, HeaderRuleConfig } from "@tony.ganchev/eslint-plugin-header";
import headers from "eslint-plugin-headers";
import { defineConfig } from "eslint/config";

export default defineConfig([
    {
        files: ["**/*.js"],
        plugins: {
            headers,
            "@tony.ganchev": header
        },
        rules: {
            "headers/header-format": [
                "error",
                {
                    "source": "string",
                    "content": "Copyright (year) {company}. All rights reserved.",
                    "variables": {
                        "company": "Contemporary Org"
                    },
                    "patterns": {
                        "year": {
                            "pattern": "\\d{4}",
                            "defaultValue": "2025"
                        }
                    }
                },
            ],
            "@tony.ganchev/header": [
                "error",
                {
                    header: {
                        commentType: "block",
                        lines: [
                            "*",
                            {
                                pattern: /^ \* Copyright \d{4} Contemporary Org\. All rights reserved\.$/,
                                template: " * Copyright 2025 Contemporary Org. All rights reserved."
                            },
                            " "
                        ]
                    }
                } as HeaderOptions
            ] as HeaderRuleConfig
        }
    },
]);

```

Things to notice:

- In the _eslint-plugin-headers_, the _company_ variable is unnecessary since
  it is always validated to be the same entity.
- The year placeholder is using normal braces which is not explained clearly in
  the plugin docs. Also it is not explained what the brace escaping rules look
  like.
- _\@tony.ganchev/eslint-plugin-header_ solves the same problem with just a
  single regular expression. Note that a `template` property is provided so that
  the line can be auto-fixed if necessary. Moving the opening and closing line
  patterns outside of the regular expression improves its readability
  significantly.

### Variable Substitution

The case where you want to substitute only the variables failing validation is
not supported outside of the example shown above.

Still, _eslint-plugin-headers_ lists an example with two variables with constant predefined values. This example brings little value as it is the same as
accepting a fixed header template with the variables replaced.

## Shebangs

Both plugins support she-bangs before the copyright header. Key differences:

- _eslint-plugin-headers_ does not recognize `#!` alone on a line as a she-bang.
- _\@tony.ganchev/eslint-plugin-header_ does not allow an empty line between the
  she-bang directive.

No settings in any of the plugin can turn their behavior to be closer to closer
to the behavior of the other plugin.
