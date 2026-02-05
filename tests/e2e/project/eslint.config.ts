// Copyright 1985
// Tony Ganchev

import { defineConfig } from "eslint/config";
import plugin, { HeaderRuleConfig } from "@tony.ganchev/eslint-plugin-header";

export default defineConfig([
    {
        files: ["index.ts"],
        plugins: {
            "@tony.ganchev/header": plugin
        },
        rules: {
            "@tony.ganchev/header/header": [
                "error",
                "line",
                [" Copyright 1985", " Tony Ganchev"],
                2
            ] as HeaderRuleConfig
        }
    },
]);
