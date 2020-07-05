module.exports = {
  plugins: [
    'import',
  ],
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
  },
  env: {
    es6: true,
    browser: true,
    node: true,
  },
  extends: [
    'airbnb-base',
  ],
  rules: {
    'import/prefer-default-export': 0,
    'no-underscore-dangle': 0,
    'max-len': 0,
    camelcase: 0,
    curly: 'error',
    'brace-style': [
      2,
      '1tbs',
      {
        allowSingleLine: false,
      },
    ],
    'nonblock-statement-body-position': [
      'error',
      'below',
    ],
  },
};
