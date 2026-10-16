import { test, expect } from '@playwright/test';
import { freezeClock, startGame, answerAll } from './helpers.js';

// clientWidth et non innerWidth : sur Android, innerWidth s'élargit avec un contenu trop large.
const noHorizontalScroll = (page) => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);

test('US-6 · aucun défilement horizontal à 360 px, sur tous les écrans', async ({ page }) => {
  await freezeClock(page);
  await page.goto('/');
  expect(await noHorizontalScroll(page)).toBe(true);
  await startGame(page, 'WWWWWWWWWWWWWWW');
  for (let i = 0; i < 7; i++) {
    expect(await noHorizontalScroll(page)).toBe(true);
    await page.locator('.answer-button').first().click();
    expect(await noHorizontalScroll(page)).toBe(true); // avec l'explication affichée
    await page.locator('#next-button').click();
  }
  expect(await noHorizontalScroll(page)).toBe(true); // écran final
});

test('US-6 · aucune requête hors du site (rien n’est envoyé ailleurs)', async ({ page, baseURL }) => {
  const outside = [];
  page.on('request', (r) => { if (!r.url().startsWith(baseURL)) outside.push(r.url()); });
  await freezeClock(page);
  await startGame(page);
  await answerAll(page, () => 0);
  expect(outside).toEqual([]);
});
