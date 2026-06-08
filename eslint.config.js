const babelParser = require('@babel/eslint-parser')
const js = require('@eslint/js')
const importPlugin = require('eslint-plugin-import')
const jsxA11y = require('eslint-plugin-jsx-a11y')
const react = require('eslint-plugin-react')
const prettier = require('eslint-config-prettier')

const browserGlobals = {
  document: 'readonly',
  HTMLElement: 'readonly',
  MouseEvent: 'readonly',
  Node: 'readonly',
  process: 'readonly',
  require: 'readonly',
  TouchEvent: 'readonly',
  window: 'readonly',
}

const jestGlobals = {
  afterAll: 'readonly',
  afterEach: 'readonly',
  beforeAll: 'readonly',
  beforeEach: 'readonly',
  describe: 'readonly',
  expect: 'readonly',
  it: 'readonly',
  jest: 'readonly',
  test: 'readonly',
}

module.exports = [
  {
    ignores: ['coverage/**', 'dev/**', 'dist/**', 'node_modules/**'],
  },
  js.configs.recommended,
  prettier,
  {
    files: ['src/**/*.{js,jsx}', 'test/**/*.{js,jsx}', 'setupTests.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...browserGlobals,
        ...jestGlobals,
        console: 'readonly',
      },
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          plugins: ['@babel/plugin-syntax-flow', '@babel/plugin-transform-react-jsx'],
        },
      },
    },
    plugins: {
      import: importPlugin,
      'jsx-a11y': jsxA11y,
      react,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...jsxA11y.configs.recommended.rules,
      'arrow-body-style': ['error', 'as-needed'],
      'class-methods-use-this': 'warn',
      'import/extensions': 'off',
      'import/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: ['src/docs/**', 'test/**', 'setupTests.js'],
        },
      ],
      'import/prefer-default-export': 'off',
      'no-console': 'warn',
      'no-else-return': 'off',
      'no-param-reassign': 'off',
      'no-use-before-define': [
        'error',
        {
          classes: false,
          functions: false,
          variables: false,
        },
      ],
      'react/jsx-filename-extension': 'off',
      'react/no-unused-prop-types': 'off',
      'react/prop-types': 'off',
      'react/require-default-props': 'off',
      'react/sort-comp': 'off',
      semi: ['error', 'never'],
    },
  },
]
