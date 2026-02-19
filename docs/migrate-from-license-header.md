# Migrating from _eslint-plugin-headers_

The document explains how to migrate from
[eslint-plugin-license-header](https://github.com/nikku/eslint-plugin-license-header)
to _\@tony.ganchev/eslint-plugin-header_.

## Table of Contents

1. [Table of Contents](#table-of-contents)
2. [Before we Begin](#before-we-begin)
3. [Inline Configuration Example](#inline-configuration-example)
4. [File-based Configuration Example](#file-based-configuration-example)

## Before we Begin

The document is structured broken down into configuration use-cases. For each we
present configurations for both plugins within the same ESLint config - the same
way we tested them out.

We follow the official documentation of _eslint-plugin-license-header_ and add
specific corner cases to further illustrate more intricate details.

We are not covering legacy ESLint JSON-based config to keep the guide concise.

## Inline Configuration Example

We want to validate the following file:

```js
/***********************************************
 * Copyright My Company
 * Copyright 2026
 ***********************************************/

test();
```

We can do it with the following configuration:

```ts
import header, { HeaderOptions, HeaderRuleConfig } from "@tony.ganchev/eslint-plugin-header";
import licenseHeader from "eslint-plugin-license-header";
import { defineConfig } from "eslint/config";

export default defineConfig([
    {
        files: ["**/*.js"],
        plugins: {
            // @ts-ignore plugin definition lacks necessary metadata to pass
            // a type check.
            "license-header": licenseHeader,
            "@tony.ganchev": header
        },
        rules: {
            "license-header/header": [
                "error",
                [
                    "/***********************************************",
                    " * Copyright My Company",
                    " * Copyright " + new Date().getFullYear(),
                    " ***********************************************/",
                ]
            ],
            "@tony.ganchev/header": [
                "error",
                {
                    header: {
                        commentType: "block",
                        lines: [
                            "**********************************************",
                            " * Copyright My Company",
                            " * Copyright " + new Date().getFullYear(),
                            " **********************************************",
                        ]
                    },
                    // Added for explicitness. Removing this would still allow
                    // the above example to pass.
                    trailingEmptyLines: {
                        minimum: 2
                    }
                } as HeaderOptions
            ] as HeaderRuleConfig
        }
    },
]);
```

Note: _eslint-plugin-license-header_ expects one empty line between the header
and the content of the file. There is no setting to tell th plugin to do
otherwise.

## File-based Configuration Example

Both plugins use one and the same header template file format. The configuration
to use it as follows:

```ts
import header, { HeaderOptions, HeaderRuleConfig } from "@tony.ganchev/eslint-plugin-header";
import licenseHeader from "eslint-plugin-license-header";
import { defineConfig } from "eslint/config";

export default defineConfig([
    {
        files: ["**/*.js"],
        plugins: {
            // @ts-ignore plugin definition lacks necessary metadata to pass
            // a type check.
            "license-header": licenseHeader,
            "@tony.ganchev": header
        },
        rules: {
            "license-header/header": [
                "error",
                "header.js.template"
            ],
            "@tony.ganchev/header": [
                "error",
                {
                    header: {
                        file: "header.js.template"
                    },
                    // Added for explicitness. Removing this would still allow
                    // the above example to pass.
                    trailingEmptyLines: {
                        minimum: 2
                    }
                } as HeaderOptions
            ] as HeaderRuleConfig
        }
    },
]);
```
