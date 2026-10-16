import { test, expect } from '@playwright/test';
import { freezeClock, answerAll } from './helpers.js';

test('US-1 · l’accueil affiche QuizAgile et le bouton Jouer', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toHaveText('QuizAgile');
  await expect(page.locator('#play-button')).toHaveText('Jouer');
});

test('US-1 · la saisie du pseudo est limitée à 15 caractères', async ({ page }) => {
  await page.goto('/');
  await page.locator('#pseudo-input').pressSequentially('a'.repeat(20));
  await expect(page.locator('#pseudo-input')).toHaveValue('a'.repeat(15));
});

test('US-1 · un pseudo vide est refusé', async ({ page }) => {
  await page.goto('/');
  await page.locator('#pseudo-input').fill('   ');
  await page.locator('#play-button').click();
  await expect(page.locator('#pseudo-error')).toBeVisible();
  await expect(page.locator('#screen-home')).toBeVisible();
});

// La valeur est injectée directement pour contourner maxlength : sanitizePseudo reçoit le code complet.
test('US-1 · un pseudo avec du code ne s’exécute pas', async ({ page }) => {
  await freezeClock(page);
  await page.goto('/');
  await page.locator('#pseudo-input').evaluate((el) => { el.value = '<img src=x onerror="window.__pwned=1">Lou'; });
  await page.locator('#play-button').click();
  await answerAll(page, () => 0);
  await expect(page.locator('#final-pseudo')).toHaveText('Lou');
  expect(await page.evaluate(() => window.__pwned)).toBeUndefined();
});
