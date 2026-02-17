jest.mock('../../GenericFunctions');

import type { IExecuteFunctions } from 'n8n-workflow';
import { testLinkApiRequest } from '../../GenericFunctions';
import { getAll, get } from '../testProject';

const mockApiRequest = testLinkApiRequest as jest.MockedFunction<typeof testLinkApiRequest>;

function mockContext(params: Record<string, unknown>): IExecuteFunctions {
	return {
		getNodeParameter: jest.fn((name: string) => params[name]),
	} as unknown as IExecuteFunctions;
}

beforeEach(() => {
	mockApiRequest.mockReset();
});

describe('testProject handler', () => {
	it('getAll calls tl.getProjects with empty params', async () => {
		mockApiRequest.mockResolvedValue([{ id: 1 }]);
		const ctx = mockContext({});
		const result = await getAll(ctx, 0);
		expect(mockApiRequest).toHaveBeenCalledWith('tl.getProjects', {});
		expect(result).toEqual([{ id: 1 }]);
	});

	it('get calls tl.getTestProjectByName with projectName', async () => {
		mockApiRequest.mockResolvedValue({ id: 1, name: 'MyProject' });
		const ctx = mockContext({ projectName: 'MyProject' });
		const result = await get(ctx, 0);
		expect(ctx.getNodeParameter).toHaveBeenCalledWith('projectName', 0);
		expect(mockApiRequest).toHaveBeenCalledWith('tl.getTestProjectByName', {
			testprojectname: 'MyProject',
		});
		expect(result).toEqual({ id: 1, name: 'MyProject' });
	});
});
