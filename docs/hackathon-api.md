# Hackathon Management Portal API

Questo documento descrive in dettaglio l'API REST pensata per il portale di gestione hackathon. Tutte le risorse sono organizzate per moduli e includono campi richiesti, codici di risposta e note sui permessi. I riferimenti a ruoli usano queste etichette: `participant`, `mentor`, `judge`, `admin`.

## Convenzioni generali
- Base path: `/api`
- Autenticazione: JWT in header `Authorization: Bearer <token>` per tutte le rotte protette.
- Codici di risposta ricorrenti: `401` (token mancante/non valido), `403` (permessi insufficienti), `404` (risorsa non trovata), `422` (validation error), `500` (errore server).
- Paginazione standard: query `page`, `pageSize`; ordinamento con `sort` (es. `sort=created_at,desc`).

## Modulo Auth & Utenti

### POST /api/auth/register
- **Funzione**: crea un nuovo utente.
- **Payload**:
  ```json
  {
    "email": "user@example.com",
    "password": "Passw0rd!",
    "first_name": "Ada",
    "last_name": "Lovelace",
    "role": "participant"
  }
  ```
- **Risposte**: `201` con dati utente essenziali; `409` se email già registrata.
- **Note**: ruoli ammessi all'iscrizione: `participant`, `mentor`. `judge` e `admin` vanno assegnati da amministrazione.

### POST /api/auth/login
- **Funzione**: autentica l'utente e restituisce JWT.
- **Payload**: `{ "email": "user@example.com", "password": "Passw0rd!" }`
- **Risposte**: `200` con `{ token, user }`; `401` su credenziali errate.

### POST /api/auth/logout
- **Funzione**: invalida il token lato server (se mantenuta una denylist) o registra l'azione.
- **Risposte**: `204`.

### GET /api/auth/me
- **Funzione**: restituisce il profilo dell'utente autenticato.
- **Risposte**: `200` con dati profilo (bio, skills, link).

### GET /api/users (admin)
- **Funzione**: elenca utenti filtrabili per ruolo.
- **Query**: `role`, `search`.
- **Risposte**: `200` con lista paginata.

### GET /api/users/{id}
- **Funzione**: dettaglio pubblico di un utente.
- **Risposte**: `200` con profilo essenziale.

### PUT /api/users/{id}
- **Funzione**: aggiorna bio, skills, link social.
- **Payload**: campi parziali permessi.
- **Permessi**: proprietario o admin.

### PATCH /api/users/{id}/role (admin)
- **Funzione**: aggiorna il ruolo tra quelli ammessi.
- **Payload**: `{ "role": "judge" }`.

## Modulo Hackathon & Tracks

### GET /api/hackathons
- **Funzione**: lista hackathon filtrabile (futuri/passati) e per stato.
- **Query**: `status`, `track`, `search`, `page`, `pageSize`.

### GET /api/hackathons/{id}
- **Funzione**: dettaglio completo (date, regolamento, sponsor, limiti team).

### POST /api/hackathons (admin)
- **Funzione**: crea un nuovo evento.
- **Payload minimale**:
  ```json
  {
    "name": "HackUNI",
    "description": "Hackathon universitario su AI",
    "theme": "AI for Good",
    "registration_start": "2024-09-01T09:00:00Z",
    "registration_end": "2024-10-01T23:59:00Z",
    "event_start": "2024-10-05T09:00:00Z",
    "event_end": "2024-10-06T18:00:00Z",
    "submission_deadline": "2024-10-06T16:00:00Z",
    "max_participants": 200,
    "team_size_min": 2,
    "team_size_max": 5
  }
  ```

### PUT /api/hackathons/{id} (admin)
- **Funzione**: aggiorna dati evento; supporta archiviazione logica con campo `status`.

### DELETE /api/hackathons/{id} (admin)
- **Funzione**: disattiva/archivia un evento; preferibile soft-delete con `status=archived`.

### GET /api/hackathons/{id}/tracks
- **Funzione**: elenco delle tracce/categorie.

### POST /api/hackathons/{id}/tracks (admin)
- **Funzione**: crea una track.
- **Payload**: `{ "name": "Web", "description": "Prodotti web" }`.

### PUT /api/tracks/{trackId} (admin)
- **Funzione**: aggiorna track.

### DELETE /api/tracks/{trackId} (admin)
- **Funzione**: rimuove/archivia una track.

## Modulo Iscrizioni & Team

### POST /api/hackathons/{id}/registrations
- **Funzione**: iscrive l'utente loggato.
- **Payload opzionale**: `{ "university": "PoliMi", "motivation": "Costruire un prodotto" }`.
- **Risposte**: `201` con stato iniziale `PENDING` o `APPROVED` a seconda della policy.

### GET /api/hackathons/{id}/registrations/me
- **Funzione**: mostra lo stato di iscrizione del chiamante.

### GET /api/hackathons/{id}/registrations (admin)
- **Funzione**: elenco iscrizioni con filtri `status`, `user`, `team`.

### PATCH /api/registrations/{registrationId} (admin)
- **Funzione**: aggiorna lo stato (`PENDING`, `APPROVED`, `REJECTED`).

### GET /api/hackathons/{id}/teams
- **Funzione**: lista team dell'evento con membri e track.

### POST /api/hackathons/{id}/teams
- **Funzione**: crea un team; proprietario è l'utente autenticato.
- **Payload**: `{ "name": "Team Rocket", "description": "AI + IoT", "track_id": "uuid" }`.

### GET /api/teams/{teamId}
- **Funzione**: dettaglio team con membri e stato.

### PUT /api/teams/{teamId}
- **Funzione**: aggiorna nome, descrizione, track.
- **Permessi**: owner o admin.

### DELETE /api/teams/{teamId}
- **Funzione**: scioglie il team o lo marca come `DELETED`.

### POST /api/teams/{teamId}/invites
- **Funzione**: invita un utente a unirsi al team.
- **Payload**: `{ "user_id": "uuid" }`.

### POST /api/team-invites/{inviteId}/accept
- **Funzione**: accetta invito e aggiunge il membro se il team non è pieno.

### POST /api/team-invites/{inviteId}/decline
- **Funzione**: rifiuta l'invito.

### DELETE /api/teams/{teamId}/members/{userId}
- **Funzione**: rimuove un membro o consente l'uscita dal team.

## Modulo Progetti & Consegne

### GET /api/hackathons/{id}/projects
- **Funzione**: lista progetti dell'evento; giudici e admin vedono tutti, gli altri vedono quelli pubblici.

### GET /api/projects/{projectId}
- **Funzione**: dettaglio progetto, inclusi link repository/demo.

### POST /api/teams/{teamId}/projects
- **Funzione**: crea il progetto associato al team.
- **Payload**:
  ```json
  {
    "title": "AI Tutor",
    "description": "Assistente AI per studenti",
    "repo_url": "https://github.com/team/ai-tutor",
    "demo_url": "https://demo.example.com",
    "pitch_deck_url": "https://slides.example.com"
  }
  ```

### PUT /api/projects/{projectId}
- **Funzione**: aggiorna titolo/descrizione/link fino alla deadline.

### DELETE /api/projects/{projectId}
- **Funzione**: opzionale, archivia progetto prima della valutazione.

### POST /api/projects/{projectId}/submissions
- **Funzione**: crea o aggiorna la consegna finale (unico record).
- **Payload**: `{ "artifact_url": "https://storage.example.com/build.zip", "notes": "Versione finale" }`.

### GET /api/projects/{projectId}/submissions
- **Funzione**: mostra la consegna corrente con timestamp e autore.

## Modulo Giuria, Valutazioni & Classifiche

### GET /api/hackathons/{id}/judges
- **Funzione**: lista giudici assegnati all'evento.

### POST /api/hackathons/{id}/judges (admin)
- **Funzione**: aggiunge un utente come giudice.
- **Payload**: `{ "user_id": "uuid" }`.

### DELETE /api/hackathons/{id}/judges/{userId} (admin)
- **Funzione**: rimuove giudice dall'evento.

### POST /api/hackathons/{id}/judging-assignments (admin)
- **Funzione**: genera o carica assegnazioni progetto-giudice.
- **Payload**: elenco di associazioni `{ "project_id": "uuid", "judge_id": "uuid" }` oppure flag `auto=true` per generazione automatica.

### GET /api/judges/me/assignments
- **Funzione**: il giudice vede i progetti assegnati; filtro `h` per hackathon.

### GET /api/projects/{projectId}/scores
- **Funzione**: elenca voti ricevuti con media calcolata.

### POST /api/projects/{projectId}/scores (judge)
- **Funzione**: crea una valutazione strutturata.
- **Payload**:
  ```json
  {
    "innovation": 4,
    "technical_quality": 5,
    "impact": 3,
    "presentation": 4,
    "comment": "Ottima demo"
  }
  ```

### PUT /api/scores/{scoreId} (judge)
- **Funzione**: aggiorna una valutazione esistente.

### GET /api/hackathons/{id}/leaderboard
- **Funzione**: classifica finale; supporta filtro per track e restituisce punteggi medi e ranking.

## Modulo Comunicazioni

### GET /api/hackathons/{id}/announcements
- **Funzione**: elenco annunci ordinati per data.

### POST /api/hackathons/{id}/announcements (admin)
- **Funzione**: crea un annuncio.
- **Payload**: `{ "title": "Kickoff", "content": "Benvenuti!" }`.

### PUT /api/announcements/{announcementId} (admin)
- **Funzione**: aggiorna titolo o contenuto.

### DELETE /api/announcements/{announcementId} (admin)
- **Funzione**: archivia o elimina annuncio.

### GET /api/hackathons/{id}/faq
- **Funzione**: lista FAQ.

### POST /api/hackathons/{id}/faq (admin)
- **Funzione**: crea FAQ.
- **Payload**: `{ "question": "Cos'è la deadline?", "answer": "Ore 16:00." }`.

### PUT /api/faq/{faqId} (admin)
- **Funzione**: modifica FAQ.

### DELETE /api/faq/{faqId} (admin)
- **Funzione**: rimuove FAQ.

## MVP consigliato per contesto universitario

- **Core**: Auth (`/auth/register`, `/auth/login`, `/auth/me`), lettura hackathon (`GET /hackathons`, `GET /hackathons/{id}`), iscrizione, team, progetto, voti, leaderboard.
- **Nice-to-have**: tracks, annunci, gestione stato iscrizione.
- **Semantica consigliata**: usare soft-delete e stati (`status` per eventi, `state` per team) per evitare perdita dati.

## Note di sicurezza e permessi
- Validare sempre ownership: un utente può modificare solo il proprio profilo, il proprio team e il proprio progetto.
- I giudici possono creare/aggiornare voti solo per progetti a loro assegnati (o per l'intero evento in modalità open-judging).
- Gli admin sono gli unici a creare/aggiornare eventi, assegnare ruoli elevati e consultare panoramiche complete.

## Struttura dati minima consigliata
- **User**: id, email, password_hash, first_name, last_name, role, bio, skills, links, created_at.
- **Hackathon**: id, name, description, theme, dates, limits, status.
- **Track**: id, hackathon_id, name, description.
- **Registration**: id, hackathon_id, user_id, status, notes.
- **Team**: id, hackathon_id, owner_id, name, description, track_id, state.
- **TeamMember**: id, team_id, user_id, role, joined_at.
- **Project**: id, team_id, title, description, links, state.
- **Submission**: id, project_id, artifact_url, notes, submitted_at.
- **Score**: id, project_id, judge_id, criteria (innovation, technical_quality, impact, presentation), comment, average.
- **Announcement/FAQ**: id, hackathon_id, title/question, content/answer, created_at.
