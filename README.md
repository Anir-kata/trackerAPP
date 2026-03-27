# Frostbitten Tracker - WoW WotLK 3.3.5 Warmane

Application web complete pour suivre les rares de l achievement Frostbitten:

- Frontend Next.js deployable sur Vercel
- Backend Node.js Express deployable sur Render
- Base PostgreSQL Render via Prisma
- Cartes WoW style Wowhead avec points de spawn overlay
- Timers min/max par zone, prediction earliest/latest, statut visuel

## Architecture

- frontend: Next.js App Router, UI sombre desktop-first, responsive
- backend: API REST Express + Prisma
- database: PostgreSQL Render
- cron optionnel Render via render.yaml pour job de recalcul

## Structure

- frontend: application client
- backend: API, schema Prisma, seed Frostbitten
- render.yaml: blueprint Render (web + db + cron)

## Fonctionnalites

- Dashboard global: zones, rares, statut, prediction
- Vue zone: liste des rares de la zone
- Vue rare: detail carte + points
- Settings: import/export JSON
- Actions gameplay:
  - marquer un rare complete
  - enregistrer vu maintenant
  - notes par rare
  - filtrer rares restants
  - copier waypoints TomTom

## API REST

- GET /health
- GET /zones
- GET /zones/:id
- PATCH /zones/:id/last-seen
- GET /rares
- GET /rares/:id
- PATCH /rares/:id
- POST /import
- GET /export
- POST /jobs/recompute (pour cron, protege par JOBS_SECRET)

## Schema Prisma

Voir backend/prisma/schema.prisma

Tables:
- zones
- rares
- sightings

## Seed Frostbitten

Voir backend/prisma/seed.ts

Le seed insere:
- 10 zones de Norfendre
- preset Warmane respawn 4h-8h
- liste de rares avec npc_id, wowhead_url, map_image_url, spawn_points

## Lancer en local

### 1) Backend

1. Copier backend/.env.example vers backend/.env
2. Renseigner DATABASE_URL
3. Installer dependances:
   - cd backend
   - npm install
4. Generer Prisma + sync schema:
   - npm run prisma:generate
   - npm run db:push
5. Seed:
   - npm run seed
6. Demarrer API:
   - npm run dev

API locale: http://localhost:4000

### 2) Frontend

1. Copier frontend/.env.example vers frontend/.env.local
2. Mettre NEXT_PUBLIC_API_URL vers l URL API (ex: http://localhost:4000)
3. Installer et lancer:
   - cd frontend
   - npm install
   - npm run dev

App locale: http://localhost:3000

## Deploiement Vercel (Frontend)

1. Importer le repo dans Vercel
2. Root Directory: frontend
3. Build command: npm run build
4. Output: Next.js default
5. Variable d environnement:
   - NEXT_PUBLIC_API_URL=https://<api-render>.onrender.com
6. Deploy

## Deploiement Render (Backend + DB)

Option A (recommande): Blueprint render.yaml

1. Sur Render: New + Blueprint
2. Selectionner le repo
3. Render lit render.yaml et cree:
   - service web frostbitten-api
   - PostgreSQL frostbitten-postgres
   - cron frostbitten-recompute
4. Ajouter CORS_ORIGIN avec l URL Vercel frontend
5. Deploy

Option B (manuel):

1. Creer PostgreSQL Render
2. Creer Web Service Render (root backend)
3. Build command:
   - npm install && npm run prisma:generate
4. Start command:
   - npm run prisma:migrate && npm run start
5. Env vars:
   - DATABASE_URL=<connection string render postgres>
   - CORS_ORIGIN=<url frontend vercel>
   - JOBS_SECRET=<secret fort>
   - PORT=10000

## Statuts et couleurs

- too_early: rouge
- check_now: jaune
- overdue: vert

Regle:
- earliest_spawn = last_seen_at + respawn_min_hours
- latest_spawn = last_seen_at + respawn_max_hours

## Notes cartes WoW

Les cartes affichent de vraies maps WoW style Wowhead via references statiques WoW map art, avec superposition des points de spawn en pourcentage.

## Commandes utiles

Backend:
- npm run dev
- npm run prisma:generate
- npm run db:push
- npm run seed

Frontend:
- npm run dev
- npm run build

## Production checklist

- CORS_ORIGIN pointe vers Vercel
- NEXT_PUBLIC_API_URL pointe vers Render
- Database migree et seed applique
- Endpoint /health retourne ok
- Cron /jobs/recompute securise avec JOBS_SECRET
