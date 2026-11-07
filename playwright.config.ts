import { defineConfig } from '@playwright/test';

export default defineConfig({
	// Opt-in local integration run: allow WebGPU in headless Chromium.
	use:
		process.env.PORTFOLIO_AI_SMOKE === '1'
			? {
					launchOptions: {
						args: [
							'--enable-unsafe-webgpu',
							...(process.platform === 'darwin' ? ['--use-angle=metal'] : [])
						]
					}
				}
			: {},
	webServer: { command: 'npm run build && npm run preview', port: 4173 },
	testMatch: '**/*.e2e.{ts,js}'
});
