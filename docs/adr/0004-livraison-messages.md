# ADR-0004 — Livraison idempotente et reprise par curseur

- Statut : accepté
- Date : 2026-09-07

## Décision

Le client génère un `clientMessageId` UUID stable. L’unicité porte sur conversation + auteur + identifiant client. Le serveur attribue un identifiant et un curseur monotone, renvoie le même message aux nouvelles tentatives, puis diffuse un événement versionné. Après coupure, le client demande les messages dont le curseur est supérieur au dernier persisté.

## Conséquences

Les reconnexions ne créent pas de doublons. La production exigera une transaction PostgreSQL regroupant message et outbox, puis une diffusion au moins une fois ; les clients resteront idempotents.
