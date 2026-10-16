export const QUESTION_DURATION_MS = 20000;
export const MAX_PSEUDO_LENGTH = 15;

// Retire les balises, puis tout < ou > restant ; coupe à 15 caractères.
export function sanitizePseudo(raw) {
  return raw.replace(/<[^>]*>/g, '').replace(/[<>]/g, '').trim().slice(0, MAX_PSEUDO_LENGTH);
}

export function isValidPseudo(clean) {
  return clean.length > 0;
}

// 100 points par bonne réponse + bonus de rapidité jusqu'à 50 points.
export function pointsFor(correct, remainingMs) {
  if (!correct) return 0;
  const remaining = Math.min(Math.max(remainingMs, 0), QUESTION_DURATION_MS);
  return 100 + Math.round((50 * remaining) / QUESTION_DURATION_MS);
}
