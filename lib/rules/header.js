/**
 * @file Header validation rule implementation.
 * @copyright Copyright (c) 2015-present Stuart Knightley and contributors
 * @copyright Copyright (c) 2024-2026 Tony Ganchev
 * @license MIT
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
const { description, recommended } = require("./header.docs");
const { lineEndingOptions, commentTypeOptions, schema } = require("./header.schema");

/**
 * @import { JSSyntaxElement, Linter, Rule, SourceCode } from "eslint"
 * @import { Comment, SourceLocation } from "estree"
 * @import { ViolationReport } from "@eslint/core";
 * @typedef {Rule.NodeListener} NodeListener
 * @typedef {Rule.ReportFixer} ReportFixer
 * @typedef {Rule.RuleFixer} RuleFixer
 * @typedef {Rule.RuleContext} RuleContext
 */

/**
 * @typedef {"\n" | "\r\n"} LineEnding The sequence of characters that define
 * the end of a line.
 */

/**
 * @typedef {object} HeaderLinePattern Matching rule for a line from the header
 * using regular expression and optionally providing an auto-fix replacement.
 * @property {string | RegExp} pattern A regular expression that should match
 * the header line.
 * @property {string} [template] When set, if the actual header line does not
 * match `pattern`, this value is to be used when running auto-fix.
 */

/**
 * @typedef {string | RegExp | HeaderLinePattern} HeaderLine Matching rule for
 * a single line of the header comment or the header comment as a whole if only
 * one used.
 * @typedef {HeaderLine | HeaderLine[]} HeaderLines The set of header comment-
 * matching rules.
 * @typedef {"os" | "unix" | "windows"} LineEndingOption Defines what EOL
 * characters to expect - either forced to be Windows / POSIX-compatible, or
 * defaulting to whatever the OS expects.
 * @typedef {{ lineEndings?: LineEndingOption }} HeaderSettings How to treat
 * line endings.
 * @typedef {"block" | "line"} CommentType The expected type of comment to use
 * for the header.
 */

/**
 * @typedef {object} FileBasedConfig Header content configuration defined in a
 * separate JavaScript template file.
 * @property {string} file Template file path relative to the directory
 * from which ESLint runs.
 * @property {BufferEncoding} [encoding] Encoding to use when reading the
 * file. If omitted, `"utf8"` will be assumed.
 */

/**
 * @typedef {object} InlineConfig Header content configuration defined inline
 * within the ESLint configuration.
 * @property {CommentType} commentType The type of comment to expect.
 * @property {HeaderLine[]} lines Matching rules for lines. If only one rule
 * is provided, the rule would attempt to match either the first line ar all
 * lines together.
 */

/**
 * @typedef {object} LeadingComments A set of comments that can appear before
 * the header.
 * @property {(FileBasedConfig | InlineConfig)[]} comments The set of comments
 * that are allowed. If none of the matching rules matches the first comment the
 * rule assumes the first comment *is* the header.
 */

/**
 * @typedef {object} TrailingEmptyLines Rule configuration on the handling of
 * empty lines after the header comment.
 * @property {number} [minimum] If set, the rule would check that at least
 * a `minimum` number of EOL characters trail the header.
 */

/**
 * @typedef {object} HeaderOptionsWithoutSettings
 * @property {FileBasedConfig | InlineConfig} header The text matching rules
 * for the header.
 * @property {LeadingComments} [leadingComments] The set of allowed comments to
 * precede the header. Useful to allow position-sensitive pragma comments for
 * certain tools.
 * @property {TrailingEmptyLines} [trailingEmptyLines] Rules about empty lines
 * after the header comment.
 */

/**
 * @typedef {HeaderOptionsWithoutSettings & HeaderSettings} HeaderOptions Modern
 * object-based rule configuration.
 */

/**
 * @typedef {[template: string]} LegacyFileBasedConfig
 * @typedef {[template: string, settings: HeaderSettings]
 * } LegacyFileBasedSettingsConfig
 * @typedef {[type: CommentType, lines: HeaderLines]} LegacyInlineConfig
 * @typedef {[type: CommentType, lines: HeaderLines, settings: HeaderSettings]
 * } LegacyInlineSettingsConfig
 * @typedef {[type: CommentType, lines: HeaderLines, minLines: number]
 * } LegacyInlineMinLinesConfig
 * @typedef {[
 * type: CommentType,
 * lines: HeaderLines,
 * minLines: number,
 * settings: HeaderSettings
 * ]} LegacyInlineMinLinesSettingsConfig
 * @typedef {[HeaderOptions]
 * | LegacyFileBasedConfig
 * | LegacyFileBasedSettingsConfig
 * | LegacyInlineConfig
 * | LegacyInlineSettingsConfig
 * | LegacyInlineMinLinesConfig
 * | LegacyInlineMinLinesSettingsConfig
 * } AllHeaderOptions Full possible rule configuration options.
 */

/**
 * @typedef {Linter.RuleEntry<AllHeaderOptions>} HeaderRuleConfig Rule
 * configuration array including severity.
 */

/**
 * Tests if the passed line configuration string or object is a pattern
 * definition.
 * @param {HeaderLine} object Line configuration object or string.
 * @returns {object is HeaderLinePattern} `true` if the line configuration is a
 * pattern-defining object or `false` otherwise.
 */
function isPattern(object) {
    return typeof object === "object"
        && (Object.prototype.hasOwnProperty.call(object, "pattern"));
}

/**
 * Utility over a line config argument to match an expected string either
 * against a regex or for full match against a string.
 * @param {string} actual The string to test.
 * @param {string | RegExp} expected The string or regex to test again.
 * @returns {boolean} `true` if the passed string matches the expected line
 * config or `false` otherwise.
 */
function match(actual, expected) {
    if (expected instanceof RegExp) {
        return expected.test(actual);
    } else {
        return expected === actual;
    }
}

/**
 * @typedef {[number, number]} Range
 */

/**
 * @typedef {object} CommentEx
 * @property {"Shebang" | "Block" | "Line"} type Comment type.
 * @property {string} value Content of the comment.
 * @property {Range} range Linear position of the comment within the source.
 * @property {SourceLocation} loc Editor-oriented location of the comment.
 */

/**
 * @typedef {object} BlockComment
 * @property {string} startDelimiter The delimiter that marks the start of the
 * block comment.
 * @property {string} endDelimiter The delimiter that marks the end of the
 * block comment.
 */

/**
 * @typedef {object} LineComment
 * @property {string} startDelimiter The delimiter that marks the start of the
 * line comment.
 */

/**
 * @typedef {object} Language
 * @property { BlockComment } blockComment The tokens delimiting a block
 * comment.
 * @property { LineComment } [lineComment] The tokens delimiting a line comment
 * if such is allowed.
 * @property { boolean} [shebang] If set to `true`, the logic to handle shebangs
 * will kick in.
 */

/**
 * Returns an array of comment groups before the actual code.
 * Block comments form single-element groups.
 * Line comments without empty lines between them form grouped elements.
 * @param {SourceCode} sourceCode AST.
 * @param {Language} language The language configuration.
 * @returns {CommentEx[][]} Array of groups of leading comments.
 */
function getLeadingComments(sourceCode, language) {
    const text = sourceCode.text;
    const groups = [];
    /** @type {CommentEx[]} */
    let currentGroup = [];
    let pos = 0;
    let lastCommentEnd = 0;

    /**
     * Adds a comment to the appropriate group, handling line-comment grouping.
     * @param {CommentEx} comment The comment to add.
     * @returns {void}
     */
    function addComment(comment) {
        if (comment.type === "Block" || comment.type === "Shebang") {
            if (currentGroup.length > 0) {
                groups.push(currentGroup);
                currentGroup = [];
            }
            groups.push([comment]);
        } else {
            // Group consecutive line comments
            if (currentGroup.length > 0) {
                const range = comment.range;
                const whitespace = text.slice(lastCommentEnd, range[0]);
                const newlineCount = whitespace.split(/\r?\n/).length - 1;
                if (newlineCount > 1) {
                    groups.push(currentGroup);
                    currentGroup = [];
                }
            }
            currentGroup.push(comment);
        }
        lastCommentEnd = comment.range[1];
    }

    while (pos < text.length) {
        // Try Shebang only at the very start
        if (language.shebang && pos === 0) {
            const shebangMatch = text.match(/^#!.*/);
            if (shebangMatch) {
                const shebangText = shebangMatch[0];
                const valueText = shebangText.slice(2);
                addComment({
                    type: "Shebang",
                    value: valueText,
                    range: [0, shebangText.length],
                    loc: {
                        start: sourceCode.getLocFromIndex(0),
                        end: sourceCode.getLocFromIndex(shebangText.length)
                    }
                });
                pos = shebangText.length;
                continue;
            }
        }

        // Check for block comment
        if (language.blockComment && text.startsWith(language.blockComment.startDelimiter, pos)) {
            const endIdx =
                text.indexOf(language.blockComment.endDelimiter, pos + language.blockComment.startDelimiter.length);
            if (endIdx !== -1) {
                const valueText = text.slice(pos + language.blockComment.startDelimiter.length, endIdx);
                const endPos = endIdx + language.blockComment.endDelimiter.length;
                addComment({
                    type: "Block",
                    value: valueText,
                    range: [pos, endPos],
                    loc: {
                        start: sourceCode.getLocFromIndex(pos),
                        end: sourceCode.getLocFromIndex(endPos)
                    }
                });
                pos = endPos;
                continue;
            }
        }

        // Check for line comment
        if (language.lineComment && text.startsWith(language.lineComment.startDelimiter, pos)) {
            const endOfLineMatch = text.slice(pos).match(/\r?\n/);
            const endOffset = endOfLineMatch ? (/** @type {number} */ (endOfLineMatch.index)) : text.length - pos;
            const endIdx = pos + endOffset;
            const valueText = text.slice(pos + language.lineComment.startDelimiter.length, endIdx);
            addComment({
                type: "Line",
                value: valueText,
                range: [pos, endIdx],
                loc: {
                    start: sourceCode.getLocFromIndex(pos),
                    end: sourceCode.getLocFromIndex(endIdx)
                }
            });
            pos = endIdx;
            continue;
        }

        // Check for whitespace to skip
        const wsMatch = text.slice(pos).match(/^\s+/);
        if (wsMatch) {
            pos += wsMatch[0].length;
            continue;
        }

        // Anything else is code, stop parsing leading comments
        break;
    }

    if (currentGroup.length > 0) {
        groups.push(currentGroup);
    }

    return groups;
}

/**
 * Generate a comment including trailing spaces out of a number of comment body
 * lines.
 * @param {CommentType} commentType The type of comment to generate.
 * @param {string[]} textArray List of lines of the comment content.
 * @param {LineEnding} eol End-of-line characters.
 * @param {Language} language The language configuration.
 * @returns {string} Resulting comment.
 */
function genCommentBody(commentType, textArray, eol, language) {
    if (commentType === commentTypeOptions.block) {
        return language.blockComment.startDelimiter + textArray.join(eol) + language.blockComment.endDelimiter;
    } else {
        const lineStartDelimiter = /** @type {LineComment} */ (language.lineComment).startDelimiter;
        // We need one trailing EOL on line comments to ensure the fixed source
        // is parsable.
        return lineStartDelimiter + textArray.join(eol + lineStartDelimiter);
    }
}

/**
 * Determines the start and end position in the source code of the leading
 * comment.
 * @param {CommentEx[]} comments List of comments.
 * @returns {Range} Resulting range.
 */
function genCommentsRange(comments) {
    assert.ok(comments.length);
    const firstComment = comments[0];
    const start = firstComment.range[0];
    const lastComment = comments.slice(-1)[0];
    const end = lastComment.range[1];
    return [start, end];
}

/**
 * Calculates the number of leading empty lines in the source code. The function
 * counts both Windows and POSIX line endings.
 * @param {string} src The source code to traverse.
 * @returns {number} The number of leading empty lines.
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
 * @param {CommentType} commentType Type of comment to use.
 * @param {SourceCode} sourceCode AST.
 * @param {string[]} headerLines Lines of the header comment.
 * @param {LineEnding} eol End-of-line characters.
 * @param {number} numNewlines Number of trailing lines after the comment.
 * @param {Language} language The language configuration.
 * @returns {ReportFixer} The fix to apply.
 */
function genPrependFixer(commentType, sourceCode, headerLines, eol, numNewlines, language) {
    return function (fixer) {
        let insertPos = 0;
        let newHeader = genCommentBody(commentType, headerLines, eol, language);
        if (language.shebang && sourceCode.text.startsWith("#!")) {
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
 * @param {CommentType} commentType Type of comment to use.
 * @param {SourceCode} sourceCode AST.
 * @param {CommentEx[]} leadingComments Comment elements to replace.
 * @param {string[]} headerLines Lines of the header comment.
 * @param {LineEnding} eol End-of-line characters.
 * @param {number} numNewlines Number of trailing lines after the comment.
 * @param {Language} language The language configuration.
 * @returns {ReportFixer} The fix to apply.
 */
function genReplaceFixer(commentType, sourceCode, leadingComments, headerLines, eol, numNewlines, language) {
    return function (fixer) {
        const commentRange = genCommentsRange(leadingComments);
        const emptyLines = leadingEmptyLines(sourceCode.text.substring(commentRange[1]));
        const missingNewlines = Math.max(0, numNewlines - emptyLines);
        const eols = eol.repeat(missingNewlines);
        return fixer.replaceTextRange(
            commentRange,
            genCommentBody(commentType, headerLines, eol, language) + eols
        );
    };
}

/**
 * Factory for fixer that replaces an incorrect header.
 * @param {CommentEx[]} leadingComments Comment elements to replace.
 * @param {LineEnding} eol End-of-line characters.
 * @param {number} missingEmptyLinesCount Number of trailing lines after the
 * comment.
 * @returns {ReportFixer} The fix to apply.
 */
function genEmptyLinesFixer(leadingComments, eol, missingEmptyLinesCount) {
    return function (fixer) {
        return fixer.insertTextAfterRange(
            genCommentsRange(leadingComments),
            eol.repeat(missingEmptyLinesCount)
        );
    };
}

/**
 * Returns the used line-termination characters per the rule's config if any or
 * else based on the runtime environments.
 * @param {LineEndingOption} style Line-ending styles.
 * @returns {LineEnding} The correct line ending characters for the environment.
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
            return /** @type {LineEnding} */ (os.EOL);
    }
}

/**
 * Asserts on an expression and adds template texts to the failure message.
 * Helper to write cleaner code.
 * @param {boolean} condition Condition to verify.
 * @param {string} message Assert message on violation.
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
 * @param {AllHeaderOptions} originalOptions The options as configured by the
 * user.
 * @returns {HeaderOptions} The transformed new-style options with no
 * normalization.
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
    /** @type {HeaderOptions} */
    const transformedOptions = {};
    // populate header
    if (
        originalOptions.length === 1
        || (
            originalOptions.length === 2
            && typeof originalOptions[1] === "object"
            && !Array.isArray(originalOptions[1])
            && !isPattern(/** @type {HeaderLine} */(originalOptions[1]))
        )) {
        transformedOptions.header = { file: originalOptions[0], encoding: "utf8" };
    } else {
        schemaAssert(Object.prototype.hasOwnProperty.call(commentTypeOptions, originalOptions[0]),
            "Only 'block' or 'line' is accepted as comment type");
        schemaAssert(
            typeof originalOptions[1] === "string"
            || Array.isArray(originalOptions[1])
            || isPattern(/** @type {HeaderLine} */(originalOptions[1])),
            "second header option after severity should be a string, a pattern, or an array of the previous two");
        transformedOptions.header = {
            commentType: /** @type {CommentType} */ (originalOptions[0]),
            lines: /** @type {HeaderLine[]} */ (
                Array.isArray(originalOptions[1])
                    ? originalOptions[1]
                    : [originalOptions[1]])
        };
    }
    // configure required line settings
    if (originalOptions.length >= 3) {
        if (typeof originalOptions[2] === "number") {
            transformedOptions.trailingEmptyLines = { minimum: originalOptions[2] };
            if (originalOptions.length === 4) {
                schemaAssert(typeof originalOptions[3] === "object",
                    "Fourth header option after severity should be either number of required trailing empty lines or "
                    + "a settings object");
                Object.assign(transformedOptions, originalOptions[3]);
            }
        } else {
            schemaAssert(typeof originalOptions[2] === "object",
                "Third header option after severity should be either number of required trailing empty lines or a "
                + "settings object");
            Object.assign(transformedOptions, originalOptions[2]);
        }
    }
    return transformedOptions;
}

/**
 * Type guard for `FileBasedConfig`.
 * @param {FileBasedConfig | InlineConfig} config The header configuration.
 * @returns {config is FileBasedConfig} `true` if `config` is `FileBasedConfig`,
 * else `false`.
 */
function isFileBasedHeaderConfig(config) {
    return "file" in config;
}

/** @type {Record<string, { commentType: CommentType; lines: string[]}>} */
const parsedFilesCache = {};

/**
 * Transforms file template-based matching rules to inline rules for further
 * use.
 * @param {FileBasedConfig | InlineConfig} matcher The matching rule.
 * @param {Language} language The language configuration.
 * @returns {InlineConfig} The resulting normalized configuration.
 */
function normalizeMatchingRules(matcher, language) {
    if (isFileBasedHeaderConfig(matcher)) {
        if (!(matcher.file in parsedFilesCache)) {
            const text = fs.readFileSync(matcher.file, matcher.encoding || "utf8");
            const [commentType, lines] = commentParser(text, language);
            parsedFilesCache[matcher.file] = { commentType, lines };
        }
        return parsedFilesCache[matcher.file];
    }
    const commentType = matcher.commentType;
    const lines = matcher.lines.flatMap(
        (line) => {
            if (typeof line === "string") {
                return /** @type {HeaderLine[]} */(line.split(/\r?\n/));
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
    return { commentType, lines };
}

/**
 * Transforms a set of new-style options adding defaults and standardizing on
 * one of multiple config styles.
 * @param {HeaderOptions} originalOptions New-style options to normalize.
 * @param {Language} language The language configuration.
 * @returns {HeaderOptions} Normalized options.
 */
function normalizeOptions(originalOptions, language) {
    const options = structuredClone(originalOptions);

    options.header = normalizeMatchingRules(originalOptions.header, language);

    if (!options.lineEndings) {
        options.lineEndings = "os";
    }

    if (originalOptions.leadingComments) {
        options.leadingComments = {
            comments: originalOptions.leadingComments.comments.map((c) => normalizeMatchingRules(c, language))
        };
    } else {
        options.leadingComments = { comments: [] };
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
 * @param {CommentEx[]} leadingComments The comment lines that constitute the
 * header.
 * @param {number} actualEmptyLines The number of empty lines that follow the
 * header.
 * @returns {SourceLocation} The location (line and column) of the violation.
 */
function missingEmptyLinesViolationLoc(leadingComments, actualEmptyLines) {
    assert.ok(leadingComments);
    const loc = leadingComments[leadingComments.length - 1].loc;
    const lastCommentLineLocEnd = loc.end;
    return {
        start: lastCommentLineLocEnd,
        end: {
            column: actualEmptyLines === 0 ? lastCommentLineLocEnd.column + 1 : 0,
            line: lastCommentLineLocEnd.line + actualEmptyLines
        }
    };
}

/**
 * Matches comments against of header content-matching rules. An object performs
 * a number of expensive operations only once and thus can be used multiple
 * times to test different comments.
 */
class CommentMatcher {
    /**
     * Initializes the matcher for a specific comment-matching rules.
     * @param {InlineConfig} headerConfig Content-matching rules.
     * @param {string} eol The EOL characters used.
     * @param {number} numLines The requirred minimum number of trailing empty
     * lines.
     * @param {Language} language The language configuration.
     */
    constructor(headerConfig, eol, numLines, language) {
        this.commentType = headerConfig.commentType;
        this.headerLines = headerConfig.lines.map((line) => isPattern(line) ? line.pattern : line);
        this.eol = eol;
        this.numLines = numLines;
        this.language = language;
    }

    /**
     * @typedef {ViolationReport<JSSyntaxElement, string>} ViolationReportBad
     * @typedef {ViolationReportBad & { messageId: string }} ViolationReportEx
     */

    /**
     * Performs a validation of a comment against a header matching
     * configuration.
     * @param {CommentEx[]} leadingComments The block comment or sequence of
     * line comments to test.
     * @param {SourceCode} sourceCode The source code AST.
     * @returns {ViolationReportEx | null} If set a
     * violation report to pass back to ESLint or interpret as necessary.
     */
    validate(leadingComments, sourceCode) {

        const firstLeadingCommentLoc = leadingComments[0].loc;
        const firstLeadingCommentRange = leadingComments[0].range;

        const lastLeadingCommentLoc = leadingComments[leadingComments.length - 1].loc;

        if (leadingComments[0].type.toLowerCase() !== this.commentType) {
            return {
                loc: {
                    start: firstLeadingCommentLoc.start,
                    end: lastLeadingCommentLoc.end
                },
                messageId: "incorrectCommentType",
                data: {
                    commentType: this.commentType
                },
            };
        }
        if (this.commentType === commentTypeOptions.line) {
            const lineCommentDelimiter = /** @type {LineComment} */ (this.language.lineComment).startDelimiter;
            if (this.headerLines.length === 1) {
                const leadingCommentValues = leadingComments.map((c) => c.value);
                if (
                    !match(leadingCommentValues.join("\n"), this.headerLines[0])
                    && !match(leadingCommentValues.join("\r\n"), this.headerLines[0])
                ) {
                    return {
                        loc: {
                            start: firstLeadingCommentLoc.start,
                            end: lastLeadingCommentLoc.end
                        },
                        messageId: "incorrectHeader",
                        data: {
                            pattern: this.headerLines[0].toString()
                        }
                    };
                }
            } else {
                for (let i = 0; i < this.headerLines.length; i++) {
                    if (leadingComments.length - 1 < i) {
                        return {
                            loc: {
                                start: lastLeadingCommentLoc.end,
                                end: lastLeadingCommentLoc.end
                            },
                            messageId: "headerTooShort",
                            data: {
                                remainder: this.headerLines.slice(i).join(this.eol)
                            },
                        };
                    }
                    const headerLine = this.headerLines[i];
                    const comment = leadingComments[i];
                    const commentLoc = comment.loc;
                    if (typeof headerLine === "string") {
                        const leadingCommentLength = comment.value.length;
                        const headerLineLength = headerLine.length;
                        for (let j = 0; j < Math.min(leadingCommentLength, headerLineLength); j++) {
                            if (comment.value[j] !== headerLine[j]) {
                                return {
                                    loc: {
                                        start: {
                                            column: lineCommentDelimiter.length + j,
                                            line: commentLoc.start.line
                                        },
                                        end: commentLoc.end
                                    },
                                    messageId: "headerLineMismatchAtPos",
                                    data: {
                                        expected: headerLine.substring(j)
                                    },
                                };
                            }
                        }
                        if (leadingCommentLength < headerLineLength) {
                            return {
                                loc: {
                                    start: commentLoc.end,
                                    end: commentLoc.end,
                                },
                                messageId: "headerLineTooShort",
                                data: {
                                    remainder: headerLine.substring(leadingCommentLength)
                                },
                            };
                        }
                        if (leadingCommentLength > headerLineLength) {
                            return {
                                loc: {
                                    start: {
                                        column: lineCommentDelimiter.length + headerLineLength,
                                        line: commentLoc.start.line
                                    },
                                    end: commentLoc.end,
                                },
                                messageId: "headerLineTooLong",
                            };
                        }
                    } else {
                        if (!match(comment.value, headerLine)) {
                            return {
                                loc: {
                                    start: {
                                        column: lineCommentDelimiter.length,
                                        line: commentLoc.start.line,
                                    },
                                    end: commentLoc.end,
                                },
                                messageId: "incorrectHeaderLine",
                                data: {
                                    pattern: headerLine.toString()
                                },
                            };
                        }
                    }
                }
            }

            const commentRange = leadingComments[this.headerLines.length - 1].range;
            const actualLeadingEmptyLines = leadingEmptyLines(sourceCode.text.substring(commentRange[1]));
            const missingEmptyLines = this.numLines - actualLeadingEmptyLines;
            if (missingEmptyLines > 0) {
                return {
                    loc: missingEmptyLinesViolationLoc(leadingComments, actualLeadingEmptyLines),
                    messageId: "noNewlineAfterHeader",
                    data: {
                        expected: this.numLines,
                        actual: actualLeadingEmptyLines
                    },
                };
            }

            return null;
        }
        // if block comment pattern has more than 1 line, we also split the
        // comment
        let leadingLines = [leadingComments[0].value];
        if (this.headerLines.length > 1) {
            leadingLines = leadingComments[0].value.split(/\r?\n/);
        }

        /** @type {null | string} */
        let errorMessageId = null;
        /** @type {undefined | Record<string, string>} */
        let errorMessageData;
        /** @type {null | SourceLocation} */
        let errorMessageLoc = null;
        const blockStartLen = this.language.blockComment.startDelimiter.length;
        const blockEndLen = this.language.blockComment.endDelimiter.length;

        for (let i = 0; i < this.headerLines.length; i++) {
            if (leadingLines.length - 1 < i) {
                return {
                    loc: {
                        start: lastLeadingCommentLoc.end,
                        end: lastLeadingCommentLoc.end
                    },
                    messageId: "headerTooShort",
                    data: {
                        remainder: this.headerLines.slice(i).join(this.eol)
                    },
                };
            }
            const leadingLine = leadingLines[i];
            const headerLine = this.headerLines[i];
            if (typeof headerLine === "string") {
                for (let j = 0; j < Math.min(leadingLine.length, headerLine.length); j++) {
                    if (leadingLine[j] !== headerLine[j]) {
                        errorMessageId = "headerLineMismatchAtPos";
                        const columnOffset = i === 0 ? blockStartLen : 0;
                        const line = firstLeadingCommentLoc.start.line + i;
                        errorMessageLoc = {
                            start: { column: columnOffset + j, line },
                            end: { column: columnOffset + leadingLine.length, line }
                        };
                        errorMessageData = { expected: headerLine.substring(j) };
                        break;
                    }
                }
                if (errorMessageId) {
                    break;
                }

                if (leadingLine.length < headerLine.length) {
                    errorMessageId = "headerLineTooShort";
                    const startColumn = (i === 0 ? blockStartLen : 0) + leadingLine.length;
                    errorMessageLoc = {
                        start: { column: startColumn, line: firstLeadingCommentLoc.start.line + i },
                        end: { column: startColumn + 1, line: firstLeadingCommentLoc.start.line + i }
                    };
                    errorMessageData = { remainder: headerLine.substring(leadingLine.length) };
                    break;
                }
                if (leadingLine.length > headerLine.length) {
                    errorMessageId = "headerLineTooLong";
                    errorMessageLoc = {
                        start: {
                            column: (i === 0 ? blockStartLen : 0) + headerLine.length,
                            line: firstLeadingCommentLoc.start.line + i
                        },
                        end: {
                            column: (i === 0 ? blockStartLen : 0) + leadingLine.length,
                            line: firstLeadingCommentLoc.start.line + i
                        }
                    };
                    break;
                }
            } else {
                if (!match(leadingLine, headerLine)) {
                    errorMessageId = "incorrectHeaderLine";
                    errorMessageData = { pattern: headerLine.toString() };
                    const columnOffset = i === 0 ? blockStartLen : 0;
                    errorMessageLoc = {
                        start: { column: columnOffset + 0, line: firstLeadingCommentLoc.start.line + i },
                        end: { column: columnOffset + leadingLine.length, line: firstLeadingCommentLoc.start.line + i }
                    };
                    break;
                }
            }
        }

        if (!errorMessageId && leadingLines.length > this.headerLines.length) {
            errorMessageId = "headerTooLong";
            errorMessageLoc = {
                start: {
                    column: (this.headerLines.length === 0 ? blockStartLen : 0) + 0,
                    line: firstLeadingCommentLoc.start.line + this.headerLines.length
                },
                end: {
                    column: lastLeadingCommentLoc.end.column - blockEndLen,
                    line: lastLeadingCommentLoc.end.line
                }
            };
        }

        if (errorMessageId) {
            return {
                loc: /** @type {SourceLocation} */ (errorMessageLoc),
                messageId: errorMessageId,
                data: errorMessageData,
            };
        }

        const actualLeadingEmptyLines =
            leadingEmptyLines(sourceCode.text.substring(firstLeadingCommentRange[1]));
        const missingEmptyLines = this.numLines - actualLeadingEmptyLines;
        if (missingEmptyLines > 0) {
            return {
                loc: missingEmptyLinesViolationLoc(leadingComments, actualLeadingEmptyLines),
                messageId: "noNewlineAfterHeader",
                data: {
                    expected: this.numLines,
                    actual: actualLeadingEmptyLines
                },
            };
        }

        return null;
    }
}


/** @type {Rule.RuleModule} */
const headerRule = {
    meta: {
        type: "layout",
        docs: {
            description,
            recommended
        },
        fixable: "whitespace",
        schema,
        messages: {
            // messages customized for header validation.
            headerLineMismatchAtPos:
                "header line does not match expected after this position; expected: '{{expected}}'",
            headerLineTooLong: "header line longer than expected",
            headerLineTooShort: "header line shorter than expected; missing: '{{remainder}}'",
            headerTooShort: "header too short; missing lines: '{{remainder}}'",
            headerTooLong: "header too long",
            incorrectCommentType: "header should be a {{commentType}} comment",
            incorrectHeader: "header does not match pattern: '{{pattern}}'",
            incorrectHeaderLine: "header line does not match pattern: '{{pattern}}'",
            // messages customized for leading comments validation.
            "leadingComment-headerLineMismatchAtPos":
                "leading comment validation failed: line does not match expected after this position; "
                + "expected: '{{expected}}'",
            "leadingComment-headerLineTooLong": "leading comment validation failed: line longer than expected",
            "leadingComment-headerLineTooShort":
                "leading comment validation failed: line shorter than expected; missing: '{{remainder}}'",
            "leadingComment-headerTooShort":
                "leading comment validation failed: comment too short; missing lines: '{{remainder}}'",
            "leadingComment-headerTooLong": "leading comment validation failed: comment too long",
            "leadingComment-incorrectCommentType":
                "leading comment validation failed: should be a {{commentType}} comment",
            "leadingComment-incorrectHeader":
                "leading comment validation failed: comment does not match pattern: '{{pattern}}'",
            "leadingComment-incorrectHeaderLine":
                "leading comment validation failed: comment line does not match pattern: '{{pattern}}'",
            // messages only applicable to header validation.
            missingHeader: "missing header",
            noNewlineAfterHeader: "not enough newlines after header: expected: {{expected}}, actual: {{actual}}"
        }
    },

    /**
     * Rule creation function.
     * @param {RuleContext} context ESLint rule execution context.
     * @returns {NodeListener} The rule definition.
     */
    create: function (context) {

        const newStyleOptions = transformLegacyOptions(/** @type {AllHeaderOptions} */(context.options));

        /**
         * Hooks into the processing of the overall script node to do the
         * header validation.
         * @param {Language} language The language configuration.
         * @returns {void}
         */
        function onRootNode(language) {
            const options = normalizeOptions(newStyleOptions, language);
            const eol = getEol(/** @type {LineEndingOption} */(options.lineEndings));
            const header = /** @type {InlineConfig} */ (options.header);
            const canFix = !header.lines.some((line) =>
                isPattern(/** @type {HeaderLine} */(line)) && !("template" in line));
            const fixLines = header.lines.map((line) => {
                if (isPattern(/** @type {HeaderLine} */(line))) {
                    return ("template" in line) ? /** @type {string} */(line.template) : "";
                }
                return /** @type {string} */(line);
            });
            const numLines = /** @type {number} */ (options.trailingEmptyLines?.minimum);

            const sourceCode = contextSourceCode(context);
            const headerMatcher = new CommentMatcher(header, eol, numLines, language);
            const allowedLeadingComments = /** @type {LeadingComments} */ (options.leadingComments).comments;
            const allowedCommentsMatchers =
                allowedLeadingComments.map((c) => new CommentMatcher(/** @type {InlineConfig} */(c), eol, 0, language));

            const leadingComments = getLeadingComments(sourceCode, language);
            // XXX: the reason we test like this instead of checking the
            // first comment is of type "Shabeng" is because
            // @typecript-eslint/prser does not recognize shebang comments
            // with some TypeScript configuration. Since we are not
            // releasing a major version we do not want to break the current
            // behavior of not be pedantic about the tsconfig.json.
            const hasShebang = language.shebang && sourceCode.text.startsWith("#!");
            let startingHeaderLine = 1;
            if (hasShebang) {
                if (leadingComments.length > 0
                    && /** @type {string} */ (leadingComments[0][0].type) === "Shebang"
                ) {
                    leadingComments.splice(0, 1);
                }
                startingHeaderLine = 2;
            }

            if (leadingComments.length === 0 || leadingComments[0][0].loc.start.line > startingHeaderLine) {
                context.report({
                    loc: {
                        start: {
                            column: 0,
                            line: startingHeaderLine
                        },
                        end: {
                            column: 0,
                            line: startingHeaderLine
                        }
                    },
                    messageId: "missingHeader",
                    fix: canFix
                        ? genPrependFixer(
                            headerMatcher.commentType,
                            sourceCode,
                            fixLines,
                            eol,
                            numLines,
                            language)
                        : null
                });
                return;
            }

            for (const leadingComment of leadingComments) {

                const headerReport = headerMatcher.validate(leadingComment, sourceCode);
                if (headerReport === null) {
                    return;
                }
                const leadingCommentReports =
                    allowedCommentsMatchers.map((m) => m.validate(leadingComment, sourceCode));
                const commentMatched = leadingCommentReports.some((report) => report === null);

                if (!commentMatched) {
                    if ("messageId" in headerReport && headerReport.messageId === "noNewlineAfterHeader") {
                        const { expected, actual } =
                            /** @type {{ expected: number, actual: number }} */ (headerReport.data);
                        headerReport.fix = genEmptyLinesFixer(leadingComment, eol, expected - actual);
                    } else if (canFix) {
                        headerReport.fix = genReplaceFixer(
                            headerMatcher.commentType,
                            sourceCode,
                            leadingComment,
                            fixLines,
                            eol,
                            numLines,
                            language);
                    }

                    context.report(headerReport);
                    for (const commentReport of leadingCommentReports) {
                        if (commentReport !== null) {
                            /** @type {{ messageId: string }} */ (commentReport).messageId =
                                "leadingComment-" + /** @type {{ messageId: string }} */ (commentReport).messageId;
                            context.report(commentReport);
                        }
                    }
                    return;
                }
            }

            const lastComment = leadingComments[leadingComments.length - 1];
            const lastCommentLine = lastComment[lastComment.length - 1];
            const lineIndex = lastCommentLine.loc.end.line + 1;

            context.report({
                loc: {
                    start: {
                        column: 0,
                        line: lineIndex
                    },
                    end: {
                        column: 0,
                        line: lineIndex
                    }
                },
                messageId: "missingHeader",
                fix: canFix
                    ? genPrependFixer(
                        headerMatcher.commentType,
                        sourceCode,
                        fixLines,
                        eol,
                        numLines,
                        language)
                    : null
            });
        }

        /** @type {Language} */
        const jsStyleLanguage = {
            blockComment: {
                startDelimiter: "/*",
                endDelimiter: "*/"
            },
            lineComment: {
                startDelimiter: "//"
            },
            shebang: true
        };

        /** @type {Language} */
        const cssStyleLanguage = {
            blockComment: {
                startDelimiter: "/*",
                endDelimiter: "*/"
            },
        };

        /** @type {Language} */
        const htmlStyleLanguage = {
            blockComment: {
                startDelimiter: "<!--",
                endDelimiter: "-->"
            }
        };

        const hooks = {
            Program: () => onRootNode(jsStyleLanguage),
            StyleSheet: () => onRootNode(cssStyleLanguage),
            // eslint/markdown
            root: () => onRootNode(htmlStyleLanguage),
        };
        return hooks;
    }
};

exports.header = headerRule;
exports.parsedFilesCache = parsedFilesCache;
