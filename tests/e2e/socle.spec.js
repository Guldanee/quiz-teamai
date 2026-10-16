import { test, expect } from '@playwright/test';
import { QUESTIONS } from '../../site/js/questions.js';
import { freezeClock, startGame, answerAll } from './helpers.js';

test('Socle · on joue les 7 questions jusqu’à l’écran final', async ({ page }) => {
  await freezeClock(page); // le temps ne s'écoule pas : 150 points par bonne réponse
  await startGame(page);
  await expect(page.locator('#progress-label')).toHaveText('Question 1/7');
  await answerAll(page, (i) => QUESTIONS[i].correctIndex);
  await expect(page.locator('#screen-final')).toBeVisible();
  await expect(page.locator('#final-correct')).toHaveText('7/7');
  await expect(page.locator('#final-score')).toHaveText('1050 points');
});
