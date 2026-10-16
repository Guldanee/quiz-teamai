import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { QUESTIONS } from '../../site/js/questions.js';

const md = readFileSync(new URL('../../questions.md', import.meta.url), 'utf8');

// Nombre de réponses marquées ✅ dans chaque question, rempli par parseQuestionsMd.
let correctMarks = [];

// Lit questions.md, la source de référence rédigée par l'équipe.
function parseQuestionsMd(text) {
  correctMarks = [];
  return text.split(/^## Q\d+ — /m).slice(1).map((block) => {
    const lines = block.split('\n');
    const answerLines = lines.filter((l) => l.startsWith('- '));
    correctMarks.push(answerLines.filter((l) => l.startsWith('- ✅ ')).length);
    return {
      theme: lines[0].trim(),
      text: block.match(/^\*\*(.+)\*\*$/m)[1],
      answers: answerLines.map((l) => l.slice(2).replace(/^✅ /, '')),
      correctIndex: answerLines.findIndex((l) => l.startsWith('- ✅ ')),
      explanation: block.match(/^\*Explication : (.+)\*$/m)[1],
    };
  });
}

test('US-5 · les données du quiz sont identiques à questions.md', () => {
  assert.deepEqual(QUESTIONS, parseQuestionsMd(md));
});

test('US-5 · 7 questions couvrant les thèmes de l’exposé', () => {
  assert.equal(QUESTIONS.length, 7);
  assert.deepEqual(
    QUESTIONS.map((q) => q.theme.split(' (')[0]),
    ['Plugins', 'MCP', 'RAG', 'Température', 'Hallucinations', 'Données sensibles', 'Rôles agiles'],
  );
});

test('US-5 · chaque question a 4 réponses, une seule bonne, et une explication', () => {
  for (const q of parseQuestionsMd(md)) {
    assert.equal(q.answers.length, 4);
    assert.ok(q.correctIndex >= 0);
    assert.ok(q.explanation.length > 0);
  }
  assert.deepEqual(correctMarks, [1, 1, 1, 1, 1, 1, 1]);
});
