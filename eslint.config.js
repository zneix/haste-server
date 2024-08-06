/* eslint-disable quote-props */
const unicornPlugin = require('eslint-plugin-unicorn');
const eslintJs = require('@eslint/js');
const globals = require('globals');

const eslintConfig = [
	eslintJs.configs.recommended,
	unicornPlugin.configs['flat/all'],
	{
		languageOptions: {
			globals: {
				Api: 'readonly',
				...globals.node,
				...globals.es2022,
				...globals.browser
			}
		},
		rules: {
			'unicorn/prefer-module': 'off',
			'unicorn/prevent-abbreviations': 'off',
			'unicorn/no-process-exit': 'off',
			'unicorn/filename-case': 'off',
			'unicorn/no-null': 'off',
			'unicorn/no-keyword-prefix': 'off',
			'unicorn/no-anonymous-default-export': 'off',
			'unicorn/prefer-top-level-await': 'off',
			'arrow-body-style': ['warn', 'as-needed'],
			'brace-style': ['warn', '1tbs'],
			'comma-dangle': ['warn', 'never'],
			'curly': ['warn', 'all'],
			'dot-location': ['warn', 'property'],
			'dot-notation': 'warn',
			'eol-last': ['warn', 'always'],
			'eqeqeq': 'error',
			'indent': ['warn', 'tab'],
			'key-spacing': ['warn', {
				afterColon: true,
				beforeColon: false,
				mode: 'strict'
			}],
			'keyword-spacing': 'warn',
			'linebreak-style': ['error', 'unix'],
			'max-len': ['warn', 250, {
				ignoreStrings: true,
				ignoreTemplateLiterals: true
			}],
			'max-params': ['warn', {
				max: 5
			}],
			'max-statements-per-line': ['error', {
				max: 1
			}],
			'multiline-ternary': ['warn', 'always-multiline'],
			'new-cap': 'warn',
			'new-parens': ['error', 'always'],
			'no-duplicate-imports': 'error',
			'no-empty-pattern': 'error',
			'no-lonely-if': 'warn',
			'no-multi-assign': 'error',
			'no-multi-spaces': 'warn',
			'no-multi-str': 'warn',
			'no-multiple-empty-lines': ['error', {
				max: 2,
				maxBOF: 0
			}],
			'no-new': 'warn',
			'no-new-object': 'error',
			'no-new-wrappers': 'error',
			'no-return-assign': 'error',
			'no-self-compare': 'warn',
			'no-sequences': 'error',
			'no-throw-literal': 'error',
			'no-trailing-spaces': ['warn', {
				skipBlankLines: true
			}],
			'no-unneeded-ternary': 'warn',
			'no-unreachable-loop': 'warn',
			'no-unused-vars': 'warn',
			'no-var': 'error',
			'object-curly-newline': ['warn', {
				consistent: true
			}],
			'object-curly-spacing': ['warn', 'always', {
				arraysInObjects: false,
				objectsInObjects: true
			}],
			'object-property-newline': ['warn', {
				allowAllPropertiesOnSameLine: true
			}],
			'object-shorthand': ['warn', 'properties'],
			'one-var': ['warn', 'never'],
			'operator-linebreak': ['warn', 'before'],
			'padded-blocks': ['warn', 'never'],
			'prefer-arrow-callback': 'warn',
			'prefer-const': ['warn', {
				destructuring: 'all'
			}],
			'prefer-exponentiation-operator': 'warn',
			'prefer-numeric-literals': 'warn',
			'prefer-object-spread': 'warn',
			'prefer-rest-params': 'error',
			'prefer-template': 'warn',
			'quote-props': ['warn', 'as-needed'],
			'quotes': ['error', 'single'],
			'rest-spread-spacing': ['warn', 'never'],
			'semi': ['error', 'always'],
			'semi-spacing': ['warn', {
				before: false,
				after: true
			}],
			'semi-style': ['warn', 'last'],
			'space-before-blocks': ['warn', 'always'],
			'space-before-function-paren': ['warn', 'always'],
			'space-in-parens': ['warn', 'never'],
			'space-infix-ops': 'error',
			'space-unary-ops': 'warn',
			'spaced-comment': ['warn', 'always'],
			'switch-colon-spacing': 'warn',
			'template-curly-spacing': ['warn', 'never'],
			'template-tag-spacing': ['warn', 'always'],
			'wrap-iife': ['warn', 'inside'],
			'yoda': 'error'
		}
	}
];

module.exports = eslintConfig;
