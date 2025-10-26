import path from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import stylistic from "@stylistic/eslint-plugin"
import { defineConfig } from "eslint/config";
import eslintPlugin from "eslint-plugin-eslint-plugin";
import jsdoc from "eslint-plugin-jsdoc";
import n from "eslint-plugin-n";
import globals from "globals";
import header from "./index.js";

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
        "eslint-plugin": eslintPlugin,
        n,
        "@stylistic": stylistic,
        "@tony.ganchev": header
    },
    rules: {
        camelcase: ["error", {
            properties: "never",
        }],
        "consistent-return": "error",
        curly: ["error", "all"],
        "default-case": "error",
        "dot-notation": ["error", {
            allowKeywords: true,
        }],
        eqeqeq: "error",
        "func-style": ["error", "declaration"],
        "global-strict": ["off", "always"],
        "guard-for-in": "error",
        "new-cap": "error",
        "no-alert": "error",
        "no-array-constructor": "error",
        "no-caller": "error",
        "no-console": "off",
        "no-delete-var": "error",
        "no-eval": "error",
        "no-extend-native": "error",
        "no-extra-bind": "error",
        "no-fallthrough": "error",
        "no-implied-eval": "error",
        "no-invalid-this": "error",
        "no-iterator": "error",
        "no-label-var": "error",
        "no-labels": "error",
        "no-lone-blocks": "error",
        "no-loop-func": "error",
        "no-multi-str": "error",
        "no-global-assign": "error",
        "no-nested-ternary": "error",
        "no-new": "error",
        "no-new-func": "error",
        "no-object-constructor": "error",
        "no-new-require": "error",
        "no-new-wrappers": "error",
        "no-octal": "error",
        "no-octal-escape": "error",
        "no-proto": "error",
        "no-redeclare": "error",
        "no-return-assign": "error",
        "no-script-url": "error",
        "no-sequences": "error",
        "no-shadow": "error",
        "no-shadow-restricted-names": "error",
        "no-undef": "error",
        "no-undef-init": "error",
        "no-undefined": "error",
        "no-underscore-dangle": "error",
        "no-unused-expressions": "error",
        "no-unused-vars": ["error", {
            vars: "all",
            args: "after-used",
        }],
        "no-use-before-define": "error",
        "no-var": "error",
        "no-with": "error",
        radix: "error",
        strict: ["error", "global"],
        yoda: ["error", "never"],

        "eslint-plugin/meta-property-ordering": "error",
        "eslint-plugin/no-property-in-node": "error",
        "eslint-plugin/prefer-placeholders": "error",
        "eslint-plugin/prefer-replace-text": "error",
        "eslint-plugin/report-message-format": "error",
        "eslint-plugin/require-meta-docs-description": "error",
        "eslint-plugin/require-meta-docs-recommended": "error",
        "eslint-plugin/require-meta-docs-url": "error",

        "n/callback-return": ["error", ["cb", "callback", "next"]],
        "n/handle-callback-err": ["error", "err"],
        "n/no-mixed-requires": "error",
        "n/no-path-concat": "error",
        "n/no-process-exit": "error",

        "@stylistic/brace-style": ["error", "1tbs"],
        "@stylistic/comma-spacing": "error",
        "@stylistic/comma-style": ["error", "last"],
        "@stylistic/eol-last": "error",
        "@stylistic/function-call-spacing": "error",
        "@stylistic/key-spacing": ["error", {
            beforeColon: false,
            afterColon: true,
        }],
        "@stylistic/keyword-spacing": ["error", {
            after: true,
        }],
        "@stylistic/new-parens": "error",
        "@stylistic/indent": ["error", 4, {
            SwitchCase: 1,
        }],
        "@stylistic/max-len": ["error", {
            code: 120,
            comments: 80
        }],
        "@stylistic/no-floating-decimal": "error",
        "@stylistic/no-mixed-spaces-and-tabs": ["error", false],
        "@stylistic/no-multi-spaces": "error",
        "@stylistic/no-trailing-spaces": "error",
        "@stylistic/quotes": ["error", "double"],
        "@stylistic/semi": "error",
        "@stylistic/semi-spacing": ["error", {
            before: false,
            after: true,
        }],
        "@stylistic/space-before-blocks": "error",
        "@stylistic/space-before-function-paren": ["error", "never"],
        "@stylistic/space-infix-ops": "error",
        "@stylistic/space-unary-ops": ["error", {
            words: true,
            nonwords: false,
        }],
        "@stylistic/spaced-comment": ["error", "always", {
            exceptions: ["-"],
        }],
        "@stylistic/wrap-iife": "error",

        "@tony.ganchev/header": [
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
        ],
    }
};

export default defineConfig([
    jsdoc.configs["flat/recommended"],
    eslintPlugin.configs.recommended,
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
