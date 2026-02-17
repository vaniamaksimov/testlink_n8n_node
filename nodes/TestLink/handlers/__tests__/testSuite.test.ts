jest.mock('../../GenericFunctions');

import type { IExecuteFunctions } from 'n8n-workflow';
import { testLinkApiRequest } from '../../GenericFunctions';
import { getAll, get } from '../testSuite';

const mockApiRequest = testLinkApiRequest as jest.MockedFunction<typeof testLinkApiRequest>;

function mockContext(params: Record<string, unknown>): IExecuteFunctions {
	return {
		getNodeParameter: jest.fn((name: string) => params[name]),
	} as unknown as IExecuteFunctions;
}

beforeEach(() => {
	mockApiRequest.mockReset();
});

describe('testSuite handler', () => {
	it('getAll calls tl.getFirstLevelTestSuitesForTestProject with projectId', async () => {
		mockApiRequest.mockResolvedValue([{ id: 5 }]);
		const ctx = mockContext({ projectId: 42 });
		const result = await getAll(ctx, 0);
		expect(ctx.getNodeParameter).toHaveBeenCalledWith('projectId', 0);
		expect(mockApiRequest).toHaveBeenCalledWith(
			'tl.getFirstLevelTestSuitesForTestProject',
			{ testprojectid: 42 },
		);
		expect(result).toEqual([{ id: 5 }]);
	});

	it('get calls tl.getTestSuiteByID with suiteId', async () => {
		mockApiRequest.mockResolvedValue({ id: 7 });
		const ctx = mockContext({ suiteId: 7 });
		const result = await get(ctx, 0);
		expect(ctx.getNodeParameter).toHaveBeenCalledWith('suiteId', 0);
		expect(mockApiRequest).toHaveBeenCalledWith('tl.getTestSuiteByID', {
			testsuiteid: 7,
		});
		expect(result).toEqual({ id: 7 });
	});

	describe('edge cases', () => {
		it('getAll returns empty array', async () => {
			mockApiRequest.mockResolvedValue([]);
			const ctx = mockContext({ projectId: 42 });
			const result = await getAll(ctx, 0);
			expect(result).toEqual([]);
		});

		it('getAll propagates API error', async () => {
			mockApiRequest.mockRejectedValue(new Error('TestLink API Error: Server down'));
			const ctx = mockContext({ projectId: 42 });
			await expect(getAll(ctx, 0)).rejects.toThrow('TestLink API Error: Server down');
		});

		it('get propagates API error', async () => {
			mockApiRequest.mockRejectedValue(new Error('TestLink API Error: Not found'));
			const ctx = mockContext({ suiteId: 999 });
			await expect(get(ctx, 0)).rejects.toThrow('TestLink API Error: Not found');
		});
	});
});
