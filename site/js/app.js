// Relie la logique du quiz à la page. Tous les textes sont posés avec textContent.
import { QUESTIONS } from './questions.js';
import { sanitizePseudo, isValidPseudo, messageFor } from './logic.js';
import { newGame, answer, timeout, next, remainingMs, correctCount } from './game.js';

const $ = (id) => document.getElementById(id);
const answerButtons = [...document.querySelectorAll('.answer-button')];

let state = null; // null = accueil

function show(screenId) {
  for (const id of ['screen-home', 'screen-quiz', 'screen-final']) $(id).hidden = id !== screenId;
}

function renderTimer() {
  $('timer').textContent = `${Math.ceil(remainingMs(state, Date.now()) / 1000)} s`;
}

function renderQuiz() {
  const q = QUESTIONS[state.index];
  const asked = state.phase === 'feedback';
  const last = asked ? state.answers[state.index] : null;
  $('progress-label').textContent = `Question ${state.index + 1}/7`;
  $('progress-bar').value = state.index + 1;
  $('score-label').textContent = `Score : ${state.score}`;
  $('question-text').textContent = q.text;
  answerButtons.forEach((button, i) => {
    button.querySelector('.label').textContent = q.answers[i];
    button.disabled = asked;
    button.classList.toggle('is-correct', asked && i === q.correctIndex);
    button.classList.toggle('is-wrong-choice', asked && i === last.choice && !last.correct);
    button.classList.toggle('is-dimmed', asked && i !== q.correctIndex && i !== last.choice);
  });
  if (!asked) renderTimer();
  $('feedback').hidden = !asked;
  if (asked) {
    $('feedback-title').textContent = last.correct ? 'Bonne réponse' : 'Mauvaise réponse';
    $('feedback-points').textContent = `+${last.points}`;
    $('feedback-timeout').hidden = !last.timedOut;
    $('feedback-explanation').textContent = q.explanation;
    $('next-button').textContent = state.index < 6 ? 'Question suivante' : 'Voir mon score';
  }
}

function renderFinal() {
  $('final-pseudo').textContent = state.pseudo;
  $('final-correct').textContent = `${correctCount(state)}/7`;
  $('final-score').textContent = `${state.score} points`;
  const { message, extra } = messageFor(correctCount(state));
  $('final-message').textContent = message;
  $('final-extra').textContent = extra ?? '';
  $('final-extra').hidden = extra === null;
}

function render() {
  if (state === null) return show('screen-home');
  if (state.phase === 'final') {
    renderFinal();
    return show('screen-final');
  }
  renderQuiz();
  show('screen-quiz');
}

function setState(newState) {
  if (newState === state) return;
  state = newState;
  render();
}

function tick() {
  if (state?.phase !== 'question') return;
  if (remainingMs(state, Date.now()) === 0) setState(timeout(state, QUESTIONS));
  else renderTimer();
}

$('home-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const pseudo = sanitizePseudo($('pseudo-input').value);
  $('pseudo-error').hidden = isValidPseudo(pseudo);
  if (!isValidPseudo(pseudo)) return;
  setState(newGame(pseudo, Date.now(), 'v1'));
});

answerButtons.forEach((button) => {
  button.addEventListener('click', () => {
    setState(answer(state, QUESTIONS, Number(button.dataset.index), Date.now()));
  });
});

$('next-button').addEventListener('click', () => {
  setState(next(state, Date.now()));
  window.scrollTo(0, 0);
});

setInterval(tick, 250);
render();
