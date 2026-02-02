import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class TestLinkApi implements ICredentialType {
	name = 'testLinkApi';
	displayName = 'TestLink API';
	documentationUrl = 'https://testlink.org/';
	properties: INodeProperties[] = [
		{
			displayName: 'Host URL',
			name: 'host',
			type: 'string',
			default: '',
			placeholder: 'https://testlink.example.com',
			description: 'The base URL of your TestLink instance',
			required: true,
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'Your TestLink API key (found in User Settings > API interface)',
			required: true,
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.host}}',
			url: '/lib/api/xmlrpc/v1/xmlrpc.php',
			method: 'POST',
			headers: {
				'Content-Type': 'text/xml',
			},
			body: `<?xml version="1.0"?>
<methodCall>
	<methodName>tl.sayHello</methodName>
</methodCall>`,
		},
	};
}
