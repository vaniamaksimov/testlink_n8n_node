import * as xmlrpc from 'xmlrpc';

/**
 * Make an XML-RPC call to TestLink API.
 * Used by integration tests and the seed script.
 */
export function xmlRpcCall(
	baseUrl: string,
	method: string,
	params: Record<string, unknown>,
): Promise<any> {
	const url = `${baseUrl.replace(/\/$/, '')}/lib/api/xmlrpc/v1/xmlrpc.php`;
	const client = xmlrpc.createClient({ url });

	return new Promise((resolve, reject) => {
		client.methodCall(method, [params], (error: any, value: any) => {
			if (error) {
				const msg =
					(error as { faultString?: string }).faultString ??
					(error as { message?: string }).message ??
					'Unknown error';
				reject(new Error(`XML-RPC Error (${method}): ${msg}`));
				return;
			}
			resolve(value);
		});
	});
}
