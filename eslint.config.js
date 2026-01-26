import js from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import vue from "eslint-plugin-vue";
import vueParser from "vue-eslint-parser";

export default [
	js.configs.recommended,
	...vue.configs["flat/recommended"],
	{
		files: ["**/*.ts"],
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				ecmaVersion: "latest",
				sourceType: "module",
			},
		},
		plugins: {
			"@typescript-eslint": tsPlugin,
		},
		rules: {
			...tsPlugin.configs.recommended.rules,
			"@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
			indent: ["error", "tab"],
			"no-trailing-spaces": "error",
			"no-multiple-empty-lines": ["error", { max: 1 }],
			"eol-last": "error",
			semi: ["error", "always"],
			quotes: ["error", "double"],
			"comma-dangle": ["error", "always-multiline"],
			"max-len": ["error", { code: 80 }],
		},
	},
	{
		files: ["**/*.vue"],
		languageOptions: {
			parser: vueParser,
			parserOptions: {
				parser: tsParser,
				ecmaVersion: "latest",
				sourceType: "module",
			},
			globals: {
				window: "readonly",
				document: "readonly",
				navigator: "readonly",
				console: "readonly",
				localStorage: "readonly",
				setTimeout: "readonly",
				clearTimeout: "readonly",
				DOMParser: "readonly",
				Blob: "readonly",
				URL: "readonly",
				File: "readonly",
				FileReader: "readonly",
				HTMLElement: "readonly",
				HTMLInputElement: "readonly",
				Event: "readonly",
				KeyboardEvent: "readonly",
				Node: "readonly",
				MediaQueryList: "readonly",
				ResizeObserver: "readonly",
			},
		},
		plugins: {
			"@typescript-eslint": tsPlugin,
		},
		rules: {
			...tsPlugin.configs.recommended.rules,
			"@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
			indent: ["error", "tab"],
			"no-trailing-spaces": "error",
			"no-multiple-empty-lines": ["error", { max: 1 }],
			"eol-last": "error",
			semi: ["error", "always"],
			quotes: ["error", "double"],
			"comma-dangle": ["error", "always-multiline"],
			"max-len": ["error", { code: 120 }],
			"vue/html-indent": ["error", "tab"],
		},
	},
	{
		languageOptions: {
			ecmaVersion: "latest",
			sourceType: "module",
			globals: {
				window: "readonly",
				document: "readonly",
				navigator: "readonly",
				console: "readonly",
				localStorage: "readonly",
				setTimeout: "readonly",
				DOMParser: "readonly",
				Blob: "readonly",
				URL: "readonly",
				File: "readonly",
				FileReader: "readonly",
			},
		},
		rules: {
			indent: ["error", "tab"],
			"no-trailing-spaces": "error",
			"no-multiple-empty-lines": ["error", { max: 1 }],
			"eol-last": "error",
			semi: ["error", "always"],
			quotes: ["error", "double"],
			"comma-dangle": ["error", "always-multiline"],
			"max-len": ["warn", { code: 120 }],
			"vue/html-indent": ["error", "tab"],
		},
	},
];
