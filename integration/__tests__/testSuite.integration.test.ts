import { xmlRpcCall } from '../helpers/xmlrpcClient';
import type { SeedData } from '../helpers/seedTestLink';

let baseUrl: string;
let apiKey: string;
let seed: SeedData;

const call = (method: string, params: Record<string, unknown> = {}) =>
	xmlRpcCall(baseUrl, method, { devKey: apiKey, ...params });

beforeAll(() => {
	baseUrl = (globalThis as any).__TESTLINK_URL__;
	apiKey = (globalThis as any).__TESTLINK_API_KEY__;
	seed = (globalThis as any).__SEED_DATA__;
});

describe('testSuite integration', () => {
	it('getAll returns top-level suites for the seed project', async () => {
		const result = await call('tl.getFirstLevelTestSuitesForTestProject', {
			testprojectid: seed.projectId,
		});

		expect(Array.isArray(result)).toBe(true);
		const suite = (result as any[]).find(
			(s: any) => s.name === seed.testSuiteName,
		);
		expect(suite).toBeDefined();
		expect(Number(suite.id)).toBe(seed.testSuiteId);
	});

	it('get returns the seed suite by ID', async () => {
		const result = await call('tl.getTestSuiteByID', {
			testsuiteid: seed.testSuiteId,
		});

		expect(result).toBeDefined();
		const suite = Array.isArray(result) ? result[0] : result;
		expect(Number(suite.id)).toBe(seed.testSuiteId);
		expect(suite.name).toBe(seed.testSuiteName);
	});
});
