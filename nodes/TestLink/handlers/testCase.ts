import type { IExecuteFunctions } from 'n8n-workflow';
import { testLinkApiRequest } from '../GenericFunctions';

export async function get(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<any> {
	const testCaseId = context.getNodeParameter('testCaseId', itemIndex) as number;
	return await testLinkApiRequest.call(context, 'tl.getTestCase', {
		testcaseid: testCaseId,
	});
}

export async function getAll(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<any> {
	const testSuiteId = context.getNodeParameter('testSuiteId', itemIndex) as number;
	return await testLinkApiRequest.call(context, 'tl.getTestCasesForTestSuite', {
		testsuiteid: testSuiteId,
		deep: true,
		details: 'full',
	});
}
