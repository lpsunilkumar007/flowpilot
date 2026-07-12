module.exports = {
  env: {
    browser: true,
    es2022: true
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': 'warn',
    "@typescript-eslint/no-non-null-assertion": "off",
    '@typescript-eslint/no-unused-vars': 'warn',
    "@typescript-eslint/no-explicit-any": ["off"]
  },
  overrides: [
    {
      files: ['src/pages/orbit/**/*.tsx'],
      rules: {
        'no-restricted-syntax': [
          'warn',
          {
            selector: "JSXAttribute[name.name='style']",
            message: 'Avoid inline styles in Orbit. Prefer SCSS classes, or set CSS variables only when values are truly dynamic.',
          },
        ],
        'max-len': ['warn', { code: 140, ignoreUrls: true, ignoreStrings: true, ignoreComments: true }],
      },
    },
    {
      files: ['**/*.cjs'],
      env: {
        node: true,
      },
    },
  ],
}
