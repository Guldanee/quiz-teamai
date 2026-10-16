import { test, expect } from '@playwright/test';
import { QUESTIONS } from '../../site/js/questions.js';
import { freezeClock, startGame, answerAll } from './helpers.js';

test('US-4 · bonus de rapidité : réponse juste à 13,4 s restantes = +134', async ({ page }) => {
  await freezeClock(page);
  await startGame(page);
  await page.clock.fastForward(6600);
  await page.locator('.answer-button').nth(1).click();
  await expect(page.locator('#feedback-points')).toHaveText('+134');
});

test('US-4 · écran final : pseudo, score, X/7 et message', async ({ page }) => {
  await freezeClock(page);
  await startGame(page, 'Lou42');
  await answerAll(page, (i) => (i < 4 ? QUESTIONS[i].correctIndex : (QUESTIONS[i].correctIndex + 1) % 4));
  await expect(page.locator('#final-pseudo')).toHaveText('Lou42');
  await expect(page.locator('#final-correct')).toHaveText('4/7');
  await expect(page.locator('#final-score')).toHaveText('600 points');
  await expect(page.locator('#final-message')).toHaveText("Joli score ! Tu as suivi l'essentiel de l'exposé.");
  await expect(page.locator('#final-extra')).toBeHidden();
  await expect(page.getByText('Rejouer')).toHaveCount(0);
});
