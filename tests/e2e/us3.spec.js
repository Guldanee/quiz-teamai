import { test, expect } from '@playwright/test';
import { QUESTIONS } from '../../site/js/questions.js';
import { afterNext, freezeClock, startGame } from './helpers.js';

// Q1 : la bonne réponse est la n° 1 (B).
test.beforeEach(async ({ page }) => {
  await freezeClock(page);
  await startGame(page);
});

test('US-3 · bonne réponse : « Bonne réponse » et explication', async ({ page }) => {
  await page.locator('.answer-button').nth(1).click();
  await expect(page.locator('#feedback-title')).toHaveText('Bonne réponse');
  await expect(page.locator('#feedback-explanation')).toHaveText(QUESTIONS[0].explanation);
  await expect(page.locator('.answer-button').nth(1)).toHaveClass(/is-correct/);
  await expect(page.locator('#feedback-timeout')).toBeHidden();
});

test('US-3 · mauvaise réponse : bonne réponse mise en évidence', async ({ page }) => {
  await page.locator('.answer-button').nth(0).click();
  await expect(page.locator('#feedback-title')).toHaveText('Mauvaise réponse');
  await expect(page.locator('.answer-button').nth(1)).toHaveClass(/is-correct/);
  await expect(page.locator('.answer-button').nth(0)).toHaveClass(/is-wrong-choice/);
  await expect(page.locator('.answer-button').nth(2)).toHaveClass(/is-dimmed/);
  await expect(page.locator('#feedback-explanation')).toHaveText(QUESTIONS[0].explanation);
});

test('US-3 · temps écoulé : Mauvaise réponse, Temps écoulé, bonne réponse en évidence', async ({ page }) => {
  await page.clock.fastForward(20000);
  await expect(page.locator('#feedback-title')).toHaveText('Mauvaise réponse');
  await expect(page.locator('#feedback-timeout')).toHaveText('Temps écoulé');
  await expect(page.locator('.answer-button').nth(1)).toHaveClass(/is-correct/);
});

test('US-3 · « Question suivante » puis « Voir mon score » à la 7e', async ({ page }) => {
  for (let i = 0; i < 7; i++) {
    await page.locator('.answer-button').first().click();
    await expect(page.locator('#next-button')).toHaveText(i < 6 ? 'Question suivante' : 'Voir mon score');
    await page.locator('#next-button').click();
    await afterNext(page);
  }
  await expect(page.locator('#screen-final')).toBeVisible();
});
