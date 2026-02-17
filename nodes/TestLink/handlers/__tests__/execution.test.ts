jest.mock('../../GenericFunctions');

import type { IExecuteFunctions } from 'n8n-workflow';
import { testLinkApiRequest } from '../../GenericFunctions';
import { report, getLast } from '../execution';

const mockApiRequest = testLinkApiRequest as jest.MockedFunction<typeof testLinkApiRequest>;

function mockContext(params: Record<string, unknown>): IExecuteFunctions {
	return {
		getNodeParameter: jest.fn((name: string) => params[name]),
	} as unknown as IExecuteFunctions;
}

beforeEach(() => {
	mockApiRequest.mockReset();
});

describe('execution handler', () => {
	it('report calls tl.reportTCResult with all parameters', async () => {
		mockApiRequest.mockResolvedValue({ id: 1 });
		const ctx = mockContext({
			testPlanId: 10,
			testCaseExternalId: 'TC-1',
			buildId: 5,
			status: 'p',
			notes: 'Passed OK',
		});
		const result = await report(ctx, 0);
		expect(ctx.getNodeParameter).toHaveBeenCalledWith('testPlanId', 0);
		expect(ctx.getNodeParameter).toHaveBeenCalledWith('testCaseExternalId', 0);
		expect(ctx.getNodeParameter).toHaveBeenCalledWith('buildId', 0);
		expect(ctx.getNodeParameter).toHaveBeenCalledWith('status', 0);
		expect(ctx.getNodeParameter).toHaveBeenCalledWith('notes', 0);
		expect(mockApiRequest).toHaveBeenCalledWith('tl.reportTCResult', {
			testplanid: 10,
			testcaseexternalid: 'TC-1',
			buildid: 5,
			status: 'p',
			notes: 'Passed OK',
		});
		expect(result).toEqual({ id: 1 });
	});

	it('getLast calls tl.getLastExecutionResult with testPlanId and testCaseExternalId', async () => {
		mockApiRequest.mockResolvedValue({ id: 99, status: 'f' });
		const ctx = mockContext({
			testPlanId: 10,
			testCaseExternalId: 'TC-1',
		});
		const result = await getLast(ctx, 0);
		expect(ctx.getNodeParameter).toHaveBeenCalledWith('testPlanId', 0);
		expect(ctx.getNodeParameter).toHaveBeenCalledWith('testCaseExternalId', 0);
		expect(mockApiRequest).toHaveBeenCalledWith('tl.getLastExecutionResult', {
			testplanid: 10,
			testcaseexternalid: 'TC-1',
		});
		expect(result).toEqual({ id: 99, status: 'f' });
	});
});
