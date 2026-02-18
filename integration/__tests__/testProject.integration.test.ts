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

describe('testProject integration', () => {
	it('getAll returns an array containing the seed project', async () => {
		const result = await call('tl.getProjects');

		expect(Array.isArray(result)).toBe(true);
		const project = (result as any[]).find(
			(p: any) => p.name === seed.projectName,
		);
		expect(project).toBeDefined();
		expect(Number(project.id)).toBe(seed.projectId);
	});

	it('get returns the seed project by name', async () => {
		const result = await call('tl.getTestProjectByName', {
			testprojectname: seed.projectName,
		});

		expect(result).toBeDefined();
		const project = Array.isArray(result) ? result[0] : result;
		expect(Number(project.id)).toBe(seed.projectId);
		expect(project.name).toBe(seed.projectName);
	});
});
