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

const assert = require("node:assert");
const fs = require("node:fs");
const os = require("node:os");
const commentParser = require("../comment-parser");
const { contextSourceCode } = require("./eslint-utils");
const { description, recommended, url } = require("./header.docs");
const { lineEndingOptions, commentTypeOptions, schema } = require("./header.schema");

/**
 * Import type definitions.
 * @typedef {import('eslint').Rule.Fix} Fix
 * @typedef {import('eslint').Rule.NodeListener} NodeListener
 * @typedef {import('eslint').Rule.ReportFixer} ReportFixer
 * @typedef {import('eslint').Rule.RuleFixer} RuleFixer
 * @typedef {import('eslint').Rule.RuleContext} RuleContext
 * @typedef {import('estree').Comment} Comment
 * @typedef {import('estree').Program} Program
 * @typedef {import("estree").SourceLocation} SourceLocation
 */

/**
 * Local type definitions.
 * @typedef {{ pattern: string | RegExp, template?: string }} HeaderLinePattern
 * @typedef {string | RegExp | HeaderLinePattern} HeaderLine
 * @typedef {(HeaderLine | HeaderLine[])} HeaderLines
 * @typedef {{ lineEndings?: ('unix' | 'windows' | 'os') }} HeaderSettings
 * @typedef {
 *  [string]
 *  | [string, HeaderSettings]
 *  | [('block' | 'line'), HeaderLines ]
 *  | [('block' | 'line'), HeaderLines, HeaderSettings]
 *  | [('block' | 'line'), HeaderLines, number ]
 *  | [('block' | 'line'), HeaderLines, number, HeaderSettings]
 * } LegacyHeaderOptions
 * @typedef {
 *  {
 *      file: string,
 *      encoding?: string
 *  }
 * } FileBasedConfig
 * @typedef {
 *  {
 *      commentType: 'line' | 'block',
 *      lines: HeaderLine[]
 *  }
 * } LinesBasedConfig
 * @typedef {{ minimum?: number }} TrailingEmptyLines
 * @typedef {
 *  {
 *      header: FileBasedConfig | LinesBasedConfig,
 *      trailingEmptyLines?: TrailingEmptyLines
 *  }
 *  & HeaderSettings
 * } NewHeaderOptions
 * @typedef {LegacyHeaderOptions | [NewHeaderOptions]} HeaderOptions
 */

/**
 * Tests if the passed line configuration string or object is a pattern
 * definition.
 * @param {HeaderLine} object line configuration object or string
 * @returns {boolean} `true` if the line configuration is a pattern-defining
 *                    object or `false` otherwise.
 */
function isPattern(object) {
    return typeof object === "object"
        && (object instanceof RegExp || Object.prototype.hasOwnProperty.call(object, "pattern"));
}

/**
 * Utility over a line config argument to match an expected string either
 * against a regex or for full match against a string.
 * @param {string} actual the string to test.
 * @param {string | RegExp} expected The string or regex to test again.
 * @returns {boolean} `true` if the passed string matches the expected line
 *                    config or `false` otherwise.
 */
function match(actual, expected) {
    if (expected instanceof RegExp) {
        return expected.test(actual);
    } else {
        return expected === actual;
    }
}

/**
 * Remove Unix she-bangs from the list of comments.
 * @param {(Comment | { type: "Shebang" })[]} comments the list of comment
 *                                                     lines.
 * @returns {Comment[]} the list of comments with containing all incoming
 *                      comments from `comments` with the shebang comments
 *                      omitted.
 */
function excludeShebangs(comments) {
    /** @type {Comment[]} */
    return comments.filter(function(comment) {
        return comment.type !== "Shebang";
    });
}

/**
 * Returns either the first block comment or the first set of line comments that
 * are ONLY separated by a single newline. Note that this does not actually
 * check if they are at the start of the file since that is already checked by
 * `hasHeader()`.
 * @param {RuleContext} context ESLint execution environment.
 * @param {Program} node ESLint AST tree node being processed.
 * @returns {Comment[]} lines that constitute the leading comment.
 */
function getLeadingComments(context, node) {
    const sourceCode = contextSourceCode(context);
    const all = excludeShebangs(sourceCode.getAllComments(node.body.length ? node.body[0] : node));
    if (all[0].type.toLowerCase() === commentTypeOptions.block) {
        return [all[0]];
    }
    let i = 1;
    for (; i < all.length; ++i) {
        const txt = sourceCode.text.slice(all[i - 1].range[1], all[i].range[0]);
        if (!txt.match(/^(\r\n|\r|\n)$/)) {
            break;
        }
    }
    return all.slice(0, i);
}

/**
 * Generate a comment including trailing spaces out of a number of comment body
 * lines.
 * @param {'block' | 'line'} commentType the type of comment to generate.
 * @param {string[]} textArray list of lines of the comment content.
 * @param {'\n' | '\r\n'} eol end-of-line characters.
 * @returns {string} resulting comment.
 */
function genCommentBody(commentType, textArray, eol) {
    if (commentType === commentTypeOptions.block) {
        return "/*" + textArray.join(eol) + "*/";
    } else {
        // We need one trailing EOL on line comments to ensure the fixed source
        // is parsable.
        return "//" + textArray.join(eol + "//");
    }
}

/**
 * Determines the start and end position in the source code of the leading
 * comment.
 * @param {Comment[]} comments list of comments.
 * @returns {[number, number]} resulting range.
 */
function genCommentsRange(comments) {
    const start = comments[0].range[0];
    const end = comments.slice(-1)[0].range[1];
    return [start, end];
}

/**
 * Calculates the number of leading empty lines in the source code. The function
 * counts both Windows and POSIX line endings.
 * @param {string} src the source code to traverse.
 * @returns {number} the number of leading empty lines.
 */
function leadingEmptyLines(src) {
    let numLines = 0;
    while (true) {
        const m = src.match(/^(\r\n|\n)/);
        if (!m) {
            break;
        }
        assert.strictEqual(m.index, 0);
        numLines++;
        src = src.slice(m.index + m[0].length);
    }
    return numLines;
}

/**
 * Factory for fixer that adds a missing header.
 * @param {'block' | 'line'} commentType type of comment to use.
 * @param {RuleContext} context ESLint execution runtime.
 * @param {string[]} headerLines lines of the header comment.
 * @param {'\n' | '\r\n'} eol end-of-line characters
 * @param {number} numNewlines number of trailing lines after the comment.
 * @returns {ReportFixer} the fixer.
 */
function genPrependFixer(commentType, context, headerLines, eol, numNewlines) {
    return function(fixer) {
        let insertPos = 0;
        let newHeader = genCommentBody(commentType, headerLines, eol);
        const sourceCode = contextSourceCode(context);
        if (sourceCode.text.startsWith("#!")) {
            const firstNewLinePos = sourceCode.text.indexOf("\n");
            insertPos = firstNewLinePos === -1 ? sourceCode.text.length : firstNewLinePos + 1;
            if (firstNewLinePos === -1) {
                newHeader = eol + newHeader;
            }
        }
        const numEmptyLines = leadingEmptyLines(sourceCode.text.substring(insertPos));
        const additionalEmptyLines = Math.max(0, numNewlines - numEmptyLines);
        newHeader += eol.repeat(additionalEmptyLines);
        return fixer.insertTextBeforeRange(
            [insertPos, insertPos /* don't care */],
            newHeader
        );
    };
}

/**
 * Factory for fixer that replaces an incorrect header.
 * @param {'block' | 'line'} commentType type of comment to use.
 * @param {RuleContext} context ESLint execution context.
 * @param {Comment[]} leadingComments comment elements to replace.
 * @param {string[]} headerLines lines of the header comment.
 * @param {'\n' | '\r\n'} eol end-of-line characters
 * @param {number} numNewlines number of trailing lines after the comment.
 * @returns {(fixer: RuleFixer) => Fix | Fix[] | null} the fixer.
 */
function genReplaceFixer(commentType, context, leadingComments, headerLines, eol, numNewlines) {
    return function(fixer) {
        const commentRange = genCommentsRange(leadingComments);
        const emptyLines = leadingEmptyLines(contextSourceCode(context).text.substring(commentRange[1]));
        const missingNewlines = Math.max(0, numNewlines - emptyLines);
        const eols = eol.repeat(missingNewlines);
        return fixer.replaceTextRange(
            commentRange,
            genCommentBody(commentType, headerLines, eol) + eols
        );
    };
}

/**
 * Factory for fixer that replaces an incorrect header.
 * @param {Comment[]} leadingComments comment elements to replace.
 * @param {'\n' | '\r\n'} eol end-of-line characters
 * @param {number} missingEmptyLinesCount number of trailing lines after the
 *                                        comment.
 * @returns {(fixer: RuleFixer) => Fix | Fix[] | null} the fixer.
 */
function genEmptyLinesFixer(leadingComments, eol, missingEmptyLinesCount) {
    return function(fixer) {
        return fixer.insertTextAfterRange(
            genCommentsRange(leadingComments),
            eol.repeat(missingEmptyLinesCount)
        );
    };
}

/**
 * Returns the used line-termination characters per the rule's config if any or
 * else based on the runtime environments.
 * @param {'os' | 'unix' | 'windows'} style line-ending styles.
 * @returns {'\n' | '\r\n'} the correct line ending characters for the
 *                          environment.
 */
function getEol(style) {
    assert.strictEqual(Object.prototype.hasOwnProperty.call(lineEndingOptions, style), true,
        "lineEnding style should have been populated in normalizeOptions().");
    switch (style) {
        case lineEndingOptions.unix:
            return "\n";
        case lineEndingOptions.windows:
            return "\r\n";
        case lineEndingOptions.os:
        default:
            return /** @type {'\n' | '\r\n'} */ (os.EOL);
    }
}

/**
 * Tests if the first line in the source code (after a Unix she-bang) is a
 * comment. Does not tolerate empty lines before the first match.
 * @param {string} src source code to test.
 * @returns {boolean} `true` if there is a comment or `false` otherwise.
 */
function hasHeader(src) {
    const srcWithoutShebang = src.replace(/^#![^\n]*\r?\n/, "");
    return srcWithoutShebang.startsWith("/*") || srcWithoutShebang.startsWith("//");
}

/**
 * asserts on an expression and adds template texts to the failure message.
 * Helper to write cleaner code.
 * @param {boolean} condition assert condition.
 * @param {string} message assert message on violation.
 */
function schemaAssert(condition, message) {
    assert.strictEqual(condition, true, message + " - should have been handled by eslint schema validation.");
}

/**
 * Ensures that if legacy options as defined in the original
 * `eslint-plugin-header` are used, they'd be converted to the new object-based
 * configuration. This is not a normalized internal representation of the
 * options in that some settings are still union types and unspecified
 * properties are not replaced by defaults. If the options follow the new
 * format, a simple seep copy would be returned.
 * @param {HeaderOptions} originalOptions the options as configured by the user.
 * @returns {NewHeaderOptions} the transformed new-style options with no
 *                             normalization.
 */
function transformLegacyOptions(originalOptions) {
    schemaAssert(originalOptions?.length > 0,
        "header options are required (at least one in addition to the severity)");
    schemaAssert(originalOptions.length <= 4,
        "header options should not be more than four (five including issue severity)");
    if (originalOptions.length === 1 && typeof originalOptions[0] === "object") {
        // The user chose to use the new-style config. We pass a copy of the
        // incoming sole option to not mess with ESLint not relying on the old
        // values of the option.
        return structuredClone(originalOptions[0]);
    }
    // The user chose the legacy-style config. Transform them to new-style
    // config.
    schemaAssert(typeof originalOptions[0] === "string",
        "first header option after severity should be either a filename or 'block' | 'line'");
    /** @type {NewHeaderOptions} */
    const transformedOptions = {};
    // populate header
    if (
        originalOptions.length === 1
        || (
            originalOptions.length === 2
            && typeof originalOptions[1] === "object"
            && !Array.isArray(originalOptions[1])
            && !isPattern(originalOptions[1])
        )) {
        transformedOptions.header = { file: originalOptions[0], encoding: "utf8" };
    } else {
        schemaAssert(Object.prototype.hasOwnProperty.call(commentTypeOptions, originalOptions[0]),
            "Only 'block' or 'line' is accepted as comment type");
        schemaAssert(
            typeof originalOptions[1] === "string"
            || Array.isArray(originalOptions[1])
            || isPattern(originalOptions[1]),
            "second header option after severity should be a string, a pattern, or an array of the previous two");
        transformedOptions.header = {
            commentType: originalOptions[0],
            lines: Array.isArray(originalOptions[1]) ? originalOptions[1] : [originalOptions[1]]
        };
    }
    // configure required line settings
    if (originalOptions.length >= 3) {
        if (typeof originalOptions[2] === "number") {
            transformedOptions.trailingEmptyLines = { minimum: originalOptions[2] };
            if (originalOptions.length === 4) {
                schemaAssert(typeof originalOptions[3] === "object",
                    "Fourth header option after severity should be either number of required trailing empty lines or " +
                    "a settings object");
                Object.assign(transformedOptions, originalOptions[3]);
            }
        } else {
            schemaAssert(typeof originalOptions[2] === "object",
                "Third header option after severity should be either number of required trailing empty lines or a " +
                "settings object");
            Object.assign(transformedOptions, originalOptions[2]);
        }
    }
    return transformedOptions;
}

/**
 * Transforms a set of new-style options adding defaults and standardizing on
 * one of multiple config styles.
 * @param {NewHeaderOptions} originalOptions new-style options to normalize.
 * @returns {NewHeaderOptions} normalized options.
 */
function normalizeOptions(originalOptions) {
    const options = structuredClone(originalOptions);

    if (options.header.file) {
        const text = fs.readFileSync(originalOptions.header.file, originalOptions.header.encoding || "utf8");
        const [commentType, lines] = commentParser(text);
        options.header = { commentType, lines };
    }

    options.header.lines = options.header.lines.flatMap(
        (line) => {
            if (typeof line === "string") {
                return line.split(/\r?\n/);
            }
            if (line instanceof RegExp) {
                return [{ pattern: line }];
            }
            assert.ok(Object.prototype.hasOwnProperty.call(line, "pattern"));
            const pattern = line.pattern instanceof RegExp ? line.pattern : new RegExp(line.pattern);
            if (Object.prototype.hasOwnProperty.call(line, "template")) {
                return [{
                    pattern,
                    template: line.template
                }];
            }
            return [{ pattern }];
        });

    if (!options.lineEndings) {
        options.lineEndings = "os";
    }

    if (!options.trailingEmptyLines) {
        options.trailingEmptyLines = {};
    }
    if (typeof options.trailingEmptyLines.minimum !== "number") {
        options.trailingEmptyLines.minimum = 1;
    }
    return options;
}

/**
 * Calculates the source location of the violation that not enough empty lines
 * follow the header.
 * The behavior chosen is that the violation is shown over the empty (but
 * insufficient) lines that trail the comment. A special case is when there are
 * no empty lines after the header in which case we highlight the next character
 * in the source regardless of which one it is).
 * @param {Comment[]} leadingComments the comment lines that constitute the
 *                                    header.
 * @param {number} actualEmptyLines the number of empty lines that follow the
 *                                  header.
 * @returns {SourceLocation} the location (line and column) of the violation.
 */
function missingEmptyLinesViolationLoc(leadingComments, actualEmptyLines) {
    const lastCommentLineLocEnd = leadingComments[leadingComments.length - 1].loc.end;
    return {
        start: lastCommentLineLocEnd,
        end: {
            column: actualEmptyLines === 0 ? lastCommentLineLocEnd.column + 1 : 0,
            line: lastCommentLineLocEnd.line + actualEmptyLines
        }
    };
}

/** @type {import('eslint').Rule.RuleModule} */
const headerPlugin = {
    meta: {
        type: "layout",
        docs: {
            description,
            recommended,
            url
        },
        fixable: "whitespace",
        schema,
        defaultOptions: [
            /** @type {HeaderOptions} */
            {
                lineEndings: lineEndingOptions.os,
                trailingEmptyLines: {
                    minimum: 1
                }
            }
        ],
        messages: {
            headerLineMismatchAtPos: "header line does not match expected after this position; expected: {{expected}}",
            headerLineTooLong: "header line longer than expected",
            headerLineTooShort: "header line shorter than expected; missing: {{remainder}}",
            headerTooShort: "header too short: missing lines: {{remainder}}",
            headerTooLong: "header too long",
            incorrectCommentType: "header should be a {{commentType}} comment",
            incorrectHeader: "incorrect header",
            incorrectHeaderLine: "header line does not match pattern: {{pattern}}",
            missingHeader: "missing header",
            noNewlineAfterHeader: "not enough newlines after header: expected: {{expected}}, actual: {{actual}}"
        }
    },
    /**
     * Rule creation function.
     * @param {RuleContext} context ESLint rule execution context.
     * @returns {NodeListener} the rule definition.
     */
    create: function(context) {

        const newStyleOptions = transformLegacyOptions(context.options);
        const options = normalizeOptions(newStyleOptions);

        const eol = getEol(options.lineEndings);

        let fixLines = [];
        // If any of the lines are regular expressions, then we can't
        // automatically fix them. We set this to true below once we
        // ensure none of the lines are of type RegExp
        let canFix = true;
        const headerLines = options.header.lines.map(function(line) {
            const isRegex = isPattern(line);
            // Can only fix regex option if a template is also provided
            if (isRegex && !line.template) {
                canFix = false;
            }
            fixLines.push(line.template || line);
            return isRegex ? line.pattern : line;
        });

        return {
            /**
             * Hooks into the processing of the overall script node to do the
             * header validation.
             * @param {Program} node the whole script node
             * @returns {void}
             */
            Program: function(node) {
                const sourceCode = contextSourceCode(context);
                if (!hasHeader(sourceCode.text)) {
                    const hasShebang = sourceCode.text.startsWith("#!");
                    const line = hasShebang ? 2 : 1;
                    context.report({
                        loc: {
                            start: {
                                column: 1,
                                line
                            },
                            end: {
                                column: 1,
                                line
                            }
                        },
                        messageId: "missingHeader",
                        fix: genPrependFixer(
                            options.header.commentType,
                            context,
                            fixLines,
                            eol,
                            options.trailingEmptyLines.minimum)
                    });
                    return;
                }

                const leadingComments = getLeadingComments(context, node);

                if (leadingComments[0].type.toLowerCase() !== options.header.commentType) {
                    context.report({
                        loc: {
                            start: leadingComments[0].loc.start,
                            end: leadingComments[leadingComments.length - 1].loc.end
                        },
                        messageId: "incorrectCommentType",
                        data: {
                            commentType: options.header.commentType
                        },
                        fix: canFix
                            ? genReplaceFixer(
                                options.header.commentType,
                                context,
                                leadingComments,
                                fixLines,
                                eol,
                                options.trailingEmptyLines.minimum)
                            : null
                    });
                    return;
                }
                if (options.header.commentType === commentTypeOptions.line) {
                    if (headerLines.length === 1) {
                        const leadingCommentValues = leadingComments.map((c) => c.value);
                        if (
                            !match(leadingCommentValues.join("\n"), headerLines[0])
                            && !match(leadingCommentValues.join("\r\n"), headerLines[0])
                        ) {
                            context.report({
                                loc: {
                                    start: leadingComments[0].loc.start,
                                    end: leadingComments[leadingComments.length - 1].loc.end
                                },
                                messageId: "incorrectHeader",
                                fix: canFix
                                    ? genReplaceFixer(
                                        options.header.commentType,
                                        context,
                                        leadingComments,
                                        fixLines,
                                        eol,
                                        options.trailingEmptyLines.minimum)
                                    : null
                            });
                            return;
                        }
                    } else {
                        for (let i = 0; i < headerLines.length; i++) {
                            if (leadingComments.length - 1 < i) {
                                context.report({
                                    loc: {
                                        start: leadingComments[leadingComments.length - 1].loc.end
                                    },
                                    messageId: "headerTooShort",
                                    data: {
                                        remainder: headerLines.slice(i).join(eol)
                                    },
                                    fix: canFix
                                        ? genReplaceFixer(
                                            options.header.commentType,
                                            context,
                                            leadingComments,
                                            fixLines,
                                            eol,
                                            options.trailingEmptyLines.minimum)
                                        : null
                                });
                                return;
                            }
                            if (typeof headerLines[i] === "string") {
                                const leadingCommentLength = leadingComments[i].value.length;
                                const headerLineLength = headerLines[i].length;
                                for (let j = 0; j < Math.min(leadingCommentLength, headerLineLength); j++) {
                                    if (leadingComments[i].value[j] !== headerLines[i][j]) {
                                        context.report({
                                            loc: {
                                                start: {
                                                    column: "//".length + j,
                                                    line: leadingComments[i].loc.start.line
                                                },
                                                end: leadingComments[i].loc.end
                                            },
                                            messageId: "headerLineMismatchAtPos",
                                            data: {
                                                expected: headerLines[i].substring(j)
                                            },
                                            fix: genReplaceFixer(
                                                options.header.commentType,
                                                context,
                                                leadingComments,
                                                fixLines,
                                                eol,
                                                options.trailingEmptyLines.minimum)
                                        });
                                        return;
                                    }
                                }
                                if (leadingCommentLength < headerLineLength) {
                                    context.report({
                                        loc: {
                                            start: leadingComments[i].loc.end,
                                        },
                                        messageId: "headerLineTooShort",
                                        data: {
                                            remainder: headerLines[i].substring(leadingCommentLength)
                                        },
                                        fix: canFix
                                            ? genReplaceFixer(
                                                options.header.commentType,
                                                context,
                                                leadingComments,
                                                fixLines,
                                                eol,
                                                options.trailingEmptyLines.minimum)
                                            : null
                                    });
                                    return;
                                }
                                if (leadingCommentLength > headerLineLength) {
                                    context.report({
                                        loc: {
                                            start: {
                                                column: "//".length + headerLineLength,
                                                line: leadingComments[i].loc.start.line
                                            },
                                            end: leadingComments[i].loc.end,
                                        },
                                        messageId: "headerLineTooLong",
                                        fix: canFix
                                            ? genReplaceFixer(
                                                options.header.commentType,
                                                context,
                                                leadingComments,
                                                fixLines,
                                                eol,
                                                options.trailingEmptyLines.minimum)
                                            : null
                                    });
                                    return;
                                }
                            } else {
                                if (!match(leadingComments[i].value, headerLines[i])) {
                                    context.report({
                                        loc: {
                                            start: {
                                                column: "//".length,
                                                line: leadingComments[i].loc.start.line,
                                            },
                                            end: leadingComments[i].loc.end,
                                        },
                                        messageId: "incorrectHeaderLine",
                                        data: {
                                            pattern: headerLines[i]
                                        },
                                        fix: canFix
                                            ? genReplaceFixer(
                                                options.header.commentType,
                                                context,
                                                leadingComments,
                                                fixLines,
                                                eol,
                                                options.trailingEmptyLines.minimum)
                                            : null
                                    });
                                    return;
                                }
                            }
                        }
                    }

                    const actualLeadingEmptyLines =
                        leadingEmptyLines(sourceCode.text.substring(leadingComments[headerLines.length - 1].range[1]));
                    const missingEmptyLines = options.trailingEmptyLines.minimum - actualLeadingEmptyLines;
                    if (missingEmptyLines > 0) {
                        context.report({
                            loc: missingEmptyLinesViolationLoc(leadingComments, actualLeadingEmptyLines),
                            messageId: "noNewlineAfterHeader",
                            data: {
                                expected: options.trailingEmptyLines.minimum,
                                actual: actualLeadingEmptyLines
                            },
                            fix: genEmptyLinesFixer(leadingComments, eol, missingEmptyLines)
                        });
                    }
                    return;
                }
                // if block comment pattern has more than 1 line, we also split
                // the comment
                let leadingLines = [leadingComments[0].value];
                if (headerLines.length > 1) {
                    leadingLines = leadingComments[0].value.split(/\r?\n/);
                }

                /** @type {null | string} */
                let errorMessageId = null;
                /** @type {null | Record<string, string | RegExp>} */
                let errorMessageData = null;
                /** @type {null | SourceLocation} */
                let errorMessageLoc = null;
                for (let i = 0; i < headerLines.length; i++) {
                    const leadingLine = leadingLines[i];
                    const headerLine = headerLines[i];
                    if (typeof headerLine === "string") {
                        for (let j = 0; j < Math.min(leadingLine.length, headerLine.length); j++) {
                            if (leadingLine[j] !== headerLine[j]) {
                                errorMessageId = "headerLineMismatchAtPos";
                                const columnOffset = i === 0 ? "/*".length : 0;
                                const line = leadingComments[0].loc.start.line + i;
                                errorMessageLoc = {
                                    start: {
                                        column: columnOffset + j,
                                        line
                                    },
                                    end: {
                                        column: columnOffset + leadingLine.length,
                                        line
                                    }
                                };
                                errorMessageData = {
                                    expected: headerLine.substring(j)
                                };
                                break;
                            }
                        }
                        if (errorMessageId) {
                            break;
                        }
                        if (leadingLine.length < headerLine.length) {
                            errorMessageId = "headerLineTooShort";
                            const startColumn = (i === 0 ? "/*".length : 0) + leadingLine.length;
                            errorMessageLoc = {
                                start: {
                                    column: startColumn,
                                    line: leadingComments[0].loc.start.line + i
                                },
                                end: {
                                    column: startColumn + 1,
                                    line: leadingComments[0].loc.start.line + i
                                }
                            };
                            errorMessageData = {
                                remainder: headerLines[i].substring(leadingLine.length)
                            };
                            break;
                        }
                        if (leadingLine.length > headerLine.length) {
                            errorMessageId = "headerLineTooLong";
                            errorMessageLoc = {
                                start: {
                                    column: (i === 0 ? "/*".length : 0) + headerLine.length,
                                    line: leadingComments[0].loc.start.line + i
                                },
                                end: {
                                    column: (i === 0 ? "/*".length : 0) + leadingLine.length,
                                    line: leadingComments[0].loc.start.line + i
                                }
                            };
                            break;
                        }
                    } else {
                        if (!match(leadingLine, headerLine)) {
                            errorMessageId = "incorrectHeaderLine";
                            errorMessageData = {
                                pattern: headerLine
                            };
                            const columnOffset = i === 0 ? "/*".length : 0;
                            errorMessageLoc = {
                                start: {
                                    column: columnOffset + 0,
                                    line: leadingComments[0].loc.start.line + i
                                },
                                end: {
                                    column: columnOffset + leadingLine.length,
                                    line: leadingComments[0].loc.start.line + i
                                }
                            };
                            break;
                        }
                    }
                }

                if (!errorMessageId && leadingLines.length > headerLines.length) {
                    errorMessageId = "headerTooLong";
                    errorMessageLoc = {
                        start: {
                            column: (headerLines.length === 0 ? "/*".length : 0) + 0,
                            line: leadingComments[0].loc.start.line + headerLines.length
                        },
                        end: {
                            column: leadingComments[leadingComments.length - 1].loc.end.column - "*/".length,
                            line: leadingComments[leadingComments.length - 1].loc.end.line
                        }
                    };
                }

                if (errorMessageId) {
                    if (canFix && headerLines.length > 1) {
                        fixLines = [fixLines.join(eol)];
                    }
                    context.report({
                        loc: errorMessageLoc,
                        messageId: errorMessageId,
                        data: errorMessageData,
                        fix: canFix
                            ? genReplaceFixer(
                                options.header.commentType,
                                context,
                                leadingComments,
                                fixLines,
                                eol,
                                options.trailingEmptyLines.minimum)
                            : null
                    });
                    return;
                }

                const actualLeadingEmptyLines =
                    leadingEmptyLines(sourceCode.text.substring(leadingComments[0].range[1]));
                const missingEmptyLines = options.trailingEmptyLines.minimum - actualLeadingEmptyLines;
                if (missingEmptyLines > 0) {
                    context.report({
                        loc: missingEmptyLinesViolationLoc(leadingComments, actualLeadingEmptyLines),
                        messageId: "noNewlineAfterHeader",
                        data: {
                            expected: options.trailingEmptyLines.minimum,
                            actual: actualLeadingEmptyLines
                        },
                        fix: genEmptyLinesFixer(leadingComments, eol, missingEmptyLines)
                    });
                }
            }
        };
    }
};

module.exports = headerPlugin;
