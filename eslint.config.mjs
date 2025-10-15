import { defineConfig } from "eslint/config";
import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";
import jsdoc from "eslint-plugin-jsdoc";
import header from "./index.js"

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const compat = new FlatCompat({
    baseDirectory: dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

const jsRules = {
    extends: [
        ...compat.extends("eslint:recommended"),
    ],
    plugins: {
        header
    },
    rules: {
        "brace-style": [2, "1tbs"],
        camelcase: [2, {
            properties: "never",
        }],
        "callback-return": [2, ["cb", "callback", "next"]],
        "comma-spacing": 2,
        "comma-style": [2, "last"],
        "consistent-return": 2,
        curly: [2, "all"],
        "default-case": 2,
        "dot-notation": [2, {
            allowKeywords: true,
        }],
        "eol-last": 2,
        eqeqeq: 2,
        "func-style": [2, "declaration"],
        "global-strict": [0, "always"],
        "guard-for-in": 2,
        "handle-callback-err": [2, "err"],
        indent: [2, 4, {
            SwitchCase: 1,
        }],
        "key-spacing": [2, {
            beforeColon: false,
            afterColon: true,
        }],
        "keyword-spacing": [2, {
            after: true,
        }],
        "new-cap": 2,
        "new-parens": 2,
        "no-alert": 2,
        "no-array-constructor": 2,
        "no-caller": 2,
        "no-catch-shadow": 0,
        "no-console": 0,
        "no-delete-var": 2,
        "no-eval": 2,
        "no-extend-native": 2,
        "no-extra-bind": 2,
        "no-fallthrough": 2,
        "no-floating-decimal": 2,
        "no-implied-eval": 2,
        "no-invalid-this": 2,
        "no-iterator": 2,
        "no-label-var": 2,
        "no-labels": 2,
        "no-lone-blocks": 2,
        "no-loop-func": 2,
        "no-mixed-requires": 2,
        "no-mixed-spaces-and-tabs": [2, false],
        "no-multi-spaces": 2,
        "no-multi-str": 2,
        "no-native-reassign": 2,
        "no-nested-ternary": 2,
        "no-new": 2,
        "no-new-func": 2,
        "no-new-object": 2,
        "no-new-require": 2,
        "no-new-wrappers": 2,
        "no-octal": 2,
        "no-octal-escape": 2,
        "no-path-concat": 2,
        "no-process-exit": 2,
        "no-proto": 2,
        "no-redeclare": 2,
        "no-return-assign": 2,
        "no-script-url": 2,
        "no-sequences": 2,
        "no-shadow": 2,
        "no-shadow-restricted-names": 2,
        "no-spaced-func": 2,
        "no-trailing-spaces": 2,
        "no-undef": 2,
        "no-undef-init": 2,
        "no-undefined": 2,
        "no-underscore-dangle": 2,
        "no-unused-expressions": 2,
        "no-unused-vars": [2, {
            vars: "all",
            args: "after-used",
        }],
        "no-use-before-define": 2,
        "no-var": 2,
        "no-with": 2,
        quotes: [2, "double"],
        radix: 2,
        semi: 2,
        "semi-spacing": [2, {
            before: false,
            after: true,
        }],
        "space-before-blocks": 2,
        "space-before-function-paren": [2, "never"],
        "space-infix-ops": 2,
        "space-unary-ops": [2, {
            words: true,
            nonwords: false,
        }],
        "spaced-comment": [2, "always", {
            exceptions: ["-"],
        }],
        strict: [2, "global"],
        "wrap-iife": 2,
        yoda: [2, "never"],

        "header/header": [
            "error",
            "block",
            [
                "",
                " * MIT License",
                " *",
                {
                    pattern: " * Copyright \\(c\\) \\d{4}-present .*Tony Ganchev,? and contributors",
                    template: " * Copyright (c) 2025-present Tony Ganchev and contributors",
                },
                " *",
                " * Permission is hereby granted, free of charge, to any person obtaining a copy",
                " * of this software and associated documentation files (the “Software”), to deal",
                " * in the Software without restriction, including without limitation the rights",
                " * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell",
                " * copies of the Software, and to permit persons to whom the Software is",
                " * furnished to do so, subject to the following conditions:",
                " *",
                " * The above copyright notice and this permission notice shall be included in",
                " * all copies or substantial portions of the Software.",
                " *",
                " * THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR",
                " * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,",
                " * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE",
                " * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER",
                " * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,",
                " * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE",
                " * SOFTWARE.",
                " "
            ],
            2
        ]
    }
};

export default defineConfig([
    jsdoc.configs["flat/recommended"],
    {
        files: ["lib/**/*.js"],
        languageOptions: {
            sourceType: "commonjs",
            globals: {
                ...globals.node,
            },
        },
        ...jsRules,
    },
    {
        files: ["tests/lib/**/*.js"],
        languageOptions: {
            sourceType: "script",
            globals: {
                ...globals.node,
                ...globals.mocha,
            },
        },
        ...jsRules,
    },
]);
