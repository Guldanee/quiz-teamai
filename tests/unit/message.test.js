import { test } from 'node:test';
import assert from 'node:assert/strict';
import { messageFor } from '../../site/js/logic.js';

test('US-4 · message selon le palier', () => {
  for (const n of [0, 2]) {
    assert.equal(messageFor(n).message, "Pas de panique : même les IA hallucinent parfois ! Revois l'exposé, tu feras mieux la prochaine fois.");
  }
  for (const n of [3, 5]) assert.equal(messageFor(n).message, "Joli score ! Tu as suivi l'essentiel de l'exposé.");
  for (const n of [6, 7]) assert.equal(messageFor(n).message, "Impressionnant ! Tu maîtrises l'IA générative et l'agilité.");
});

test('US-4 · phrase « Lève la main » seulement pour 7/7', () => {
  assert.equal(messageFor(7).extra, "Lève la main quand l'animatrice demande qui a eu 7/7 !");
  assert.equal(messageFor(6).extra, null);
});
