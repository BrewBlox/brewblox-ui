module.exports = {
  preset: 'ts-jest',
  globals: {},
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.vue$': 'vue-jest',
    '^.+\\js$': 'babel-jest',
  },
  moduleFileExtensions: ['vue', 'js', 'json', 'jsx', 'ts', 'tsx', 'node'],
  testMatch: ['<rootDir>/(test|src)/**/__tests__/**.(spec|test).+(ts|js)'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transformIgnorePatterns: [
    '<rootDir>/node_modules/(?!quasar/lang|vuex-class-modules)',
  ],
  watchPathIgnorePatterns: [
    '<rootDir>/dev',
    '<rootDir>/dist',
    '<rootDir>/node_modules',
    '<rootDir>/docker',
    '<rootDir>/build',
  ],
};
