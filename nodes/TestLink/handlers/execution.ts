import type { IExecuteFunctions } from 'n8n-workflow';
import { testLinkApiRequest } from '../GenericFunctions';

export async function report(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<any> {
	const testPlanId = context.getNodeParameter('testPlanId', itemIndex) as number;
	const testCaseExternalId = context.getNodeParameter('testCaseExternalId', itemIndex) as string;
	const buildId = context.getNodeParameter('buildId', itemIndex) as number;
	const status = context.getNodeParameter('status', itemIndex) as string;
	const notes = context.getNodeParameter('notes', itemIndex) as string;

	return await testLinkApiRequest.call(context, 'tl.reportTCResult', {
		testplanid: testPlanId,
		testcaseexternalid: testCaseExternalId,
		buildid: buildId,
		status,
		notes,
	});
}

export async function getLast(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<any> {
	const testPlanId = context.getNodeParameter('testPlanId', itemIndex) as number;
	const testCaseExternalId = context.getNodeParameter('testCaseExternalId', itemIndex) as string;

	return await testLinkApiRequest.call(context, 'tl.getLastExecutionResult', {
		testplanid: testPlanId,
		testcaseexternalid: testCaseExternalId,
	});
}
