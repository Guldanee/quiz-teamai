import { test } from 'node:test';
import assert from 'node:assert/strict';
import { QUESTIONS } from '../../site/js/questions.js';
import { quizVersion } from '../../site/js/logic.js';
import { newGame } from '../../site/js/game.js';
import { STORAGE_KEY, loadGame, saveGame } from '../../site/js/store.js';

function fakeStorage() {
  return {
    data: {},
    getItem(k) { return this.data[k] ?? null; },
    setItem(k, v) { this.data[k] = v; },
  };
}

test('Reprise · sauvegarde puis relecture à l’identique', () => {
  const st = fakeStorage();
  const s = newGame('Lou', 1000, 'v1');
  saveGame(st, s);
  assert.deepEqual(loadGame(st, 'v1'), s);
});

test('Reprise · une sauvegarde d’une autre version des questions est ignorée', () => {
  const st = fakeStorage();
  saveGame(st, newGame('Lou', 1000, 'v1'));
  assert.equal(loadGame(st, 'v2'), null);
});

test('Reprise · une sauvegarde abîmée est ignorée', () => {
  const raws = [
    '{pas du json',
    '42',
    'null',
    JSON.stringify({ version: 'v1', phase: 'bidon', index: 0, answers: [] }),
    JSON.stringify({ version: 'v1', phase: 'question', index: 9, answers: [] }),
  ];
  for (const raw of raws) {
    const st = fakeStorage();
    st.data[STORAGE_KEY] = raw;
    assert.equal(loadGame(st, 'v1'), null);
  }
});

test('Reprise · un stockage qui lève une erreur ne fait jamais planter', () => {
  const broken = { getItem() { throw new Error('bloqué'); }, setItem() { throw new Error('bloqué'); } };
  assert.equal(loadGame(broken, 'v1'), null);
  assert.doesNotThrow(() => saveGame(broken, newGame('Lou', 0, 'v1')));
  assert.equal(loadGame(null, 'v1'), null);
  assert.doesNotThrow(() => saveGame(null, newGame('Lou', 0, 'v1')));
});

test('Reprise · quizVersion change si une question change', () => {
  const copy = structuredClone(QUESTIONS);
  copy[0].text += ' ';
  assert.equal(quizVersion(QUESTIONS), quizVersion(structuredClone(QUESTIONS)));
  assert.notEqual(quizVersion(QUESTIONS), quizVersion(copy));
});
