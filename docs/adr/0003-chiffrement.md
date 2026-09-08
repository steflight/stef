# ADR-0003 — Chiffrement éprouvé, sans protocole maison

- Statut : proposé, validation sécurité requise
- Date : 2026-09-07

## Contexte

AES-GCM protège une charge avec une clé connue mais ne résout ni échange de clés, identité, multi-appareil, groupes, récupération ni confidentialité persistante.

## Décision

Évaluer une implémentation maintenue du protocole Signal pour les dialogues et Messaging Layer Security (MLS, RFC 9420) pour les groupes, selon disponibilité et maturité React Native/web. Faire revoir le choix et les scénarios multi-appareil par un spécialiste. Ne jamais implémenter nous-mêmes ces protocoles.

Le prototype expose seulement des enveloppes AES-256-GCM Web Crypto et injecte la clé hors bande ; il prouve que l’API peut rester aveugle au texte, **pas** que l’E2EE produit est terminé.

## Points à trancher

Bibliothèques supportées, stockage matériel des clés, QR de liaison, rotation/révocation, récupération, sauvegarde chiffrée, ajout/retrait de groupe, notifications et traitement IA explicitement consenti. Pour les appels, vérifier l’admission/retrait cryptographique du recorder avec LiveKit E2EE avant décision.
