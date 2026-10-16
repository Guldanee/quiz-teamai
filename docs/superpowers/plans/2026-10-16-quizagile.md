# QuizAgile — plan de construction

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal :** mettre en ligne ce soir sur GitHub Pages un quiz mobile d'une seule page (7 questions, 20 s, score, reprise après rechargement, une partie par téléphone), couvert par des tests automatiques nommés d'après les stories Jira.

**Architecture :** site statique dans `site/` (HTML + CSS + modules JavaScript natifs, sans framework ni compilation). La logique est pure et testée sous Node : `logic.js` (calculs), `game.js` (machine à états de la partie) et `store.js` (sauvegarde). `app.js` relie cette logique à la page. Les parcours sont testés dans de vrais moteurs de navigateur avec Playwright (WebKit pour iPhone, Chromium pour Android). Un workflow GitHub Actions lance les tests sur chaque demande de fusion et sur `main`, et ne déploie `site/` que si tout passe.

**Tech Stack :** HTML/CSS/JS (modules ES), Node.js 22 (`node --test`), `@playwright/test@1.48.2` (dépendance de développement uniquement), GitHub Actions et GitHub Pages, `gh`, connecteur Jira (MCP Atlassian).

**Spec :** `docs/superpowers/specs/2026-10-16-quizagile-design.md`. Lisez-la avant de commencer. La section 4 décrit les écrans, la 5 le score, la 6 la reprise et l'annexe 13 les critères Jira mot pour mot.

## Global Constraints

- **Aucune requête réseau** hors de l'origine du site : pas de police externe, pas de CDN, pas de statistiques. Polices système uniquement.
- Les fichiers publiés sont uniquement le contenu de `site/`. Pas d'étape de compilation : ce qui est dans `site/` est servi tel quel.
- Écran de 360 px de large sans défilement horizontal. Boutons d'au moins 48 px de haut.
- Le pseudo est toujours inséré avec `textContent`, jamais avec `innerHTML`. Aucun `innerHTML` construit à partir d'une donnée du joueur.
- Durée d'une question : `20000` ms. Pseudo : `15` caractères au maximum.
- Score d'une bonne réponse : `100 + Math.round(50 × restantMs / 20000)`, avec `restantMs` borné entre 0 et 20000. Mauvaise réponse ou temps écoulé : `0`.
- Textes de l'interface (exacts) : « QuizAgile », « IA générative et pratiques agiles », « Jouer », « Choisis un pseudo pour jouer. », « Question N/7 », « Score : X », « N s », « Bonne réponse », « Mauvaise réponse », « Temps écoulé », « +P », « Question suivante », « Voir mon score », « X/7 », « bonnes réponses », « S points », « Une seule partie par joueur — merci d'avoir joué ».
- Messages de fin (exacts, validés par la PO) :
  - 0–2 : « Pas de panique : même les IA hallucinent parfois ! Revois l'exposé, tu feras mieux la prochaine fois. »
  - 3–5 : « Joli score ! Tu as suivi l'essentiel de l'exposé. »
  - 6–7 : « Impressionnant ! Tu maîtrises l'IA générative et l'agilité. » et, pour 7/7 seulement, une seconde ligne : « Lève la main quand l'animatrice demande qui a eu 7/7 ! »
- Couleurs des réponses, identiques en mode clair et sombre, avec du texte blanc : A `#be123c`, B `#1d4ed8`, C `#b45309`, D `#15803d`. Le mode sombre suit `prefers-color-scheme`.
- Chaque test porte dans son nom le numéro de story qu'il prouve (ex. `US-2 · …`). Les tests du socle commencent par `Socle ·` et ceux de la reprise par `Reprise ·`.
- Adresse en ligne : `https://guldanee.github.io/quiz-teamai/`. Jira : cloudId `c813aa3f-0660-47b7-b79e-557ee3d156bd`, transition `31` = « En cours », `51` = « Terminé(e) ».

## Cycle commun à chaque tâche (sauf mention contraire)

1. `git switch main && git pull && git switch -c <branche>`.
2. Si la tâche a un ticket Jira, appeler `transitionJiraIssue` (cloudId ci-dessus, `transitionId: "31"`) sur ce ticket.
3. Suivre les étapes de la tâche (test qui échoue, code, test qui passe).
4. Lancer `npm test`. Attendu : 0 échec, sur les tests unitaires comme sur les deux projets Playwright `iphone` et `android`.
5. `git push -u origin <branche>`, puis `gh pr create --fill --base main`. Le corps de la demande se termine par la ligne d'attribution `🤖 Generated with [Claude Code](https://claude.com/claude-code)`.
6. `gh pr checks --watch`. Attendu : le job `tests` est vert.
7. Faire la relecture de code. Une fois approuvée : `gh pr merge --merge --delete-branch`.
8. `gh run watch $(gh run list --branch main --limit 1 --json databaseId -q '.[0].databaseId')`. Attendu : les jobs `tests` et `deploy` sont verts. Ensuite, `curl -s -o /dev/null -w '%{http_code}' https://guldanee.github.io/quiz-teamai/` doit répondre `200`.
9. Si la tâche a un ticket Jira, appeler `transitionJiraIssue` avec `transitionId: "51"`.

Chaque message de commit se termine par `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

Si un test écrit dans une tâche passe dès le premier lancement parce que le socle couvre déjà le comportement, on le garde comme preuve du critère Jira. On le note dans le message de commit et on passe à la suite.

## Review Focus

1. **Double toucher ou deux réponses touchées très vite** : seule la première compte (une seule entrée dans `answers`, score inchangé au second toucher). → test dans la Tâche 3.
2. **Téléphone en veille ou onglet en arrière-plan pendant une question** (les minuteries du navigateur sont alors ralenties ou suspendues) : au retour, le temps restant est recalculé à partir de l'heure de début. Au-delà de 20 s, la question est comptée fausse avec « Temps écoulé ». → test dans la Tâche 6.
3. **Stockage du navigateur bloqué ou qui lève une erreur** (navigation privée de certains Safari, réglages stricts) : le quiz se joue normalement, simplement sans reprise. → tests dans la Tâche 6.
4. **Sauvegarde abîmée ou d'une ancienne version des questions** : on revient à l'accueil sans plantage. → tests dans la Tâche 6.
5. **Textes longs sur un écran de 360 px** (réponses de la Q6, explication de la Q7, pseudo de 15 caractères larges comme `WWWWWWWWWWWWWWW`) : retour à la ligne sans aucun défilement horizontal, sur les 7 questions et sur l'écran final. → test dans la Tâche 8.

---

## Structure des fichiers

| Fichier | Rôle |
|---|---|
| `site/index.html` | La page unique : écrans `#screen-home`, `#screen-quiz`, `#screen-final`. |
| `site/style.css` | Mise en page mobile, couleurs, mode sombre. |
| `site/js/questions.js` | `QUESTIONS`, copie exacte de `questions.md`. |
| `site/js/logic.js` | Constantes et fonctions pures : score, pseudo, messages, version du quiz. |
| `site/js/game.js` | Machine à états pure de la partie. |
| `site/js/store.js` | Lecture et écriture de la partie dans le stockage, sans jamais planter. |
| `site/js/app.js` | Liaison avec la page : affichage, clics, minuterie, sauvegarde. |
| `site/favicon.svg` | Icône (évite une requête 404). |
| `tests/unit/*.test.js` | Tests Node (`node --test`). |
| `tests/e2e/*.spec.js`, `tests/e2e/helpers.js` | Tests Playwright. |
| `tests/serve.mjs` | Petit serveur statique Node (port 4173) qui sert `site/` pour Playwright. |
| `playwright.config.js`, `package.json`, `package-lock.json` | Outillage de test. |
| `.github/workflows/deploy.yml` | Tests, puis déploiement. |
| `qr-code.png` | QR code de l'adresse en ligne, pour la diapositive (non publié). |

### Interfaces partagées (référence pour toutes les tâches)

```js
// site/js/questions.js
export const QUESTIONS; // Array<{ theme: string, text: string, answers: [string,string,string,string], correctIndex: 0|1|2|3, explanation: string }>

// site/js/logic.js
export const QUESTION_DURATION_MS = 20000;
export const MAX_PSEUDO_LENGTH = 15;
export function pointsFor(correct: boolean, remainingMs: number): number;
export function sanitizePseudo(raw: string): string;          // Tâche 2
export function isValidPseudo(clean: string): boolean;        // Tâche 2
export function messageFor(correctCount: number): { message: string, extra: string | null }; // Tâche 5
export function quizVersion(questions): string;               // Tâche 6

// site/js/game.js
// GameState = { version: string, pseudo: string, index: number /*0..6*/, phase: 'question'|'feedback'|'final',
//               questionStartedAt: number /*ms epoch*/, answers: Array<{ choice: number|null, correct: boolean, points: number, timedOut: boolean }>, score: number }
export function newGame(pseudo: string, now: number, version: string): GameState;
export function remainingMs(state: GameState, now: number): number;   // borné entre 0 et 20000
export function answer(state, questions, choice: number, now: number): GameState; // même objet renvoyé si phase ≠ 'question'
export function timeout(state, questions): GameState;                 // même objet renvoyé si phase ≠ 'question'
export function next(state, now: number): GameState;                  // feedback → question suivante, ou 'final' après l'index 6
export function correctCount(state): number;

// site/js/store.js — Tâche 6
export const STORAGE_KEY = 'quizagile';
export function loadGame(storage: Storage|null, version: string): GameState | null;
export function saveGame(storage: Storage|null, state: GameState): void;
```

Les fonctions de `game.js` ne modifient jamais l'état reçu : elles renvoient un nouvel objet.

### Repères dans la page (utilisés par les tests e2e)

`#screen-home`, `#pseudo-input` (`maxlength="15"`), `#play-button`, `#pseudo-error` · `#screen-quiz`, `#progress-label`, `#progress-bar` (`<progress max="7">`), `#timer`, `#score-label`, `#question-text`, `.answer-button[data-index="0..3"]` (contenant `.letter` A–D et `.label`), `#feedback` (masqué pendant la question), `#feedback-title`, `#feedback-points`, `#feedback-timeout`, `#feedback-explanation`, `#next-button` · `#screen-final`, `#final-pseudo`, `#final-correct`, `#final-score`, `#final-message`, `#final-extra`. Un seul écran est visible à la fois (attribut `hidden` sur les deux autres).

---

### Tâche 1 : Socle en ligne (chaîne de déploiement et quiz jouable minimal)

Branche `socle`. Ticket : SCRUM-10 (US-6) passe « En cours » à l'étape 2 du cycle, mais il ne passe **pas** « Terminé » ici (ce sera à la Tâche 8).

**Files :**
- Create : `package.json`, `package-lock.json`, `playwright.config.js`, `tests/serve.mjs`, `.github/workflows/deploy.yml`
- Create : `site/index.html`, `site/style.css`, `site/favicon.svg`, `site/js/questions.js`, `site/js/logic.js`, `site/js/game.js`, `site/js/app.js`
- Create : `qr-code.png`
- Test : `tests/unit/logic.test.js`, `tests/unit/game.test.js`, `tests/e2e/helpers.js`, `tests/e2e/socle.spec.js`

**Interfaces :**
- Produit : `QUESTIONS`, `QUESTION_DURATION_MS`, `MAX_PSEUDO_LENGTH`, `pointsFor`, et tout `game.js` (voir Interfaces partagées). Dans `tests/e2e/helpers.js` : `startGame(page, pseudo = 'Lou42')` (qui fait `page.goto('/')`, remplit le pseudo et clique « Jouer ») et `freezeClock(page)` (`page.clock.install({ time: T0 })` puis `page.clock.pauseAt(T0 + 1000)`, avec `T0 = new Date('2026-10-17T10:00:00')` : le temps ne s'écoule plus que par `page.clock.fastForward`, à appeler avant `page.goto`), et `answerAll(page, pick)`, où `pick(questionIndex) → index du bouton` pour chacune des 7 questions, avec clic sur `#next-button` après chaque réponse.

- [ ] **Étape 0 : publier la conception sur le dépôt vide (directement sur `main`, avant le cycle)**

```bash
git remote add origin https://github.com/Guldanee/quiz-teamai.git
git push -u origin main
```
Attendu : `gh repo view Guldanee/quiz-teamai --json defaultBranchRef -q .defaultBranchRef.name` affiche `main`.

- [ ] **Étape 1 : outillage**

`package.json` : `"type": "module"`, `"private": true`, devDependency `"@playwright/test": "1.48.2"`, scripts `"test:unit": "node --test tests/unit/"`, `"test:e2e": "playwright test"`, `"test": "npm run test:unit && npm run test:e2e"`. Lancer `npm install`, puis `npx playwright install chromium webkit`.

`tests/serve.mjs` : serveur `node:http` qui sert les fichiers de `site/` sur le port 4173, avec `/` → `index.html` et les types MIME `.html .css .js .svg .png`. Il répond 404 sinon et refuse tout chemin contenant `..`.

`playwright.config.js` :
```js
import { defineConfig, devices } from '@playwright/test';
const phone = { viewport: { width: 360, height: 740 } };
export default defineConfig({
  testDir: 'tests/e2e',
  use: { baseURL: 'http://localhost:4173' },
  webServer: { command: 'node tests/serve.mjs', url: 'http://localhost:4173', reuseExistingServer: !process.env.CI },
  projects: [
    { name: 'iphone', use: { ...devices['iPhone 13'], ...phone } },   // WebKit = moteur de Safari
    { name: 'android', use: { ...devices['Pixel 5'], ...phone } },    // Chromium
  ],
});
```

`.github/workflows/deploy.yml` :
```yaml
name: Tests et mise en ligne
on:
  push:
    branches: [main]
  pull_request:
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npx playwright install --with-deps chromium webkit
      - run: npm test
  deploy:
    if: github.event_name == 'push'
    needs: tests
    runs-on: ubuntu-latest
    concurrency: { group: pages, cancel-in-progress: false }
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with: { path: site }
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Étape 2 : écrire les tests unitaires qui échouent**

`tests/unit/logic.test.js` :
```js
test('Socle · pointsFor : 150 au maximum, 100 au minimum, 0 si faux', () => {
  assert.equal(pointsFor(true, 20000), 150);
  assert.equal(pointsFor(true, 13400), 134);   // exemple de la spec : 100 + arrondi(33,5)
  assert.equal(pointsFor(true, 0), 100);
  assert.equal(pointsFor(true, -50), 100);
  assert.equal(pointsFor(true, 25000), 150);
  assert.equal(pointsFor(false, 15000), 0);
});
```
`tests/unit/game.test.js` (avec `QUESTIONS[0].correctIndex === 1`) :
```js
test('Socle · newGame démarre la question 1', () => {
  assert.deepEqual(newGame('Lou', 1000, 'v1'), { version: 'v1', pseudo: 'Lou', index: 0, phase: 'question', questionStartedAt: 1000, answers: [], score: 0 });
});
test('Socle · bonne réponse avec 13,4 s restantes = 134 points', () => {
  const s = answer(newGame('Lou', 0, 'v1'), QUESTIONS, 1, 6600);
  assert.equal(s.phase, 'feedback'); assert.equal(s.score, 134);
  assert.deepEqual(s.answers[0], { choice: 1, correct: true, points: 134, timedOut: false });
});
test('Socle · mauvaise réponse = 0 point', () => {
  assert.equal(answer(newGame('Lou', 0, 'v1'), QUESTIONS, 0, 1000).answers[0].points, 0);
});
test('Socle · réponse après 20 s comptée comme temps écoulé', () => {
  assert.deepEqual(answer(newGame('Lou', 0, 'v1'), QUESTIONS, 1, 20000).answers[0], { choice: null, correct: false, points: 0, timedOut: true });
});
test('Socle · timeout compte la question fausse', () => {
  const s = timeout(newGame('Lou', 0, 'v1'), QUESTIONS);
  assert.equal(s.phase, 'feedback'); assert.equal(s.answers[0].timedOut, true); assert.equal(s.score, 0);
});
test('Socle · answer et timeout ignorés hors phase question', () => {
  const s = answer(newGame('Lou', 0, 'v1'), QUESTIONS, 1, 0);
  assert.equal(answer(s, QUESTIONS, 0, 10), s); assert.equal(timeout(s, QUESTIONS), s);
});
test('Socle · next passe à la question suivante puis à l’écran final', () => {
  let s = next(answer(newGame('Lou', 0, 'v1'), QUESTIONS, 1, 0), 5000);
  assert.equal(s.phase, 'question'); assert.equal(s.index, 1); assert.equal(s.questionStartedAt, 5000);
  for (let i = 1; i < 7; i++) s = next(answer(s, QUESTIONS, QUESTIONS[i].correctIndex, s.questionStartedAt), s.questionStartedAt + 1);
  assert.equal(s.phase, 'final'); assert.equal(correctCount(s), 7); assert.equal(s.index, 6);
});
test('Socle · remainingMs borné entre 0 et 20000', () => {
  const s = newGame('Lou', 1000, 'v1');
  assert.equal(remainingMs(s, 1000), 20000); assert.equal(remainingMs(s, 15000), 6000); assert.equal(remainingMs(s, 99000), 0);
});
test('Socle · answer ne modifie pas l’état reçu', () => {
  const s = newGame('Lou', 0, 'v1'); answer(s, QUESTIONS, 1, 0);
  assert.equal(s.phase, 'question'); assert.deepEqual(s.answers, []);
});
```

- [ ] **Étape 3 : `npm run test:unit`**. Attendu : ÉCHEC, modules introuvables.

- [ ] **Étape 4 : implémenter `site/js/questions.js`, `site/js/logic.js` (constantes et `pointsFor`) et `site/js/game.js`**

`QUESTIONS` reprend mot pour mot les 7 questions de `questions.md`. `theme` correspond au mot après « Q1 — » (ex. `'Plugins'`, `'Rôles agiles (question du switch)'`), `text` est l'énoncé entre `**`, `answers` sont les 4 réponses dans l'ordre, sans le `✅`, `correctIndex` est la position du `✅`, et `explanation` est le texte après « Explication : », sans les `*`.

- [ ] **Étape 5 : `npm run test:unit`**. Attendu : tous les tests passent.

- [ ] **Étape 6 : écrire le test e2e qui échoue, `tests/e2e/socle.spec.js`**

```js
test('Socle · on joue les 7 questions jusqu’à l’écran final', async ({ page }) => {
  await freezeClock(page); // le temps ne s'écoule pas : 150 points par bonne réponse
  await startGame(page);
  await expect(page.locator('#progress-label')).toHaveText('Question 1/7');
  await answerAll(page, i => QUESTIONS[i].correctIndex);
  await expect(page.locator('#screen-final')).toBeVisible();
  await expect(page.locator('#final-correct')).toHaveText('7/7');
  await expect(page.locator('#final-score')).toHaveText('1050 points');
});
```

- [ ] **Étape 7 : `npx playwright test tests/e2e/socle.spec.js`**. Attendu : ÉCHEC, la page n'existe pas.

- [ ] **Étape 8 : implémenter `site/index.html`, `site/style.css`, `site/favicon.svg` et `site/js/app.js`**

`index.html` : `lang="fr"`, `<meta name="viewport" content="width=device-width, initial-scale=1">`, `<link rel="icon" href="favicon.svg">`, `<script type="module" src="js/app.js">`, et les repères listés plus haut avec les textes exacts des Global Constraints. L'écran final contient le libellé « bonnes réponses » sous `#final-correct` et le pied de page « Une seule partie par joueur — merci d'avoir joué ».

`app.js` garde l'état dans une variable `state` : `null` pour l'accueil, sinon un `GameState`. Le pseudo est pour l'instant `input.value.trim()`, refusé s'il est vide (affiche `#pseudo-error`). Il sera remplacé à la Tâche 2. Une fonction `render()` affiche l'écran selon `state.phase`, avec `#feedback` masqué en phase question. Une minuterie `setInterval(tick, 250)` met à jour `#timer` (`Math.ceil(remainingMs/1000) + ' s'`) et appelle `timeout` quand `remainingMs` vaut 0. Un clic sur `.answer-button` appelle `answer` avec `Date.now()`, puis désactive les 4 boutons. `#next-button` appelle `next`. Le texte de `#feedback-title` est « Bonne réponse » ou « Mauvaise réponse », celui de `#feedback-points` est `+${points}` et `#feedback-explanation` reçoit l'explication. Le libellé de `#next-button` est « Question suivante », ou « Voir mon score » sur la 7e question. Tous les textes issus des données sont posés avec `textContent`.

`style.css` : une colonne, `max-width: 480px`, marges latérales de 16 px, boutons de réponse de `min-height: 56px` avec les 4 couleurs des Global Constraints, `overflow-wrap: anywhere` sur les textes, polices système.

- [ ] **Étape 9 : `npm test`**. Attendu : tous les tests unitaires passent, ainsi que `socle.spec.js` sur `iphone` et `android`.

- [ ] **Étape 10 : générer le QR code**

```bash
npx --yes qrcode@1.5.4 -w 1024 -o qr-code.png "https://guldanee.github.io/quiz-teamai/"
```
Attendu : le fichier `qr-code.png` existe. Il est à la racine, hors de `site/`, et n'est pas publié.

- [ ] **Étape 11 : commit, puis étapes 5 à 8 du cycle commun.** Message : `Socle : chaîne de déploiement et quiz jouable minimal`. Après le déploiement, signaler à la PO que la version minimale est en ligne et que le QR code est prêt dans `qr-code.png`.

---

### Tâche 2 : US-1 · Rejoindre le quiz et choisir un pseudo (SCRUM-5)

Branche `us-1-pseudo`.

**Files :** Modify `site/js/logic.js`, `site/js/app.js` · Test `tests/unit/pseudo.test.js`, `tests/e2e/us1.spec.js`

**Interfaces :** Produit `sanitizePseudo(raw) → string` (retire les balises `<…>`, puis tout `<` ou `>` restant, enlève les espaces au début et à la fin, coupe à 15 caractères) et `isValidPseudo(clean) → boolean` (vrai si la chaîne n'est pas vide). `app.js` remplace son `trim()` provisoire par ces deux fonctions.

- [ ] **Étape 1 : tests unitaires qui échouent**
```js
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
```
- [ ] **Étape 2 : `npm run test:unit`**. Attendu : ÉCHEC, `sanitizePseudo` n'est pas exportée.
- [ ] **Étape 3 : implémenter les deux fonctions et les brancher dans `app.js`.**
- [ ] **Étape 4 : tests e2e dans `tests/e2e/us1.spec.js`**
```js
test('US-1 · l’accueil affiche QuizAgile et le bouton Jouer', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toHaveText('QuizAgile');
  await expect(page.locator('#play-button')).toHaveText('Jouer');
});
test('US-1 · la saisie du pseudo est limitée à 15 caractères', async ({ page }) => {
  await page.goto('/'); await page.locator('#pseudo-input').pressSequentially('a'.repeat(20));
  await expect(page.locator('#pseudo-input')).toHaveValue('a'.repeat(15));
});
test('US-1 · un pseudo vide est refusé', async ({ page }) => {
  await page.goto('/'); await page.locator('#pseudo-input').fill('   '); await page.locator('#play-button').click();
  await expect(page.locator('#pseudo-error')).toBeVisible(); await expect(page.locator('#screen-home')).toBeVisible();
});
test('US-1 · un pseudo avec du code ne s’exécute pas', async ({ page }) => {
  await freezeClock(page);
  await startGame(page, '<img src=x onerror="window.__pwned=1">Lou');
  await answerAll(page, () => 0);
  await expect(page.locator('#final-pseudo')).toHaveText('Lou');
  expect(await page.evaluate(() => window.__pwned)).toBeUndefined();
});
```
Attention : `maxlength=15` coupe la saisie du dernier test avant le filtrage. Le test utilise donc `fill` dans `startGame`, qui contourne `maxlength`, et `sanitizePseudo` s'applique à la valeur complète.
- [ ] **Étape 5 : `npm test`**. Attendu : tous les tests passent.
- [ ] **Étape 6 : commit `US-1 : filtrage et validation du pseudo`, puis cycle commun (étapes 5 à 9).**

---

### Tâche 3 : US-2 · Répondre aux questions en 20 secondes (SCRUM-6)

Branche `us-2-questions`.

**Files :** Modify `site/index.html`, `site/style.css`, `site/js/app.js` · Test `tests/e2e/us2.spec.js`

**Interfaces :** Consomme les repères de page et `startGame`. Ne produit rien de nouveau.

- [ ] **Étape 1 : tests e2e** (`test.beforeEach` : `await freezeClock(page); await startGame(page);`)
```js
test('US-2 · 4 gros boutons de couleurs différentes, lettres A à D', async ({ page }) => {
  const buttons = page.locator('.answer-button');
  await expect(buttons).toHaveCount(4);
  const colors = await buttons.evaluateAll(bs => bs.map(b => getComputedStyle(b).backgroundColor));
  expect(new Set(colors).size).toBe(4);
  await expect(page.locator('.answer-button .letter')).toHaveText(['A', 'B', 'C', 'D']);
  for (const b of await buttons.all()) expect((await b.boundingBox()).height).toBeGreaterThanOrEqual(48);
});
test('US-2 · indicateur Question N/7 et barre de progression', async ({ page }) => {
  await expect(page.locator('#progress-label')).toHaveText('Question 1/7');
  await expect(page.locator('#progress-bar')).toHaveAttribute('value', '1');
  await page.locator('.answer-button').first().click(); await page.locator('#next-button').click();
  await expect(page.locator('#progress-label')).toHaveText('Question 2/7');
  await expect(page.locator('#progress-bar')).toHaveAttribute('value', '2');
});
test('US-2 · toucher une réponse bloque les boutons et arrête le chronomètre', async ({ page }) => {
  await page.clock.fastForward(6000);
  await expect(page.locator('#timer')).toHaveText('14 s');
  await page.locator('.answer-button').nth(1).click();
  for (const b of await page.locator('.answer-button').all()) await expect(b).toBeDisabled();
  await page.clock.fastForward(5000);
  await expect(page.locator('#timer')).toHaveText('14 s');
});
test('US-2 · deux touchers rapides : seule la première réponse compte', async ({ page }) => {
  await page.locator('.answer-button').nth(1).click();            // bonne réponse de Q1
  await page.locator('.answer-button').nth(0).click({ force: true });
  await expect(page.locator('#feedback-title')).toHaveText('Bonne réponse');
  await expect(page.locator('#score-label')).toHaveText('Score : 150');
});
test('US-2 · à zéro sans réponse, la question est comptée fausse', async ({ page }) => {
  await page.clock.fastForward(20000);
  await expect(page.locator('#feedback-title')).toHaveText('Mauvaise réponse');
  await expect(page.locator('#score-label')).toHaveText('Score : 0');
});
for (const scheme of ['light', 'dark']) test(`US-2 · lisible en mode ${scheme === 'dark' ? 'sombre' : 'clair'}`, async ({ page }) => {
  await page.emulateMedia({ colorScheme: scheme });
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  const [r, g, b] = bg.match(/\d+/g).map(Number);
  const lum = (r + g + b) / 3;
  expect(scheme === 'dark' ? lum < 60 : lum > 200).toBe(true);
  await expect(page.locator('.answer-button .label').first()).toHaveCSS('color', 'rgb(255, 255, 255)');
});
```
- [ ] **Étape 2 : `npx playwright test tests/e2e/us2.spec.js`**. Attendu : ÉCHEC au moins sur les lettres et le mode sombre.
- [ ] **Étape 3 : implémenter** les lettres `.letter` dans les boutons, `@media (prefers-color-scheme: dark)` (fond de page sombre, fond de page clair sinon) et le `<progress>` mis à jour à `index + 1`. Ajouter aussi la garde dans le gestionnaire de clic : on n'appelle `answer` que si `state.phase === 'question'`.
- [ ] **Étape 4 : `npm test`**. Attendu : tous les tests passent.
- [ ] **Étape 5 : commit `US-2 : boutons, progression, chronomètre et mode sombre`, puis cycle commun.**

---

### Tâche 4 : US-3 · Feedback immédiat (SCRUM-7)

Branche `us-3-feedback`.

**Files :** Modify `site/js/app.js`, `site/style.css` · Test `tests/e2e/us3.spec.js`

**Interfaces :** Ajoute aux boutons les classes `.is-correct` (bonne réponse), `.is-wrong-choice` (mauvais choix du joueur) et `.is-dimmed` (toutes les autres). `#feedback-timeout` n'est visible que si `timedOut`.

- [ ] **Étape 1 : tests e2e** (`test.beforeEach` : `await freezeClock(page); await startGame(page);`. Q1 a `correctIndex = 1`.)
```js
test('US-3 · bonne réponse : « Bonne réponse » et explication', async ({ page }) => {
  await page.locator('.answer-button').nth(1).click();
  await expect(page.locator('#feedback-title')).toHaveText('Bonne réponse');
  await expect(page.locator('#feedback-explanation')).toHaveText(QUESTIONS[0].explanation);
  await expect(page.locator('.answer-button').nth(1)).toHaveClass(/is-correct/);
  await expect(page.locator('#feedback-timeout')).toBeHidden();
});
test('US-3 · mauvaise réponse : bonne réponse mise en évidence', async ({ page }) => {
  await page.locator('.answer-button').nth(0).click();
  await expect(page.locator('#feedback-title')).toHaveText('Mauvaise réponse');
  await expect(page.locator('.answer-button').nth(1)).toHaveClass(/is-correct/);
  await expect(page.locator('.answer-button').nth(0)).toHaveClass(/is-wrong-choice/);
  await expect(page.locator('.answer-button').nth(2)).toHaveClass(/is-dimmed/);
  await expect(page.locator('#feedback-explanation')).toHaveText(QUESTIONS[0].explanation);
});
test('US-3 · temps écoulé : Mauvaise réponse, Temps écoulé, bonne réponse en évidence', async ({ page }) => {
  await page.clock.fastForward(20000);
  await expect(page.locator('#feedback-title')).toHaveText('Mauvaise réponse');
  await expect(page.locator('#feedback-timeout')).toHaveText('Temps écoulé');
  await expect(page.locator('.answer-button').nth(1)).toHaveClass(/is-correct/);
});
test('US-3 · « Question suivante » puis « Voir mon score » à la 7e', async ({ page }) => {
  for (let i = 0; i < 7; i++) {
    await page.locator('.answer-button').first().click();
    await expect(page.locator('#next-button')).toHaveText(i < 6 ? 'Question suivante' : 'Voir mon score');
    await page.locator('#next-button').click();
  }
  await expect(page.locator('#screen-final')).toBeVisible();
});
```
- [ ] **Étape 2 : lancer le fichier**. Attendu : ÉCHEC sur les classes et sur « Temps écoulé ».
- [ ] **Étape 3 : implémenter les classes**, puis dans `style.css` : `.is-dimmed { opacity: .35 }` et `.is-correct { outline: 4px solid currentColor }` (un contour bien visible). `.is-wrong-choice` reste à pleine opacité, sans contour.
- [ ] **Étape 4 : `npm test`**. Attendu : tous les tests passent.
- [ ] **Étape 5 : commit `US-3 : mise en évidence et temps écoulé`, puis cycle commun.**

---

### Tâche 5 : US-4 · Score et écran final (SCRUM-8)

Branche `us-4-score`.

**Files :** Modify `site/js/logic.js`, `site/js/app.js` · Test `tests/unit/message.test.js`, `tests/e2e/us4.spec.js`

**Interfaces :** Produit `messageFor(n) → { message, extra }` avec les textes exacts des Global Constraints. `extra` vaut la phrase « Lève la main… » si `n === 7`, et `null` sinon. `app.js` remplit `#final-message` et `#final-extra` (masqué quand `extra === null`).

- [ ] **Étape 1 : tests unitaires**
```js
test('US-4 · message selon le palier', () => {
  for (const n of [0, 2]) assert.equal(messageFor(n).message, 'Pas de panique : même les IA hallucinent parfois ! Revois l\'exposé, tu feras mieux la prochaine fois.');
  for (const n of [3, 5]) assert.equal(messageFor(n).message, 'Joli score ! Tu as suivi l\'essentiel de l\'exposé.');
  for (const n of [6, 7]) assert.equal(messageFor(n).message, 'Impressionnant ! Tu maîtrises l\'IA générative et l\'agilité.');
});
test('US-4 · phrase « Lève la main » seulement pour 7/7', () => {
  assert.equal(messageFor(7).extra, 'Lève la main quand l\'animatrice demande qui a eu 7/7 !');
  assert.equal(messageFor(6).extra, null);
});
```
- [ ] **Étape 2 : tests e2e**
```js
test('US-4 · bonus de rapidité : réponse juste à 13,4 s restantes = +134', async ({ page }) => {
  await freezeClock(page); await startGame(page);
  await page.clock.fastForward(6600); await page.locator('.answer-button').nth(1).click();
  await expect(page.locator('#feedback-points')).toHaveText('+134');
});
test('US-4 · écran final : pseudo, score, X/7 et message', async ({ page }) => {
  await freezeClock(page); await startGame(page, 'Lou42');
  await answerAll(page, i => (i < 4 ? QUESTIONS[i].correctIndex : (QUESTIONS[i].correctIndex + 1) % 4));
  await expect(page.locator('#final-pseudo')).toHaveText('Lou42');
  await expect(page.locator('#final-correct')).toHaveText('4/7');
  await expect(page.locator('#final-score')).toHaveText('600 points');
  await expect(page.locator('#final-message')).toHaveText('Joli score ! Tu as suivi l\'essentiel de l\'exposé.');
  await expect(page.locator('#final-extra')).toBeHidden();
  await expect(page.getByText('Rejouer')).toHaveCount(0);
});
```
- [ ] **Étape 3 : lancer les deux fichiers**. Attendu : ÉCHEC, `messageFor` n'existe pas.
- [ ] **Étape 4 : implémenter `messageFor`** et le remplissage de l'écran final.
- [ ] **Étape 5 : `npm test`**. Attendu : tous les tests passent.
- [ ] **Étape 6 : commit `US-4 : messages de fin et écran final`, puis cycle commun.**

---

### Tâche 6 : Reprise après rechargement et partie unique (spec §6, pas de ticket Jira)

Branche `reprise`. Pas de transition Jira.

**Files :** Create `site/js/store.js` · Modify `site/js/logic.js`, `site/js/app.js` · Test `tests/unit/store.test.js`, `tests/e2e/reprise.spec.js`

**Interfaces :**
- Produit `quizVersion(questions) → string`, une empreinte stable du contenu (ex. hachage djb2 de `JSON.stringify(questions)` en base 36). Elle change dès qu'un caractère des questions change.
- Produit `loadGame(storage, version)` : lit `STORAGE_KEY` et renvoie `null` si `storage` vaut `null`, si la lecture lève une erreur, si le JSON est invalide, si `version` diffère, si `phase` est hors de `question|feedback|final`, si `index` n'est pas un entier de 0 à 6, ou si `answers` n'est pas un tableau.
- Produit `saveGame(storage, state)` : écrit le JSON et ne lève jamais d'erreur.
- `app.js` obtient le stockage par une fonction qui renvoie `window.localStorage`, ou `null` si son accès lève une erreur. Au chargement : `state = loadGame(storage, quizVersion(QUESTIONS))`, puis si `state?.phase === 'question' && remainingMs(state, Date.now()) === 0`, alors `state = timeout(state, QUESTIONS)`. `saveGame` est appelé après chaque changement d'état. Un `visibilitychange` (retour au premier plan) appelle `tick()`.

- [ ] **Étape 1 : tests unitaires** (faux stockage `{ data: {}, getItem(k) { return this.data[k] ?? null }, setItem(k, v) { this.data[k] = v } }`)
```js
test('Reprise · sauvegarde puis relecture à l’identique', () => {
  const st = fakeStorage(); const s = newGame('Lou', 1000, 'v1'); saveGame(st, s);
  assert.deepEqual(loadGame(st, 'v1'), s);
});
test('Reprise · une sauvegarde d’une autre version des questions est ignorée', () => {
  const st = fakeStorage(); saveGame(st, newGame('Lou', 1000, 'v1')); assert.equal(loadGame(st, 'v2'), null);
});
test('Reprise · une sauvegarde abîmée est ignorée', () => {
  for (const raw of ['{pas du json', '42', 'null', JSON.stringify({ version: 'v1', phase: 'bidon', index: 0, answers: [] }), JSON.stringify({ version: 'v1', phase: 'question', index: 9, answers: [] })]) {
    const st = fakeStorage(); st.data[STORAGE_KEY] = raw; assert.equal(loadGame(st, 'v1'), null);
  }
});
test('Reprise · un stockage qui lève une erreur ne fait jamais planter', () => {
  const broken = { getItem() { throw new Error('bloqué') }, setItem() { throw new Error('bloqué') } };
  assert.equal(loadGame(broken, 'v1'), null);
  assert.doesNotThrow(() => saveGame(broken, newGame('Lou', 0, 'v1')));
  assert.equal(loadGame(null, 'v1'), null);
  assert.doesNotThrow(() => saveGame(null, newGame('Lou', 0, 'v1')));
});
test('Reprise · quizVersion change si une question change', () => {
  const copy = structuredClone(QUESTIONS); copy[0].text += ' ';
  assert.equal(quizVersion(QUESTIONS), quizVersion(structuredClone(QUESTIONS)));
  assert.notEqual(quizVersion(QUESTIONS), quizVersion(copy));
});
```
- [ ] **Étape 2 : `npm run test:unit`**. Attendu : ÉCHEC, `store.js` est absent.
- [ ] **Étape 3 : implémenter `store.js` et `quizVersion`.** `npm run test:unit` doit alors passer.
- [ ] **Étape 4 : tests e2e** (sans horloge simulée : on vieillit la sauvegarde directement)
```js
const age = (page, ms) => page.evaluate(([k, ms]) => {
  const s = JSON.parse(localStorage.getItem(k)); s.questionStartedAt = Date.now() - ms; localStorage.setItem(k, JSON.stringify(s));
}, ['quizagile', ms]);
test('Reprise · après rechargement, on reprend à la même question avec son score', async ({ page }) => {
  await startGame(page); await page.locator('.answer-button').nth(1).click(); await page.locator('#next-button').click();
  await page.reload();
  await expect(page.locator('#progress-label')).toHaveText('Question 2/7');
  await expect(page.locator('#score-label')).toHaveText(/^Score : 1[0-5]\d$/);
});
test('Reprise · le chronomètre ne repart pas à 20 s', async ({ page }) => {
  await startGame(page); await age(page, 15000); await page.reload();
  await expect(page.locator('#timer')).toHaveText(/^[1-5] s$/);
});
test('Reprise · retour après plus de 20 s (veille) : Temps écoulé', async ({ page }) => {
  await startGame(page); await age(page, 25000); await page.reload();
  await expect(page.locator('#feedback-title')).toHaveText('Mauvaise réponse');
  await expect(page.locator('#feedback-timeout')).toHaveText('Temps écoulé');
});
test('Reprise · une partie terminée ramène à l’écran final, sans pouvoir rejouer', async ({ page }) => {
  await startGame(page); await answerAll(page, () => 0);
  await page.goto('/');
  await expect(page.locator('#screen-final')).toBeVisible();
  await expect(page.locator('#screen-home')).toBeHidden();
});
test('Reprise · le quiz se joue même si le stockage est bloqué', async ({ page }) => {
  await page.addInitScript(() => { for (const m of ['getItem', 'setItem']) Storage.prototype[m] = () => { throw new Error('bloqué') }; });
  await startGame(page); await answerAll(page, i => QUESTIONS[i].correctIndex);
  await expect(page.locator('#final-correct')).toHaveText('7/7');
});
```
- [ ] **Étape 5 : `npm test`**. Attendu : tous les tests passent.
- [ ] **Étape 6 : commit `Reprise : sauvegarde locale, chronomètre continu, partie unique`, puis cycle commun (sans Jira).**

---

### Tâche 7 : US-5 · Questions sur l'exposé (SCRUM-9)

Branche `us-5-questions`.

**Files :** Test `tests/unit/questions.test.js` (+ correction de `site/js/questions.js` si le test révèle un écart)

**Interfaces :** Consomme `QUESTIONS`. Le test lit `questions.md` (à la racine) avec `fs.readFileSync(new URL('../../questions.md', import.meta.url), 'utf8')`.

- [ ] **Étape 1 : écrire le test**, avec une petite fonction `parseQuestionsMd(md)` définie dans le fichier de test. Elle découpe sur `## Q`, puis lit `theme` après « — », `text` entre `**`, les lignes `- ` comme réponses (le `✅ ` donne `correctIndex` et est retiré) et `explanation` dans `*Explication : …*`.
```js
test('US-5 · les données du quiz sont identiques à questions.md', () => {
  assert.deepEqual(QUESTIONS, parseQuestionsMd(md));
});
test('US-5 · 7 questions couvrant les thèmes de l’exposé', () => {
  assert.equal(QUESTIONS.length, 7);
  assert.deepEqual(QUESTIONS.map(q => q.theme.split(' (')[0]), ['Plugins', 'MCP', 'RAG', 'Température', 'Hallucinations', 'Données sensibles', 'Rôles agiles']);
});
test('US-5 · chaque question a 4 réponses, une seule bonne, et une explication', () => {
  for (const q of parseQuestionsMd(md)) {
    assert.equal(q.answers.length, 4); assert.ok(q.explanation.length > 0);
  }
  assert.equal((md.match(/✅/g) || []).length, 7);
});
```
- [ ] **Étape 2 : `npm run test:unit`**. Attendu : les tests passent si la Tâche 1 a recopié fidèlement. Sinon, l'écart affiché indique le texte à corriger dans `questions.js`. On corrige alors `questions.js`, jamais `questions.md`.
- [ ] **Étape 3 : vérification de sécurité.** Modifier temporairement un mot dans `questions.md`, constater que `npm run test:unit` échoue, puis `git checkout questions.md`.
- [ ] **Étape 4 : commit `US-5 : test de cohérence avec questions.md`, puis cycle commun.**

---

### Tâche 8 : US-6 · Mise en ligne automatique (SCRUM-10)

Branche `us-6-mobile`. SCRUM-10 est déjà « En cours » depuis la Tâche 1. À l'étape 2 du cycle, ne rien faire. À l'étape 9, passer SCRUM-10 en « Terminé(e) ».

**Files :** Modify `site/style.css` si nécessaire · Test `tests/e2e/us6.spec.js`

- [ ] **Étape 1 : tests e2e**
```js
const noHorizontalScroll = page => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
test('US-6 · aucun défilement horizontal à 360 px, sur tous les écrans', async ({ page }) => {
  await freezeClock(page);
  await page.goto('/'); expect(await noHorizontalScroll(page)).toBe(true);
  await startGame(page, 'WWWWWWWWWWWWWWW');
  for (let i = 0; i < 7; i++) {
    expect(await noHorizontalScroll(page)).toBe(true);
    await page.locator('.answer-button').first().click();
    expect(await noHorizontalScroll(page)).toBe(true);           // avec l'explication affichée
    await page.locator('#next-button').click();
  }
  expect(await noHorizontalScroll(page)).toBe(true);             // écran final
});
test('US-6 · aucune requête hors du site (rien n’est envoyé ailleurs)', async ({ page, baseURL }) => {
  const outside = [];
  page.on('request', r => { if (!r.url().startsWith(baseURL)) outside.push(r.url()); });
  await freezeClock(page);
  await startGame(page); await answerAll(page, () => 0);
  expect(outside).toEqual([]);
});
```
- [ ] **Étape 2 : `npx playwright test tests/e2e/us6.spec.js`**. Attendu : les tests passent, ou bien la page défile à cause d'un texte long et il faut corriger le CSS (`overflow-wrap`, `min-width: 0`, largeurs en `%`) jusqu'à ce qu'ils passent.
- [ ] **Étape 3 : `npm test`**. Attendu : tous les tests passent.
- [ ] **Étape 4 : commit `US-6 : vérifications mobile et confidentialité`, puis cycle commun.** À l'étape 8, vérifier en plus que `curl -s https://guldanee.github.io/quiz-teamai/ | grep -c QuizAgile` affiche au moins `1`.
- [ ] **Étape 5 : bilan à la PO.** Donner l'adresse en ligne, l'emplacement de `qr-code.png` et le nombre de tests qui passent. Rappeler deux limites : le critère US-6 n° 2 (< 2 s en 4G) n'a pas été mesuré, à sa demande, et le critère n° 3 n'a été vérifié que sur des téléphones simulés. Rappeler aussi de supprimer SCRUM-4 dans Jira.
