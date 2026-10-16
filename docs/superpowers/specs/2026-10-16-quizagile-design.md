# QuizAgile — document de conception

**Date :** 16 octobre 2026. **Présentation : 17 octobre 2026. L'application doit être en ligne le 16 au soir.** [PO]
**Product Owner :** Güldane Acar (équipe TeamAI), qui ne code pas : tout ce qui est technique doit pouvoir se vérifier sans lire de code (tests qui passent ou échouent, page en ligne).
**Sources :** `cahier-des-charges.md`, `questions.md`, projet Jira « Quiz TeamAI » (SCRUM-5 à SCRUM-10, sprint « SCRUM Sprint 0 »).
**Dépôt :** https://github.com/Guldanee/quiz-teamai (public, vide, GitHub Pages réglé sur « GitHub Actions », `gh` installé et connecté).

Légende : **[PO]** = décidé par la Product Owner pendant la conception ; **[choix du concepteur]** = décision prise par Claude, que la PO peut contester ; sans mention = issu du cahier des charges ou des stories Jira.

---

## 1. Intention

L'équipe TeamAI termine un exposé de 30 minutes (« IA générative et pratiques agiles ») par un quiz. Elle veut **sa propre application construite avec l'IA**, plutôt que Kahoot ou Wooclap, pour démontrer en direct ce que l'IA apporte à un projet agile. L'application est donc à la fois un outil et une pièce à conviction : son bon fonctionnement fait partie du message.

**Le moment en salle [PO] :** un QR code s'affiche sur le grand écran ; chacun le scanne, saisit un pseudo et joue **seul sur son téléphone** : 7 questions, 20 s chacune, bonne réponse et explication après chaque question, score à la fin. L'animatrice demande à voix haute « Qui a eu 7/7 ? » et la salle applaudit. L'application ne pilote rien côté animatrice et n'a pas de classement commun.

**Critères de réussite [PO] :** tout le monde joue **sans aide**, **sans bug**, et la page **charge vite en 4G** (< 2 s), même si toute la salle se connecte en même temps.

## 2. Objectifs, non-objectifs, anti-objectifs

**Objectifs**
- Un parcours joueur complet sur iPhone (Safari) et Android (Chrome), sans installation ni compte.
- Couvrir intégralement les critères d'acceptation des stories US-1 à US-6.
- Des tests automatisés qui prouvent ces critères, exécutés à chaque modification, et qui **bloquent la mise en ligne** s'ils échouent.
- Mise en ligne automatique sur GitHub Pages à chaque modification de la branche `main`.

**Non-objectifs** (volontairement hors périmètre)
- Classement partagé, score centralisé, écran animatrice, mode « présentateur ».
- Serveur, base de données, compte, connexion.
- Bouton « Rejouer », mélange des questions ou des réponses, multilingue, sons.

**Anti-objectifs** (ce qui serait un échec même si « ça marche »)
- **Une donnée qui quitte le téléphone.** Aucun appel réseau après le chargement de la page : pas de statistiques de visite, pas de police Google, pas de bibliothèque chargée depuis un CDN, pas de traceur. (Une police ou un script externe révélerait l'adresse IP du joueur à un tiers.) [choix du concepteur, déduit de la règle RGPD du cahier des charges]
- **Un moment de flottement devant la salle** : page qui ne charge pas, bouton qui ne réagit pas, joueur bloqué sur l'écran du pseudo.
- Un joueur qui peut facilement tricher pour obtenir 7/7 (recharger pour regagner du temps, rejouer).

## 3. Contraintes

- **Une seule page** HTML/CSS/JavaScript, **sans framework** ni étape de compilation : ce que contient le dépôt est exactement ce qui est servi.
- Fonctionne sur un écran de **360 px de large sans défilement horizontal** ; gros boutons utilisables au pouce.
- Couleurs vives, **une couleur par réponse** (façon jeu télévisé) ; lisible en mode clair et en mode sombre.
- Chargement < 2 s en 4G simulée (Chrome / Lighthouse).
- Pseudo : 15 caractères maximum, vide refusé, balises HTML/scripts filtrées, jamais envoyé nulle part.
- Hébergement GitHub Pages, déploiement par GitHub Actions.
- Definition of Done (cahier des charges §6) : codée, testée, relue par un second regard (humain ou IA), déployée.

## 4. Le parcours joueur (validé par la PO sur maquette)

### Écran 1 — Accueil (US-1)
- Titre « QuizAgile », sous-titre de l'exposé, champ pseudo, bouton « Jouer ».
- Le champ n'accepte pas plus de 15 caractères. Un pseudo vide (ou composé uniquement d'espaces) est refusé avec un message clair, sans bloquer l'écran.
- Les balises sont retirées du pseudo (`<script>alert(1)</script>Lou` → `alert(1)Lou`, puis coupé à 15 caractères). Le pseudo est toujours affiché comme du texte, jamais interprété comme du HTML. Si le pseudo devient vide après le filtrage, il est refusé. [précisions : choix du concepteur]

### Écran 2 — Question (US-2)
- « Question N/7 » et une barre de progression.
- Un chronomètre de 20 s visible.
- L'énoncé et **4 gros boutons**, chacun d'une couleur vive différente, avec une lettre A/B/C/D pour ne pas dépendre de la seule couleur [choix du concepteur].
- Au premier toucher, la réponse est enregistrée, les autres boutons se bloquent et le chronomètre s'arrête. Un double toucher ne compte qu'une seule fois.
- À zéro sans réponse, la question est comptée fausse et on passe à l'écran 3.
- Les réponses sont affichées dans l'ordre de `questions.md`, sans mélange [choix du concepteur].

### Écran 3 — Réponse et explication (US-3)
- Pour une bonne réponse : « Bonne réponse » et les points gagnés (ex. « +135 »).
- Pour une mauvaise réponse ou un temps écoulé : « Mauvaise réponse ». Si le temps est écoulé, on peut ajouter la mention « Temps écoulé » [choix du concepteur].
- La bonne réponse est mise en évidence, les autres sont atténuées. Si le joueur s'est trompé, son choix reste repérable.
- L'explication de `questions.md` s'affiche.
- Le joueur passe à la suite en touchant le bouton **« Question suivante »** [PO]. Il n'y a pas d'enchaînement automatique. Sur la 7e question, le bouton mène à l'écran final (libellé « Voir mon score » [choix du concepteur]).

### Écran 4 — Écran final (US-4)
- Le pseudo, le nombre de bonnes réponses sur 7 **en très gros** (c'est ce que le joueur montre quand l'animatrice demande « Qui a eu 7/7 ? »), le score total en points et un message selon le palier.
- **Pas de bouton « Rejouer »** [PO].
- Messages (proposés par le concepteur, **validés tels quels par la PO**) :
  - 0 à 2 bonnes réponses : « Pas de panique : même les IA hallucinent parfois ! Revois l'exposé, tu feras mieux la prochaine fois. »
  - 3 à 5 : « Joli score ! Tu as suivi l'essentiel de l'exposé. »
  - 6 à 7 : « Impressionnant ! Tu maîtrises l'IA générative et l'agilité. » Pour un 7/7, ajouter : « Lève la main quand l'animatrice demande qui a eu 7/7 ! »

## 5. Score (US-4)

- Une bonne réponse rapporte **100 + arrondi(50 × secondes restantes / 20)**, donc 150 points au maximum. Une mauvaise réponse ou un temps écoulé rapporte 0.
- Les « secondes restantes » sont le temps exact restant au moment du toucher, et c'est le résultat final qui est arrondi à l'entier le plus proche [choix du concepteur]. Exemple : une réponse juste avec 13,4 s restantes → 100 + arrondi(33,5) = 134.
- Score maximal théorique : 7 × 150 = 1 050.

## 6. Mémoire sur le téléphone : reprise et partie unique [PO]

- **Tout reste sur le téléphone.** L'état de la partie est sauvegardé dans le stockage du navigateur (`localStorage`) à chaque étape : pseudo, question atteinte, écran affiché, réponses données, score, heure de début de la question en cours.
- **Reprise :** si la page est rechargée, le téléphone mis en veille ou le QR code rescanné, le joueur reprend exactement là où il en était, avec son score.
- **Le chronomètre ne repart pas à zéro** quand on recharge la page : le temps restant est recalculé à partir de l'heure de début enregistrée. Si les 20 s sont dépassées au retour, la question est comptée fausse et l'écran 3 s'affiche [choix du concepteur].
- **Une seule partie par joueur :** une fois la partie terminée, rouvrir la page affiche directement l'écran final.
- **Pas de remise à zéro cachée** [PO] : pour répéter avant le jour J, l'équipe utilise la navigation privée. C'est plus sûr qu'une adresse secrète qu'un joueur pourrait découvrir.
- **Limite connue et acceptée** [choix du concepteur, expliqué à la PO] : une navigation privée ou un autre navigateur permet de rejouer. La seule parade serait un serveur, donc une collecte de données, ce qui est exclu.
- **Sauvegarde liée à la version du quiz** [choix du concepteur] : l'état sauvegardé porte un numéro de version des questions ; si les questions changent après qu'un téléphone a joué, l'ancienne sauvegarde est ignorée.
- **Si le stockage est indisponible** (navigateur qui le bloque) : le quiz fonctionne quand même, simplement sans reprise. Ça ne doit jamais provoquer de plantage [choix du concepteur].

## 7. Contenu des questions (US-5)

- Les 7 questions, réponses, bonnes réponses et explications sont celles de `questions.md`, **mot pour mot**, y compris la Q7 « question du switch », dont l'explication se termine par une question ouverte au public.
- `questions.md` reste la source de référence rédigée par l'équipe. L'application lit un fichier de données au format JavaScript/JSON qui la reproduit. **Un test automatique vérifie que ce fichier correspond exactement à `questions.md`** : 7 questions, 4 réponses chacune, une seule bonne réponse, une explication, textes identiques. Si l'équipe modifie une question dans `questions.md` sans mettre à jour les données, le test échoue et la mise en ligne est bloquée [choix du concepteur].

## 8. Apparence

- Couleurs vives, une par réponse (ex. rouge, bleu, orange, vert), avec du texte blanc suffisamment contrasté.
- Le mode sombre suit le réglage du téléphone [choix du concepteur].
- Boutons d'au moins 48 px de haut, textes lisibles sans zoom, aucune police externe (polices du système) [choix du concepteur].
- Maquette de référence validée : `.superpowers/brainstorm/…/content/parcours-joueur.html` (déroulé et hiérarchie des informations, pas le rendu final).

## 9. Tests automatisés

Chaque critère d'acceptation des stories US-1 à US-6 doit être couvert par au moins un test, et le nom du test cite la story (ex. « US-2 · le chronomètre à zéro compte la question fausse »). C'est ce qui permet à la PO de suivre l'avancement sans lire de code.

Outils [choix du concepteur] :
- **Tests de logique** (score, filtrage du pseudo, paliers de message, reprise de partie, cohérence avec `questions.md`) avec le lanceur de tests intégré à Node.js. Il ne demande aucune dépendance.
- **Tests de parcours dans un vrai navigateur** avec Playwright, sur des écrans de téléphone simulés : iPhone (moteur WebKit, celui de Safari) et Android (Chromium), largeur 360 px. Ils couvrent le parcours complet, l'absence de défilement horizontal, le blocage des boutons après un toucher, le temps écoulé (en accélérant l'horloge, pour ne pas attendre 20 s), la reprise après rechargement, l'écran final au retour, le mode sombre et l'absence de tout appel réseau après le chargement.
- Ces outils servent uniquement aux tests. Ils ne sont jamais envoyés aux joueurs.

## 10. Mise en ligne (US-6)

- Un workflow GitHub Actions se déclenche à chaque modification de `main` : il **lance tous les tests, puis déploie sur GitHub Pages seulement s'ils passent tous**.
- Adresse attendue : https://guldanee.github.io/quiz-teamai/
- Seuls les fichiers de l'application sont publiés : la page, ses styles, son script, les données des questions et une icône. Les tests, la documentation et les fichiers de travail ne sont pas publiés [choix du concepteur].
- Performance : une page légère (quelques dizaines de Ko au total, sans dépendance externe), servie par GitHub Pages. **Pas de mesure 4G et pas de session d'essai sur de vrais téléphones** [PO, faute de temps]. Le critère 2 de US-6 (« < 2 s en 4G ») n'est donc pas mesuré : il est rendu très probable par la légèreté de la page, sans être prouvé. Le critère 3 (iPhone/Android, 360 px) est vérifié uniquement sur des téléphones simulés par les tests automatiques.
- **QR code** [choix du concepteur] : une image de QR code pointant vers l'adresse en ligne est générée et ajoutée au dépôt, prête à coller dans la dernière diapositive de l'exposé.

## 11. Organisation et Jira

- **Façon de travailler** [choix du concepteur] : une branche et une demande de fusion (pull request) par story. Les tests tournent sur chaque demande, la revue IA est faite avant la fusion, et c'est la fusion dans `main` qui met en ligne. Ainsi rien n'est publié avant d'avoir été testé et relu, comme l'exige la Definition of Done.

- Chaque story Jira (SCRUM-5 à SCRUM-10) correspond à un lot de travail testé. Les tests reprennent les critères « Étant donné / quand / alors ».
- La relecture exigée par la Definition of Done est faite par une revue de code IA à la fin de chaque story.
- Le ticket vide SCRUM-4 « Sous-tâche 2.1 » doit être supprimé [PO]. Le connecteur Jira ne propose pas la suppression, donc la PO le supprime elle-même dans Jira.
- **Statuts Jira tenus à jour au fil du travail** [PO] : une story passe « en cours » quand son travail commence, puis « terminée » quand elle est en ligne (fusionnée dans `main` et déployée avec succès). Transitions Jira du projet (site teamai-demonstration, cloudId `c813aa3f-0660-47b7-b79e-557ee3d156bd`) : id `31` → « En cours », id `51` → « Terminé(e) ».

## 12. Ordre de travail (tout doit être en ligne ce soir) [PO]

1. **D'abord une version jouable minimale en ligne** : la chaîne de mise en ligne (tests puis déploiement) et un quiz qui se joue de bout en bout. Accueil avec pseudo, 7 questions avec chronomètre, réponse et explication, écran final avec score. Les tests de base sont inclus. À ce stade, l'application est utilisable demain même si la suite prend du retard.
2. **Ensuite le reste, dans l'ordre des stories** : US-1, US-2, US-3, US-4, US-5, US-6. Chaque story complète et renforce la version minimale jusqu'à couvrir tous ses critères d'acceptation. Chacune a ses tests nommés, sa relecture IA, et elle est mise en ligne à la fusion.
3. Le QR code est généré dès que l'adresse en ligne existe, c'est-à-dire après l'étape 1 [choix du concepteur].

## 13. Annexe — critères d'acceptation Jira (texte exact)

| Story | Ticket | Points |
|---|---|---|
| US-1 · Rejoindre le quiz et choisir un pseudo | SCRUM-5 | 3 |
| US-2 · Répondre aux questions en 20 secondes | SCRUM-6 | 5 |
| US-3 · Feedback immédiat | SCRUM-7 | 2 |
| US-4 · Score et écran final | SCRUM-8 | 3 |
| US-5 · Questions sur l'exposé | SCRUM-9 | 3 |
| US-6 · Mise en ligne automatique | SCRUM-10 | 3 |

Toutes en priorité « Must », dans le sprint « SCRUM Sprint 0 », 19 points au total.

**US-1 (SCRUM-5)**
1. Étant donné le QR code projeté en salle, quand je le scanne avec un iPhone ou un Android, alors l'écran d'accueil « QuizAgile » s'ouvre dans le navigateur avec un bouton « Jouer », sans installation ni compte.
2. Étant donné l'écran d'accueil, quand je saisis un pseudo, alors la saisie est limitée à 15 caractères et un pseudo vide est refusé.
3. Étant donné un pseudo contenant du code comme `<script>`, quand je valide, alors les balises sont filtrées, rien ne s'exécute, et le pseudo reste sur le téléphone sans être envoyé à aucun serveur.

**US-2 (SCRUM-6)**
1. Étant donné une question affichée, quand je la lis, alors je vois 4 réponses sur de gros boutons d'une couleur vive chacune, lisibles en mode clair comme en mode sombre, et l'indicateur « Question N/7 » avec sa barre de progression.
2. Étant donné une question affichée, quand je touche une réponse, alors ma réponse est enregistrée, les autres boutons se bloquent et le chronomètre s'arrête.
3. Étant donné le chronomètre de 20 secondes, quand il atteint zéro sans réponse, alors la question est comptée fausse.

**US-3 (SCRUM-7)**
1. Étant donné que je viens de répondre, quand ma réponse est juste, alors « Bonne réponse » s'affiche avec une courte explication.
2. Étant donné que je viens de répondre ou que le temps est écoulé, quand ma réponse est fausse ou absente, alors « Mauvaise réponse » s'affiche, la bonne réponse est mise en évidence et une courte explication l'accompagne.

**US-4 (SCRUM-8)**
1. Étant donné une bonne réponse, quand le score est calculé, alors elle rapporte 100 points plus un bonus de rapidité de 50 × (secondes restantes / 20), arrondi, soit 50 points au maximum ; une mauvaise réponse rapporte 0.
2. Étant donné la 7e question terminée, quand l'écran final s'affiche, alors je vois mon pseudo, mon score total, mon nombre de bonnes réponses sur 7 et un message qui dépend de mon résultat (0 à 2, 3 à 5, 6 à 7 bonnes réponses).

**US-5 (SCRUM-9)**
1. Étant donné le fichier de questions, quand l'équipe le relit, alors il contient 7 questions couvrant plugins, MCP, RAG, température, hallucinations, données sensibles et rôles agiles.
2. Étant donné une question du fichier, quand elle est chargée dans le quiz, alors elle a exactement 4 réponses, une seule bonne réponse et une explication.

**US-6 (SCRUM-10)**
1. Étant donné le dépôt GitHub « quiz-teamai », quand une modification est poussée sur la branche principale, alors un workflow GitHub Actions déploie l'application sur GitHub Pages.
2. Étant donné l'application en ligne, quand on l'ouvre en 4G (simulation réseau Chrome ou Lighthouse), alors la page unique se charge en moins de 2 secondes.
3. Étant donné un iPhone (Safari) et un Android (Chrome) récents, quand on joue un quiz complet, alors tout fonctionne sans défilement horizontal sur un écran de 360 px de large.

## 14. Laissé au constructeur

- Le découpage exact en fichiers, tant que l'application reste une seule page sans framework et sans étape de compilation.
- Les teintes exactes, les animations légères et la présentation du chronomètre (chiffre, anneau ou barre), dans le respect de la maquette et du contraste.
- La structure interne de l'état sauvegardé et le nom de la clé de stockage.
- L'organisation des tests, tant que chaque critère d'acceptation est couvert et nommé par sa story.
