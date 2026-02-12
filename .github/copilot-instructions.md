# Project Guidelines: TestLink n8n Community Node

## Project Overview

This is an n8n community node integrating TestLink, an open-source test management system. The node enables workflows to interact with test projects, plans, suites, cases, builds, and execution results via TestLink's XML-RPC API.

- **Compatibility**: n8n 1.0.0+, Node.js 22.0+
- **Build tool**: n8n-node-cli
- **Language**: TypeScript 5.0+

## Code Style

- **TypeScript strict mode** required throughout
- **File naming**: camelCase for classes (`TestLink.node.ts`), PascalCase for class names (`TestLink`)
- **Exports**: Use named exports from `n8n-workflow` package
- **Formatting**: Use ESLint (configured in package.json), run via `npm run lint`
- **Structure**: Organize node logic into three files:
  - `credentials/TestLinkApi.credentials.ts` - API auth config
  - `nodes/TestLink/TestLink.node.ts` - UI descriptor and execute logic
  - `nodes/TestLink/GenericFunctions.ts` - API request/response utilities

## Architecture

### n8n Node Pattern
The TestLink node follows n8n's standard structure (see [TestLink.node.ts](../../nodes/TestLink/TestLink.node.ts#L1)):

1. **Description object** (`INodeTypeDescription`) - Defines UI with resources and operations
2. **Execute method** - Processes items in series, supporting `continueOnFail()`
3. **Credentials** - Reference `testLinkApi` credentials type
4. **Resource/Operation model** - Hierarchical dispatch (e.g., `resource='testPlan'` + `operation='get'`)

### XML-RPC Protocol Integration

All API communication via XML-RPC at endpoint: `{host}/lib/api/xmlrpc/v1/xmlrpc.php`

**Key utilities** (see [GenericFunctions.ts](../../nodes/TestLink/GenericFunctions.ts)):
- `buildXmlRpcRequest(method, params, apiKey)` - Constructs XML request with automatic `devKey` injection
- `valueToXml(value)` - Converts JS values to XML-RPC typed format (handles strings, numbers, booleans, arrays, objects)
- `parseXmlRpcResponse(xml)` - Parses XML-RPC response, throws on fault
- `escapeXml(str)` - XML entity escaping

**Param handling**:
- Parameters passed as object to `testLinkApiRequest()` automatically included in request
- API key injected automatically—do NOT pass in params
- Filter out undefined/null/empty strings before building XML

### Resources & Operations Structure

Six resources with 11 total operations (see [TestLink.node.ts](../../nodes/TestLink/TestLink.node.ts#L40-L65)):

| Resource | Operations | Key Methods |
|----------|-----------|-------------|
| Test Project | Get Many, Get | `tl.getProjects`, `tl.getTestProjectByName` |
| Test Plan | Get Many, Get | `tl.getProjectTestPlans`, `tl.getTestPlanByName` |
| Test Suite | Get Many, Get | `tl.getFirstLevelTestSuitesForTestProject`, `tl.getTestSuiteByID` |
| Test Case | Get, Get Many | `tl.getTestCase`, `tl.getTestCasesForTestSuite` |
| Build | Get Many, Create | `tl.getBuildsForTestPlan`, `tl.createBuild` |
| Execution | Report, Get Last | `tl.reportTCResult`, `tl.getLastExecutionResult` |

**Parameter naming convention** (from [TestLink.node.ts](../../nodes/TestLink/TestLink.node.ts#L250)):
- Node UI uses camelCase: `projectName`, `testPlanId`, `buildNotes`
- API method receives snake_case: `testprojectname`, `testplanid`, `buildnotes`

### Credential Configuration

[TestLinkApi.credentials.ts](../../credentials/TestLinkApi.credentials.ts) defines:
- **Host URL**: Base TestLink instance URL (e.g., `https://testlink.example.com`)
- **API Key**: User's personal API key from TestLink's UI Settings
- **Test**: Uses `tl.sayHello` to validate credentials

Access in execute: `this.getCredentials('testLinkApi')` returns `{host, apiKey}`

## Build and Test

**Install dependencies:**
```bash
npm install
```

**Build TypeScript → dist/:**
```bash
npm run build
```

**Development (watches for changes):**
```bash
npm run dev
```

**Lint and fix:**
```bash
npm run lint
```

**Release (versioning & publish):**
```bash
npm run release
```

**Note:** No test files currently—use manual testing in n8n or extend with Jest.

## Project Conventions

### Execution Flow Pattern

From [TestLink.node.ts](../../nodes/TestLink/TestLink.node.ts#L367-L450):

```typescript
async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
  const items = this.getInputData();
  const returnData: INodeExecutionData[] = [];

  for (let i = 0; i < items.length; i++) {
    try {
      const resource = this.getNodeParameter('resource', 0);
      const operation = this.getNodeParameter('operation', 0);

      // Nested if-else dispatch matching resource + operation
      let responseData = await testLinkApiRequest.call(/* ... */);

      const executionData = this.helpers.constructExecutionMetaData(
        this.helpers.returnJsonArray(responseData),
        { itemData: { item: i } }
      );
      returnData.push(...executionData);
    } catch (error) {
      if (this.continueOnFail()) {
        returnData.push({ json: { error: (error as Error).message }, pairedItem: { item: i } });
      } else {
        throw error;
      }
    }
  }
  return [returnData];
}
```

### API Request Helper

Usage pattern from [TestLink.node.ts](../../nodes/TestLink/TestLink.node.ts#L380):
```typescript
responseData = await testLinkApiRequest.call(
  this,
  'tl.methodName',    // XML-RPC method
  { paramKey: value } // params (devKey added automatically)
);
```

### Error Handling

- XML-RPC faults parsed by `parseXmlRpcResponse()` throw with message: `"TestLink API Error: {message}"`
- Execution errors wrapped in `continueOnFail()` pattern
- Failed items include `{ json: { error: string }, pairedItem: { item: i } }`

## Integration Points

### n8n Framework
- **IExecuteFunctions**: Provides `getNodeParameter()`, `getCredentials()`, `helpers.*`
- **INodeTypeDescription**: Declares UI, resources, operations, properties
- **INodeExecutionData**: Item wrapper with `json` and `pairedItem` metadata
- Consult n8n docs for: expression syntax, credential types, property options

### TestLink XML-RPC API
- **Endpoint**: `{host}/lib/api/xmlrpc/v1/xmlrpc.php`
- **Auth**: API key (`devKey`) required in every request
- **Reference**: Browse TestLink source's XML-RPC API class for available methods beyond those implemented
- **Response**: XML-RPC typed structs/arrays; parser handles nested objects

### Distribution
- **Entry points** in package.json `"n8n"` field point to transpiled dist/ files
- Credentials: `dist/credentials/TestLinkApi.credentials.js`
- Nodes: `dist/nodes/TestLink/TestLink.node.js`

## Adding New Operations

1. Add resource/operation to description properties in [TestLink.node.ts](../../nodes/TestLink/TestLink.node.ts#L40)
2. Define input fields with `displayOptions` filtering by resource + operation
3. Add branch in execute's resource/operation dispatch
4. Call `testLinkApiRequest()` with method and params from user input
5. Run `npm run build` to compile; `npm run lint` to verify

## When Working on Code

- Always reference specific files/lines when describing patterns
- Check the dispatch logic in [execute()](../../nodes/TestLink/TestLink.node.ts#L367) before adding operations
- XML-RPC request building exceptions: check [GenericFunctions.ts](../../nodes/TestLink/GenericFunctions.ts#L1)
- Credentials tests use [POST to xmlrpc endpoint](../../credentials/TestLinkApi.credentials.ts#L36)
- All API responses filtered through [parseXmlRpcResponse()](../../nodes/TestLink/GenericFunctions.ts#L69)
