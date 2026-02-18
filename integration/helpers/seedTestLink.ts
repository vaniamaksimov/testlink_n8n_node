import { xmlRpcCall } from './xmlrpcClient';
import { execSync } from 'child_process';

export interface SeedData {
	apiKey: string;
	projectId: number;
	projectName: string;
	testPlanId: number;
	testPlanName: string;
	testSuiteId: number;
	testSuiteName: string;
	testCaseId: number;
	testCaseExternalId: number;
	buildId: number;
	buildName: string;
}

const KNOWN_API_KEY = 'a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5';

/**
 * Set the API key for the admin user directly in the database.
 */
function setApiKeyViaDb(): void {
	const containerName = execSync(
		"docker ps --filter 'ancestor=mariadb:10.6' --format '{{.Names}}'",
		{ encoding: 'utf-8' },
	).trim();

	if (!containerName) {
		throw new Error('MariaDB container not found');
	}

	const sql = `UPDATE users SET script_key='${KNOWN_API_KEY}' WHERE id=1;`;
	execSync(
		`docker exec ${containerName} mysql -u root -proot testlink -e "${sql}"`,
		{ encoding: 'utf-8' },
	);
}

/**
 * Seed TestLink with test data needed for integration tests.
 * Returns references to all created entities.
 */
export async function seedTestLink(baseUrl: string): Promise<SeedData> {
	setApiKeyViaDb();

	const apiKey = KNOWN_API_KEY;

	const call = (method: string, params: Record<string, unknown> = {}) =>
		xmlRpcCall(baseUrl, method, { devKey: apiKey, ...params });

	// Step 1: Create test project
	const projectName = 'IntegrationTestProject';
	const projectResult = await call('tl.createTestProject', {
		testprojectname: projectName,
		testcaseprefix: 'ITP',
		notes: 'Project for integration tests',
	});
	const projectId =
		typeof projectResult === 'object' && !Array.isArray(projectResult)
			? (projectResult.id as number)
			: (projectResult as any)[0]?.id ?? (projectResult as any).id;

	// Step 2: Create test plan
	const testPlanName = 'IntegrationTestPlan';
	const planResult = await call('tl.createTestPlan', {
		testplanname: testPlanName,
		testprojectname: projectName,
		notes: 'Plan for integration tests',
	});
	const testPlanId =
		typeof planResult === 'object' && !Array.isArray(planResult)
			? (planResult.id as number)
			: (planResult as any)[0]?.id ?? (planResult as any).id;

	// Step 3: Create test suite
	const testSuiteName = 'IntegrationTestSuite';
	const suiteResult = await call('tl.createTestSuite', {
		testprojectid: projectId,
		testsuitename: testSuiteName,
		details: 'Suite for integration tests',
	});
	const testSuiteId =
		typeof suiteResult === 'object' && !Array.isArray(suiteResult)
			? (suiteResult.id as number)
			: (suiteResult as any)[0]?.id ?? (suiteResult as any).id;

	// Step 4: Create test case (steps is required in TestLink 1.9.19)
	const testCaseResult = await call('tl.createTestCase', {
		testcasename: 'IntegrationTestCase',
		testsuiteid: testSuiteId,
		testprojectid: projectId,
		authorlogin: 'admin',
		summary: 'Test case for integration tests',
		steps: [
			{
				step_number: 1,
				actions: 'Run integration test',
				expected_results: 'Test passes',
				execution_type: 1,
			},
		],
	});
	const tcData = Array.isArray(testCaseResult) ? testCaseResult[0] : testCaseResult;
	const testCaseId = (tcData as any).id as number;
	const testCaseExternalId = parseInt(
		String(
			(tcData as any).additionalInfo?.external_id ??
				(tcData as any).additionalInfo?.tc_external_id ??
				(tcData as any).external_id ??
				0,
		),
		10,
	);

	// Step 5: Add test case to test plan
	await call('tl.addTestCaseToTestPlan', {
		testprojectid: projectId,
		testplanid: testPlanId,
		testcaseexternalid: `ITP-${testCaseExternalId}`,
		version: 1,
	});

	// Step 6: Create build
	const buildName = 'IntegrationBuild';
	const buildResult = await call('tl.createBuild', {
		testplanid: testPlanId,
		buildname: buildName,
		buildnotes: 'Build for integration tests',
	});
	const buildId =
		typeof buildResult === 'object' && !Array.isArray(buildResult)
			? (buildResult.id as number)
			: (buildResult as any)[0]?.id ?? (buildResult as any).id;

	return {
		apiKey,
		projectId: Number(projectId),
		projectName,
		testPlanId: Number(testPlanId),
		testPlanName,
		testSuiteId: Number(testSuiteId),
		testSuiteName,
		testCaseId: Number(testCaseId),
		testCaseExternalId,
		buildId: Number(buildId),
		buildName,
	};
}
