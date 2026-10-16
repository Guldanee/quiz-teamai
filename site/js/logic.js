export const QUESTION_DURATION_MS = 20000;
export const MAX_PSEUDO_LENGTH = 15;
// La question suivante démarre 400 ms après « Question suivante » : un double toucher tombe dans ce délai.
export const DOUBLE_TAP_MS = 400;

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

// Message de fin selon le nombre de bonnes réponses (textes validés par la PO).
export function messageFor(correctCount) {
  if (correctCount <= 2) {
    return { message: "Pas de panique : même les IA hallucinent parfois ! Revois l'exposé, tu feras mieux la prochaine fois.", extra: null };
  }
  if (correctCount <= 5) return { message: "Joli score ! Tu as suivi l'essentiel de l'exposé.", extra: null };
  return {
    message: "Impressionnant ! Tu maîtrises l'IA générative et l'agilité.",
    extra: correctCount === 7 ? "Lève la main quand l'animatrice demande qui a eu 7/7 !" : null,
  };
}

// Empreinte du contenu des questions (hachage djb2) : change dès qu'un caractère change.
export function quizVersion(questions) {
  const text = JSON.stringify(questions);
  let hash = 5381;
  for (let i = 0; i < text.length; i++) hash = ((hash * 33) ^ text.charCodeAt(i)) >>> 0;
  return hash.toString(36);
}
