jest.mock('../handlers/testProject');
jest.mock('../handlers/testPlan');
jest.mock('../handlers/testSuite');
jest.mock('../handlers/testCase');
jest.mock('../handlers/build');
jest.mock('../handlers/execution');

import type { IExecuteFunctions } from 'n8n-workflow';
import * as testProjectHandlers from '../handlers/testProject';
import * as testPlanHandlers from '../handlers/testPlan';
import * as testSuiteHandlers from '../handlers/testSuite';
import * as testCaseHandlers from '../handlers/testCase';
import * as buildHandlers from '../handlers/build';
import * as executionHandlers from '../handlers/execution';
import { TestLink } from '../TestLink.node';

const allHandlerModules = {
	testProject: testProjectHandlers,
	testPlan: testPlanHandlers,
	testSuite: testSuiteHandlers,
	testCase: testCaseHandlers,
	build: buildHandlers,
	execution: executionHandlers,
};

function createMockExecuteContext(
	resource: string,
	operation: string,
	items: object[] = [{}],
	continueOnFail = false,
): IExecuteFunctions {
	return {
		getInputData: jest.fn(() => items.map((json) => ({ json }))),
		getNodeParameter: jest.fn((name: string) => {
			if (name === 'resource') return resource;
			if (name === 'operation') return operation;
			return undefined;
		}),
		continueOnFail: jest.fn(() => continueOnFail),
		helpers: {
			returnJsonArray: jest.fn((data: any) => {
				const arr = Array.isArray(data) ? data : [data];
				return arr.map((json: any) => ({ json }));
			}),
			constructExecutionMetaData: jest.fn((data: any[], meta: any) =>
				data.map((item: any) => ({ ...item, pairedItem: meta.itemData })),
			),
		},
	} as unknown as IExecuteFunctions;
}

beforeEach(() => {
	jest.clearAllMocks();
});

describe('TestLink.node execute dispatch', () => {
	const node = new TestLink();

	describe('routes to correct handler', () => {
		const cases: [string, string][] = [
			['testProject', 'getAll'],
			['testProject', 'get'],
			['testPlan', 'getAll'],
			['testPlan', 'get'],
			['testSuite', 'getAll'],
			['testSuite', 'get'],
			['testCase', 'get'],
			['testCase', 'getAll'],
			['build', 'getAll'],
			['build', 'create'],
			['execution', 'report'],
			['execution', 'getLast'],
		];

		it.each(cases)('%s.%s dispatches to the correct handler', async (resource, operation) => {
			const handlers = allHandlerModules[resource as keyof typeof allHandlerModules];
			const handler = handlers[operation as keyof typeof handlers] as jest.Mock;
			handler.mockResolvedValue({ id: 1 });

			const ctx = createMockExecuteContext(resource, operation);
			await node.execute.call(ctx);

			expect(handler).toHaveBeenCalledWith(ctx, 0);
		});
	});

	describe('error handling', () => {
		it('throws on unknown resource', async () => {
			const ctx = createMockExecuteContext('unknownResource', 'get');

			await expect(node.execute.call(ctx)).rejects.toThrow('Unknown resource: unknownResource');
		});

		it('throws on unknown operation', async () => {
			const ctx = createMockExecuteContext('testProject', 'unknownOp');

			await expect(node.execute.call(ctx)).rejects.toThrow(
				'Unknown operation "unknownOp" for resource "testProject"',
			);
		});

		it('captures error in returnData when continueOnFail is true', async () => {
			(testProjectHandlers.getAll as jest.Mock).mockRejectedValue(new Error('API down'));
			const ctx = createMockExecuteContext('testProject', 'getAll', [{}], true);

			const result = await node.execute.call(ctx);

			expect(result).toHaveLength(1);
			expect(result[0]).toEqual(
				expect.arrayContaining([
					expect.objectContaining({
						json: { error: 'API down' },
						pairedItem: { item: 0 },
					}),
				]),
			);
		});
	});

	describe('multiple items', () => {
		it('iterates over all input items', async () => {
			(testProjectHandlers.getAll as jest.Mock)
				.mockResolvedValueOnce({ id: 1 })
				.mockResolvedValueOnce({ id: 2 })
				.mockResolvedValueOnce({ id: 3 });

			const ctx = createMockExecuteContext('testProject', 'getAll', [{}, {}, {}]);
			const result = await node.execute.call(ctx);

			expect(testProjectHandlers.getAll).toHaveBeenCalledTimes(3);
			expect(testProjectHandlers.getAll).toHaveBeenCalledWith(ctx, 0);
			expect(testProjectHandlers.getAll).toHaveBeenCalledWith(ctx, 1);
			expect(testProjectHandlers.getAll).toHaveBeenCalledWith(ctx, 2);
			expect(result[0]).toHaveLength(3);
		});

		it('continues processing remaining items after error with continueOnFail', async () => {
			(testProjectHandlers.getAll as jest.Mock)
				.mockResolvedValueOnce({ id: 1 })
				.mockRejectedValueOnce(new Error('fail on item 1'))
				.mockResolvedValueOnce({ id: 3 });

			const ctx = createMockExecuteContext('testProject', 'getAll', [{}, {}, {}], true);
			const result = await node.execute.call(ctx);

			expect(testProjectHandlers.getAll).toHaveBeenCalledTimes(3);
			expect(result[0]).toHaveLength(3);
			expect(result[0][1]).toEqual(
				expect.objectContaining({
					json: { error: 'fail on item 1' },
					pairedItem: { item: 1 },
				}),
			);
		});
	});
});
