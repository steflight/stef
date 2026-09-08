# ADR-0001 — Monorepo TypeScript

- Statut : accepté
- Date : 2026-09-07

## Décision

Utiliser npm workspaces, TypeScript strict, Expo pour mobile, Next.js pour le web et Node.js pour les processus serveur. Les applications restent séparément déployables ; contrats et règles pures vivent dans des packages.

## Conséquences

Le partage de types accélère les trois clients, sans autoriser l’import de code serveur dans les clients. Node 22+ et npm 11 sont la base verrouillée initiale. Expo/React Native et Next sont verrouillés dans le lockfile et devront être mis à jour ensemble après tests Android, iOS et web.
