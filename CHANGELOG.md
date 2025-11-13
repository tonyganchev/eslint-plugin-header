# Changelog

## 3.1.11

* Major overhaul of error reporting for mismatched headers and more precise
  source code locations of the different rule violations. Addresses work items
  [#58](https://github.com/tonyganchev/eslint-plugin-header/issues/58) and its
  sub-issues as well as
  [#37](https://github.com/tonyganchev/eslint-plugin-header/issues/92)
  
  Detailed changes added to the list of PRs
  below:
  * improv: better error message for missing newlines - fixes
    [#92](https://github.com/tonyganchev/eslint-plugin-header/issues/92) by
    [@tonyganchev](https://github.com/tonyganchev) in
    [#83](https://github.com/tonyganchev/eslint-plugin-header/pull/83)
  * imrpov: put more precise location when reporting missing empty lines - fixes
    [#84](https://github.com/tonyganchev/eslint-plugin-header/issues/84) by
    [@tonyganchev](https://github.com/tonyganchev) in
    [#87](https://github.com/tonyganchev/eslint-plugin-header/pull/87)
  * improv: put more precise location when reporting incorrect comment style -
    fixes
    [#90](https://github.com/tonyganchev/eslint-plugin-header/issues/90) by
    [@tonyganchev](https://github.com/tonyganchev) in
    [#94](https://github.com/tonyganchev/eslint-plugin-header/pull/94)
  * improv: put more precise location when reporting incorrect header - fixes
    [#89](https://github.com/tonyganchev/eslint-plugin-header/issues/89) by
    [@tonyganchev](https://github.com/tonyganchev) in
    [#96](https://github.com/tonyganchev/eslint-plugin-header/pull/96)
  * improv: put more precise location when reporting missing headers - fixes
    [#86](https://github.com/tonyganchev/eslint-plugin-header/issues/86) by
    [@tonyganchev](https://github.com/tonyganchev) in
    [#98](https://github.com/tonyganchev/eslint-plugin-header/pull/98)

## 3.1.10

* fix: address all autofix cases where too many new lines get created - fixes
  [#76](https://github.com/tonyganchev/eslint-plugin-header/issues/76) by
  [@tonyganchev](https://github.com/tonyganchev) in
  [#78](https://github.com/tonyganchev/eslint-plugin-header/pull/78)

## 3.1.9

* fix: do not bypass empty lines validation for single-line line comment
  headers - fixes
  [#72](https://github.com/tonyganchev/eslint-plugin-header/issues/72) by
  [@tonyganchev](https://github.com/tonyganchev) in
  [#73](https://github.com/tonyganchev/eslint-plugin-header/pull/73)

## 3.1.8

* fix: support matching multi-line line comments with a single pattern - fixes
  [#37](https://github.com/tonyganchev/eslint-plugin-header/issues/37) by
  [@tonyganchev](https://github.com/tonyganchev) in
  [#38](https://github.com/tonyganchev/eslint-plugin-header/pull/38)

## 3.1.7

* fix: add header to shebang-only file with no EOL by
  [@tonyganchev](https://github.com/tonyganchev) in
  [#20](https://github.com/tonyganchev/eslint-plugin-header/pull/20)

## 3.1.6

* fix: header is added immediately after shebang - fixes
  [#14](https://github.com/tonyganchev/eslint-plugin-header/issues/14) by
  [@tonyganchev](https://github.com/tonyganchev) in
  [#17](https://github.com/tonyganchev/eslint-plugin-header/pull/17)

## 3.1.5

* fix: proper empty lines on Windows by
  [@tonyganchev](https://github.com/tonyganchev) in
  [#7](https://github.com/tonyganchev/eslint-plugin-header/pull/7)

## 3.1.4

* fix: support both settings and empty line numbers in rule config by
  [@tonyganchev](https://github.com/tonyganchev) in
  [#2](https://github.com/tonyganchev/eslint-plugin-header/pull/2)

## 3.1.3

* Detailed ESLint 9 validation schema.

## 3.1.2

* Support ESLint 9.

## 3.1.1

* Fix detecting header below shebang comment with Windows EOL (#30)

## 3.1.0

* Update to eslint 7.7.0
* Add a third option to specify number of linebreaks after the header. (#29)

## 3.0.0

* Allow regexp in multiline arrays (#23)
* Add `template` option for regexps, for `eslint --fix` (#23)
* Update eslint to v5.12.0 (#19)

## 2.0.0

* Use the OS's line endings (`\n` on *nix, `\r\n` on Windows) when parsing and
  fixing comments. This can be configured with the `lineEndings` option. Major
  version bump as this could be a breaking change for projects.

## 1.2.0

* Add auto fix functionality (eslint `--fix` option) (#12)

## 1.1.0

* Ignore shebangs above header comments to support ESLint 4+ (#11)

## 1.0.0

* Allow RegExp patterns in addition to strings (#2, #4)
* Fix line comment length mismatch issue (#3)

## 0.1.0

* Add config option to read header from file

## 0.0.2

* Initial release
