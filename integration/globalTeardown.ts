export default async function () {
	const environment = (globalThis as any).__COMPOSE_ENV__;
	if (environment) {
		await environment.down();
	}
}
