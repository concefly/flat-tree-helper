module.exports = {
  collectCoverage: true,
  coverageReporters: ['json', 'html'],
  coverageDirectory: '<rootDir>/coverage',
  rootDir: '.',
  preset: 'ts-jest',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  // https://github.com/facebook/jest/issues/6766
  testURL: 'http://localhost/',

  globals: {
    'ts-jest': {
      diagnostics: false,
    },
  },

  verbose: true,
};
