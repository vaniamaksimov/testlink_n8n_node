import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IDataObject,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';

import * as testProjectHandlers from './handlers/testProject';
import * as testPlanHandlers from './handlers/testPlan';
import * as testSuiteHandlers from './handlers/testSuite';
import * as testCaseHandlers from './handlers/testCase';
import * as buildHandlers from './handlers/build';
import * as executionHandlers from './handlers/execution';

type HandlerFunction = (
	context: IExecuteFunctions,
	itemIndex: number,
) => Promise<any>;

export class TestLink implements INodeType {
	description: INodeTypeDescription = {
		usableAsTool: true,
		displayName: 'TestLink',
		name: 'testLink',
		icon: 'file:testlink.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with TestLink test management system',
		defaults: {
			name: 'TestLink',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'testLinkApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Test Project',
						value: 'testProject',
					},
					{
						name: 'Test Plan',
						value: 'testPlan',
					},
					{
						name: 'Test Suite',
						value: 'testSuite',
					},
					{
						name: 'Test Case',
						value: 'testCase',
					},
					{
						name: 'Build',
						value: 'build',
					},
					{
						name: 'Execution',
						value: 'execution',
					},
				],
				default: 'testProject',
			},
			// Test Project operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['testProject'],
					},
				},
				options: [
					{
						name: 'Get Many',
						value: 'getAll',
						description: 'Get all test projects',
						action: 'Get all test projects',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a test project by name',
						action: 'Get a test project',
					},
				],
				default: 'getAll',
			},
			// Test Plan operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['testPlan'],
					},
				},
				options: [
					{
						name: 'Get Many',
						value: 'getAll',
						description: 'Get all test plans for a project',
						action: 'Get all test plans',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a test plan by name',
						action: 'Get a test plan',
					},
				],
				default: 'getAll',
			},
			// Test Suite operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['testSuite'],
					},
				},
				options: [
					{
						name: 'Get Many',
						value: 'getAll',
						description: 'Get first level test suites for a project',
						action: 'Get all test suites',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a test suite by ID',
						action: 'Get a test suite',
					},
				],
				default: 'getAll',
			},
			// Test Case operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['testCase'],
					},
				},
				options: [
					{
						name: 'Get',
						value: 'get',
						description: 'Get a test case',
						action: 'Get a test case',
					},
					{
						name: 'Get Many',
						value: 'getAll',
						description: 'Get test cases for a test suite',
						action: 'Get all test cases',
					},
				],
				default: 'get',
			},
			// Build operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['build'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new build',
						action: 'Create a build',
					},
					{
						name: 'Get Many',
						value: 'getAll',
						description: 'Get all builds for a test plan',
						action: 'Get all builds',
					},
				],
				default: 'getAll',
			},
			// Execution operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['execution'],
					},
				},
				options: [
					{
						name: 'Report',
						value: 'report',
						description: 'Report test execution result',
						action: 'Report test execution',
					},
					{
						name: 'Get Last',
						value: 'getLast',
						description: 'Get last execution result for a test case',
						action: 'Get last execution result',
					},
				],
				default: 'report',
			},
			// Fields for Test Project
			{
				displayName: 'Project Name',
				name: 'projectName',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: {
						resource: ['testProject'],
						operation: ['get'],
					},
				},
				description: 'The name of the test project',
			},
			// Fields for Test Plan
			{
				displayName: 'Project Name',
				name: 'projectName',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: {
						resource: ['testPlan'],
						operation: ['getAll', 'get'],
					},
				},
				description: 'The name of the test project',
			},
			{
				displayName: 'Plan Name',
				name: 'planName',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: {
						resource: ['testPlan'],
						operation: ['get'],
					},
				},
				description: 'The name of the test plan',
			},
			// Fields for Test Suite
			{
				displayName: 'Project ID',
				name: 'projectId',
				type: 'number',
				required: true,
				default: 0,
				displayOptions: {
					show: {
						resource: ['testSuite'],
						operation: ['getAll'],
					},
				},
				description: 'The ID of the test project',
			},
			{
				displayName: 'Suite ID',
				name: 'suiteId',
				type: 'number',
				required: true,
				default: 0,
				displayOptions: {
					show: {
						resource: ['testSuite'],
						operation: ['get'],
					},
				},
				description: 'The ID of the test suite',
			},
			// Fields for Test Case
			{
				displayName: 'Test Case ID',
				name: 'testCaseId',
				type: 'number',
				required: true,
				default: 0,
				displayOptions: {
					show: {
						resource: ['testCase'],
						operation: ['get'],
					},
				},
				description: 'The internal ID of the test case',
			},
			{
				displayName: 'Test Suite ID',
				name: 'testSuiteId',
				type: 'number',
				required: true,
				default: 0,
				displayOptions: {
					show: {
						resource: ['testCase'],
						operation: ['getAll'],
					},
				},
				description: 'The ID of the test suite',
			},
			// Fields for Build
			{
				displayName: 'Test Plan ID',
				name: 'testPlanId',
				type: 'number',
				required: true,
				default: 0,
				displayOptions: {
					show: {
						resource: ['build'],
						operation: ['getAll', 'create'],
					},
				},
				description: 'The ID of the test plan',
			},
			{
				displayName: 'Build Name',
				name: 'buildName',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: {
						resource: ['build'],
						operation: ['create'],
					},
				},
				description: 'The name of the build',
			},
			{
				displayName: 'Build Notes',
				name: 'buildNotes',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['build'],
						operation: ['create'],
					},
				},
				description: 'Notes for the build',
			},
			// Fields for Execution
			{
				displayName: 'Test Plan ID',
				name: 'testPlanId',
				type: 'number',
				required: true,
				default: 0,
				displayOptions: {
					show: {
						resource: ['execution'],
						operation: ['report', 'getLast'],
					},
				},
				description: 'The ID of the test plan',
			},
			{
				displayName: 'Test Case External ID',
				name: 'testCaseExternalId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: {
						resource: ['execution'],
						operation: ['report', 'getLast'],
					},
				},
				description: 'The external ID of the test case (e.g., PROJECT-1)',
			},
			{
				displayName: 'Build ID',
				name: 'buildId',
				type: 'number',
				required: true,
				default: 0,
				displayOptions: {
					show: {
						resource: ['execution'],
						operation: ['report'],
					},
				},
				description: 'The ID of the build',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				required: true,
				options: [
					{
						name: 'Passed',
						value: 'p',
					},
					{
						name: 'Failed',
						value: 'f',
					},
					{
						name: 'Blocked',
						value: 'b',
					},
				],
				default: 'p',
				displayOptions: {
					show: {
						resource: ['execution'],
						operation: ['report'],
					},
				},
				description: 'The execution status',
			},
			{
				displayName: 'Notes',
				name: 'notes',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['execution'],
						operation: ['report'],
					},
				},
				description: 'Execution notes',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const handlers = {
			testProject: testProjectHandlers,
			testPlan: testPlanHandlers,
			testSuite: testSuiteHandlers,
			testCase: testCaseHandlers,
			build: buildHandlers,
			execution: executionHandlers,
		};

		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let responseData: IDataObject | IDataObject[];

				const resourceHandlers = handlers[resource as keyof typeof handlers];
				if (!resourceHandlers) {
					throw new Error(`Unknown resource: ${resource}`);
				}

				const handler = resourceHandlers[operation as keyof typeof resourceHandlers] as HandlerFunction;
				if (!handler) {
					throw new Error(`Unknown operation "${operation}" for resource "${resource}"`);
				}

				responseData = await handler(this, i);

				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(responseData),
					{ itemData: { item: i } },
				);
				returnData.push(...executionData);
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: (error as Error).message }, pairedItem: { item: i } });
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
