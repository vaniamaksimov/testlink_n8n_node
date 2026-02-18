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

describe('testCase integration', () => {
	it('get returns the seed test case by ID', async () => {
		const result = await call('tl.getTestCase', {
			testcaseid: seed.testCaseId,
		});

		expect(result).toBeDefined();
		const tc = Array.isArray(result) ? result[0] : result;
		expect(tc.name).toBe('IntegrationTestCase');
	});

	it('getAll returns test cases for the seed suite', async () => {
		const result = await call('tl.getTestCasesForTestSuite', {
			testsuiteid: seed.testSuiteId,
			deep: true,
			details: 'full',
		});

		expect(Array.isArray(result)).toBe(true);
		const cases = result as any[];
		expect(cases.length).toBeGreaterThanOrEqual(1);
		const tc = cases.find((c: any) => Number(c.id) === seed.testCaseId);
		expect(tc).toBeDefined();
	});
});
