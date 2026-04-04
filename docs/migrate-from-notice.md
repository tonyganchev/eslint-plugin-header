# Migrating from _eslint-plugin-notice_

The document explains how to migrate from
[eslint-plugin-notice](https://github.com/earl-man/eslint-plugin-notice)
to _\@tony.ganchev/eslint-plugin-header_.

## Table of Contents

1. [Table of Contents](#table-of-contents)
2. [Before we Begin](#before-we-begin)
3. [Configuration Mapping](#configuration-mapping)
4. [Handling Dynamic Years](#handling-dynamic-years)
5. [Fix Behavior](#fix-behavior)
6. [Features with no direct equivalent](#features-with-no-direct-equivalent)

## Before we Begin

The document is structured broken down into configuration use-cases. For each we
present configurations for both plugins within the same ESLint config - the same
way we tested them out.

We are not covering legacy ESLint JSON-based config to keep the guide concise.

## Configuration Mapping

In your Flat Config (`eslint.config.ts` or `eslint.config.mjs`), replace the
`notice/notice` rule with `@tony.ganchev/header`.

```ts
import header, { HeaderOptions, HeaderRuleConfig } from "@tony.ganchev/eslint-plugin-header";
import notice from "eslint-plugin-notice";
import { defineConfig } from "eslint/config";

export default defineConfig([
    {
        files: ["**/*.js"],
        plugins: {
            notice,
            "@tony.ganchev": header
        },
        rules: {
            "notice/notice": ["error", {
                templateFile: "config/copyright.txt",
                onNonMatchingHeader: "replace"
            }],
            "@tony.ganchev/header": [
                "error",
                {
                    header: {
                        file: "config/copyright.txt"
                    }
                } as HeaderOptions
            ] as HeaderRuleConfig
        }
    }
]);
```

## Handling Dynamic Years

_eslint-plugin-notice_ uses `{{YEAR}}` variables in template files. Since
_\@tony.ganchev/eslint-plugin-header_ uses standard Flat Config (which is just
JavaScript/TypeScript), you can handle this natively.

If you have a dynamic year, switch from `file` to `lines` and use a template
literal:

```ts
import header, { HeaderOptions, HeaderRuleConfig } from "@tony.ganchev/eslint-plugin-header";
import notice from "eslint-plugin-notice";
import { defineConfig } from "eslint/config";

export default defineConfig([
    {
        files: ["**/*.js"],
        plugins: {
            notice,
            "@tony.ganchev": header
        },
        rules: {
            "notice/notice": ["error", {
                template: "/* Copyright <%= YEAR %> */",
                onNonMatchingHeader: "replace"
            }],
            "@tony.ganchev/header": [
                "error",
                {
                    header: {
                        commentType: "block",
                        lines: [
                            {
                                pattern: / Copyright \d{4}/,
                                template: ` Copyright ${new Date().getFullYear()}`
                            }
                        ]
                    }
                } as HeaderOptions
            ] as HeaderRuleConfig
        }
    }
]);
```

## Fix Behavior

Note that _\@tony.ganchev/eslint-plugin-header_'s auto-fix behavior is
equivalent to `onNonMatchingHeader: "replace"`. It will automatically update an
incorrect header or prepend it if it's missing altogether.

## Features with no direct equivalent

While _\@tony.ganchev/eslint-plugin-header_ provides modern and native support
for most header-validation use-cases, _eslint-plugin-notice_ includes several
advanced features that have no direct equivalent in this plugin.

If your project relies heavily on these specific capabilities, you may need to
adjust your expectations or provide custom logic:

- **`onNonMatchingHeader: "prepend"`**: _eslint-plugin-notice_ can add a notice
  to the top of the file without replacing any existing comments. This plugin is
  designed to ensure the file starts with the _exact_ defined header and
  typically replaces the first comment found if it doesn't match.
- **`nonMatchingTolerance`**: _eslint-plugin-notice_ uses a string similarity
  algorithm (Longest Common Subsequence) to determine if an existing header is
  "close enough" to the required one, avoiding churn on minor variations. This
  plugin is stricter and requires a regex or exact string match.
- **Advanced Template Variables**: _eslint-plugin-notice_ has a built-in system
  for custom variables in external template files (`templateVars`). While this
  plugin allows complete flexibility via JavaScript in your Flat Config, it does
  not have a declarative injection system for external `.txt` files.
- **Reporting without Fixing**: The `onNonMatchingHeader: "report"` option in
  _notice_ allows users to flag missing headers without enabling auto-fix. This
  plugin's rule is designed for fixable layout issues and typically provides a
  fixer whenever possible.
