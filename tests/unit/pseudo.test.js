import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sanitizePseudo, isValidPseudo } from '../../site/js/logic.js';

test('US-1 · les balises sont retirées du pseudo', () => {
  assert.equal(sanitizePseudo('<script>alert(1)</script>Lou'), 'alert(1)Lou');
  assert.equal(sanitizePseudo('<img src=x onerror=alert(1)>Lou'), 'Lou');
  assert.equal(sanitizePseudo('Lou<3'), 'Lou3');
});

test('US-1 · espaces retirés et 15 caractères au maximum', () => {
  assert.equal(sanitizePseudo('  Lou  '), 'Lou');
  assert.equal(sanitizePseudo('a'.repeat(20)), 'a'.repeat(15));
});

test('US-1 · un pseudo vide (même après filtrage) est refusé', () => {
  assert.equal(isValidPseudo(sanitizePseudo('   ')), false);
  assert.equal(isValidPseudo(sanitizePseudo('<b></b>')), false);
  assert.equal(isValidPseudo(sanitizePseudo('Lou')), true);
});
