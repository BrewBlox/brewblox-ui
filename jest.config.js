module.exports = {
  moduleFileExtensions: [
    'd.ts',
    'ts',
    'tsx',
    'js',
    'jsx',
    'json',
    'vue',
  ],
  transform: {
    '^.+\\.vue$': 'vue-jest',
    '^.+\\.tsx?$': 'ts-jest',
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(ts|jsx?)$',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  snapshotSerializers: [
    'jest-serializer-vue',
  ],
};

// I use these plugins to show hot reloaded test results in vscode:
// Plugins:
// - vscode-jest
// - output colorizer (to colorize the jest output)
// - output colorizer doesn't work with quokka.js enabled
