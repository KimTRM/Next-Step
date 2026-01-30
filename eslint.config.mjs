import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import boundaries from "eslint-plugin-boundaries";
import stylelint from "stylelint";

const eslintConfig = defineConfig([
    ...nextVitals,
    ...nextTs,

    // Boundaries plugin configuration for feature-based architecture
    {
        plugins: {
            boundaries,
        },
        settings: {
            "boundaries/elements": [
                // Shared utilities and components
                { type: "shared", pattern: "shared/*" },
                // Feature modules
                {
                    type: "feature",
                    pattern: "features/*",
                    capture: ["feature"],
                },
                // App routes (Next.js pages)
                { type: "app", pattern: "app/*" },
                // Convex backend
                { type: "convex", pattern: "convex/*" },
                // Landing page components (marketing)
                { type: "landing", pattern: "components/landing/*" },
                // Legacy UI components (to be migrated)
                { type: "ui", pattern: "components/ui/*" },
                // Legacy layout components
                { type: "layout", pattern: "components/layout/*" },
                // Legacy lib (to be migrated)
                { type: "lib", pattern: "lib/*" },
            ],
            "boundaries/ignore": [
                "**/*.test.ts",
                "**/*.test.tsx",
                "**/*.spec.ts",
                "**/*.spec.tsx",
                "**/__tests__/**",
            ],
        },
        rules: {
            "boundaries/element-types": [
                "warn", // Use "warn" during migration, change to "error" when complete
                {
                    default: "disallow",
                    rules: [
                        // Shared can only import from shared
                        {
                            from: "shared",
                            allow: ["shared"],
                        },

                        // Features can import from shared, ui, lib, and their own feature
                        // Features CANNOT import from other features
                        {
                            from: "feature",
                            allow: [
                                "shared",
                                "ui",
                                "lib",
                                // Same feature only (using capture group)
                                ["feature", { feature: "${from.feature}" }],
                            ],
                        },

                        // Feature api.ts files can import from Convex
                        {
                            from: "feature",
                            allow: ["convex"],
                            message: "Only api.ts files can import from convex",
                        },

                        // App pages can import from features, shared, ui, layout, lib, and landing
                        {
                            from: "app",
                            allow: [
                                "feature",
                                "shared",
                                "ui",
                                "layout",
                                "lib",
                                "landing",
                            ],
                        },

                        // Landing components can import from shared, ui, lib
                        {
                            from: "landing",
                            allow: ["shared", "ui", "lib"],
                        },

                        // Layout components can import from shared, ui, lib
                        {
                            from: "layout",
                            allow: ["shared", "ui", "lib"],
                        },

                        // UI components can only import from shared
                        {
                            from: "ui",
                            allow: ["shared", "ui", "lib"],
                        },

                        // Lib can import from shared
                        {
                            from: "lib",
                            allow: ["shared", "lib"],
                        },

                        // Convex can only import from convex
                        {
                            from: "convex",
                            allow: ["convex"],
                        },
                    ],
                },
            ],
        },
    },

    // Restrict direct Convex imports outside of feature api.ts files
    {
        files: [
            "features/**/!(api).ts",
            "features/**/!(api).tsx",
            "features/**/components/**/*.ts",
            "features/**/components/**/*.tsx",
        ],
        rules: {
            "no-restricted-imports": [
                "warn", // Use "warn" during migration
                {
                    patterns: [
                        {
                            group: ["convex/react"],
                            message:
                                "Import Convex hooks from feature api.ts instead: import { useXxx } from '@/features/{feature}'",
                        },
                        {
                            group: ["@/convex/_generated/*"],
                            message:
                                "Import Convex types from feature api.ts instead",
                        },
                    ],
                },
            ],
        },
    },

    // Allow Convex imports in feature api.ts files
    {
        files: ["features/**/api.ts"],
        rules: {
            "no-restricted-imports": "off",
        },
    },

    // Override default ignores of eslint-config-next
    globalIgnores([
        // Default ignores of eslint-config-next:
        ".next/**",
        "out/**",
        "build/**",
        "next-env.d.ts",
        // Convex generated files
        "convex/_generated/**",
    ]),
]);

export default eslintConfig;
