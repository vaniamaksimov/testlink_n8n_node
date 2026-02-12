import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import * as xmlrpc from 'xmlrpc';

type XmlRpcResponse = IDataObject | IDataObject[] | string | number | boolean;

function buildParams(params: IDataObject, apiKey: string): IDataObject {
	const filtered: IDataObject = {};

	for (const [key, value] of Object.entries(params)) {
		if (value !== undefined && value !== null && value !== '') {
			filtered[key] = value as IDataObject[keyof IDataObject];
		}
	}

	return { devKey: apiKey, ...filtered };
}

/**
 * Make a TestLink API request via XML-RPC
 */
export async function testLinkApiRequest(
	this: IExecuteFunctions,
	method: string,
	params: IDataObject,
): Promise<XmlRpcResponse> {
	const credentials = await this.getCredentials('testLinkApi');

	const host = credentials.host as string;
	const apiKey = credentials.apiKey as string;
	const endpoint = `${host.replace(/\/$/, '')}/lib/api/xmlrpc/v1/xmlrpc.php`;

	const client = xmlrpc.createClient({ url: endpoint });
	const payload = buildParams(params, apiKey);

	return await new Promise<XmlRpcResponse>((resolve, reject) => {
		client.methodCall(method, [payload], (error, value) => {
			if (error) {
				const faultMessage =
					(error as { faultString?: string; message?: string }).faultString ??
					(error as { message?: string }).message ??
					'Unknown error';
				reject(new Error(`TestLink API Error: ${faultMessage}`));
				return;
			}

			resolve(value as XmlRpcResponse);
		});
	});
}
