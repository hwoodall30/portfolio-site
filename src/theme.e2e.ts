import { test, expect } from '@playwright/test';

test('theme follows the system and remembers an explicit choice', async ({ page }) => {
	await page.emulateMedia({ colorScheme: 'dark' });
	await page.goto('/');
	await expect(page.locator('html')).toHaveClass('dark');
	const picker = page.getByLabel('Color theme');
	await expect(picker).toHaveValue('system');
	await picker.selectOption('light');
	await expect(page.locator('html')).not.toHaveClass('dark');
	await page.reload();
	await expect(picker).toHaveValue('light');
	await expect(page.locator('html')).not.toHaveClass('dark');
	await picker.selectOption('dark');
	await page.reload();
	await expect(picker).toHaveValue('dark');
	await expect(page.locator('html')).toHaveClass('dark');
	await picker.selectOption('system');
	await page.emulateMedia({ colorScheme: 'light' });
	await expect(page.locator('html')).not.toHaveClass('dark');
	await page.emulateMedia({ colorScheme: 'dark' });
	await expect(page.locator('html')).toHaveClass('dark');
});

test('theme still switches when browser storage is blocked', async ({ page }) => {
	await page.addInitScript(() => {
		Object.defineProperty(window, 'localStorage', {
			get() {
				throw new Error('Storage blocked');
			}
		});
	});
	await page.goto('/');
	await page.getByLabel('Color theme').selectOption('dark');
	await expect(page.locator('html')).toHaveClass('dark');
	await expect(
		page.getByRole('status').filter({ hasText: 'Theme applied for this visit' })
	).toHaveText('Theme applied for this visit. Browser storage is unavailable.');
});

test('text palettes meet WCAG AA contrast in both themes', async ({ page }) => {
	await page.goto('/');
	for (const theme of ['light', 'dark']) {
		await page.getByLabel('Color theme').selectOption(theme);
		const ratios = await page.evaluate(() => {
			const style = getComputedStyle(document.documentElement);
			function luminance(token: string) {
				const probe = document.createElement('span');
				probe.style.color = style.getPropertyValue(token);
				document.body.append(probe);
				const channels = getComputedStyle(probe)
					.color.match(/[\d.]+/g)!
					.slice(0, 3)
					.map(Number);
				probe.remove();
				return channels
					.map((value) => {
						const channel = value / 255;
						return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
					})
					.reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0);
			}
			const pairs = ['--background', '--card', '--secondary', '--accent'].flatMap((surface) =>
				['--foreground', '--muted-foreground', '--primary'].map((text) => [surface, text])
			);
			pairs.push(['--primary', '--primary-foreground'], ['--accent', '--accent-foreground']);
			return pairs.map(([surface, text]) => {
				const a = luminance(surface),
					b = luminance(text);
				return { surface, text, ratio: (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05) };
			});
		});
		for (const pair of ratios) {
			expect(pair.ratio, `${theme}: ${pair.text} on ${pair.surface}`).toBeGreaterThanOrEqual(4.5);
		}
	}
});
