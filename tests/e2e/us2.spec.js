import { test, expect } from '@playwright/test';
import { freezeClock, startGame } from './helpers.js';

test.beforeEach(async ({ page }) => {
  await freezeClock(page);
  await startGame(page);
});

test('US-2 · 4 gros boutons de couleurs différentes, lettres A à D', async ({ page }) => {
  const buttons = page.locator('.answer-button');
  await expect(buttons).toHaveCount(4);
  const colors = await buttons.evaluateAll((bs) => bs.map((b) => getComputedStyle(b).backgroundColor));
  expect(new Set(colors).size).toBe(4);
  await expect(page.locator('.answer-button .letter')).toHaveText(['A', 'B', 'C', 'D']);
  for (const b of await buttons.all()) expect((await b.boundingBox()).height).toBeGreaterThanOrEqual(48);
});

test('US-2 · indicateur Question N/7 et barre de progression', async ({ page }) => {
  await expect(page.locator('#progress-label')).toHaveText('Question 1/7');
  await expect(page.locator('#progress-bar')).toHaveJSProperty('value', 1);
  await page.locator('.answer-button').first().click();
  await page.locator('#next-button').click();
  await expect(page.locator('#progress-label')).toHaveText('Question 2/7');
  await expect(page.locator('#progress-bar')).toHaveJSProperty('value', 2);
});

test('US-2 · toucher une réponse bloque les boutons et arrête le chronomètre', async ({ page }) => {
  await page.clock.fastForward(6000);
  await expect(page.locator('#timer')).toHaveText('14 s');
  await page.locator('.answer-button').nth(1).click();
  for (const b of await page.locator('.answer-button').all()) await expect(b).toBeDisabled();
  await page.clock.fastForward(5000);
  await expect(page.locator('#timer')).toHaveText('14 s');
});

test('US-2 · deux touchers rapides : seule la première réponse compte', async ({ page }) => {
  await page.locator('.answer-button').nth(1).click(); // bonne réponse de Q1
  await page.locator('.answer-button').nth(0).click({ force: true });
  await expect(page.locator('#feedback-title')).toHaveText('Bonne réponse');
  await expect(page.locator('#score-label')).toHaveText('Score : 150');
});

test('US-2 · à zéro sans réponse, la question est comptée fausse', async ({ page }) => {
  await page.clock.fastForward(20000);
  await expect(page.locator('#feedback-title')).toHaveText('Mauvaise réponse');
  await expect(page.locator('#score-label')).toHaveText('Score : 0');
});

for (const scheme of ['light', 'dark']) {
  test(`US-2 · lisible en mode ${scheme === 'dark' ? 'sombre' : 'clair'}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme });
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    const [r, g, b] = bg.match(/\d+/g).map(Number);
    const lum = (r + g + b) / 3;
    expect(scheme === 'dark' ? lum < 60 : lum > 200).toBe(true);
    await expect(page.locator('.answer-button .label').first()).toHaveCSS('color', 'rgb(255, 255, 255)');
  });
}
