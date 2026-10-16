// Machine à états de la partie. Fonctions pures : l'état reçu n'est jamais modifié.
import { QUESTION_DURATION_MS, DOUBLE_TAP_MS, pointsFor } from './logic.js';

export function newGame(pseudo, now, version) {
  return { version, pseudo, index: 0, phase: 'question', questionStartedAt: now, answers: [], score: 0 };
}

export function remainingMs(state, now) {
  return Math.min(Math.max(QUESTION_DURATION_MS - (now - state.questionStartedAt), 0), QUESTION_DURATION_MS);
}

function record(state, entry) {
  return { ...state, phase: 'feedback', answers: [...state.answers, entry], score: state.score + entry.points };
}

export function answer(state, questions, choice, now) {
  if (state.phase !== 'question') return state;
  const early = state.questionStartedAt - now;
  if (early > 0 && early <= DOUBLE_TAP_MS) return state; // double toucher sur « Question suivante »
  const remaining = remainingMs(state, now);
  if (remaining === 0) return timeout(state, questions);
  const correct = choice === questions[state.index].correctIndex;
  return record(state, { choice, correct, points: pointsFor(correct, remaining), timedOut: false });
}

export function timeout(state, questions) {
  if (state.phase !== 'question') return state;
  return record(state, { choice: null, correct: false, points: 0, timedOut: true });
}

export function next(state, now) {
  if (state.phase !== 'feedback') return state;
  if (state.index >= 6) return { ...state, phase: 'final' };
  return { ...state, phase: 'question', index: state.index + 1, questionStartedAt: now };
}

// Avancement d'une partie, pour savoir laquelle de deux sauvegardes est la plus récente.
const PHASE_ORDER = ['question', 'feedback', 'final'];

export function progressOf(state) {
  return state ? state.index * 3 + PHASE_ORDER.indexOf(state.phase) : -1;
}

export function correctCount(state) {
  return state.answers.filter((a) => a.correct).length;
}
