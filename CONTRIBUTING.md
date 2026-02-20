# Contributing to _\@tony.ganchev/eslint-plugin-header_

First and foremost, thank you for your interest in contributing to
_\@tony.ganchev/eslint-plugin-header_! This project was created out of necessity
by contributors to _eslint-plugin-header_ and as such is driven by the same
spirit that you display, therefore you are welcome!

## Table of Contents

1. [Table of Contents](#table-of-contents)
2. [Prerequisites](#prerequisites)
3. [Versioning and Branching Strategy](#versioning-and-branching-strategy)
4. [Building](#building)
5. [Development](#development)
   1. [OS Handling](#os-handling)
   2. [Testing](#testing)
6. [Sending a PR](#sending-a-pr)
7. [Reaching the Maintainers](#reaching-the-maintainers)

## Prerequisites

Before you beg, check out the long and boring
[code of conduct](./CODE_OF_CONDUCT.md).

The project has been developed on Windows and Linux. We assume macOS would work
just as well.

No special setup is needed besides getting the code and a recent version of
Node.js.

## Versioning and Branching Strategy

The project follows semantic versioning as explained in
[this section](./README.md#versioning) of the docs.

There are two product lines as of today:

| Product Line | Branch   | Dist-tag      | Description                        |
|--------------|----------|---------------|------------------------------------|
| v3.2.x       | `main`   | `latest`      | Main product line.                 |
| v3.1.x       | `v3.1.x` | `maintenance` | Security-related patches.          |

## Building

After cloning the repository you can try to do a full CI/CD run:

```bash
$ npm install
...
$ npm run test
...
```

It will run a number of other npm scripts that together verify the code:

| script          | Description                                                |
|-----------------|------------------------------------------------------------|
| `npm run lint`  | Lints the source and docs.                                 |
| `npm run unit`  | Runs all mocha unit tests.                                 |
| `npm run build` | Generates TypeScript bindings. Prerequisite for E2E tests. |
| `npm run e2e`   | Runs E2E smoke tests for all supported versions of ESLint. |

## Development

The project uses JSDoc to guarantee some level of type safety and as the source
for and to generate bindings for projects using TypeScript to do ESLint
configuration. The `build` script also runs `tsc` type checks on the JavaScript
sources.

We always appreciate the occasional assert that guarantees the invariants at
runtime without incurring testing overhead.

### OS Handling

Whatever the platform chosen is, keep in mind any impact of your
work on systems with differing line endings. Unit tests provide significant
coverage for both Windows and POSIX but new corner-cases can always come up.

### Testing

We have 100% coverage and would love to stay that way. As with many CLI projects
we know this can be hard but we are always available to help with the tricky
bits.

If you have specific concerns related to how your change works on older ESLint
versions especially considering hierarchical configuration format, think about
adding to the small set of E2E tests.

## Sending a PR

Maintainers try to loosely follow the Angular format for writing change
descriptions. We are not religious about it but it does caress our OCD the right
way. What is more important is good wording of the change or problem being
solved and calling out specific intricate details that the reviewer needs to
keep in mind. Do include the issue number if such exists.

## Reaching the Maintainers

Outside of PRs, you can always reach us through the Issues and Discussions
pages.
