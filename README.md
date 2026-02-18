# @tony.ganchev/eslint-plugin-header

[![npm version](https://img.shields.io/npm/v/@tony.ganchev/eslint-plugin-header.svg)](https://www.npmjs.com/package/@tony.ganchev/eslint-plugin-header)
[![Downloads/month](https://img.shields.io/npm/dm/@tony.ganchev/eslint-plugin-header.svg)](http://www.npmtrends.com/@tony.ganchev/eslint-plugin-header)
[![Build Status](https://github.com/tonyganchev/eslint-plugin-header/workflows/Test/badge.svg)](https://github.com/tonyganchev/eslint-plugin-header)

The native ESLint 9/10 standard header-validating plugin. A zero-bloat, drop-in
replacement for [eslint-plugin-header](https://github.com/Stuk/eslint-plugin-header)
with first-class Flat Config & TypeScript support. Auto-fix copyright, license,
and banner comments in JavaScript and TypeScript files.

## Table of Contents

1. [Motivation and Acknowledgements](#motivation-and-acknowledgements)
2. [Compatibility](#compatibility)
3. [Usage](#usage)
   1. [File-based Configuration](#file-based-configuration)
   2. [Inline Configuration](#inline-configuration)
      1. [Header Contents Configuration](#header-contents-configuration)
      2. [Providing To-year in Auto-fix](#providing-to-year-in-auto-fix)
      3. [Trailing Empty Lines Configuration](#trailing-empty-lines-configuration)
      4. [Line Endings](#line-endings)
   3. [Examples](#examples)
4. [Comparison to Alternatives](#comparison-to-alternatives)
   1. [Compared to eslint-plugin-headers](#compared-to-eslint-plugin-headers)
      1. [Health Scans](#health-scans)
   2. [Compared to eslint-plugin-license-header](#compared-to-eslint-plugin-license-header)
5. [Versioning](#versioning)
   1. [What is a Feature?](#what-is-a-feature)
   2. [What is Backward-compatibility?](#what-is-backward-compatibility)
6. [License](#license)

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

## Compatibility

The plugin supports ESLint 7 / 8 / 9 / 10. Both flat config and legacy,
hierarchical config can be used.

The NPM package provides TypeScript type definitions and can be used with
TypeScript-based ESLint flat configuration without the need for `@ts-ignore`
statements.

## Usage

The plugin and its _header_ rule goes through evolution of its configuration in
the 3.2.x release. We introduced a new single object-based configuration format
that is easier to evolve in the future to add more capabilities.

The legacy configuration format inherited from
[eslint-plugin-header](https://github.com/Stuk/eslint-plugin-header) is still
supported and you can learn how to use it in a
[dedicated document](legacy-config.md). For information on how to switch from
the legacy configuration format to the new style, follow our
[migration guide](migrate-config.md). The current document from this point on
will cover only the new configuration format.

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

```js
//Copyright 2017
//My Company
console.log(1)
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

```js
/*************************
 * Copyright 2015
 * My Company
 *************************/
 console.log(1);
```

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

MIT
