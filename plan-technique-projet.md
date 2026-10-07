# Plan technique — Application de développement personnel (Habitudes + Journal + IA)

## 1. Philosophie du projet

Pas un habit tracker de plus : un "second cerveau" qui comprend tes patterns via un vrai pipeline RAG (Retrieval-Augmented Generation), pas un simple appel d'API avec un prompt générique. L'objectif pédagogique prime sur la vitesse — sauf pour les 80% "classiques" (auth, CRUD, UI) qu'on veut expédier proprement pour se concentrer sur la partie qui compte vraiment.

## 2. Stack & choix techniques

| Brique | Choix | Pourquoi |
|---|---|---|
| Frontend | Vue 3 (Composition API) + Pinia | Tu connais Options API via CoreFlow — passer en Composition API ici est un vrai levier de montée en compétence, sans rupture radicale |
| Backend | Node.js + Express | Cohérent avec ton expérience, pas de nouveau langage à apprendre pour se concentrer sur l'archi |
| Base de données | MySQL 8/9 | MySQL 9 a un type `VECTOR` natif — utile en bonus phase 3, mais **on ne s'appuie pas dessus au départ** (voir §6) |
| Driver DB | `mysql2` (SQL brut, pas d'ORM) | Un ORM (Sequelize/Prisma) cache la couche SQL — ici on veut comprendre exactement ce qui part en base |
| Auth | JWT access + refresh, argon2 (ou bcrypt) | "Fait maison" plutôt que Passport.js en boîte noire — c'est le cœur de ta demande de solidité technique |
| Embeddings (Phase 2) | `@xenova/transformers` (modèle `all-MiniLM-L6-v2`, local, gratuit) | Tourne en pur JS/WASM dans Node, aucune clé API, aucun coût — et ça tourne dans TON stack |
| Génération (Phase 2) | Interface interchangeable : Ollama en local (gratuit) ou API cloud (Anthropic, OpenAI...) | On isole ce choix derrière une interface, pas de dépendance dure |
| Éditeur | VS Code — extensions utiles : ESLint, Vue - Official, une extension client MySQL, Thunder Client (tester les endpoints sans Postman) | — |

## 3. Architecture (couches)

Le même schéma que CoreFlow, appliqué à fond :

```
Route → Controller → Service → Repository → DB
```

- **Route** : déclare l'endpoint, applique le middleware d'auth
- **Controller** : parse la requête HTTP, appelle le service, formate la réponse
- **Service** : logique métier pure (aucune trace de `req`/`res` ici)
- **Repository** : seul endroit qui écrit du SQL

Règle simple : si tu écris une requête SQL en dehors d'un fichier `*.repository.js`, tu casses l'architecture.

## 4. Arborescence

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js        # pool mysql2
│   │   └── env.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── habits.routes.js
│   │   ├── journal.routes.js
│   │   └── chat.routes.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── habits.controller.js
│   │   ├── journal.controller.js
│   │   └── chat.controller.js
│   ├── services/
│   │   ├── auth.service.js
│   │   ├── habits.service.js
│   │   ├── journal.service.js
│   │   ├── embedding.service.js   # génère les vecteurs (Phase 2)
│   │   ├── llm.service.js         # interface generation (Phase 2)
│   │   └── rag.service.js         # orchestre retrieval + generation
│   ├── repositories/
│   │   ├── user.repository.js
│   │   ├── habit.repository.js
│   │   ├── journal.repository.js
│   │   └── chat.repository.js
│   ├── middlewares/
│   │   ├── auth.middleware.js     # vérifie le JWT access token
│   │   └── error.middleware.js
│   └── app.js
├── migrations/
│   ├── 001_create_users.sql
│   ├── 002_create_refresh_tokens.sql
│   ├── 003_create_habits.sql
│   ├── 004_create_journal.sql
│   └── 005_create_chat.sql
├── .env.example
└── package.json

frontend/
├── src/
│   ├── views/
│   │   ├── DashboardView.vue
│   │   ├── HabitsView.vue
│   │   ├── JournalView.vue
│   │   ├── ChatView.vue
│   │   └── LoginView.vue
│   ├── components/
│   │   ├── HabitCard.vue
│   │   ├── StreakHeatmap.vue
│   │   ├── JournalEditor.vue
│   │   └── ChatWindow.vue
│   ├── stores/                    # Pinia
│   │   ├── auth.store.js
│   │   ├── habits.store.js
│   │   └── journal.store.js
│   ├── router/index.js            # navigation guards sur l'auth
│   ├── services/api.js            # instance axios + intercepteur refresh
│   └── App.vue
└── package.json
```

## 5. Schéma de base de données

```sql
-- Users & Auth
CREATE TABLE users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(100),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE refresh_tokens (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  token_hash VARCHAR(255) NOT NULL,   -- on stocke un hash, jamais le token brut
  expires_at DATETIME NOT NULL,
  revoked_at DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Habitudes
CREATE TABLE habits (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  frequency ENUM('daily','weekly','custom') DEFAULT 'daily',
  color VARCHAR(7) DEFAULT '#4f46e5',
  archived_at DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE habit_logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  habit_id BIGINT NOT NULL,
  log_date DATE NOT NULL,
  completed BOOLEAN DEFAULT TRUE,
  note VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_habit_date (habit_id, log_date),
  FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE
);

-- Journal + IA
CREATE TABLE journal_entries (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  content TEXT NOT NULL,
  mood TINYINT,              -- ex: échelle de 1 à 5
  embedding JSON,            -- Phase 2 : tableau de floats [0.12, -0.03, ...]
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Chat
CREATE TABLE conversations (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  title VARCHAR(150),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE messages (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  conversation_id BIGINT NOT NULL,
  role ENUM('user','assistant') NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);
```

## 6. Le cœur du sujet : comment on fait le RAG (Phase 2)

Volontairement, **on ne part pas sur le type `VECTOR` natif de MySQL 9 tout de suite**, même s'il existe. Pourquoi : il fait le travail à ta place (recherche de similarité en une fonction SQL), et à l'échelle d'un journal perso (quelques centaines à quelques milliers d'entrées), tu n'as absolument pas besoin de cette optimisation. Le vrai apprentissage RAG, c'est de coder toi-même :

1. **Génération d'embedding** : chaque entrée de journal passe par `@xenova/transformers` → un vecteur de 384 floats, stocké en JSON.
2. **Recherche par similarité, à la main** : quand tu poses une question au chat, tu génères l'embedding de la question, puis tu calcules toi-même la similarité cosinus contre chaque entrée stockée (une simple boucle + une fonction `cosineSimilarity(a, b)` que tu écris toi-même), tu trie, tu gardes le top-5.
3. **Assemblage du contexte** : tu injectes ces 5 entrées dans le prompt envoyé au LLM, avec une consigne claire ("réponds en te basant sur ces extraits de journal").

Ça tient dans un service de ~80 lignes, et tu comprends 100% de ce qui se passe — pas de boîte noire. Une fois que ce mécanisme tourne et que tu le maîtrises, migrer vers le type `VECTOR` natif de MySQL (et comparer les perfs avant/après) devient un excellent bonus Phase 3, plutôt qu'un point de départ où tu délègues la partie intéressante à la base de données.

## 7. Endpoints API

| Méthode | Route | Description | Phase |
|---|---|---|---|
| POST | `/api/auth/register` | Créer un compte | 1 |
| POST | `/api/auth/login` | Login → access + refresh token | 1 |
| POST | `/api/auth/refresh` | Renouveler l'access token | 1 |
| POST | `/api/auth/logout` | Révoquer le refresh token | 1 |
| GET | `/api/habits` | Liste des habitudes | 1 |
| POST | `/api/habits` | Créer une habitude | 1 |
| PATCH | `/api/habits/:id` | Modifier / archiver | 1 |
| POST | `/api/habits/:id/logs` | Marquer fait pour une date | 1 |
| GET | `/api/habits/:id/logs` | Historique (pour la heatmap) | 1 |
| GET | `/api/journal` | Liste des entrées | 1 |
| POST | `/api/journal` | Créer une entrée (+ génère l'embedding) | 1 puis 2 |
| PATCH | `/api/journal/:id` | Modifier une entrée | 1 |
| GET | `/api/chat/conversations` | Liste des conversations | 2 |
| POST | `/api/chat/conversations/:id/messages` | Envoyer un message → pipeline RAG | 2 |
| GET | `/api/analytics/correlations` | Corrélations habitudes / humeur | 3 |

## 8. Prochaine étape immédiate

1. Init du repo (`backend/` + `frontend/`), `npm init` des deux côtés.
2. MySQL installé en local, base créée, migration `001_create_users.sql` jouée à la main.
3. `auth.service.js` : hash du mot de passe, génération access/refresh token.
4. `auth.middleware.js` : vérification du token sur les routes protégées.
5. Un endpoint `GET /api/habits` protégé, qui répond `[]` — première preuve que toute la chaîne (route → controller → service → repository → DB) fonctionne.

Une fois ces 5 points faits, la Phase 1 se termine vite (CRUD habitudes + logs + UI Vue), et on attaque la Phase 2 sérieusement.
