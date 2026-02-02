# n8n-nodes-testlink

This is an n8n community node for [TestLink](https://testlink.org/) - an open source test management system.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

### Test Project
- Get all test projects
- Get a test project by name

### Test Plan
- Get all test plans for a project
- Get a test plan by name

### Test Suite
- Get first-level test suites for a project
- Get a test suite by ID

### Test Case
- Get a test case by ID
- Get all test cases for a test suite

### Build
- Create a new build
- Get all builds for a test plan

### Execution
- Report test execution result
- Get last execution result for a test case

## Credentials

To use this node, you need to configure TestLink API credentials:

1. **Host URL**: The base URL of your TestLink instance (e.g., `https://testlink.example.com`)
2. **API Key**: Your personal API key from TestLink (User Settings > API interface)

### Enabling the API in TestLink

1. Edit the `config.inc.php` file in your TestLink installation
2. Set `$tlCfg->api->enabled = TRUE;`
3. Generate an API key in TestLink: My Settings > API interface > Generate a new key

## Compatibility

- n8n version: 1.0.0+
- Node.js version: 22.0+

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
- [TestLink documentation](https://testlink.org/)
- [TestLink XML-RPC API](https://github.com/viglesiasce/testlink/blob/master/lib/api/xmlrpc.class.php)

## License

[MIT](LICENSE)
