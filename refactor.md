## Подход: Вынести обработчики в отдельные файлы

Создайте структуру:

```
nodes/TestLink/
├── TestLink.node.ts
├── handlers/
│   ├── testProject.ts
│   ├── testCase.ts
│   ├── execution.ts
│   └── build.ts
└── utils/
    └── xmlrpc.ts
```

### nodes/TestLink/utils/xmlrpc.ts

```typescript
export interface XmlRpcClient {
	methodCall: (method: string, params: any[], callback: (error: Error | null, value: any) => void) => void;
}

export async function xmlRpcCall(
	client: XmlRpcClient,
	method: string,
	params: any[],
): Promise<any> {
	return new Promise((resolve, reject) => {
		client.methodCall(method, params, (error, value) => {
			if (error) {
				reject(error);
			} else {
				resolve(value);
			}
		});
	});
}
```

### nodes/TestLink/handlers/testProject.ts

```typescript
import { IExecuteFunctions } from 'n8n-workflow';
import { XmlRpcClient, xmlRpcCall } from '../utils/xmlrpc';

export async function create(
	context: IExecuteFunctions,
	client: XmlRpcClient,
	apiKey: string,
	itemIndex: number,
): Promise<any> {
	const projectName = context.getNodeParameter('projectName', itemIndex) as string;
	const projectPrefix = context.getNodeParameter('projectPrefix', itemIndex) as string;
	const notes = context.getNodeParameter('notes', itemIndex, '') as string;

	return xmlRpcCall(client, 'tl.createTestProject', [{
		devKey: apiKey,
		testprojectname: projectName,
		testcaseprefix: projectPrefix,
		notes,
	}]);
}

export async function get(
	context: IExecuteFunctions,
	client: XmlRpcClient,
	apiKey: string,
	itemIndex: number,
): Promise<any> {
	const projectName = context.getNodeParameter('projectName', itemIndex) as string;

	return xmlRpcCall(client, 'tl.getTestProjectByName', [{
		devKey: apiKey,
		testprojectname: projectName,
	}]);
}

export async function getAll(
	context: IExecuteFunctions,
	client: XmlRpcClient,
	apiKey: string,
	itemIndex: number,
): Promise<any> {
	return xmlRpcCall(client, 'tl.getProjects', [{
		devKey: apiKey,
	}]);
}
```

### nodes/TestLink/TestLink.node.ts (упрощённый)

```typescript
import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

import * as xmlrpc from 'xmlrpc';
import * as testProjectHandlers from './handlers/testProject';
import * as testCaseHandlers from './handlers/testCase';
import * as executionHandlers from './handlers/execution';
import * as buildHandlers from './handlers/build';

export class TestLink implements INodeType {
	description: INodeTypeDescription = {
		// ... (описание как раньше)
	};

	// Маппинг resource -> operation -> handler
	private handlers = {
		testProject: testProjectHandlers,
		testCase: testCaseHandlers,
		execution: executionHandlers,
		build: buildHandlers,
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const credentials = await this.getCredentials('testLinkApi');

		const client = xmlrpc.createClient({
			url: `${credentials.url}/lib/api/xmlrpc/v1/xmlrpc.php`,
			headers: { 'Content-Type': 'text/xml' },
		});

		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;

				// Получаем обработчик
				const resourceHandlers = this.handlers[resource as keyof typeof this.handlers];
				if (!resourceHandlers) {
					throw new Error(`Unknown resource: ${resource}`);
				}

				const handler = resourceHandlers[operation as keyof typeof resourceHandlers];
				if (!handler) {
					throw new Error(`Unknown operation "${operation}" for resource "${resource}"`);
				}

				// Вызываем обработчик
				const responseData = await handler(this, client, credentials.apiKey as string, i);

				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(responseData),
					{ itemData: { item: i } },
				);

				returnData.push(...executionData);
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message },
						pairedItem: { item: i },
					});
					continue;
				}
				throw new NodeOperationError(this.getNode(), error as Error, { itemIndex: i });
			}
		}

		return [returnData];
	}
}
```

## Мой рекомендуемый подход

1. ✅ Легко читается и поддерживается
2. ✅ Каждый обработчик в своём файле
3. ✅ Легко тестировать каждый обработчик отдельно
4. ✅ Минимальная связанность между модулями
5. ✅ Легко добавлять новые операции
