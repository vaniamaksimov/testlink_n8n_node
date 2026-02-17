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
});
