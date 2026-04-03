# @tony.ganchev/eslint-plugin-header

[![npm version](https://img.shields.io/npm/v/@tony.ganchev/eslint-plugin-header.svg)](https://www.npmjs.com/package/@tony.ganchev/eslint-plugin-header)
[![Downloads/month](https://img.shields.io/npm/dm/@tony.ganchev/eslint-plugin-header.svg)](http://www.npmtrends.com/@tony.ganchev/eslint-plugin-header)
[![Build Status](https://github.com/tonyganchev/eslint-plugin-header/actions/workflows/test.yml/badge.svg)](https://github.com/tonyganchev/eslint-plugin-header/actions/workflows/test.yml?query=branch%3Amain)

The native ESLint 9/10 standard header-validating plugin. A zero-bloat, drop-in
replacement for [eslint-plugin-header](https://github.com/Stuk/eslint-plugin-header)
with first-class Flat Config & TypeScript support. Auto-fix copyright, license,
and banner comments in JavaScript, TypeScript, CSS, HTML, and Markdown files.
Supports _oxlint_.

## Table of Contents

1. [Motivation and Acknowledgements](#motivation-and-acknowledgements)
2. [Major Consumers](#major-consumers)
3. [Compatibility](#compatibility)
   1. [Runtimes](#runtimes)
   2. [Configuration Formats](#configuration-formats)
   3. [Languages](#languages)
4. [Usage](#usage)
   1. [File-based Configuration](#file-based-configuration)
   2. [Inline Configuration](#inline-configuration)
      1. [Header Contents Configuration](#header-contents-configuration)
      2. [Providing To-year in Auto-fix](#providing-to-year-in-auto-fix)
      3. [Trailing Empty Lines Configuration](#trailing-empty-lines-configuration)
      4. [Line Endings](#line-endings)
   3. [Support for Leading Comments](#support-for-leading-comments)
      1. [Notes on Behavior](#notes-on-behavior)
   4. [Examples](#examples)
   5. [Linting CSS](#linting-css)
   6. [Linting HTML](#linting-html)
   7. [Linting Markdown](#linting-markdown)
5. [Comparison to Alternatives](#comparison-to-alternatives)
   1. [Compared to eslint-plugin-headers](#compared-to-eslint-plugin-headers)
      1. [Health Scans](#health-scans)
   2. [Compared to eslint-plugin-license-header](#compared-to-eslint-plugin-license-header)
6. [Versioning](#versioning)
   1. [What is a Feature?](#what-is-a-feature)
   2. [What is Backward-compatibility?](#what-is-backward-compatibility)
7. [License](#license)

## Motivation and Acknowledgements

The plugin started as a fork of [eslint-plugin-header](https://github.com/Stuk/eslint-plugin-header)
to address missing ESLint 9 compatibility.

Today it addresses the following issues:

- Support for ESLint 9/10 with a fully-validated configuration schema.
- Continued support for ESLint 7/8.
- Complete Windows support.
- New object-based configuration providing the bases for future enhancements.
- Continued support for _eslint-plugin-header_ array configuration.
- Bugfixes where the original project has not been updated for the three
  years before the fork.
- Fixes issues with she-bangs and empty lines before the header. See PR history
  for more details.
- Good error reporting and improved auto-fixes.
- Complete drop-in-replacement compatibility with existing projects using
  _eslint-plugin-header_.

Multiple other projects took from where _eslint-plugin-header_ left off. A
comparison of the current project to these alternatives is available in a
dedicated section.

## Major Consumers

The plugin is used by hundreds of projects to enforce license compliance and
consistent header structures. Notable adopters include:

[![Microsoft](https://github.com/microsoft.png?size=48)](./docs/consumers.md#microsoft)
&nbsp;&nbsp;&nbsp;
[![Microsoft Azure](https://github.com/azure.png?size=48)](./docs/consumers.md#azure)
&nbsp;&nbsp;&nbsp;
[![Salesforce](https://github.com/forcedotcom.png?size=48)](./docs/consumers.md#salesforce)
&nbsp;&nbsp;&nbsp;
[![Angular](https://github.com/angular.png?size=48)](./docs/consumers.md#angular)
&nbsp;&nbsp;&nbsp;
[![Amazon](https://github.com/aws.png?size=48)](./docs/consumers.md#amazon)
&nbsp;&nbsp;&nbsp;
[![Amazon Cloudscape Design System](https://github.com/cloudscape-design.png?size=48)](./docs/consumers.md#cloudscape-design-system)
&nbsp;&nbsp;&nbsp;
[![Eclipse GLSP](https://github.com/eclipse.png?size=48)](./docs/consumers.md#eclipse-foundation)
&nbsp;&nbsp;&nbsp;
[![Salto](https://github.com/salto-io.png?size=48)](./docs/consumers.md#salto)
&nbsp;&nbsp;&nbsp;
[![Dash0 OpenTelemetry JS Distribution](https://github.com/dash0hq.png?size=48)](./docs/consumers.md#dash0)
&nbsp;&nbsp;&nbsp;
[![IBM InspectorRAGet](https://github.com/ibm.png?size=48)](./docs/consumers.md#ibm)
&nbsp;&nbsp;&nbsp;
[![FlowCrypt Browser Extensions](https://github.com/flowcrypt.png?size=48)](./docs/consumers.md#flowcrypt)
&nbsp;&nbsp;&nbsp;
[![Cratis](https://github.com/Cratis.png?size=48)](./docs/consumers.md#cratis)
&nbsp;&nbsp;&nbsp;
[![Mysten Labs](https://github.com/MystenLabs.png?size=48)](./docs/consumers.md#mysten-labs)
&nbsp;&nbsp;&nbsp;
[![Suwayomi](https://github.com/Suwayomi.png?size=48)](./docs/consumers.md#suwayomi)
&nbsp;&nbsp;&nbsp;
[![Wire Swiss GmbH](https://github.com/wireapp.png?size=48)](./docs/consumers.md#wire-swiss-gmbh)
&nbsp;&nbsp;&nbsp;
[![WPPConnect](https://github.com/wppconnect-team.png?size=48)](./docs/consumers.md#wppconnect)

Learn more about how these organizations use the plugin on our
[consumers list](./docs/consumers.md).

## Compatibility

### Runtimes

The plugin supports **ESLint 7 / 8 / 9 / 10**. Both **flat** config and legacy,
**hierarchical** config can be used. We have a smoke-test running to confirm the
plugin works with the latest version of ESLint. Certain features such as linting
copyright headers in CSS, HTML, or Markdown rely on APIs introduced with ESLint
9 and cannot be used with older ESLint versions.

The plugin works with latest version of **oxlint** too. We have a smoke-test
running to confirm the plugin works with the latest version of oxlint. Features
relying on the use of non-standard parsers such as linting headers in CSS, HTML,
or Markdown cannot be supported.

### Configuration Formats

The plugin supports hierarchical and flat configuration format for ESLint as
well as the configuration format for oxlint.

The NPM package provides TypeScript type definitions and can be used with
TypeScript-based ESLint flat configuration without the need for `@ts-ignore`
statements. Smoke tests cover this support as well.

### Languages

Currently the plugin supports linting copyright headers in JavaScript,
TypeScript and their JSX / TSX flavors; CSS, HTML, and Markdown files. As
mentioned in the previous sections, not all languages are supported for oxlint
or ESLint older than 9. Refer to the table below for more details.

| Language   | ESLint 7 / 8  | ESLint 9 / 10 | oxlint |
|------------|---------------|---------------|--------|
| JavaScript | ✅ Yes        | ✅ Yes        | ✅ Yes |
| TypeScript | ✅ Yes        | ✅ Yes        | ✅ Yes |
| JSX        | ✅ Yes        | ✅ Yes        | ✅ Yes |
| TSX        | ✅ Yes        | ✅ Yes        | ✅ Yes |
| CSS        | ❌ No         | ✅ Yes        | ❌ No  |
| HTML       | ❌ No         | ✅ Yes        | ❌ No  |
| Markdown   | ❌ No         | ✅ Yes        | ❌ No  |

## Usage

The plugin and its _header_ rule goes through evolution of its configuration in
the 3.2.x release. We introduced a new single object-based configuration format
that is easier to evolve in the future to add more capabilities.

The legacy configuration format inherited from
[eslint-plugin-header](https://github.com/Stuk/eslint-plugin-header) is still
supported and you can learn how to use it in a
[dedicated document](legacy-config.md). For information on how to switch from
the legacy configuration format to the new style, follow our
[migration guide](./docs/migrate-config.md). The current document from this
point on will cover only the new configuration format.

This _header_ rule takes a single object as configuration, after the severity
level. At the very least, the object should contain a `header` field describing
the expected header to match in the source files.

For TypesScript-based flat ESLint configuration, two types are provided:

- `HeaderRuleConfig` defines the overall rule configuration for the `header`
  rule and includes severity level and supports both the modern object-based
  configuration and the legacy array-based configuration.
- `HeaderOptions` helper type that defines the structure of the configuration
  object used in the modern configuration style that is used in this document.
  It can be used to either simplify auto-completion since this type is not mixed
  with a large number of named tuple types, or it can be used when the config
  object is defined outside of the definition of a specific rule.

### File-based Configuration

In this configuration mode, the header template is read from a file.

_eslint.config.ts_:

```ts
import header, {
    HeaderOptions, HeaderRuleConfig
} from "@tony.ganchev/eslint-plugin-header";
import { defineConfig } from "eslint/config";

export default defineConfig([
    {
        files: ["**/*.js"],
        plugins: {
            "@tony.ganchev": header
        },
        rules: {
            "@tony.ganchev/header": [
                "error",
                {
                    header: {
                        file: "config/header.js"
                    }
                } as HeaderOptions
            ] as HeaderRuleConfig
        }
    }
]);
```

_config/header.js_:

```js
// Copyright 2015
// My company
```

Due to limitations in ESLint plugins, the file is read relative to the working
directory that ESLint is executed in. If you run ESLint from elsewhere in your
tree then the header file will not be found.

The equivalent configuration for _oxlint_ is:

```json
{
    "$schema": "./node_modules/oxlint/configuration_schema.json",
    "overrides": [
        {
            "files": [
                "**/*.js"
            ],
            "rules": {
                "@tony.ganchev/header/header": [
                    "error",
                    {
                        "header": {
                            "file": "config/header.js"
                        }
                    }
                ]
            },
            "jsPlugins": [
                "@tony.ganchev/eslint-plugin-header"
            ]
        }
    ]
}
```

### Inline Configuration

In this configuration mode, the matching rules for the header are given inline.
The `header` field should contain the following nested properties:

- `commentType` which is either `"block"` or `"line"` to indicate what style
  of comment should be used.
- `line` which defines the lines of the header. It can be either a
  single multiline string / regular expression with the full contents of the
  header comment or an array with comment lines or regular expressions matching
  each line. It can also include template replacement strings to enable ESLint's
  auto-fix capabilities.

#### Header Contents Configuration

Suppose we want our header to look like this:

```js
/*
 * Copyright (c) 2015
 * My Company
 */
```

All of the following configurations will match the header:

- **Single string**:

    ```ts
    import header, { HeaderOptions } from "@tony.ganchev/eslint-plugin-header";
    import { defineConfig } from "eslint/config";

    export default defineConfig([
        {
            files: ["**/*.js"],
            plugins: {
                "@tony.ganchev": header
            },
            rules: {
                "@tony.ganchev/header": [
                    "error",
                    {
                        header: {
                            commentType: "block",
                            lines: ["\n * Copyright (c) 2015\n * My Company\n "]
                        }
                    } as HeaderOptions
                ]
            }
        }
    ]);
    ```

    Equivalent configuration for _oxlint_:

    ```json
    {
        "$schema": "./node_modules/oxlint/configuration_schema.json",
        "overrides": [
            {
                "files": [
                    "**/*.js"
                ],
                "rules": {
                    "@tony.ganchev/header/header": [
                        "error",
                        {
                            "header": {
                                "commentType": "block",
                                "lines": [
                                    "\n * Copyright (c) 2015\n * My Company\n "
                                ]
                            }
                        }
                    ]
                },
                "jsPlugins": [
                    "@tony.ganchev/eslint-plugin-header"
                ]
            }
        ]
    }
    ```

    Note that the above would work for both Windows and POSIX systems even
    though the EOL in the header content was specified as `\n`.

    Also, notice how we have an empty space before each line. This is because
    the plugin only strips the leading `//` characters from a line comment.
    Similarly, for a block comment, only the opening `/*` and closing `*/` will
    be preserved with all new lines and whitespace preserved. Keep this in mind
    as this can lead to poorly configured header matching rules that never
    pass. In a future release error messages would be more detailed and show
    exactly where header validation failed.

- **Single regular expression**:

    You can match the whole header with a regular expression. To do it, simply
    pass a `RegExp` object in place of a string.

    ```ts
    import header, { HeaderOptions } from "@tony.ganchev/eslint-plugin-header";
    import { defineConfig } from "eslint/config";

    export default defineConfig([
        {
            files: ["**/*.js"],
            plugins: {
                "@tony.ganchev": header
            },
            rules: {
                "@tony.ganchev/header": [
                    "error",
                    {
                        header: {
                            commentType: "block",
                            lines: [
                                /\n \* Copyright \(c\) 2015\n \* Company\n /
                            ]
                        }
                    } as HeaderOptions
                ]
            }
        }
    ]);
    ```

    If you still use hierarchical configuration, you can define the regular
    expression as a string.

    ```ts
    import header, { HeaderOptions } from "@tony.ganchev/eslint-plugin-header";
    import { defineConfig } from "eslint/config";

    export default defineConfig([
        {
            files: ["**/*.js"],
            plugins: {
                "@tony.ganchev": header
            },
            rules: {
                "@tony.ganchev/header": [
                    "error",
                    {
                        header: {
                            commentType: "block",
                            lines: [
                                { pattern: "\\n \\* Copyright \\(c\\) 2015"
                                    + "\\n \\* My Company\\n "}
                            ]
                        }
                    } as HeaderOptions
                ]
            }
        }
    ]);
    ```

    Notice the double escaping of the braces. Since these pattern strings into
    `RegExp` objects, the backslashes need to be present in the string instead
    of disappear as escape characters.

    You can pass a `RegExp` object to the `pattern` field. This is necessary if
    you want to add an aut-fix for the line as we will explain further in this
    document.

    ```ts
    import header, { HeaderOptions } from "@tony.ganchev/eslint-plugin-header";
    import { defineConfig } from "eslint/config";

    export default defineConfig([
        {
            files: ["**/*.js"],
            plugins: {
                "@tony.ganchev": header
            },
            rules: {
                "@tony.ganchev/header": [
                    "error",
                    {
                        header: {
                            commentType: "block",
                            lines: [
                                { pattern: /Copyright \(c\) 20\d{2}/ }
                            ]
                        }
                    } as HeaderOptions
                ]
            }
        }
    ]);
    ```

- **Array of strings**:

    ```ts
    import header, { HeaderOptions } from "@tony.ganchev/eslint-plugin-header";
    import { defineConfig } from "eslint/config";

    export default defineConfig([
        {
            files: ["**/*.js"],
            plugins: {
                "@tony.ganchev": header
            },
            rules: {
                "@tony.ganchev/header": [
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
                    } as HeaderOptions
                ]
            }
        }
    ]);
    ```

- **Array of strings and/or patterns**:

    ```ts
    import header, { HeaderOptions } from "@tony.ganchev/eslint-plugin-header";
    import { defineConfig } from "eslint/config";

    export default defineConfig([
        {
            files: ["**/*.js"],
            plugins: {
                "@tony.ganchev": header
            },
            rules: {
                "@tony.ganchev/header": [
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
                    } as HeaderOptions
                ]
            }
        }
    ]);
    ```

Regular expressions allow for a number of improvements in the maintainability
of the headers. Given the example above, what is clear is that new sources may
have been created later than 2015 and a comment with a different year should be
perfectly valid, such as:

```js
/*
 * Copyright 2020
 * My company
 */
```

Moreover, suppose your legal department expects that the year of first and last
change be added except if all changes happen in the same year, we also need to
support:

```js
/*
 * Copyright 2017-2022
 * My company
 */
```

We can use a regular expression to support all of these cases for your header:

```ts
import header, { HeaderOptions } from "@tony.ganchev/eslint-plugin-header";
import { defineConfig } from "eslint/config";

export default defineConfig([
    {
        files: ["**/*.js"],
        plugins: {
            "@tony.ganchev": header
        },
        rules: {
            "@tony.ganchev/header": [
                "error",
                {
                    header: {
                        commentType: "block",
                        lines: [
                            "",
                            / \* Copyright \(c\) (\d{4}-)?\d{4}/,
                            " * My Company",
                            " "
                        ]
                    }
                } as HeaderOptions
            ]
        }
    }
]);
```

Note on auto-fixes i.e. `eslint --fix`: whenever strings are used to define the
header - counting in file-based configuration - the same strings would be used
to replace a header comment that did not pass validation. This is not possible
with regular expressions. For regular expression pattern-objects, a second
property `template` adds a replacement string.

```ts
import header, { HeaderOptions } from "@tony.ganchev/eslint-plugin-header";
import { defineConfig } from "eslint/config";

export default defineConfig([
    {
        files: ["**/*.js"],
        plugins: {
            "@tony.ganchev": header
        },
        rules: {
            "@tony.ganchev/header": [
                "error",
                {
                    header: {
                        commentType: "line",
                        lines: [
                            {
                                pattern: / Copyright \(c\) (\d{4}-)?\d{4}/,
                                template: " Copyright 2025",
                            },
                            " My Company"
                        ]
                    }
                } as HeaderOptions
            ]
        }
    }
]);
```

There are a number of things to consider:

- Templates need to be matched by the regular expression pattern or otherwise
  an auto-fixed source would again fail linting. This needs to be validated
  manually today as the plugin does not do it for you.
- Templates are hardcoded strings therefore it may be better to hand-fix a bad
  header in order not to lose the from- and to-years in the copyright notice.

#### Providing To-year in Auto-fix

A common request across similar plugins is to provide for `{year}` variable to
not change the ESLint configuration every year. While such special requests were
relevant to old JSON-based configuration, this can be handled with JavaScript in
the flat configuration format:

```ts
import header, { HeaderOptions } from "@tony.ganchev/eslint-plugin-header";
import { defineConfig } from "eslint/config";

export default defineConfig([
    {
        files: ["**/*.js"],
        plugins: {
            "@tony.ganchev": header
        },
        rules: {
            "@tony.ganchev/header": [
                "error",
                {
                    header: {
                        commentType: "line",
                        lines: [
                            {
                                pattern: / Copyright \(c\) (\d{4}-)?\d{4}/,
                                template: ` Copyright ${new Date().getFullYear()}`,
                            },
                            " My Company"
                        ]
                    }
                } as HeaderOptions
            ]
        }
    }
]);
```

#### Trailing Empty Lines Configuration

The third argument of the rule configuration which defaults to 1 specifies the
number of newlines that are enforced after the header.

Zero newlines:

```ts
import header, { HeaderOptions } from "@tony.ganchev/eslint-plugin-header";
import { defineConfig } from "eslint/config";

export default defineConfig([
    {
        files: ["**/*.js"],
        plugins: {
            "@tony.ganchev": header
        },
        rules: {
            "@tony.ganchev/header": [
                "error",
                {
                    header: {
                        commentType: "block",
                        lines: [
                            " Copyright now",
                            "My Company "
                        ],
                    },
                    trailingEmptyLines: {
                        minimum: 0
                    }
                } as HeaderOptions
            ]
        }
    }
]);
```

```js
/* Copyright now
My Company */ console.log(1)
```

One newline (default):

```ts
import header, { HeaderOptions } from "@tony.ganchev/eslint-plugin-header";
import { defineConfig } from "eslint/config";

export default defineConfig([
    {
        files: ["**/*.js"],
        plugins: {
            "@tony.ganchev": header
        },
        rules: {
            "@tony.ganchev/header": [
                "error",
                {
                    header: {
                        commentType: "block",
                        lines: [
                            " Copyright now",
                            "My Company "
                        ],
                    },
                    trailingEmptyLines: {
                        minimum: 1
                    }
                } as HeaderOptions
            ]
        }
    }
]);
```

```js
/* Copyright now
My Company */
console.log(1)
```

Two newlines:

```ts
import header, { HeaderOptions } from "@tony.ganchev/eslint-plugin-header";
import { defineConfig } from "eslint/config";

export default defineConfig([
    {
        files: ["**/*.js"],
        plugins: {
            "@tony.ganchev": header
        },
        rules: {
            "@tony.ganchev/header": [
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
                } as HeaderOptions
            ]
        }
    }
]);
```

```js
/* Copyright now
My Company */

console.log(1)
```

#### Line Endings

The rule works with both Unix/POSIX and Windows line endings. For ESLint
`--fix`, the rule will use the line ending format of the current operating
system (via Node's `os` package). This setting can be overwritten as follows:

```ts
import header, { HeaderOptions } from "@tony.ganchev/eslint-plugin-header";
import { defineConfig } from "eslint/config";

export default defineConfig([
    {
        files: ["**/*.js"],
        plugins: {
            "@tony.ganchev": header
        },
        rules: {
            "@tony.ganchev/header": [
                "error",
                {
                    header: {
                        commentType: "block",
                        lines: [
                            "Copyright 2018",
                            "My Company"
                        ]
                    },
                    lineEndings: "windows"
                } as HeaderOptions
            ]
        }
    }
]);
```

Possible values are `"unix"` for `\n` and `"windows"` for `\r\n` line endings.
The default value is `"os"` which means assume the system-specific line endings.

### Support for Leading Comments

_NOTE: This feature is still experimental and as such may break between minor
versions and revisions._

_NOTE: This feature will **only** be available with the modern object-based
configuration._

Some frameworks such as [Jest](https://jestjs.io/) change behavior based on
pragma comments such as:

```js
/** @jest-environement node */
```

The problem with these is that they are not part of the header comment and
should be allowed to appear before the header comment. The `leadingComments`
option allows you to specify a set of comments that are allowed to appear before
the header comment. It is configured as an array of comments-matching rules
similar to the `header` section. For example to match the following header with
a leading pragma:

```js
/** @jest-environement node */
/* Copyright 2015, My Company */
```

... we can use the following configuration:

```ts
import header, { HeaderOptions } from "@tony.ganchev/eslint-plugin-header";
import { defineConfig } from "eslint/config";

export default defineConfig([
    {
        files: ["**/*.js"],
        plugins: {
            "@tony.ganchev": header
        },
        rules: {
            "@tony.ganchev/header": [
                "error",
                {
                    header: {
                        commentType: "block",
                        lines: [" Copyright 2015, My Company "]
                    },
                    leadingComments: {
                        comments: [
                            {
                                commentType: "block",
                                lines: ["* @jest-environement node "]
                            }
                        ]
                    }
                } as HeaderOptions
            ]
        }
    }
]);
```

Assuming you need to tolerate more pragmas, you can have a longer list of
comments e.g.

```ts
import header, { HeaderOptions } from "@tony.ganchev/eslint-plugin-header";
import { defineConfig } from "eslint/config";

export default defineConfig([
    {
        files: ["**/*.js"],
        plugins: {
            "@tony.ganchev": header
        },
        rules: {
            "@tony.ganchev/header": [
                "error",
                {
                    header: {
                        commentType: "block",
                        lines: [" Copyright 2015, My Company "]
                    },
                    leadingComments: {
                        comments: [
                            {
                                commentType: "block",
                                lines: ["* @jest-environement node "]
                            },
                            {
                                commentType: "line",
                                lines: [" @ts-ignore"]
                            }
                        ]
                    }
                } as HeaderOptions
            ]
        }
    }
]);
```

You can also use file-based configuration for any of these allowed comments.

#### Notes on Behavior

There are a number of things to consider when validating headers when allowing
some leading comments. It is important to understand the algorithm behind.
During validation, the rule breaks up all comments before the first actual code
token based either on the beginning and end of a block comments or based on the
separation of line comments by more than one line. These discrete comment blocks
are then validated against both the header-matching rule and all the leading
comment-matching rules.

For each comment, header is tested first and if it matches, validation completes
successfully. If not, the algorithm verifies that the comment satisfies at least
one comment matcher and if so, validation moves to the next comment.

If the comment matches neither the header, nor any of the leading comment
matchers, validation fails. To provide good troubleshooting information, errors
are reported for the header matcher, followed by all leading comment matchers.
While the information may seem overwhelming, this helps developers understand
all possible failures and let them pick the essential one.

Let's have the following configuration example:

```ts
import header, { HeaderOptions } from "@tony.ganchev/eslint-plugin-header";
import { defineConfig } from "eslint/config";

export default defineConfig([
    {
        files: ["**/*.js"],
        plugins: {
            "@tony.ganchev": header
        },
        rules: {
            "@tony.ganchev/header": [
                "error",
                {
                    header: {
                        commentType: "block",
                        lines: [" Copyright 2015, My Company "]
                    },
                    leadingComments: {
                        comments: [
                            {
                                commentType: "block",
                                lines: ["* @jest-environement node "]
                            },
                            {
                                commentType: "line",
                                lines: [" @ts-ignore"]
                            }
                        ]
                    }
                } as HeaderOptions
            ]
        }
    }
]);
```

Let's lint the following piece of code:

```js
/** @jest-environement node */
/* Copyright 2010, My Company */

console.log(1);
```

The following errors would be shown:

```bash
  2:1  error  leading comment validation failed: should be a line comment
        @tony.ganchev/header         
  2:3  error  header line does not match expected after this position;
    expected: 'Copyright 2015, My Company'
        @tony.ganchev/header         
  2:3  error  leading comment validation failed: line does not match expected
    after this position; expected: '* @jest-environement node '
        @tony.ganchev/header
```

Notice how all errors are reported on the second line. That is because the first
line passes validation against the first leading comment matcher, while the
second fails validation against all matchers.

Requiring an empty line between line leading comments is important as it keeps
the rule simple and fast but needs to be kept into account. Let's take the
following configuration for example:

```ts
import header, { HeaderOptions } from "@tony.ganchev/eslint-plugin-header";
import { defineConfig } from "eslint/config";

export default defineConfig([
    {
        files: ["**/*.js"],
        plugins: {
            "@tony.ganchev": header
        },
        rules: {
            "@tony.ganchev/header": [
                "error",
                {
                    header: {
                        commentType: "block",
                        lines: [" Copyright 2015, My Company "]
                    },
                    leadingComments: {
                        comments: [
                            {
                                commentType: "line",
                                lines: [" foo"]
                            },
                            {
                                commentType: "line",
                                lines: [" bar"]
                            }
                        ]
                    }
                } as HeaderOptions
            ]
        }
    }
]);
```

This configuration would successfully lint any of the following snippets:

```js
// foo

// bar
/* Copyright 2015, My Company */
console.log();
```

```js
// bar

// foo

/* Copyright 2015, My Company */
console.log();
```

```js
// bar

// bar
/* Copyright 2015, My Company */
console.log();
```

It will not pass the following snippets though:

```js
// foo
// bar

/* Copyright 2015, My Company */
console.log();
```

```js
// bar
// foo
/* Copyright 2015, My Company */
console.log();
```

```js
// bar
// bar

/* Copyright 2015, My Company */
console.log();
```

Finally, it is worth noting that the current version accepts an arbitrary number
of empty lines in between comments. The only expectation still in place is that
there is no empty line after a shebang comment. Any of these details may change
through configuration in the future.

### Examples

The following examples are all valid.

```ts
import header, { HeaderOptions } from "@tony.ganchev/eslint-plugin-header";
import { defineConfig } from "eslint/config";

export default defineConfig([
    {
        files: ["**/*.js"],
        plugins: {
            "@tony.ganchev": header
        },
        rules: {
            "@tony.ganchev/header": [
                "error",
                {
                    header: {
                        commentType: "block",
                        lines: ["Copyright 2015, My Company"]
                    }
                } as HeaderOptions
            ]
        }
    }
]);
```

```js
/*Copyright 2015, My Company*/
console.log(1);
```

```ts
import header, { HeaderOptions } from "@tony.ganchev/eslint-plugin-header";
import { defineConfig } from "eslint/config";

export default defineConfig([
    {
        files: ["**/*.js"],
        plugins: {
            "@tony.ganchev": header
        },
        rules: {
            "@tony.ganchev/header": [
                "error",
                {
                    header: {
                        commentType: "line",
                        lines: [
                            "Copyright 2015",
                            "My Company"
                        ]
                    }
                } as HeaderOptions
            ]
        }
    }
]);
```

```js
//Copyright 2015
//My Company
console.log(1)
```

```ts
import header, { HeaderOptions } from "@tony.ganchev/eslint-plugin-header";
import { defineConfig } from "eslint/config";

export default defineConfig([
    {
        files: ["**/*.js"],
        plugins: {
            "@tony.ganchev": header
        },
        rules: {
            "@tony.ganchev/header": [
                "error",
                {
                    header: {
                        commentType: "line",
                        lines: [
                            /^Copyright \d{4}$/,
                            /^My Company$/
                        ]
                    }
                } as HeaderOptions
            ]
        }
    }
]);
```

### Linting CSS

The rule supports validating and auto-fixing headers in CSS files. To
use the plugin with these file types, you need to configure the official
`@eslint/css` plugin.

**Note: the plugin does not support SCSS** as no current popular parser for
ESLint supports SCSS / LESS that being a prerequisite for this plugin to be
called. It is possible to rely on a dummy pass-through parser to ensure the SCSS
/ LESS sources simply reach the rule but as of the time of the publisihng of
this document we have not tested this approach.

Back to CSS, let us use the following configuration:

_eslint.config.js_:

```js
import header from "@tony.ganchev/eslint-plugin-header";
import css from "@eslint/css";

export default [
    {
        files: ["**/*.css"],
        plugins: {
            "@tony.ganchev": header,
            css
        },
        language: "css/css",
        rules: {
            "@tony.ganchev/header": [
                "error",
                {
                    header: {
                        commentType: "block",
                        lines: [" Copyright 2025 "]
                    }
                }
            ]
        }
    }
];
```

```css
/* Copyright 2025 */

.foo {
    color: blue;
}
```

With more decoration:

```ts
import header, { HeaderOptions } from "@tony.ganchev/eslint-plugin-header";
import { defineConfig } from "eslint/config";

export default defineConfig([
    {
        files: ["**/*.js"],
        plugins: {
            "@tony.ganchev": header
        },
        rules: {
            "@tony.ganchev/header": [
                "error",
                {
                    header: {
                        commentType: "block",
                        lines: [
                            "************************",
                            " * Copyright 2015",
                            " * My Company",
                            " ************************"
                        ]
                    }
                } as HeaderOptions
            ]
        }
    }
]);
```

```css
/*************************
 * Copyright 2015
 * My Company
 *************************/

.foo {
    color: blue
}
```

As you can expect with CSS syntax, line comments and shebangs are not supported.
All other features of the rule remain the same.

### Linting HTML

The rule supports linting copyright notices in HTML files. The rule works with
the _@html-eslint/eslint-plugin_ plugin and its parser.

Similar to CSS, all you need to do to turn on header validation is to configure
the _\@html-eslint/eslint-plugin_ plugin and the rule:

```ts
import header from "@tony.ganchev/eslint-plugin-header";
import html from "@html-eslint/eslint-plugin";

export default [
    {
        files: ["**/*.html"],
        plugins: {
            "@tony.ganchev": header,
            html
        },
        language: "html/html",
        rules: {
            "@tony.ganchev/header": [
                "error",
                {
                    header: {
                        commentType: "block",
                        lines: [" Copyright 2025 "]
                    }
                }
            ]
        }
    }
];
```

```html
<!-- Copyright 2025 -->

<html>
<body>
    <h1>Hello, world!</h1>
    <p>Lorem ipsum dolor.</p>
</body>
</html>
```

As with CSS, only block comments are supported - no line- or shebang comments.

### Linting Markdown

The rule supports copyright comments in Markdown syntax in both _commonmark_ and
_gfm_ flavors using the _\@eslint/markdown_ plugin and parser. Only HTML
comments are supported - no anchor hacks or similar are accepted.

Similar to CSS, all you need to do to turn on header validation is to configure
the _\@eslint/markdown_ plugin and the rule:

```ts
import header from "@tony.ganchev/eslint-plugin-header";
import markdown from "@eslint/markdown";

export default [
    {
        files: ["**/*.md"],
        plugins: {
            "@tony.ganchev": header,
            markdown
        },
        // ... or "markdown/gfm"
        language: "markdown/commonmark",
        rules: {
            "@tony.ganchev/header": [
                "error",
                {
                    header: {
                        commentType: "block",
                        lines: [" Copyright 2025 "]
                    }
                }
            ]
        }
    }
];
```

```md
    <!-- Copyright 2025 -->
    
    # Title
    
    ## Subtitle
    
    ## Code
    
    ```js
    console.log("Hello, world!");
    ```
```

Note that if you have configured header for `*.js` files, the linter would fail
on the first line of the nested JavaScript snippet. Look up how to differentiate
the configuration of JavaScript sources (`**/*.js`) from JavaScript snippets in
Markdown (`**/*.md/*.js`). Same applies to `*.ts`, `*.jsx`, `*.tsx`, etc.

As with CSS, only block comments are supported - no line- or shebang comments.

## Comparison to Alternatives

A number of projects have been aiming to solve problems similar to
_\@tony.ganchev/eslint-plugin-header_ - mainly with respect to providing ESLint
9 support. The section below tries to outline why developers may choose either.
The evaluation is based on the versions of each project as of the time of
publishing the current version of _\@tony.ganchev/eslint-plugin-header_.

Further iterations of this document would add migration information.

### Compared to [eslint-plugin-headers](https://github.com/robmisasi/eslint-plugin-headers)

_\@tony.ganchev/eslint-plugin-header_ is a drop-in replacement for
_eslint-plugin-header_ and all plugins that already use the latter can migrate
to the fork right away. At the same time, it provides improved user experience
and windows support.

eslint-plugin-headers is not a drop-in replacement. It offers additional
features. Some of them, such as support for Vue templates do not have an
analogue in the current version of _\@tony.ganchev/eslint-plugin-header_ while
others such as `{year}` variable placeholders are redundant in the world of
ESLint 9's flat, JavaScript-based configuration as [already pointed out in this
document](#providing-to-year-in-auto-fix).

The configuration format philosophy of the two plugin differs.
_\@tony.ganchev/eslint-plugin-header_ supports both the legacy model inherited
from _eslint-plugin-header_ and a new object-based configuration that is easy to
adopt and offers both a lot of power to the user as to what the headers should
look like, and keeps the configuration compact - just a few lines defining the
content inside the comment. At the same time, the configuration is structured in
a way that can evolve without breaking compatibility, which is critical for a
tool that is not differentiating for the critical delivery of teams.

_eslint-plugin-headers_ also offers an object-based format, but the content is
flat and may need breaking changes to be kept concise as new features come
about. Further, it makes assumption that then need to be corrected such as a
block comment starting with `/**` instead of `/*` by default. The correction
needs to happen not by adjusting the header template but through a separate
confusing configuration properties.
Overall, the configuration tends to be noisier nad harder to read than that of
_\@tony.ganchev/eslint-plugin-header_.

_eslint-plugin-headers_'s error reporting is rudimentary - either the header
passes or it fails and with complex templates you get no idea what the issue is.
Granted this is the case with _eslint-plugin-header_ but we spent many hours
improving  this and the side by side comparison is telling.

_eslint-plugin-headers_ does not offer TypeScript bindings for its
configuration format making it slower to author configuration.
_\@tony.ganchev/eslint-plugin-header_ as often as possible reports which line
is problematic and starting from which character.

_eslint-plugin-headers_ supports some level of partial auto-fixes such as
replacing company names but not years. Or keeping JSDoc variables after the
copyright notice within the same comment. Some cases can be supported by
_\@tony.ganchev/eslint-plugin-header_ but in general our design has shied away
from touching existing comments to provide "smart" fixes. This is the current
state of the feature set yet the team is looking for the right model to bridge
the functionality gaps.

We have prepared a detailed [migration guide](docs/migrate-from-headers.md) for
anyone eager to migrate to _\@tony.ganchev/eslint-plugin-header_.

#### Health Scans

- _\@tony.ganchev/eslint-plugin-header_</th> -
  [snyk.io](https://security.snyk.io/package/npm/%40tony.ganchev%2Feslint-plugin-header),
  [socket.dev](https://socket.dev/npm/package/@tony.ganchev/eslint-plugin-header/overview/3.2.2)

- _eslint-plugin-headers_ -
  [snyk.io](https://security.snyk.io/package/npm/eslint-plugin-headers),
  [socket.dev](https://socket.dev/npm/package/eslint-plugin-headers/overview/1.3.4)

At the time of the publishing of the current version of
_\@tony.ganchev/eslint-plugin-header_, the latter has a slight edge in both
scans against _eslint-plugin-headers_.

### Compared to [eslint-plugin-license-header](https://github.com/nikku/eslint-plugin-license-header)

_eslint-plugin-license-header_ per its limited documentation does not have a lot
of features including not matching arbitrary from-years in the copyright notice.
This on one hand leads to it having a nice, dead-simple configuration, but means
no complex multi-year project would be happy with it. Surprisingly, given the
limited feature set, the plugin has more peer dependencies than the competition.

We have prepared a detailed
[migration guide](docs/migrate-from-license-header.md) for anyone eager to
migrate to _\@tony.ganchev/eslint-plugin-header_.

## Versioning

The project follows standard [NPM semantic versioning policy](
https://docs.npmjs.com/about-semantic-versioning).

The following guidelines apply:

- **major versions** - new functionality that breaks compatibility.
- **minor versions** - new features that do not break compatibility. For the
  most part we would aim to continue releasing new versions in the 3.x product
  line and have opt-in flags for changes in behavior of existing features.
- **revisions** - bugfixes and minor non-feature improvements that do not break
  compatibility. Note that bug-fixes are allowed to break compatibility with
  previous version if the older version regressed previous expected behavior.

Two concepts are important when going over the above guidelines and we will go
over them in the next sections.

### What is a Feature?

We keep the distinction between a feature and a non-feature improvement / bug
fix as simple as possible:

- If configuration changes, it's a **feature**.
- If it doesn't, then you have two cases:
  - If it changes behavior back to what is expected, it is a bug.
  - If it changes the expected behavior, it is an improvement.

### What is Backward-compatibility?

Backward compatibility in the context of this plugin relates to how the plugin
consistently passes or fails one and the same code in between upgrades to newer
backward-compatible versions. This guarantees that plugin updates can be done
without breaking CI/CD pipeline linting.

Backward-compatibility does not cover the following functional aspects:

- Rule violation messages are not kept stable between backward-compatible
  versions. This allows us to improve error reporting in addition to bug fixes.
- Auto-fix behavior is not stable between backward-compatible versions. As auto-
  fixes are not part of CI/CD processes results of them may vary.
- Bugs to released functionality. Bugs are considered regression to expected
  functionality regardless of whether they went into a release or not. We fix
  bugs without maintaining bug-compatibility.

## License

MIT, see [license file](./LICENSE.md) for more details.
