jest.mock('../../GenericFunctions');

import type { IExecuteFunctions } from 'n8n-workflow';
import { testLinkApiRequest } from '../../GenericFunctions';
import { get, getAll } from '../testCase';

const mockApiRequest = testLinkApiRequest as jest.MockedFunction<typeof testLinkApiRequest>;

function mockContext(params: Record<string, unknown>): IExecuteFunctions {
	return {
		getNodeParameter: jest.fn((name: string) => params[name]),
	} as unknown as IExecuteFunctions;
}

beforeEach(() => {
	mockApiRequest.mockReset();
});

describe('testCase handler', () => {
	it('get calls tl.getTestCase with testCaseId', async () => {
		mockApiRequest.mockResolvedValue({ id: 100 });
		const ctx = mockContext({ testCaseId: 100 });
		const result = await get(ctx, 0);
		expect(ctx.getNodeParameter).toHaveBeenCalledWith('testCaseId', 0);
		expect(mockApiRequest).toHaveBeenCalledWith('tl.getTestCase', {
			testcaseid: 100,
		});
		expect(result).toEqual({ id: 100 });
	});

	it('getAll calls tl.getTestCasesForTestSuite with deep and details', async () => {
		mockApiRequest.mockResolvedValue([{ id: 101 }, { id: 102 }]);
		const ctx = mockContext({ testSuiteId: 50 });
		const result = await getAll(ctx, 0);
		expect(ctx.getNodeParameter).toHaveBeenCalledWith('testSuiteId', 0);
		expect(mockApiRequest).toHaveBeenCalledWith('tl.getTestCasesForTestSuite', {
			testsuiteid: 50,
			deep: true,
			details: 'full',
		});
		expect(result).toEqual([{ id: 101 }, { id: 102 }]);
	});
});
