# Cahier des charges — QuizAgile

**Projet :** application de quiz mobile pour la présentation « IA générative et pratiques agiles »  
**Commanditaire / Product Owner :** Güldane Acar — équipe TeamAI  
**Version :** 1.0 — octobre 2026  
**Durée du projet :** 1 sprint

---

## 1. Contexte

L'équipe TeamAI (6 étudiants de M2) présente un exposé de 30 minutes dans le cadre du cours de gestion de projet agile. Pour vérifier que le public a suivi, l'équipe souhaite terminer par un quiz interactif.

Plutôt que d'utiliser un outil existant (Kahoot, Wooclap…), l'équipe veut sa **propre application**, construite avec l'aide de l'IA, afin de démontrer en direct ce que l'IA générative apporte à un projet agile.

## 2. Objectif

Permettre à chaque personne présente dans la salle de répondre au quiz **depuis son téléphone**, en scannant un QR code, sans rien installer.

## 3. Utilisateurs

| Utilisateur | Besoin |
|---|---|
| **Joueur** (étudiant ou enseignant dans la salle) | Répondre rapidement aux questions et connaître son score |
| **Animatrice** (membre de l'équipe) | Lancer le quiz et annoncer les résultats à voix haute |

## 4. Fonctionnalités attendues

### 4.1 Accueil
- Écran d'accueil avec le titre « QuizAgile » et un bouton « Jouer ».
- Le joueur saisit un **pseudo** (15 caractères maximum).

### 4.2 Déroulé du quiz
- **7 questions** à choix multiples, **4 réponses** possibles par question.
- Une seule bonne réponse par question.
- **Chronomètre de 20 secondes** par question ; à zéro, la question est comptée fausse.
- Après chaque réponse : affichage immédiat « Bonne réponse » / « Mauvaise réponse » avec une courte explication.
- Barre de progression (question 3/7…).

### 4.3 Score
- 100 points par bonne réponse, + un bonus de rapidité (jusqu'à 50 points).
- Écran final : score, nombre de bonnes réponses, message personnalisé selon le score.

### 4.4 Questions du quiz
Les questions portent sur le contenu de l'exposé : plugins, MCP, RAG, température, hallucinations, données sensibles et rôles agiles.

## 5. Contraintes

### 5.1 Techniques
- Application **web**, en une seule page, fonctionnant sur iPhone et Android.
- Aucune installation, aucun compte à créer.
- Hébergement gratuit sur **GitHub Pages**.
- Déploiement automatique à chaque modification (**pipeline CI/CD GitHub Actions**).
- Temps de chargement inférieur à 2 secondes en 4G.

### 5.2 Données et RGPD
- **Aucune donnée personnelle** ne doit être collectée : pas de nom, pas d'adresse e-mail, pas de numéro étudiant.
- Le pseudo reste sur le téléphone du joueur et n'est envoyé nulle part.
- Le pseudo doit être filtré (pas de code HTML ni de script).

### 5.3 Design
- Lisible sur petit écran, gros boutons (pouce).
- Couleurs vives, une couleur par réponse (façon jeu télévisé).
- Mode sombre accepté.

## 6. Organisation agile

- Méthode : **Scrum**, un sprint unique.
- Backlog géré dans **Jira** (projet « Quiz TeamAI »).
- Chaque fonctionnalité est rédigée sous forme de **user story** avec critères d'acceptation et estimation en story points.
- **Definition of Done** : la story est codée, testée, relue par un second regard (humain ou IA), et déployée en ligne.

## 7. Livrables

1. Backlog Jira complet (user stories + sprint).
2. Code source sur GitHub (dépôt `quiz-teamai`).
3. Application en ligne, accessible par QR code.

## 8. Planning

| Étape | Échéance |
|---|---|
| Backlog et sprint planning | Jour J – 1 |
| Développement et tests | Jour J – 1 |
| Mise en ligne | Jour J – 1 au soir |
| Quiz en salle | Jour de la présentation, à la fin de l'exposé |
