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

describe('build integration', () => {
	it('getAll returns builds for the seed test plan', async () => {
		const result = await call('tl.getBuildsForTestPlan', {
			testplanid: seed.testPlanId,
		});

		expect(Array.isArray(result)).toBe(true);
		const build = (result as any[]).find(
			(b: any) => b.name === seed.buildName,
		);
		expect(build).toBeDefined();
		expect(Number(build.id)).toBe(seed.buildId);
	});

	it('create creates a new build and returns its data', async () => {
		const newBuildName = 'NewIntegrationBuild';
		const result = await call('tl.createBuild', {
			testplanid: seed.testPlanId,
			buildname: newBuildName,
			buildnotes: 'Created during integration test',
		});

		expect(result).toBeDefined();
		const buildData = Array.isArray(result) ? result[0] : result;
		expect(Number(buildData.id)).toBeGreaterThan(0);

		// Verify build actually exists
		const builds = await call('tl.getBuildsForTestPlan', {
			testplanid: seed.testPlanId,
		});
		const found = (builds as any[]).find((b: any) => b.name === newBuildName);
		expect(found).toBeDefined();
	});
});
