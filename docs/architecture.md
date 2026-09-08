# Architecture initiale

## Vue d’ensemble

Le monorepo npm contient des applications déployables et des packages partageables. La première tranche exécutable reste volontairement petite : une API modulaire en mémoire, un client web Next.js et une coquille Expo partageant contrats, domaine, SDK, tokens et primitives cryptographiques.

```text
clients web/mobile -> SDK HTTP + WebSocket -> API modulaire -> PostgreSQL (cible)
                                                |
                                                +-> file -> workers / IA
                                                +-> LiveKit -> recorder autorisé
```

L’API actuelle emploie un dépôt mémoire pour rendre les règles testables. Ce dépôt n’est pas un choix de production. Son interface doit être remplacée par PostgreSQL avant tout environnement partagé.

## Modules métier initiaux

- **Identité** : sessions de démonstration, futures identités vérifiées et appareils.
- **Organisation** : appartenances, rôles et invitations à usage unique.
- **Conversation** : dialogue privé dans une organisation, seulement entre membres actifs.
- **Message** : enveloppe chiffrée opaque, identifiant client idempotent, curseur monotone, accusé de réception serveur.
- **Temps réel** : diffusion WebSocket après autorisation ; la reprise utilise le curseur HTTP et déduplique par `clientMessageId`.

## Frontières de sécurité

Le serveur reçoit une enveloppe chiffrée (`ciphertext`, `nonce`, version d’algorithme), jamais le texte clair dans le parcours de message. Il vérifie organisation, appartenance et participation à chaque lecture/écriture. Les identifiants transmis par le client ne constituent jamais une autorisation.

Le package crypto actuel illustre le chiffrement authentifié AES-256-GCM avec Web Crypto à partir d’une clé de conversation déjà distribuée. **Il ne constitue pas un protocole E2EE complet** : distribution/rotation des clés, vérification d’identité, multi-appareil, récupération et groupes restent bloquants. L’ADR 0003 définit le chemin de sélection d’un protocole éprouvé.

## Résilience et données limitées

- `clientMessageId` stable pour réessayer un envoi sans duplication.
- curseur monotone pour reprendre après coupure ; le client conserve localement le dernier curseur ; les médias ne sont pas inclus dans la première tranche.
- événements compacts et versionnés ; les pièces jointes futures seront téléchargées à la demande.

## Déploiement

Chaque application possède son manifeste. `deploy/compose.yaml` fournit PostgreSQL, Redis et MinIO pour l’évolution locale ; l’API mémoire actuelle peut démarrer sans eux. Workers et recorder sont des processus séparés, initialisés comme bornes explicites mais sans prétendre implémenter transcription ou enregistrement.

## Risques ouverts

1. Choix et audit du protocole E2EE/multi-appareil.
2. Stratégie d’identité, récupération et invitation anti-abus.
3. Persistance transactionnelle et outbox temps réel.
4. Compatibilité E2EE de groupe et média avec LiveKit/recorder.
5. Notifications mobiles sans fuite de contenu.
6. Contraintes légales de consentement et conservation par juridiction.
