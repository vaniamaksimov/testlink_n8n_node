import type { IExecuteFunctions } from 'n8n-workflow';
import { testLinkApiRequest } from '../GenericFunctions';

export async function getAll(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<any> {
	return await testLinkApiRequest.call(context, 'tl.getProjects', {});
}

export async function get(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<any> {
	const projectName = context.getNodeParameter('projectName', itemIndex) as string;
	return await testLinkApiRequest.call(context, 'tl.getTestProjectByName', {
		testprojectname: projectName,
	});
}
