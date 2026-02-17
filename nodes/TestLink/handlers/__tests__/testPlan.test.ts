jest.mock('../../GenericFunctions');

import type { IExecuteFunctions } from 'n8n-workflow';
import { testLinkApiRequest } from '../../GenericFunctions';
import { getAll, get } from '../testPlan';

const mockApiRequest = testLinkApiRequest as jest.MockedFunction<typeof testLinkApiRequest>;

function mockContext(params: Record<string, unknown>): IExecuteFunctions {
	return {
		getNodeParameter: jest.fn((name: string) => params[name]),
	} as unknown as IExecuteFunctions;
}

beforeEach(() => {
	mockApiRequest.mockReset();
});

describe('testPlan handler', () => {
	it('getAll calls tl.getProjectTestPlans with projectName', async () => {
		mockApiRequest.mockResolvedValue([{ id: 10 }]);
		const ctx = mockContext({ projectName: 'Proj1' });
		const result = await getAll(ctx, 0);
		expect(ctx.getNodeParameter).toHaveBeenCalledWith('projectName', 0);
		expect(mockApiRequest).toHaveBeenCalledWith('tl.getProjectTestPlans', {
			testprojectname: 'Proj1',
		});
		expect(result).toEqual([{ id: 10 }]);
	});

	it('get calls tl.getTestPlanByName with projectName and planName', async () => {
		mockApiRequest.mockResolvedValue({ id: 10, name: 'Plan1' });
		const ctx = mockContext({ projectName: 'Proj1', planName: 'Plan1' });
		const result = await get(ctx, 0);
		expect(ctx.getNodeParameter).toHaveBeenCalledWith('projectName', 0);
		expect(ctx.getNodeParameter).toHaveBeenCalledWith('planName', 0);
		expect(mockApiRequest).toHaveBeenCalledWith('tl.getTestPlanByName', {
			testprojectname: 'Proj1',
			testplanname: 'Plan1',
		});
		expect(result).toEqual({ id: 10, name: 'Plan1' });
	});

	describe('edge cases', () => {
		it('getAll returns empty array', async () => {
			mockApiRequest.mockResolvedValue([]);
			const ctx = mockContext({ projectName: 'Proj1' });
			const result = await getAll(ctx, 0);
			expect(result).toEqual([]);
		});

		it('getAll propagates API error', async () => {
			mockApiRequest.mockRejectedValue(new Error('TestLink API Error: Server down'));
			const ctx = mockContext({ projectName: 'Proj1' });
			await expect(getAll(ctx, 0)).rejects.toThrow('TestLink API Error: Server down');
		});

		it('get propagates API error', async () => {
			mockApiRequest.mockRejectedValue(new Error('TestLink API Error: Not found'));
			const ctx = mockContext({ projectName: 'Proj1', planName: 'Missing' });
			await expect(get(ctx, 0)).rejects.toThrow('TestLink API Error: Not found');
		});
	});
});
