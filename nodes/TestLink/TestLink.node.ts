import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IDataObject,
} from 'n8n-workflow';
import { NodeConnectionType } from 'n8n-workflow';

import { testLinkApiRequest } from './GenericFunctions';

export class TestLink implements INodeType {
	description: INodeTypeDescription = {
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
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
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

		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let responseData: IDataObject | IDataObject[];

				if (resource === 'testProject') {
					if (operation === 'getAll') {
						responseData = await testLinkApiRequest.call(this, 'tl.getProjects', {});
					} else if (operation === 'get') {
						const projectName = this.getNodeParameter('projectName', i) as string;
						responseData = await testLinkApiRequest.call(this, 'tl.getTestProjectByName', {
							testprojectname: projectName,
						});
					} else {
						throw new Error(`Operation ${operation} not supported`);
					}
				} else if (resource === 'testPlan') {
					if (operation === 'getAll') {
						const projectName = this.getNodeParameter('projectName', i) as string;
						responseData = await testLinkApiRequest.call(this, 'tl.getProjectTestPlans', {
							testprojectname: projectName,
						});
					} else if (operation === 'get') {
						const projectName = this.getNodeParameter('projectName', i) as string;
						const planName = this.getNodeParameter('planName', i) as string;
						responseData = await testLinkApiRequest.call(this, 'tl.getTestPlanByName', {
							testprojectname: projectName,
							testplanname: planName,
						});
					} else {
						throw new Error(`Operation ${operation} not supported`);
					}
				} else if (resource === 'testSuite') {
					if (operation === 'getAll') {
						const projectId = this.getNodeParameter('projectId', i) as number;
						responseData = await testLinkApiRequest.call(
							this,
							'tl.getFirstLevelTestSuitesForTestProject',
							{
								testprojectid: projectId,
							},
						);
					} else if (operation === 'get') {
						const suiteId = this.getNodeParameter('suiteId', i) as number;
						responseData = await testLinkApiRequest.call(this, 'tl.getTestSuiteByID', {
							testsuiteid: suiteId,
						});
					} else {
						throw new Error(`Operation ${operation} not supported`);
					}
				} else if (resource === 'testCase') {
					if (operation === 'get') {
						const testCaseId = this.getNodeParameter('testCaseId', i) as number;
						responseData = await testLinkApiRequest.call(this, 'tl.getTestCase', {
							testcaseid: testCaseId,
						});
					} else if (operation === 'getAll') {
						const testSuiteId = this.getNodeParameter('testSuiteId', i) as number;
						responseData = await testLinkApiRequest.call(this, 'tl.getTestCasesForTestSuite', {
							testsuiteid: testSuiteId,
							deep: true,
							details: 'full',
						});
					} else {
						throw new Error(`Operation ${operation} not supported`);
					}
				} else if (resource === 'build') {
					if (operation === 'getAll') {
						const testPlanId = this.getNodeParameter('testPlanId', i) as number;
						responseData = await testLinkApiRequest.call(this, 'tl.getBuildsForTestPlan', {
							testplanid: testPlanId,
						});
					} else if (operation === 'create') {
						const testPlanId = this.getNodeParameter('testPlanId', i) as number;
						const buildName = this.getNodeParameter('buildName', i) as string;
						const buildNotes = this.getNodeParameter('buildNotes', i) as string;
						responseData = await testLinkApiRequest.call(this, 'tl.createBuild', {
							testplanid: testPlanId,
							buildname: buildName,
							buildnotes: buildNotes,
						});
					} else {
						throw new Error(`Operation ${operation} not supported`);
					}
				} else if (resource === 'execution') {
					if (operation === 'report') {
						const testPlanId = this.getNodeParameter('testPlanId', i) as number;
						const testCaseExternalId = this.getNodeParameter('testCaseExternalId', i) as string;
						const buildId = this.getNodeParameter('buildId', i) as number;
						const status = this.getNodeParameter('status', i) as string;
						const notes = this.getNodeParameter('notes', i) as string;

						responseData = await testLinkApiRequest.call(this, 'tl.reportTCResult', {
							testplanid: testPlanId,
							testcaseexternalid: testCaseExternalId,
							buildid: buildId,
							status,
							notes,
						});
					} else if (operation === 'getLast') {
						const testPlanId = this.getNodeParameter('testPlanId', i) as number;
						const testCaseExternalId = this.getNodeParameter('testCaseExternalId', i) as string;

						responseData = await testLinkApiRequest.call(
							this,
							'tl.getLastExecutionResult',
							{
								testplanid: testPlanId,
								testcaseexternalid: testCaseExternalId,
							},
						);
					} else {
						throw new Error(`Operation ${operation} not supported`);
					}
				} else {
					throw new Error(`Resource ${resource} not supported`);
				}

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
