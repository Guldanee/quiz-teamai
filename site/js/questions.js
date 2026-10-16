// Copie exacte de questions.md (un test vérifie la correspondance).
export const QUESTIONS = [
  {
    theme: 'Plugins',
    text: "Qu'est-ce qu'un plugin pour une IA comme Claude ?",
    answers: [
      'Une extension de navigateur',
      'Un ensemble de skills et de connecteurs',
      "Un modèle d'IA plus puissant",
      "Un antivirus pour l'IA",
    ],
    correctIndex: 1,
    explanation: 'un plugin regroupe des skills (savoir-faire) et des connecteurs (accès à des outils) dans un seul paquet.',
  },
  {
    theme: 'MCP',
    text: 'À quoi sert un connecteur MCP ?',
    answers: [
      "À rendre l'IA plus rapide",
      "À traduire les réponses de l'IA",
      "À connecter l'IA à des outils externes comme Jira ou GitHub",
      "À réduire le prix de l'abonnement",
    ],
    correctIndex: 2,
    explanation: "le MCP (Model Context Protocol) permet à l'IA de lire et d'agir dans d'autres applications.",
  },
  {
    theme: 'RAG',
    text: 'Que fait une IA qui utilise le RAG ?',
    answers: [
      "Elle va chercher l'information dans des documents qu'on lui fournit",
      'Elle génère des images',
      "Elle répond uniquement avec ce qu'elle a appris pendant son entraînement",
      "Elle refuse de répondre si elle n'est pas sûre",
    ],
    correctIndex: 0,
    explanation: 'Retrieval Augmented Generation = génération augmentée par la recherche dans des documents.',
  },
  {
    theme: 'Température',
    text: "Si on baisse la température d'une IA, ses réponses sont…",
    answers: [
      'Plus créatives mais moins fiables',
      'Plus longues',
      'Plus sûres mais moins originales',
      'Plus rapides',
    ],
    correctIndex: 2,
    explanation: "une température faible rend l'IA plus prévisible et prudente, mais moins inventive.",
  },
  {
    theme: 'Hallucinations',
    text: "Selon l'effet « Lost in the middle », quand le contexte donné à l'IA est très long…",
    answers: [
      "L'IA devient plus précise",
      "L'IA risque d'oublier des informations et d'halluciner",
      "L'IA refuse de répondre",
      "Ça n'a aucun effet",
    ],
    correctIndex: 1,
    explanation: "l'IA retient mieux le début et la fin d'un long contexte ; ce qui est au milieu se perd.",
  },
  {
    theme: 'Données sensibles',
    text: 'Quelle est la bonne pratique pour faire travailler une IA sur une base de données sensible ?',
    answers: [
      'Lui donner la vraie base, elle est confidentielle',
      'Lui donner seulement les mots de passe',
      "Ne jamais utiliser d'IA en entreprise",
      'Lui donner une fausse base anonymisée, ou filtrer les colonnes sensibles',
    ],
    correctIndex: 3,
    explanation: "l'IA ne doit jamais voir les vraies données personnelles : on anonymise ou on filtre avant.",
  },
  {
    theme: 'Rôles agiles (question du switch)',
    text: "Dans la démo, qui a fait le travail du Product Owner, du développeur, du testeur et de l'ops ?",
    answers: [
      "Toute l'équipe TeamAI",
      'Un développeur senior',
      "L'IA, pilotée par une seule personne",
      "Personne, l'appli existait déjà",
    ],
    correctIndex: 2,
    explanation: "l'IA a pris en charge une partie de chaque rôle… mais un humain a dû piloter et vérifier. Alors, comment les rôles agiles évoluent-ils ?",
  },
];
