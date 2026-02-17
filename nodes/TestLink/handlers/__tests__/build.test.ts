jest.mock('../../GenericFunctions');

import type { IExecuteFunctions } from 'n8n-workflow';
import { testLinkApiRequest } from '../../GenericFunctions';
import { getAll, create } from '../build';

const mockApiRequest = testLinkApiRequest as jest.MockedFunction<typeof testLinkApiRequest>;

function mockContext(params: Record<string, unknown>): IExecuteFunctions {
	return {
		getNodeParameter: jest.fn((name: string) => params[name]),
	} as unknown as IExecuteFunctions;
}

beforeEach(() => {
	mockApiRequest.mockReset();
});

describe('build handler', () => {
	it('getAll calls tl.getBuildsForTestPlan with testPlanId', async () => {
		mockApiRequest.mockResolvedValue([{ id: 1 }]);
		const ctx = mockContext({ testPlanId: 20 });
		const result = await getAll(ctx, 0);
		expect(ctx.getNodeParameter).toHaveBeenCalledWith('testPlanId', 0);
		expect(mockApiRequest).toHaveBeenCalledWith('tl.getBuildsForTestPlan', {
			testplanid: 20,
		});
		expect(result).toEqual([{ id: 1 }]);
	});

	it('create calls tl.createBuild with all parameters', async () => {
		mockApiRequest.mockResolvedValue({ id: 2 });
		const ctx = mockContext({
			testPlanId: 20,
			buildName: 'Build 1',
			buildNotes: 'Notes here',
		});
		const result = await create(ctx, 0);
		expect(ctx.getNodeParameter).toHaveBeenCalledWith('testPlanId', 0);
		expect(ctx.getNodeParameter).toHaveBeenCalledWith('buildName', 0);
		expect(ctx.getNodeParameter).toHaveBeenCalledWith('buildNotes', 0);
		expect(mockApiRequest).toHaveBeenCalledWith('tl.createBuild', {
			testplanid: 20,
			buildname: 'Build 1',
			buildnotes: 'Notes here',
		});
		expect(result).toEqual({ id: 2 });
	});

	describe('edge cases', () => {
		it('getAll returns empty array', async () => {
			mockApiRequest.mockResolvedValue([]);
			const ctx = mockContext({ testPlanId: 20 });
			const result = await getAll(ctx, 0);
			expect(result).toEqual([]);
		});

		it('getAll propagates API error', async () => {
			mockApiRequest.mockRejectedValue(new Error('TestLink API Error: Server down'));
			const ctx = mockContext({ testPlanId: 20 });
			await expect(getAll(ctx, 0)).rejects.toThrow('TestLink API Error: Server down');
		});

		it('create propagates API error', async () => {
			mockApiRequest.mockRejectedValue(new Error('TestLink API Error: Duplicate build'));
			const ctx = mockContext({ testPlanId: 20, buildName: 'B1', buildNotes: '' });
			await expect(create(ctx, 0)).rejects.toThrow('TestLink API Error: Duplicate build');
		});
	});
});
