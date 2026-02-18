/** @type {import('jest').Config} */
module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	testMatch: ['**/integration/**/*.integration.test.ts'],
	globalSetup: './integration/globalSetup.ts',
	globalTeardown: './integration/globalTeardown.ts',
	testTimeout: 30000,
};
