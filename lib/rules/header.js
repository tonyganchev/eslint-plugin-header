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
const { commentTypeOptions, lineEndingOptions, schema } = require("./header.schema");

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
 * @typedef {string | { pattern: string, template?: string }} HeaderLine
 * @typedef {(HeaderLine | HeaderLine[])} HeaderLines
 * @typedef {{ lineEndings: ('unix' | 'windows') }} HeaderSettings
 * @typedef {
 *  [string]
 *  | [string, HeaderSettings]
 *  | [('block' | 'line') | HeaderLines ]
 *  | [('block' | 'line') | HeaderLines | HeaderSettings]
 *  | [('block' | 'line') | HeaderLines | number ]
 *  | [('block' | 'line') | HeaderLines | number | HeaderSettings]
 * } HeaderOptions
 */

/**
 * Tests if the passed line configuration string or object is a pattern
 * definition.
 * @param {HeaderLine} object line configuration object or string
 * @returns {boolean} `true` if the line configuration is a pattern-defining
 *                    object or `false` otherwise.
 */
function isPattern(object) {
    return typeof object === "object" && Object.prototype.hasOwnProperty.call(object, "pattern");
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
 * @returns {Comment[]} lines that constitute the leading comment.
 */
function getLeadingComments(context) {
    const sourceCode = contextSourceCode(context);
    const all = excludeShebangs(sourceCode.getAllComments());
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
 * Finds the option parameter within the list of rule config options.
 * @param {HeaderOptions} options the config options passed to the rule.
 * @returns {HeaderSettings | null} the settings parameter or `null` if no such
 *                                  is defined.
 */
function findSettings(options) {
    const lastOption = options[options.length - 1];
    if (typeof lastOption === "object" && !Array.isArray(lastOption) && lastOption !== null
        && !Object.prototype.hasOwnProperty.call(lastOption, "pattern")) {
        return lastOption;
    }
    return null;
}

/**
 * Returns the used line-termination characters per the rule's config if any or
 * else based on the runtime environments.
 * @param {HeaderOptions} options rule configuration.
 * @returns {'\n' | '\r\n'} the correct line ending characters for the
 * environment.
 */
function getEOL(options) {
    const settings = findSettings(options);
    if (settings) {
        if (settings.lineEndings === lineEndingOptions.unix) {
            return "\n";
        }
        if (settings.lineEndings === lineEndingOptions.windows) {
            return "\r\n";
        }
    }
    return /** @type {'\n' | '\r\n'} */ (os.EOL);
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
        defaultOptions: [{}],
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
        let options = context.options;
        const numNewlines = options.length > 2 && typeof options[2] === "number" ? options[2] : 1;
        const eol = getEOL(options);

        // If just one option then read comment from file
        if (options.length === 1 || (options.length === 2 && findSettings(options))) {
            const text = fs.readFileSync(context.options[0], "utf8");
            options = commentParser(text);
        }

        const commentType = options[0].toLowerCase();
        /** @type {(string | RegExp)[] | string[]} */
        let headerLines;
        /** @type {string[]} */
        let fixLines = [];
        // If any of the lines are regular expressions, then we can't
        // automatically fix them. We set this to true below once we
        // ensure none of the lines are of type RegExp
        let canFix = false;
        if (Array.isArray(options[1])) {
            canFix = true;
            headerLines = options[1].map(function(line) {
                const isRegex = isPattern(line);
                // Can only fix regex option if a template is also provided
                if (isRegex && !line.template) {
                    canFix = false;
                }
                fixLines.push(line.template || line);
                return isRegex ? new RegExp(line.pattern) : line;
            });
        } else if (isPattern(options[1])) {
            const line = options[1];
            headerLines = [new RegExp(line.pattern)];
            fixLines.push(line.template || line);
            // Same as above for regex and template
            canFix = !!line.template;
        } else {
            canFix = true;
            headerLines = options[1].split(/\r?\n/);
            fixLines = /** @type {string[]} */ (headerLines);
        }

        return {
            /**
             * Hooks into the processing of the overall script node to do the
             * header validation.
             * @returns {void}
             */
            Program: function() {
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
                        fix: genPrependFixer(commentType, context, fixLines, eol, numNewlines)
                    });
                    return;
                }
                const leadingComments = getLeadingComments(context);

                if (leadingComments[0].type.toLowerCase() !== commentType) {
                    context.report({
                        loc: {
                            start: leadingComments[0].loc.start,
                            end: leadingComments[leadingComments.length - 1].loc.end
                        },
                        messageId: "incorrectCommentType",
                        data: {
                            commentType: commentType
                        },
                        fix: canFix
                            ? genReplaceFixer(commentType, context, leadingComments, fixLines, eol, numNewlines)
                            : null
                    });
                    return;
                }
                if (commentType === commentTypeOptions.line) {
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
                                    ? genReplaceFixer(commentType, context, leadingComments, fixLines, eol, numNewlines)
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
                                            commentType,
                                            context,
                                            leadingComments,
                                            fixLines,
                                            eol,
                                            numNewlines)
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
                                                commentType,
                                                context,
                                                leadingComments,
                                                fixLines,
                                                eol,
                                                numNewlines)
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
                                                commentType,
                                                context,
                                                leadingComments,
                                                fixLines,
                                                eol,
                                                numNewlines)
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
                                                commentType,
                                                context,
                                                leadingComments,
                                                fixLines,
                                                eol,
                                                numNewlines)
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
                                                commentType,
                                                context,
                                                leadingComments,
                                                fixLines,
                                                eol,
                                                numNewlines)
                                            : null
                                    });
                                    return;
                                }
                            }
                        }
                    }

                    const actualLeadingEmptyLines =
                        leadingEmptyLines(sourceCode.text.substring(leadingComments[headerLines.length - 1].range[1]));
                    const missingEmptyLines = numNewlines - actualLeadingEmptyLines;
                    if (missingEmptyLines > 0) {
                        context.report({
                            loc: missingEmptyLinesViolationLoc(leadingComments, actualLeadingEmptyLines),
                            messageId: "noNewlineAfterHeader",
                            data: {
                                expected: numNewlines,
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
                            ? genReplaceFixer(commentType, context, leadingComments, fixLines, eol, numNewlines)
                            : null
                    });
                    return;
                }

                const actualLeadingEmptyLines =
                    leadingEmptyLines(sourceCode.text.substring(leadingComments[0].range[1]));
                const missingEmptyLines = numNewlines - actualLeadingEmptyLines;
                if (missingEmptyLines > 0) {
                    context.report({
                        loc: missingEmptyLinesViolationLoc(leadingComments, actualLeadingEmptyLines),
                        messageId: "noNewlineAfterHeader",
                        data: {
                            expected: numNewlines,
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
