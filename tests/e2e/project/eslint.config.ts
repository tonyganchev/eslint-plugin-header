// Copyright 1985
// Tony Ganchev

import { defineConfig } from "eslint/config";
import plugin, { HeaderOptions, HeaderRuleConfig } from "@tony.ganchev/eslint-plugin-header";
import css from "@eslint/css";
import markdown from "@eslint/markdown";

export default defineConfig([
    {
        files: ["index.ts"],
        plugins: {
            "@tony.ganchev/header": plugin
        },
        rules: {
            "@tony.ganchev/header/header": [
                "error",
                {
                    header: {
                        commentType: "line",
                        lines: [
                            " Copyright 1985",
                            " Tony Ganchev"
                        ]
                    },
                    lineEndings: "os",
                    trailingEmptyLines: {
                        minimum: 2
                    }
                } as HeaderOptions
            ] as HeaderRuleConfig
        }
    },
    {
        files: ["*.css"],
        plugins: {
            "@tony.ganchev/header": plugin,
            css
        },
        language: "css/css",
        rules: {
            "@tony.ganchev/header/header": [
                "error",
                {
                    header: {
                        commentType: "block",
                        lines: [
                            " Copyright 1985 ",
                        ]
                    },
                    lineEndings: "os",
                    trailingEmptyLines: {
                        minimum: 2
                    }
                } as HeaderOptions
            ] as HeaderRuleConfig
        }
    },
    {
        files: ["*.md"],
        plugins: {
            "@tony.ganchev/header": plugin,
            markdown
        },
        language: "markdown/commonmark",
        rules: {
            "@tony.ganchev/header/header": [
                "error",
                {
                    header: {
                        commentType: "block",
                        lines: [
                            " Copyright 1985 ",
                        ]
                    },
                    lineEndings: "os",
                    trailingEmptyLines: {
                        minimum: 2
                    }
                } as HeaderOptions
            ] as HeaderRuleConfig
        }
    },
]);
