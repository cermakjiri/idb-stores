import { resolve } from 'path';
import { createServer } from 'vite';

export async function createTestsServer() {
    const server = await createServer({
        configFile: resolve(process.cwd(), './tests/vite.config.ts'),
    });

    await server.listen();

    return {
        close: () => server.close(),
        url: `http://localhost:${server.config.server.port}`,
    };
}
