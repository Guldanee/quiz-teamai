import { test, expect } from '@playwright/test';
import { QUESTIONS } from '../../site/js/questions.js';
import { startGame, answerAll } from './helpers.js';

// Pas d'horloge simulée : on vieillit directement la sauvegarde de la question en cours.
const age = (page, ms) => page.evaluate(([k, ms]) => {
  const s = JSON.parse(localStorage.getItem(k));
  s.questionStartedAt = Date.now() - ms;
  localStorage.setItem(k, JSON.stringify(s));
}, ['quizagile', ms]);

test('Reprise · après rechargement, on reprend à la même question avec son score', async ({ page }) => {
  await startGame(page);
  await page.locator('.answer-button').nth(1).click();
  await page.locator('#next-button').click();
  await page.reload();
  await expect(page.locator('#progress-label')).toHaveText('Question 2/7');
  await expect(page.locator('#score-label')).toHaveText(/^Score : 1[0-5]\d$/);
});

test('Reprise · le chronomètre ne repart pas à 20 s', async ({ page }) => {
  await startGame(page);
  await age(page, 15000);
  await page.reload();
  await expect(page.locator('#timer')).toHaveText(/^[1-5] s$/);
});

test('Reprise · retour après plus de 20 s (veille) : Temps écoulé', async ({ page }) => {
  await startGame(page);
  await age(page, 25000);
  await page.reload();
  await expect(page.locator('#feedback-title')).toHaveText('Mauvaise réponse');
  await expect(page.locator('#feedback-timeout')).toHaveText('Temps écoulé');
});

test('Reprise · une partie terminée ramène à l’écran final, sans pouvoir rejouer', async ({ page }) => {
  await startGame(page);
  await answerAll(page, () => 0);
  await page.goto('/');
  await expect(page.locator('#screen-final')).toBeVisible();
  await expect(page.locator('#screen-home')).toBeHidden();
});

test('Reprise · le quiz se joue même si le stockage est bloqué', async ({ page }) => {
  await page.addInitScript(() => {
    for (const m of ['getItem', 'setItem']) Storage.prototype[m] = () => { throw new Error('bloqué'); };
  });
  await startGame(page);
  await answerAll(page, (i) => QUESTIONS[i].correctIndex);
  await expect(page.locator('#final-correct')).toHaveText('7/7');
});
