# Frostbitten Tracker - WoW WotLK 3.3.5 Warmane

Application web complete pour suivre les rares de l achievement Frostbitten:

- Frontend Next.js en local
- Backend Node.js Express en local
- Base SQLite locale via Prisma
- Cartes WoW style Wowhead avec points de spawn overlay
- Timers min/max par zone, prediction earliest/latest, statut visuel

## Architecture

- frontend: Next.js App Router, UI sombre desktop-first, responsive
- backend: API REST Express + Prisma
- database: SQLite locale (fichier backend/prisma/dev.db)

## Structure

- frontend: application client
- backend: API, schema Prisma, seed Frostbitten

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
2. Laisser DATABASE_URL="file:./dev.db" (par defaut)
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
2. Mettre NEXT_PUBLIC_API_URL vers http://localhost:4000
3. Installer et lancer:
   - cd frontend
   - npm install
   - npm run dev

App locale: http://localhost:3000

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

## Checklist locale

- Backend lance sur http://localhost:4000
- Frontend lance sur http://localhost:3000
- Database locale migree et seed applique
- Endpoint /health retourne ok
