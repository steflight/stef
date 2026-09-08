# Kladrichat

Messagerie privée et d’équipe, mobile en priorité, qui transforme les échanges explicitement autorisés en mémoire de travail par projet.

## État de cette première tranche

Cette branche initialise le monorepo et une **tranche technique de KC-001** : modèle multi-organisation, invitations, conversations privées, enveloppes chiffrées côté client, livraison idempotente et diffusion WebSocket. Il ne s’agit pas encore d’une livraison de KC-001 complète : l’authentification de production, la persistance PostgreSQL, le protocole E2EE audité, l’association d’appareils et les builds signés restent à réaliser.

## Démarrage

Prérequis : Node.js 22+ et npm 11+.

```bash
npm install
npm run dev:api
# dans un second terminal
npm run dev:web
```

- API : `http://localhost:4000`
- Web : `http://localhost:3000`
- Mobile Expo : `npm run dev:mobile`

Les détails, limites et commandes par application sont dans [`docs/developpement.md`](docs/developpement.md).

## Vérifications

```bash
npm run typecheck
npm test
```

## Documentation

- [Cadrage produit](docs/cadrage-produit.md)
- [Architecture](docs/architecture.md)
- [Backlog](docs/backlog.md)
- [Décisions d’architecture](docs/adr/README.md)
