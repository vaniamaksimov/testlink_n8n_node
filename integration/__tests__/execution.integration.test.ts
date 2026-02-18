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

describe('execution integration', () => {
	it('report submits a test execution result', async () => {
		const result = await call('tl.reportTCResult', {
			testplanid: seed.testPlanId,
			testcaseexternalid: `ITP-${seed.testCaseExternalId}`,
			buildid: seed.buildId,
			status: 'p',
			notes: 'Passed in integration test',
		});

		expect(result).toBeDefined();
		const data = Array.isArray(result) ? result[0] : result;
		expect(data.status).toBe(true);
	});

	it('getLast returns the last execution result for a test case', async () => {
		// Ensure at least one execution exists (created by the test above)
		const result = await call('tl.getLastExecutionResult', {
			testplanid: seed.testPlanId,
			testcaseexternalid: `ITP-${seed.testCaseExternalId}`,
		});

		expect(result).toBeDefined();
		const data = Array.isArray(result) ? result[0] : result;
		expect(data.status).toBe('p');
		expect(data.notes).toBe('Passed in integration test');
	});
});
