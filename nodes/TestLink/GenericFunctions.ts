import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';

/**
 * Build XML-RPC request body
 */
function buildXmlRpcRequest(method: string, params: IDataObject, apiKey: string): string {
	let paramsXml = `<member><name>devKey</name><value><string>${escapeXml(apiKey)}</string></value></member>`;

	for (const [key, value] of Object.entries(params)) {
		if (value !== undefined && value !== null && value !== '') {
			paramsXml += `<member><name>${escapeXml(key)}</name><value>${valueToXml(value)}</value></member>`;
		}
	}

	return `<?xml version="1.0" encoding="UTF-8"?>
<methodCall>
	<methodName>${escapeXml(method)}</methodName>
	<params>
		<param>
			<value>
				<struct>
					${paramsXml}
				</struct>
			</value>
		</param>
	</params>
</methodCall>`;
}

/**
 * Convert a value to XML-RPC format
 */
function valueToXml(value: unknown): string {
	if (typeof value === 'string') {
		return `<string>${escapeXml(value)}</string>`;
	} else if (typeof value === 'number') {
		if (Number.isInteger(value)) {
			return `<int>${value}</int>`;
		}
		return `<double>${value}</double>`;
	} else if (typeof value === 'boolean') {
		return `<boolean>${value ? '1' : '0'}</boolean>`;
	} else if (Array.isArray(value)) {
		const items = value.map((item) => `<value>${valueToXml(item)}</value>`).join('');
		return `<array><data>${items}</data></array>`;
	} else if (typeof value === 'object' && value !== null) {
		const members = Object.entries(value as Record<string, unknown>)
			.map(([k, v]) => `<member><name>${escapeXml(k)}</name><value>${valueToXml(v)}</value></member>`)
			.join('');
		return `<struct>${members}</struct>`;
	}
	return `<string>${escapeXml(String(value))}</string>`;
}

/**
 * Escape special XML characters
 */
function escapeXml(str: string): string {
	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

/**
 * Parse XML-RPC response
 */
function parseXmlRpcResponse(xml: string): IDataObject | IDataObject[] {
	// Simple XML-RPC response parser
	// Check for fault
	const faultMatch = xml.match(/<fault>[\s\S]*?<string>([^<]+)<\/string>[\s\S]*?<\/fault>/);
	if (faultMatch) {
		throw new Error(`TestLink API Error: ${faultMatch[1]}`);
	}

	// Extract the value from params
	const paramsMatch = xml.match(/<params>[\s\S]*?<param>[\s\S]*?<value>([\s\S]*?)<\/value>[\s\S]*?<\/param>[\s\S]*?<\/params>/);
	if (!paramsMatch) {
		throw new Error('Invalid XML-RPC response format');
	}

	return parseValue(paramsMatch[1].trim());
}

/**
 * Parse a single XML-RPC value
 */
function parseValue(xml: string): IDataObject | IDataObject[] | string | number | boolean {
	// Array
	const arrayMatch = xml.match(/^<array>[\s\S]*?<data>([\s\S]*?)<\/data>[\s\S]*?<\/array>$/);
	if (arrayMatch) {
		const values: (IDataObject | IDataObject[] | string | number | boolean)[] = [];
		const valueRegex = /<value>([\s\S]*?)<\/value>/g;
		let match;
		while ((match = valueRegex.exec(arrayMatch[1])) !== null) {
			values.push(parseValue(match[1].trim()));
		}
		return values as IDataObject[];
	}

	// Struct
	const structMatch = xml.match(/^<struct>([\s\S]*?)<\/struct>$/);
	if (structMatch) {
		const result: IDataObject = {};
		const memberRegex = /<member>[\s\S]*?<name>([^<]+)<\/name>[\s\S]*?<value>([\s\S]*?)<\/value>[\s\S]*?<\/member>/g;
		let match;
		while ((match = memberRegex.exec(structMatch[1])) !== null) {
			result[match[1]] = parseValue(match[2].trim());
		}
		return result;
	}

	// String
	const stringMatch = xml.match(/^<string>([^]*?)<\/string>$/);
	if (stringMatch) {
		return unescapeXml(stringMatch[1]);
	}

	// Int/i4
	const intMatch = xml.match(/^<(?:int|i4)>(-?\d+)<\/(?:int|i4)>$/);
	if (intMatch) {
		return parseInt(intMatch[1], 10);
	}

	// Double
	const doubleMatch = xml.match(/^<double>(-?[\d.]+)<\/double>$/);
	if (doubleMatch) {
		return parseFloat(doubleMatch[1]);
	}

	// Boolean
	const boolMatch = xml.match(/^<boolean>([01])<\/boolean>$/);
	if (boolMatch) {
		return boolMatch[1] === '1';
	}

	// Default: treat as string
	return xml;
}

/**
 * Unescape XML entities
 */
function unescapeXml(str: string): string {
	return str
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&apos;/g, "'");
}

/**
 * Make a TestLink API request via XML-RPC
 */
export async function testLinkApiRequest(
	this: IExecuteFunctions,
	method: string,
	params: IDataObject,
): Promise<IDataObject | IDataObject[]> {
	const credentials = await this.getCredentials('testLinkApi');

	const host = credentials.host as string;
	const apiKey = credentials.apiKey as string;

	const body = buildXmlRpcRequest(method, params, apiKey);

	const options = {
		method: 'POST' as const,
		body,
		url: `${host.replace(/\/$/, '')}/lib/api/xmlrpc/v1/xmlrpc.php`,
		headers: {
			'Content-Type': 'text/xml',
		},
	};

	const response = await this.helpers.request(options);

	return parseXmlRpcResponse(response as string);
}
