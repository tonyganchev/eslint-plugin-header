# Migrating from Legacy to Modern Configuration Format

The document explains how to migrate from the
[legacy configuration format](legacy-config.md) inherited from
[eslint-plugin-header](https://github.com/Stuk/eslint-plugin-header), to the
[new configuration format](../README.md#usage).

## Table of Contents

1. [Table of Contents](#table-of-contents)
2. [Before we Begin](#before-we-begin)
3. [File-based Configuration](#file-based-configuration)
   1. [File-only](#file-only)
   2. [File and Settings](#file-and-settings)
4. [Inline Configuration](#inline-configuration)
   1. [Single-line](#single-line)
   2. [Single Regular Expression](#single-regular-expression)
   3. [Array of Strings](#array-of-strings)
   4. [Array of Strings and/or Patterns](#array-of-strings-andor-patterns)
   5. [Adding Auto-fixable Patterns](#adding-auto-fixable-patterns)
5. [Trailing Empty Lines Configuration](#trailing-empty-lines-configuration)

## Before we Begin

The document structured as a list of configuration use-cases. For each use-case
we present both their _Legacy Configuration_ and _New Configuration_ equivalent.

To keep the code concise, we just show the _header_ configuration rule snippet.
It is part of a larger flat ESLint configuration as presented here:

```js
import header from "@tony.ganchev/eslint-plugin-header";
import { defineConfig } from "eslint/config";

const headerConfig = {
    // Values from the examples go here...
};

export default defineConfig([
    {
        files: ["**/*.js"],
        plugins: {
            "@tony.ganchev": header
        },
        rules: {
            "@tony.ganchev/header": headerConfig
        }
    }
]);

```

## File-based Configuration

### File-only

Legacy Configuration:

```js
const headerConfig = [
    "error",
    "config/header.js"
];
```

New Configuration:

```js
const headerConfig = [
    "error",
    {
        header: {
            file: "config/header.js"
        }
    }
];
```

### File and Settings

Legacy Configuration:

```js
const headerConfig = [
    "error",
    "config/header.js",
    {
        lineEndings: "windows"
    }
];
```

New Configuration:

```js
const headerConfig = [
    "error",
    {
        header: {
            file: "config/header.js"
        },
        lineEndings: "windows"
    }
];
```

## Inline Configuration

### Single-line

There is no special configuration format for a single-line matcher. The _header_
rule assumes that if only a single line is given it should be tested against
the full header comment. Applies to both string- and regular-expression rules.

Legacy Configuration:

```js
const headerConfig = [
    "error",
    "block",
    "\n * Copyright (c) 2015\n * My Company\n "
];
```

New Configuration:

```js
const headerConfig = [
    "error",
    {
        header: {
            commentType: "block",
            lines: ["\n * Copyright (c) 2015\n * My Company\n "]
        }
    }
];
```

### Single Regular Expression

Legacy Configuration:

```js
const headerConfig = [
    "error",
    "block",
    {
        pattern:
            "\\n \\* Copyright \\(c\\) 2015\\n \\* My Company\\n "
    }
];
```

New Configuration:

```js
const headerConfig = [
    "error",
    {
        header: {
            commentType: "block",
            lines: [/\n \* Copyright \(c\) 2015\n \* My Company\n /]
        }
    }
];
```

### Array of Strings

Legacy Configuration:

```js
const headerConfig = [
    "error",
    "block",
    [
        "",
        " * Copyright (c) 2015",
        " * My Company",
        " "
    ]
];
```

New Configuration:

```js
const headerConfig = [
    "error",
    {
        header: {
            commentType: "block",
            lines: [
                "",
                " * Copyright (c) 2015",
                " * My Company",
                " "
            ]
        }
    }
];
```

### Array of Strings and/or Patterns

Legacy Configuration:

```js
const headerConfig = [
    "error",
    "block",
    [
        "",
        { pattern: " \\* Copyright \\(c\\) 2015" },
        " * My Company",
        " "
    ]
];
```

New Configuration:

```js
const headerConfig = [
    "error",
    {
        header: {
            commentType: "block",
            lines: [
                "",
                / \* Copyright \(c\) 2015/,
                " * My Company",
                " "
            ]
        }
    }
];
```

Note: you can still use strings in place of RegExp objects (do not forget to
escape the backslashes). This would allow you to use the new configuration in
legacy hierarchical ESLint configuration files.

### Adding Auto-fixable Patterns

Legacy Configuration:

```js
const headerConfig = [
    "error",
    "block",
    [
        {
            "pattern": " Copyright \\(c\\) (\\d{4}-)?\\d{4}",
            "template": " Copyright 2025",
        },
        " My Company"
    ]
];
```

New Configuration:

```js
const headerConfig = [
    "error",
    {
        header: {
            commentType: "block",
            lines: [
                {
                    pattern: / Copyright \(c\) (\d{4}-)?\d{4}/,
                    template: " Copyright 2025",
                },
                " My Company"
            ]
        }
    }
];
```

## Trailing Empty Lines Configuration

Legacy Configuration:

```js
const headerConfig = [
        "error",
    "block",
    [
        " Copyright now",
        "My Company "
    ],
    2
];
```

New Configuration:

```js
const headerConfig = [
    "error",
    {
        header: {
            commentType: "block",
            lines: [
                " Copyright now",
                "My Company "
            ]
        },
        trailingEmptyLines: {
            minimum: 2
        }
    }
];
```
