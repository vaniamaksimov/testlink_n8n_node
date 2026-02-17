# TestLink XML-RPC API Methods

Full list of public methods from `TestlinkXMLRPCServer` class (API v1.1).

Legend: :white_check_mark: — implemented in n8n node, :x: — not implemented.

## Test Project

| Method | Description | Status |
|--------|-------------|--------|
| `tl.getProjects` | Get all projects | :white_check_mark: |
| `tl.getTestProjectByName` | Get project by name | :white_check_mark: |
| `tl.createTestProject` | Create a test project | :x: |
| `tl.deleteTestProject` | Delete a project | :x: |
| `tl.getProjectKeywords` | Get project keywords | :x: |
| `tl.getProjectPlatforms` | Get project platforms | :x: |

## Test Plan

| Method | Description | Status |
|--------|-------------|--------|
| `tl.getProjectTestPlans` | Get test plans for a project | :white_check_mark: |
| `tl.getTestPlanByName` | Get test plan by name | :white_check_mark: |
| `tl.createTestPlan` | Create a test plan | :x: |
| `tl.deleteTestPlan` | Delete a test plan | :x: |
| `tl.getTotalsForTestPlan` | Get test plan statistics | :x: |
| `tl.getTestPlanPlatforms` | Get platforms for a test plan | :x: |
| `tl.addPlatformToTestPlan` | Add platform to test plan | :x: |
| `tl.removePlatformFromTestPlan` | Remove platform from test plan | :x: |

## Test Suite

| Method | Description | Status |
|--------|-------------|--------|
| `tl.getFirstLevelTestSuitesForTestProject` | Get first-level suites for a project | :white_check_mark: |
| `tl.getTestSuiteByID` | Get suite by ID | :white_check_mark: |
| `tl.getTestSuitesForTestPlan` | Get suites for a test plan | :x: |
| `tl.getTestSuitesForTestSuite` | Get child suites | :x: |
| `tl.createTestSuite` | Create a test suite | :x: |
| `tl.updateTestSuite` | Update a test suite | :x: |
| `tl.getTestSuite` | Get test suite | :x: |

## Test Case

| Method | Description | Status |
|--------|-------------|--------|
| `tl.getTestCase` | Get a test case | :white_check_mark: |
| `tl.getTestCasesForTestSuite` | Get test cases for a suite | :white_check_mark: |
| `tl.getTestCasesForTestPlan` | Get test cases for a test plan | :x: |
| `tl.getTestCaseIDByName` | Find test case by name | :x: |
| `tl.createTestCase` | Create a test case | :x: |
| `tl.updateTestCase` | Update a test case | :x: |
| `tl.addTestCaseToTestPlan` | Add test case to a test plan | :x: |
| `tl.getTestCaseKeywords` | Get test case keywords | :x: |
| `tl.setTestCaseExecutionType` | Set execution type | :x: |
| `tl.setTestCaseTestSuite` | Move test case to another suite | :x: |

## Build

| Method | Description | Status |
|--------|-------------|--------|
| `tl.getBuildsForTestPlan` | Get builds for a test plan | :white_check_mark: |
| `tl.createBuild` | Create a build | :white_check_mark: |
| `tl.getLatestBuildForTestPlan` | Get latest build for a test plan | :x: |
| `tl.closeBuild` | Close a build | :x: |

## Execution

| Method | Description | Status |
|--------|-------------|--------|
| `tl.reportTCResult` | Report test case execution result | :white_check_mark: |
| `tl.getLastExecutionResult` | Get last execution result | :white_check_mark: |
| `tl.getAllExecutionsResults` | Get all execution results | :x: |
| `tl.deleteExecution` | Delete an execution | :x: |
| `tl.getExecCountersByBuild` | Get execution counters by build | :x: |
| `tl.getExecutionSet` | Get execution set | :x: |
| `tl.getTestCaseBugs` | Get bugs linked to a test case | :x: |

## Assignment

| Method | Description | Status |
|--------|-------------|--------|
| `tl.assignTestCaseExecutionTask` | Assign tester to a test case | :x: |
| `tl.unassignTestCaseExecutionTask` | Unassign tester | :x: |
| `tl.getTestCaseAssignedTester` | Get assigned tester | :x: |

## Requirements

| Method | Description | Status |
|--------|-------------|--------|
| `tl.assignRequirements` | Assign requirements to a test case | :x: |
| `tl.getRequirements` | Get requirements | :x: |
| `tl.getReqCoverage` | Get requirement coverage | :x: |

## Custom Fields

| Method | Description | Status |
|--------|-------------|--------|
| `tl.getTestCaseCustomFieldDesignValue` | Get test case custom field (design) | :x: |
| `tl.getTestCaseCustomFieldExecutionValue` | Get test case custom field (execution) | :x: |
| `tl.getTestCaseCustomFieldTestPlanDesignValue` | Get test case custom field (test plan design) | :x: |
| `tl.getTestSuiteCustomFieldDesignValue` | Get test suite custom field (design) | :x: |
| `tl.getTestPlanCustomFieldDesignValue` | Get test plan custom field (design) | :x: |
| `tl.getReqSpecCustomFieldDesignValue` | Get req spec custom field (design) | :x: |
| `tl.getRequirementCustomFieldDesignValue` | Get requirement custom field (design) | :x: |
| `tl.updateTestCaseCustomFieldDesignValue` | Update test case custom field (design) | :x: |
| `tl.updateTestSuiteCustomFieldDesignValue` | Update test suite custom field (design) | :x: |
| `tl.updateBuildCustomFieldsValues` | Update build custom field values | :x: |

## Attachments

| Method | Description | Status |
|--------|-------------|--------|
| `tl.uploadTestProjectAttachment` | Upload attachment to a project | :x: |
| `tl.uploadTestSuiteAttachment` | Upload attachment to a suite | :x: |
| `tl.uploadTestCaseAttachment` | Upload attachment to a test case | :x: |
| `tl.uploadExecutionAttachment` | Upload attachment to an execution | :x: |
| `tl.uploadRequirementSpecificationAttachment` | Upload attachment to a req spec | :x: |
| `tl.uploadRequirementAttachment` | Upload attachment to a requirement | :x: |
| `tl.uploadAttachment` | Generic attachment upload | :x: |
| `tl.getTestSuiteAttachments` | Get test suite attachments | :x: |
| `tl.getTestCaseAttachments` | Get test case attachments | :x: |

## Platform

| Method | Description | Status |
|--------|-------------|--------|
| `tl.createPlatform` | Create a platform | :x: |

## Users

| Method | Description | Status |
|--------|-------------|--------|
| `tl.doesUserExist` | Check if user exists | :x: |
| `tl.getUserByLogin` | Get user by login | :x: |
| `tl.getUserByID` | Get user by ID | :x: |
| `tl.checkDevKey` | Validate API key | :x: |

## Utility

| Method | Description | Status |
|--------|-------------|--------|
| `tl.sayHello` | Ping / health check | :x: |
| `tl.repeat` | Echo back input | :x: |
| `tl.about` | API info | :x: |
| `tl.testLinkVersion` | Get TestLink version | :x: |
| `tl.setTestMode` | Enable test mode | :x: |

## Misc

| Method | Description | Status |
|--------|-------------|--------|
| `tl.getFullPath` | Get full path to an element | :x: |
| `tl.getIssueTrackerSystem` | Get issue tracker info | :x: |
