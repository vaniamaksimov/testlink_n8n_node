import { DockerComposeEnvironment, Wait } from 'testcontainers';
import path from 'path';
import { seedTestLink } from './helpers/seedTestLink';

export default async function () {
	const composeFilePath = path.resolve(__dirname);
	const environment = await new DockerComposeEnvironment(composeFilePath, 'docker-compose.yml')
		.withWaitStrategy('testlink-1', Wait.forHealthCheck())
		.up();

	const testlinkContainer = environment.getContainer('testlink-1');
	const host = testlinkContainer.getHost();
	const port = testlinkContainer.getMappedPort(80);

	const baseUrl = `http://${host}:${port}`;

	// Obtain API key and seed test data
	const seedData = await seedTestLink(baseUrl);

	(globalThis as any).__TESTLINK_URL__ = baseUrl;
	(globalThis as any).__TESTLINK_API_KEY__ = seedData.apiKey;
	(globalThis as any).__SEED_DATA__ = seedData;
	(globalThis as any).__COMPOSE_ENV__ = environment;
}
