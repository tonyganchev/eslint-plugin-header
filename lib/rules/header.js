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

const assert = require("assert");
const fs = require("fs");
const os = require("os");
const { lineEndingOptions, commentTypeOptions, schema } = require("./header.schema");
const commentParser = require("../comment-parser");

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
 * Local type defintions.
 * @typedef {{ pattern: string, template?: string }} HeaderLinePattern
 * @typedef {string | HeaderLinePattern} HeaderLine
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
            return os.EOL;
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
 * Ensures that the right amount of empty lines trail the header.
 * @param {string} src source to validate.
 * @param {number} num expected number of trailing empty lines.
 * @returns {boolean} `true` if the `num` number of empty lines are appended at
 *                    the end or `false` otherwise.
 */
function matchesLineEndings(src, num) {
    for (let i = 0; i < num; i++) {
        const m = src.match(/^(\r\n|\r|\n)/);
        if (m) {
            src = src.slice(m.index + m[0].length);
        } else {
            return false;
        }
    }
    return true;
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
        (line) => typeof line === "string" ? line.split(/\r?\n/) : [line]);

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

module.exports = {
    meta: {
        type: "layout",
        fixable: "whitespace",
        schema
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
            return isRegex ? new RegExp(line.pattern) : line;
        });

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
                        loc: node.loc,
                        message: "header should be a {{commentType}} comment",
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
                    if (leadingComments.length < headerLines.length) {
                        context.report({
                            loc: node.loc,
                            message: "incorrect header",
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
                    if (headerLines.length === 1) {
                        const leadingCommentValues = leadingComments.map((c) => c.value);
                        if (
                            !match(leadingCommentValues.join("\n"), headerLines[0])
                            && !match(leadingCommentValues.join("\r\n"), headerLines[0])
                        ) {
                            context.report({
                                loc: node.loc,
                                message: "incorrect header",
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
                        }
                        return;
                    }
                    for (let i = 0; i < headerLines.length; i++) {
                        if (!match(leadingComments[i].value, headerLines[i])) {
                            context.report({
                                loc: node.loc,
                                message: "incorrect header",
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

                    const start = leadingComments[headerLines.length - 1].range[1];
                    const postLineHeader = context.sourceCode.text.substring(
                        start,
                        start + options.trailingEmptyLines.minimum * 2);
                    if (!matchesLineEndings(postLineHeader, options.trailingEmptyLines.minimum)) {
                        context.report({
                            loc: node.loc,
                            message: "no newline after header",
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
                    }
                    return;
                }

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

                const start = leadingComments[0].range[1];
                const postBlockHeader = context.sourceCode.text.substring(
                    start,
                    start + options.trailingEmptyLines.minimum * 2);
                if (!matchesLineEndings(postBlockHeader, options.trailingEmptyLines.minimum)) {
                    context.report({
                        loc: node.loc,
                        message: "no newline after header",
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
                }
            }
        };
    }
};

