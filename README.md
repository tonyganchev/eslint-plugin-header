# eslint-plugin-header

ESLint plugin / rule to ensure that files begin with a given comment - usually a
copyright notice.

Often you will want to have a copyright notice at the top of every file. This
ESLint plugin checks that the first comment in every file has the contents
defined in the rule settings.

## Table of Contents

1. [Table of Contents](#table-of-contents)
2. [Scope and Acknowledgements](#scope-and-acknowledgements)
3. [Usage](#usage)
   1. [File-based Configuration](#file-based-configuration)
   2. [Inline Configuration](#inline-configuration)
      1. [Header Contents Configuration](#header-contents-configuration)
      2. [Trailing Empty Lines Configuration](#trailing-empty-lines-configuration)
      3. [Line Endings](#line-endings)
4. [Examples](#examples)
5. [Versioning](#versioning)
   1. [What is a Feature?](#what-is-a-feature)
6. [What is Backward-compatibility?](#what-is-backward-compatibility)
7. [License](#license)

## Scope and Acknowledgements

This is a fork of <https://github.com/Stuk/eslint-plugin-header>.

It addresses the following issus:

- Adds bugfixes where the original project has not been updated in the last
  three years.
- Adds support for ESLint 9 with a fully-validated configuration schema.
- Addresses a number of bugs on Windows and adds significant amount of tests to
  verify there are no future regressions.
- Fixes issues with she-bangs and empty lines before the header. See PR history
  for more details.
- Provides the foundation to evolve the plugin to add more capabilities moving
  forward. This would come at the expense of plugin compatibility and the
  portability of fixes to the upstream repository.

## Usage

This rule takes between 1 and 4 arguments after the rule validation severity.

The configuration can take any of the following forms:

- File-based Configuration
  - `[<severity>, "<file>"]` - read the header template from a file.
  - `[<severity>, "<file>", {<settings>}]` - read the header template from a
    file with additional settings.
- Inline Configuration
  - `"<severity>", "<comment-type>", <header-contents>` - define the header
    contents inline.
  - `[<severity>, "<comment-type>", <header-contents>, {<settings>}]` - define
    the header contents inline and pass additional settings.
  - `[<severity>, "<comment-type>", <header-contents>, <n-empty-lines>]` -
    define the header contents inline and an expected number of empty lines
    after the header.
  - `[<severity>, "<comment-type>", <header-contents>, <n-empty-lines>,
    {<settings>}]` - define the header contents inline and an expected number of
    empty lines after the header and pass additional settings.

### File-based Configuration

In this configuration mode, the first argument is a string pointing to a JS
file containing the header contents. The rule would expect an exact match to be
found in the source code.

The second argument can be a settings object that will be covered later in this
document.

```json
{
    "plugins": [
        "header"
    ],
    "rules": {
        "header/header": [2, "config/header.js"]
    }
}
```

config/header.js:

```js
// Copyright 2015
// My company
```

Due to limitations in ESLint plugins, the file is read relative to the working
directory that ESLint is executed in. If you run ESLint from elsewhere in your
tree then the header file will not be found.

### Inline Configuration

The inline configuration expects at least two arguments to be given:

- _comment-type_ which is either `"block"` or `"line"` to indicate what style
  of comment should be used.
- _header-contents_ which defines the lines of the header. It can be either a
  single multiline string / regular expression with the full contents of the
  header comment or an array with comment lines or regular expressions matching
  each line.

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

    ```json
    {
        "rules": {
            "header/header": [
                2,
                "block",
                "\n * Copyright (c) 2015\n * My Company\n "
            ]
        }
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

    ```json
    {
        "rules": {
            "header/header": [
                2,
                "block",
                {
                    "pattern":
                        "\\n \\* Copyright \\(c\\) 2015\\n \\* My Company\\n "
                }
            ]
        }
    }
    ```

    Notice the double escaping of the braces. Since these pattern strings into
    `RegExp` objects, the backslashes need to be present in the string instead
    of disappear as escape characters.

- **Array of strings**:

    ```json
    {
        "rules": {
            "header/header": [
                2,
                "block",
                [
                    "",
                    " * Copyright (c) 2015",
                    " * My Company",
                    " "
                ]
            ]
        }
    }
    ```

- **Array of strings and/or patterns**:

    ```json
    {
        "rules": {
            "header/header": [
                2,
                "block",
                [
                    "",
                    { "pattern": " \\* Copyright \\(c\\) 2015" },
                    " * My Company",
                    " "
                ]
            ]
        }
    }
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

```json
{
    "rules": {
        "header/header": [
            2,
            "block",
            [
                "",
                { "pattern": " \\* Copyright \\(c\\) (\\d{4}-)?\\d{4}" },
                " * My Company",
                " "
            ]
        ]
    }
}
```

Note on auto-fixes i.e. `eslint --fix`: whenever strings are used to define the
header - counting in file-based configuration - the same strings would be used
to replace a header comment that did not pass validation. This is not possible
with regular expressions. For regular expression pattern-objects, a second
property `template` adds a replacement string.

```json
{
    "rules": {
        "header/header": [
            2,
            "line",
            [
                {
                    "pattern": " Copyright \\(c\\) (\\d{4}-)?\\d{4}",
                    "template": " Copyright 2025",
                },
                " My Company"
            ]
        ]
    }
}
```

There are a number of things to consider:

- Templates need to be matched by the regular expression pattern or otherwise
  an auto-fixed source would again fail linting. This needs to be validated
  manually today as the plugin does not do it for you.
- Templates are hardcoded strings therefore it may be better to hand-fix a bad
  header in order not to lose the from- and to-years in the copyright notice.

#### Trailing Empty Lines Configuration

The third argument of the rule configuration which defaults to 1 specifies the
number of newlines that are enforced after the header.

Zero newlines:

```json
{
    "plugins": [
        "header"
    ],
    "rules": {
        "header/header": [
            2,
            "block",
            [
                " Copyright now",
                "My Company "
            ],
            0
        ]
    }
}
```

```js
/* Copyright now
My Company */ console.log(1)
```

One newline (default):

```json
{
    "plugins": [
        "header"
    ],
    "rules": {
        "header/header": [
            2,
            "block",
            [
                " Copyright now",
                "My Company "
            ],
            1
        ]
    }
}
```

```js
/* Copyright now
My Company */
console.log(1)
```

Two newlines:

```json
{
    "plugins": [
        "header"
    ],
    "rules": {
        "header/header": [
            2,
            "block",
            [
                " Copyright now",
                "My Company "
            ],
            2
        ]
    }
}
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

```json
"rules": {
    "header/header": [
        2,
        "block",
        [
            "Copyright 2018",
            "My Company"
        ],
        {
            "lineEndings": "windows"
        }
    ]
}
```

Possible values are `"unix"` for `\n` and `"windows"` for `\r\n` line endings.

## Examples

The following examples are all valid.

`"block", "Copyright 2015, My Company"`:

```js
/*Copyright 2015, My Company*/
console.log(1);
```

`"line", ["Copyright 2015", "My Company"]]`:

```js
//Copyright 2015
//My Company
console.log(1)
```

`"line", [{pattern: "^Copyright \\d{4}$"}, {pattern: "^My Company$"}]]`:

```js
//Copyright 2017
//My Company
console.log(1)
```

With more decoration:

```json
"header/header": [2, "block", [
    "************************",
    " * Copyright 2015",
    " * My Company",
    " ************************"
]]
```

```js
/*************************
 * Copyright 2015
 * My Company
 *************************/
 console.log(1);
```

## Versioning

The project follows standard [NPM semantic versioning policy](
https://docs.npmjs.com/about-semantic-versioning).

The following guidelines apply:

- **major versions** - new functionality that breaks compatibility.
- **minor versions** - new features that do not break compatibility. For the
  most part we would aim to continue releasing new versions in the 3.x product
  line and have opt-in flags for changes in behavior of existign features.
- **revisions** - bugfixes and minor non-feature improvements that do not break
  compatibility.

Two concepts are important when going over the above guidelines and we will go
over them in the next sections.

### What is a Feature?

We keep the distinction between a feature and a non-feature improvement / bug
fix as simple as possible:

- If configuration changes, it's a **feature**.
- If it doesn't, then you have two cases:
  - If it changes behavior back to what is expected, it is a bug.
  - If it changes the expected behavior, it is an improvement.

## What is Backward-compatibility?

Backward compatibility in the context of this plugin relates to how the plugin
consistently passes or fails one and the same code in between upgrades to newer
backward-compatible versions. This guarantees that plugin updates can be done
without breaking CI/CD pipeline linting.

Backward-compatibility does not cover the following functional aspects:

- Rule violation messages are not kept stable between backward-compatible
  versions. This allows us to improve error reporting in addition to bug fixes.
- Auto-fix behavior is not stable between backward-compatible versions. As auto-
  fixes are not part of CI/CD processes results of them may vary.

## License

MIT
