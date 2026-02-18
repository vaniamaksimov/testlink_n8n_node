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

describe('testPlan integration', () => {
	it('getAll returns plans for the seed project', async () => {
		const result = await call('tl.getProjectTestPlans', {
			testprojectid: seed.projectId,
		});

		expect(Array.isArray(result)).toBe(true);
		const plan = (result as any[]).find(
			(p: any) => p.name === seed.testPlanName,
		);
		expect(plan).toBeDefined();
		expect(Number(plan.id)).toBe(seed.testPlanId);
	});

	it('get returns the seed plan by name', async () => {
		const result = await call('tl.getTestPlanByName', {
			testprojectname: seed.projectName,
			testplanname: seed.testPlanName,
		});

		expect(result).toBeDefined();
		const plan = Array.isArray(result) ? result[0] : result;
		expect(Number(plan.id)).toBe(seed.testPlanId);
		expect(plan.name).toBe(seed.testPlanName);
	});
});
