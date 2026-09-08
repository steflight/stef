# ADR-0002 — Monolithe métier modulaire

- Statut : accepté
- Date : 2026-09-07

## Décision

Conserver identité, organisations et messagerie dans une API modulaire unique. Exécuter traitements longs dans `apps/workers` et capture média dans `apps/recorder`. PostgreSQL sera la source métier, Redis la file/coordination et S3 le stockage d’objets.

## Conséquences

On évite les transactions distribuées prématurées tout en isolant les profils de charge. Les limites de module et événements versionnés rendent une extraction future possible. L’API mémoire de la première tranche est uniquement une doublure testable.
