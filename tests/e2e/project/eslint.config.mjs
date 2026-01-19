import { defineConfig } from "eslint/config";
import header from "@tony.ganchev/eslint-plugin-header";

export default defineConfig([
    {
        files: ["**/*.js"],
        plugins: {
            "@tony.ganchev/header": header
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
                    trailingEmptyLines: {
                        minimum: 2
                    }
                }
            ]
        }
    },
]);
