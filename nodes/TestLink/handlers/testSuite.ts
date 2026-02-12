import type { IExecuteFunctions } from 'n8n-workflow';
import { testLinkApiRequest } from '../GenericFunctions';

export async function getAll(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<any> {
	const projectId = context.getNodeParameter('projectId', itemIndex) as number;
	return await testLinkApiRequest.call(context, 'tl.getFirstLevelTestSuitesForTestProject', {
		testprojectid: projectId,
	});
}

export async function get(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<any> {
	const suiteId = context.getNodeParameter('suiteId', itemIndex) as number;
	return await testLinkApiRequest.call(context, 'tl.getTestSuiteByID', {
		testsuiteid: suiteId,
	});
}
