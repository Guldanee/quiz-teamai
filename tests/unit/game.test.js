import { test } from 'node:test';
import assert from 'node:assert/strict';
import { QUESTIONS } from '../../site/js/questions.js';
import { DOUBLE_TAP_MS } from '../../site/js/logic.js';
import { newGame, answer, timeout, next, remainingMs, correctCount, progressOf } from '../../site/js/game.js';

test('Socle · newGame démarre la question 1', () => {
  assert.deepEqual(newGame('Lou', 1000, 'v1'), {
    version: 'v1', pseudo: 'Lou', index: 0, phase: 'question', questionStartedAt: 1000, answers: [], score: 0,
  });
});

test('Socle · bonne réponse avec 13,4 s restantes = 134 points', () => {
  const s = answer(newGame('Lou', 0, 'v1'), QUESTIONS, 1, 6600);
  assert.equal(s.phase, 'feedback');
  assert.equal(s.score, 134);
  assert.deepEqual(s.answers[0], { choice: 1, correct: true, points: 134, timedOut: false });
});

test('Socle · mauvaise réponse = 0 point', () => {
  assert.equal(answer(newGame('Lou', 0, 'v1'), QUESTIONS, 0, 1000).answers[0].points, 0);
});

test('Socle · réponse après 20 s comptée comme temps écoulé', () => {
  assert.deepEqual(answer(newGame('Lou', 0, 'v1'), QUESTIONS, 1, 20000).answers[0], {
    choice: null, correct: false, points: 0, timedOut: true,
  });
});

test('Socle · timeout compte la question fausse', () => {
  const s = timeout(newGame('Lou', 0, 'v1'), QUESTIONS);
  assert.equal(s.phase, 'feedback');
  assert.equal(s.answers[0].timedOut, true);
  assert.equal(s.score, 0);
});

test('Socle · answer et timeout ignorés hors phase question', () => {
  const s = answer(newGame('Lou', 0, 'v1'), QUESTIONS, 1, 0);
  assert.equal(answer(s, QUESTIONS, 0, 10), s);
  assert.equal(timeout(s, QUESTIONS), s);
});

test('Socle · next passe à la question suivante puis à l’écran final', () => {
  let s = next(answer(newGame('Lou', 0, 'v1'), QUESTIONS, 1, 0), 5000);
  assert.equal(s.phase, 'question');
  assert.equal(s.index, 1);
  assert.equal(s.questionStartedAt, 5000);
  for (let i = 1; i < 7; i++) {
    s = next(answer(s, QUESTIONS, QUESTIONS[i].correctIndex, s.questionStartedAt), s.questionStartedAt + 1);
  }
  assert.equal(s.phase, 'final');
  assert.equal(correctCount(s), 7);
  assert.equal(s.index, 6);
});

test('Socle · remainingMs borné entre 0 et 20000', () => {
  const s = newGame('Lou', 1000, 'v1');
  assert.equal(remainingMs(s, 1000), 20000);
  assert.equal(remainingMs(s, 15000), 6000);
  assert.equal(remainingMs(s, 99000), 0);
});

test('Socle · answer ne modifie pas l’état reçu', () => {
  const s = newGame('Lou', 0, 'v1');
  answer(s, QUESTIONS, 1, 0);
  assert.equal(s.phase, 'question');
  assert.deepEqual(s.answers, []);
});

test('Relecture · progressOf avance avec la question et la phase', () => {
  const q1 = newGame('Lou', 0, 'v1');
  const q1fb = answer(q1, QUESTIONS, 1, 0);
  const q2 = next(q1fb, 10);
  assert.ok(progressOf(q1fb) > progressOf(q1));
  assert.ok(progressOf(q2) > progressOf(q1fb));
  assert.ok(progressOf({ ...q2, index: 6, phase: 'final' }) > progressOf({ ...q2, index: 6, phase: 'feedback' }));
  assert.equal(progressOf(null), -1);
});

test('Relecture · un toucher avant le début de la question (double toucher) est ignoré', () => {
  const s = newGame('Lou', 1000, 'v1');
  assert.equal(answer(s, QUESTIONS, 1, 1000 - DOUBLE_TAP_MS), s);
  assert.equal(answer(s, QUESTIONS, 1, 1000).answers[0].points, 150);
});

test('Relecture · une heure de début très lointaine (horloge du téléphone reculée) ne bloque pas les réponses', () => {
  const s = newGame('Lou', 10 * 60 * 1000, 'v1');
  assert.equal(answer(s, QUESTIONS, 1, 0).phase, 'feedback');
});
