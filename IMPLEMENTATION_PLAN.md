# Plan: Add nameFilter and details parameter to Test Case getAll

## Problem

When using the TestLink node as a tool in n8n Agent node, calling `getAll` for Test Cases returns all test cases with full details (including steps). The response is too large and overflows the LLM context window.

## Solution

Add two optional parameters to the `testCase` → `getAll` operation:
1. **nameFilter** — client-side filtering by substring in test case name (case-insensitive)
2. **details** — control response verbosity (`simple` by default instead of `full`)

## Changes

### 1. `nodes/TestLink/TestLink.node.ts` — add UI parameters

Add two new fields after the existing `testSuiteId` field for `testCase` / `getAll` (after line 340):

```typescript
{
    displayName: 'Name Filter',
    name: 'nameFilter',
    type: 'string',
    required: false,
    default: '',
    displayOptions: {
        show: {
            resource: ['testCase'],
            operation: ['getAll'],
        },
    },
    description: 'Filter test cases by name (case-insensitive, partial match)',
},
{
    displayName: 'Details',
    name: 'details',
    type: 'options',
    required: false,
    default: 'simple',
    options: [
        {
            name: 'Simple',
            value: 'simple',
            description: 'Returns only id, external_id, name, node_order, testsuite_id',
        },
        {
            name: 'Full',
            value: 'full',
            description: 'Returns all fields including steps, summary, preconditions',
        },
    ],
    displayOptions: {
        show: {
            resource: ['testCase'],
            operation: ['getAll'],
        },
    },
    description: 'Level of detail in the response',
},
```

### 2. `nodes/TestLink/handlers/testCase.ts` — update getAll handler

```typescript
export async function getAll(
    context: IExecuteFunctions,
    itemIndex: number,
): Promise<any> {
    const testSuiteId = context.getNodeParameter('testSuiteId', itemIndex) as number;
    const nameFilter = context.getNodeParameter('nameFilter', itemIndex, '') as string;
    const details = context.getNodeParameter('details', itemIndex, 'simple') as string;

    let result = await testLinkApiRequest.call(context, 'tl.getTestCasesForTestSuite', {
        testsuiteid: testSuiteId,
        deep: true,
        details,
    });

    // Client-side filtering by name (case-insensitive, partial match)
    if (nameFilter && Array.isArray(result)) {
        const filter = nameFilter.toLowerCase();
        result = result.filter((tc: any) => tc.name?.toLowerCase().includes(filter));
    }

    return result;
}
```

### Key changes from current code:
- `details` parameter: was hardcoded `'full'`, now defaults to `'simple'` (compact response)
- `nameFilter` parameter: client-side filtering applied after API response
- Default behavior changes: `getAll` now returns compact data by default

## Verification

1. `npm run build` — check compilation
2. `npm run lint` — check linting
3. Manual test in n8n: testCase → getAll with nameFilter set to a keyword
