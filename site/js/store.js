// Sauvegarde de la partie sur le téléphone uniquement. Ne lève jamais d'erreur.
export const STORAGE_KEY = 'quizagile';

const PHASES = ['question', 'feedback', 'final'];

export function loadGame(storage, version) {
  if (!storage) return null;
  try {
    const state = JSON.parse(storage.getItem(STORAGE_KEY));
    if (
      state === null || typeof state !== 'object' ||
      state.version !== version ||
      !PHASES.includes(state.phase) ||
      !Number.isInteger(state.index) || state.index < 0 || state.index > 6 ||
      !Array.isArray(state.answers)
    ) return null;
    return state;
  } catch {
    return null;
  }
}

export function saveGame(storage, state) {
  if (!storage) return;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Stockage plein ou bloqué : le quiz continue, sans reprise possible.
  }
}
