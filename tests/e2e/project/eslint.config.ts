// Copyright 1985
// Tony Ganchev

import { defineConfig } from "eslint/config";
import plugin, { HeaderOptions, HeaderRuleConfig } from "@tony.ganchev/eslint-plugin-header";

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
]);
