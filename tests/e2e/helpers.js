export const T0 = new Date('2026-10-17T10:00:00');

// Horloge simulée et figée : le temps n'avance plus que par page.clock.fastForward. À appeler avant page.goto.
export async function freezeClock(page) {
  await page.clock.install({ time: T0 });
  await page.clock.pauseAt(new Date(T0.getTime() + 1000));
}

export async function startGame(page, pseudo = 'Lou42') {
  await page.goto('/');
  await page.locator('#pseudo-input').fill(pseudo);
  await page.locator('#play-button').click();
}

// pick(indexQuestion) → index du bouton à toucher, pour les 7 questions.
export async function answerAll(page, pick) {
  for (let i = 0; i < 7; i++) {
    await page.locator(`.answer-button[data-index="${pick(i)}"]`).click();
    await page.locator('#next-button').click();
  }
}
