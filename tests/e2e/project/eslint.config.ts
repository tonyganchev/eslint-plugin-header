// Copyright 1985
// Tony Ganchev

import { defineConfig } from "eslint/config";
import plugin, { HeaderOptions, HeaderRuleConfig } from "@tony.ganchev/eslint-plugin-header";
import css from "@eslint/css";
import html from "@html-eslint/eslint-plugin";
import markdown from "@eslint/markdown";
import svelteParser from "svelte-eslint-parser";
import svelte from "eslint-plugin-svelte";
import vueParser from "vue-eslint-parser";
import vue from "eslint-plugin-vue";

export default defineConfig([
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
                            " Copyright 1985 css",
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
                            " Copyright 1985 md",
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
        files: ["*.html"],
        plugins: {
            "@tony.ganchev/header": plugin,
            html
        },
        language: "html/html",
        rules: {
            "@tony.ganchev/header/header": [
                "error",
                {
                    header: {
                        commentType: "block",
                        lines: [
                            " Copyright 1985 html",
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
        files: ["*.svelte"],
        plugins: {
            "@tony.ganchev/header": plugin,
            svelte
        },
        languageOptions: {
            parser: svelteParser
        },
        rules: {
            "@tony.ganchev/header/header": [
                "error",
                {
                    header: {
                        commentType: "block",
                        lines: [
                            " Copyright 1985 svelte",
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
        files: ["*.vue"],
        plugins: {
            "@tony.ganchev/header": plugin,
            vue
        },
        languageOptions: {
            parser: vueParser
        },
        rules: {
            "@tony.ganchev/header/header": [
                "error",
                {
                    header: {
                        commentType: "block",
                        lines: [
                            " Copyright 1985 vue",
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
