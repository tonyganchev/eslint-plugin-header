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

/**
 * Import type definitions.
 * @typedef {import('estree').Comment} Comment
 * @typedef {import('estree').Program} Program
 * @typedef {import('eslint').Rule.Fix} Fix
 * @typedef {import('eslint').Rule.NodeListener} NodeListener
 * @typedef {import('eslint').Rule.ReportFixer} ReportFixer
 * @typedef {import('eslint').Rule.RuleFixer} RuleFixer
 * @typedef {import('eslint').Rule.RuleTextEdit} RuleTextEdit
 * @typedef {import('eslint').Rule.RuleTextEditor} RuleTextEditor
 * @typedef {import('eslint').Rule.RuleContext} RuleContext
 */

/**
 * @enum {string}
 */
const lineEndingOptions = Object.freeze({
    unix: "unix", // \n
    windows: "windows", // \n
});

/**
 * @enum {string}
 */
const commentTypeOptions = Object.freeze({
    block: "block",
    line: "line"
});

/**
 * Local type defintions.
 * @typedef {string | { pattern: string, template?: string }} HeaderLine
 * @typedef {HeaderLine | HeaderLine[]} HeaderLines
 * @typedef {{ lineEndings: ('unix' | 'windows') }} HeaderSettings
 * @typedef {
 * [string]
 *  | [string, HeaderSettings]
 *  | [('block' | 'line') | HeaderLines ]
 *  | [('block' | 'line') | HeaderLines | HeaderSettings]
 *  | [('block' | 'line') | HeaderLines | number ]
 *  | [('block' | 'line') | HeaderLines | number | HeaderSettings]
 * } HeaderOptions
 */

const fs = require("fs");
const commentParser = require("../comment-parser");
const os = require("os");

/**
 * Tests if the passed line configuration string or object is a pattern
 * definition.
 * @param {HeaderLine} object line configuration object or string
 * @returns {boolean} `true` if the line configuration is a pattern-dfining
 *                    object or `false` otherwise.
 */
function isPattern(object) {
    return typeof object === "object" && Object.prototype.hasOwnProperty.call(object, "pattern");
}

/**
 * Utility over a line config argument to match an expected string either
 * against a regex or for full match against a string.
 * @param {HeaderLine} actual the string to test.
 * @param {string} expected The string or regex to test again.
 * @returns {boolean} `true` if the passed string matches the expected line
 *                    config or `false` otherwise.
 */
function match(actual, expected) {
    if (expected.test) {
        return expected.test(actual);
    } else {
        return expected === actual;
    }
}

/**
 * Remove Unix she-bangs from the list of comments.
 * @param {Comment[]} comments the list of comment lines.
 * @returns {Comment[]} the list of comments with containing all incomming
 *                      comments from `comments` with the shebang comments
 *                      omitted.
 */
function excludeShebangs(comments) {
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
 * @param {Program} node ESLint AST treee node being processed.
 * @returns {Comment[]} lines that constitute the leading comment.
 */
function getLeadingComments(context, node) {
    const all = excludeShebangs(context.sourceCode.getAllComments(node.body.length ? node.body[0] : node));
    if (all[0].type.toLowerCase() === commentTypeOptions.block) {
        return [all[0]];
    }
    let i;
    for (i = 1; i < all.length; ++i) {
        const txt = context.sourceCode.text.slice(all[i - 1].range[1], all[i].range[0]);
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
 * @param {number} numNewlines number of trailing lines after the comment.
 * @returns {string} resulting comment.
 */
function genCommentBody(commentType, textArray, eol, numNewlines) {
    const eols = eol.repeat(numNewlines);
    if (commentType === commentTypeOptions.block) {
        return "/*" + textArray.join(eol) + "*/" + eols;
    } else {
        return "//" + textArray.join(eol + "//") + eols;
    }
}

/**
 * ...
 * @param {RuleContext} context ESLint rule execution context.
 * @param {string[]} comments list of comments.
 * @param {'\n' | '\r\n'} eol end-of-line characters
 * @returns {[number, number]} resulting range.
 */
function genCommentsRange(context, comments, eol) {
    const start = comments[0].range[0];
    let end = comments.slice(-1)[0].range[1];
    const sourceCode = context.sourceCode.text;
    const headerTrailingChars = sourceCode.substring(end, end + eol.length);
    if (headerTrailingChars === eol) {
        end += eol.length;
    }
    return [start, end];
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
        const newHeader = genCommentBody(commentType, headerLines, eol, numNewlines);
        if (context.sourceCode.text.startsWith("#!")) {
            const firstNewLinePos = context.sourceCode.text.indexOf("\n");
            const insertPos = firstNewLinePos === -1 ? context.sourceCode.text.length : firstNewLinePos + 1;
            return fixer.insertTextBeforeRange(
                [insertPos, insertPos /* don't care */],
                (firstNewLinePos === -1 ? eol : "") + newHeader
            );
        } else {
            return fixer.insertTextBeforeRange(
                [0, 0 /* don't care */],
                newHeader
            );
        }
    };
}

/**
 * Factory for fixer that replaces an incorrect header.
 * @param {'block' | 'line'} commentType type of comment to use.
 * @param {RuleContext} context ESLint rule execution context.
 * @param {Comment[]} leadingComments comment elements to replace.
 * @param {string[]} headerLines lines of the header comment.
 * @param {'\n' | '\r\n'} eol end-of-line characters
 * @param {number} numNewlines number of trailing lines after the comment.
 * @returns {
 *  (fixer: RuleTextEditor) => RuleTextEdit | RuleTextEdit[] | null
 * } the fixer.
 */
function genReplaceFixer(commentType, context, leadingComments, headerLines, eol, numNewlines) {
    return function(fixer) {
        return fixer.replaceTextRange(
            genCommentsRange(context, leadingComments, eol),
            genCommentBody(commentType, headerLines, eol, numNewlines)
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
 *                          environment.
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
    return os.EOL;
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
 * Ensures that the right amount of empty lines trail the header.
 * @param {string} src source to validate.
 * @param {number} num expected number of trailing empty lines.
 * @returns {boolean} `true` if the `num` number of empty lines are appended at
 *                    the end or `false` otherwise.
 */
function matchesLineEndings(src, num) {
    for (let i = 0; i < num; ++i) {
        const m = src.match(/^(\r\n|\r|\n)/);
        if (m) {
            src = src.slice(m.index + m[0].length);
        } else {
            return false;
        }
    }
    return true;
}

module.exports = {
    meta: {
        type: "layout",
        fixable: "whitespace",
        schema: {
            $ref: "#/definitions/options",
            definitions: {
                commentType: {
                    type: "string",
                    enum: [commentTypeOptions.block, commentTypeOptions.line]
                },
                line: {
                    anyOf: [
                        {
                            type: "string"
                        },
                        {
                            type: "object",
                            properties: {
                                pattern: {
                                    type: "string"
                                },
                                template: {
                                    type: "string"
                                }
                            },
                            required: ["pattern"],
                            additionalProperties: false
                        }
                    ]
                },
                headerLines: {
                    anyOf: [
                        {
                            $ref: "#/definitions/line"
                        },
                        {
                            type: "array",
                            items: {
                                $ref: "#/definitions/line"
                            }
                        }
                    ]
                },
                numNewlines: {
                    type: "integer",
                    minimum: 0
                },
                settings: {
                    type: "object",
                    properties: {
                        lineEndings: {
                            type: "string",
                            enum: [lineEndingOptions.unix, lineEndingOptions.windows]
                        }
                    },
                    additionalProperties: false
                },
                options: {
                    anyOf: [
                        {
                            type: "array",
                            minItems: 1,
                            maxItems: 2,
                            items: [
                                { type: "string" },
                                { $ref: "#/definitions/settings" }
                            ]
                        },
                        {
                            type: "array",
                            minItems: 2,
                            maxItems: 3,
                            items: [
                                { $ref: "#/definitions/commentType" },
                                { $ref: "#/definitions/headerLines" },
                                { $ref: "#/definitions/settings" }
                            ]
                        },
                        {
                            type: "array",
                            minItems: 3,
                            maxItems: 4,
                            items: [
                                { $ref: "#/definitions/commentType" },
                                { $ref: "#/definitions/headerLines" },
                                { $ref: "#/definitions/numNewlines" },
                                { $ref: "#/definitions/settings" }
                            ]
                        }
                    ]
                }
            }
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
        let headerLines;
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
            fixLines = headerLines;
        }

        return {
            /**
             * Hooks into the processing of the overall script node to do the
             * header validation.
             * @param {Program} node the whole script node
             * @returns {void}
             */
            Program: function(node) {
                if (!hasHeader(context.sourceCode.text)) {
                    context.report({
                        loc: node.loc,
                        message: "missing header",
                        fix: genPrependFixer(commentType, context, fixLines, eol, numNewlines)
                    });
                } else {
                    const leadingComments = getLeadingComments(context, node);

                    if (leadingComments[0].type.toLowerCase() !== commentType) {
                        context.report({
                            loc: node.loc,
                            message: "header should be a {{commentType}} comment",
                            data: {
                                commentType: commentType
                            },
                            fix: canFix
                                ? genReplaceFixer(commentType, context, leadingComments, fixLines, eol, numNewlines)
                                : null
                        });
                    } else {
                        if (commentType === commentTypeOptions.line) {
                            if (leadingComments.length < headerLines.length) {
                                context.report({
                                    loc: node.loc,
                                    message: "incorrect header",
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
                            for (let i = 0; i < headerLines.length; i++) {
                                if (!match(leadingComments[i].value, headerLines[i])) {
                                    context.report({
                                        loc: node.loc,
                                        message: "incorrect header",
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

                            const start = leadingComments[headerLines.length - 1].range[1];
                            const postLineHeader = context.sourceCode.text.substring(start, start + numNewlines * 2);
                            if (!matchesLineEndings(postLineHeader, numNewlines)) {
                                context.report({
                                    loc: node.loc,
                                    message: "no newline after header",
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
                            }

                        } else {
                            // if block comment pattern has more than 1 line, we
                            // also split the comment
                            let leadingLines = [leadingComments[0].value];
                            if (headerLines.length > 1) {
                                leadingLines = leadingComments[0].value.split(/\r?\n/);
                            }

                            let hasError = false;
                            if (leadingLines.length > headerLines.length) {
                                hasError = true;
                            }
                            for (let i = 0; !hasError && i < headerLines.length; i++) {
                                const leadingLine = leadingLines[i];
                                const headerLine = headerLines[i];
                                if (!match(leadingLine, headerLine)) {
                                    hasError = true;
                                    break;
                                }
                            }

                            if (hasError) {
                                if (canFix && headerLines.length > 1) {
                                    fixLines = [fixLines.join(eol)];
                                }
                                context.report({
                                    loc: node.loc,
                                    message: "incorrect header",
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
                            } else {
                                const start = leadingComments[0].range[1];
                                const postBlockHeader =
                                    context.sourceCode.text.substring(start, start + numNewlines * 2);
                                if (!matchesLineEndings(postBlockHeader, numNewlines)) {
                                    context.report({
                                        loc: node.loc,
                                        message: "no newline after header",
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
                                }
                            }
                        }
                    }
                }
            }
        };
    }
};
