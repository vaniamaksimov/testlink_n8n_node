import type { IExecuteFunctions } from 'n8n-workflow';
import { testLinkApiRequest } from '../GenericFunctions';

export async function getAll(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<any> {
	const testPlanId = context.getNodeParameter('testPlanId', itemIndex) as number;
	return await testLinkApiRequest.call(context, 'tl.getBuildsForTestPlan', {
		testplanid: testPlanId,
	});
}

export async function create(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<any> {
	const testPlanId = context.getNodeParameter('testPlanId', itemIndex) as number;
	const buildName = context.getNodeParameter('buildName', itemIndex) as string;
	const buildNotes = context.getNodeParameter('buildNotes', itemIndex) as string;
	return await testLinkApiRequest.call(context, 'tl.createBuild', {
		testplanid: testPlanId,
		buildname: buildName,
		buildnotes: buildNotes,
	});
}
