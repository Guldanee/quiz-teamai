import { test, expect } from '@playwright/test';
import { startGame } from './helpers.js';

// Corrections issues de la relecture finale indépendante.

test('Relecture · un double toucher sur « Question suivante » ne répond pas à la question suivante', async ({ page }) => {
  await startGame(page);
  await page.locator('.answer-button').nth(1).click();
  await page.locator('#next-button').click();
  await page.locator('.answer-button').nth(3).click({ delay: 0 }); // second toucher, aussitôt après
  await expect(page.locator('#progress-label')).toHaveText('Question 2/7');
  await expect(page.locator('#feedback')).toBeHidden();
  await page.waitForTimeout(500);
  await page.locator('.answer-button').nth(3).click(); // un vrai toucher, plus tard, compte
  await expect(page.locator('#feedback')).toBeVisible();
});

test('Relecture · un ancien onglet adopte la partie plus avancée d’un nouvel onglet', async ({ page, context }) => {
  await startGame(page); // onglet A, question 1
  const tabB = await context.newPage(); // QR code rescanné : nouvel onglet
  await tabB.goto('/');
  await expect(tabB.locator('#progress-label')).toHaveText('Question 1/7');
  await tabB.waitForTimeout(500);
  await tabB.locator('.answer-button').nth(1).click();
  await tabB.locator('#next-button').click();
  await expect(tabB.locator('#progress-label')).toHaveText('Question 2/7');
  await page.bringToFront();
  await expect(page.locator('#progress-label')).toHaveText('Question 2/7');
  await page.reload();
  await expect(page.locator('#progress-label')).toHaveText('Question 2/7');
});

test('Relecture · après une réponse, le bouton « Question suivante » est visible sans faire défiler', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 548 }); // iPhone SE avec les barres de Safari
  await startGame(page);
  for (let i = 0; i < 7; i++) {
    await page.waitForTimeout(450);
    await page.locator('.answer-button').first().click();
    await expect(page.locator('#feedback-title')).toBeInViewport();
    await expect(page.locator('#next-button')).toBeInViewport();
    await page.locator('#next-button').click();
  }
});
