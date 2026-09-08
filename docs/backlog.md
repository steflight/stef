# Backlog produit initial

Statuts : **fait dans la tranche** signifie testé dans le prototype, pas prêt production.

## KC-001 — Rejoindre une organisation et échanger

| ID | Tâche vérifiable | État |
|---|---|---|
| KC-001.1 | Modéliser identité, appartenance et rôles séparément | Fait dans la tranche |
| KC-001.2 | Créer une organisation et son propriétaire | Fait dans la tranche |
| KC-001.3 | Émettre/accepter une invitation à usage unique | Fait dans la tranche |
| KC-001.4 | Limiter l’annuaire aux membres de l’organisation demandée | Fait dans la tranche |
| KC-001.5 | Refuser toute lecture/écriture inter-organisation | Fait dans la tranche + tests |
| KC-001.6 | Créer une conversation privée entre membres actifs | Fait dans la tranche |
| KC-001.7 | Livrer une enveloppe chiffrée en temps réel | Fait dans la tranche (API/WS) |
| KC-001.8 | Dédupliquer les reprises via `clientMessageId` | Fait dans la tranche + tests |
| KC-001.9 | Reprendre par curseur et calculer les non-lus | Reprise faite ; non-lus à compléter |
| KC-001.10 | Remplacer les sessions de démo par une authentification vérifiée | À faire |
| KC-001.11 | Persister avec PostgreSQL et outbox transactionnelle | À faire |
| KC-001.12 | Choisir/implémenter un protocole E2EE audité et multi-appareil | À faire — bloquant production |
| KC-001.13 | Association, vérification et révocation d’appareils | À faire |
| KC-001.14 | Parcours complet et accessible web | Amorçage seulement |
| KC-001.15 | Parcours complet Android/iOS, hors Expo Go | Amorçage seulement |
| KC-001.16 | Tests E2E réseau interrompu sur appareil et navigateur | À faire |

## KC-002 — Collaborer dans un groupe (prochaine étape)

1. Définir rôles de groupe séparés des rôles d’organisation.
2. Établir et tester la règle d’historique : par défaut, un nouveau membre ne reçoit que les messages postérieurs à son admission.
3. Rotation de clés à chaque ajout/retrait ; un membre retiré ne reçoit plus aucun échange futur.
4. Messages, réponses, mentions et réactions idempotents.
5. Pièces jointes chiffrées avant téléversement S3, métadonnées minimales.
6. Vocaux avec téléchargement manuel en économie de données.
7. Notifications configurables sans texte clair côté fournisseur push.
8. Reprise et tests de concurrence/hors-ligne sur les trois plateformes.

## Après le socle

`KC-010` appels audio ; `KC-011` preuve chiffrement/enregistrement sélectif ; `KC-020` gouvernance IA/budgets ; `KC-021` transcription et mémoire projet ; `KC-022` revue humaine et Delivery OS ; `KC-023` assistant ; `KC-030` import WhatsApp ; `KC-031` étude connecteur continu ; `KC-040` réunions/vidéo/mémoire avancée.

## Définition de terminé

Une tâche n’est terminée que si son code réel, contrôles serveur, tests automatisés et documentation concordent. Android/iOS nécessitent build signé, installation et vérification sur appareils réels consignés séparément. Les démonstrateurs crypto, IA ou recorder sont explicitement étiquetés comme tels.
