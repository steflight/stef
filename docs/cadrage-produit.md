# Cadrage produit Kladrichat

## Vision et contexte

Kladrichat est une messagerie privée et d’équipe assistée par l’IA, conçue en priorité pour les organisations. Kladriva collabore notamment avec des personnes en Afrique habituées à WhatsApp : l’expérience doit donc être familière, mobile, simple, économe en données et robuste face aux connexions intermittentes.

Le produit cible Android, iOS et le web. Sa valeur principale est de transformer les messages et les séquences d’appels volontairement enregistrées en mémoire de travail organisée par projet, exploitable par un chef de projet : retrouver l’information, identifier les décisions et préparer les actions, selon la configuration de l’organisation et de l’utilisateur.

## Organisation du produit

Le produit vit dans le monorepo `kladrichat`. Les composants sont séparément déployables : `apps/mobile`, `apps/web`, `apps/api`, `apps/workers`, `apps/recorder`, puis `packages/contracts`, `packages/domain`, `packages/sdk`, `packages/design-tokens` et `packages/crypto`. `deploy` contient le développement local et les modèles de déploiement.

Noémie OS et le Delivery OS sont des produits distincts, reliés par API et événements. Un dépôt d’infrastructure séparé pourra être créé plus tard. Le premier déploiement cible une instance dédiée à Kladriva ; les modèles d’hébergement client restent à décider.

## Principes techniques

- TypeScript ; React Native/Expo sur mobile ; React/Next.js sur le web.
- Backend Node.js modulaire, PostgreSQL, WebSocket, file de traitements, stockage objet compatible S3.
- WebRTC pour les appels ; LiveKit est un candidat à valider.
- Passerelle IA multi-fournisseur et conteneurs pour développement/déploiement.
- Démarrer par un monolithe métier modulaire. Isoler les travaux longs et les services média du processus API.
- Verrouiller les versions compatibles et consigner les choix structurants dans les ADR.

## Identité, organisations et autorisations

Une identité est distincte de ses appartenances. Une personne peut appartenir à plusieurs organisations avec les rôles `propriétaire`, `administrateur` ou `membre`. Le serveur vérifie systématiquement les accès. Quitter une organisation retire les accès professionnels associés. Un administrateur n’obtient pas automatiquement accès aux conversations privées. Données et recherches sont strictement cloisonnées entre organisations.

## Périmètre fonctionnel

### Messagerie

Conversations individuelles et groupes ; texte, images, documents et vocaux ; réponses, mentions, réactions ; états d’envoi/réception et non-lus ; notifications configurables ; association sécurisée des appareils ; reprise sans doublons ; brouillons ; téléchargement manuel des médias en économie de données.

### Appels

Audio individuel et de groupe sur les trois plateformes, avec interruptions réseau. La vidéo vient ensuite. L’enregistrement est facultatif et commandé explicitement.

### IA et coûts

Assistant personnel, résumé ciblé, transcription/résumé des vocaux, correction, reformulation, traduction, transcription des segments d’appel autorisés, extraction des besoins/décisions/actions/risques/questions et proposition de classement par projet. Recherche et traitement portent uniquement sur les contenus explicitement autorisés. Le choix du modèle respecte la politique de l’organisation.

Le produit suit tokens entrants/sortants, minutes audio et coût estimé par utilisateur, projet, modèle et fonction. Budgets, alertes et plafonds tiennent compte de la concurrence des requêtes. Aucun fournisseur de repli ni dépassement silencieux n’est autorisé.

## « Enregistrer et transcrire »

Le toggle est **OFF par défaut à chaque appel**. OFF signifie : aucun enregistrement Kladrichat, aucune transmission audio à une IA et aucun enregistreur dans l’appel.

L’activation exige droits, information des participants, accords requis et admission du service d’enregistrement. L’indicateur devient actif seulement lorsque la capture réelle commence. La désactivation arrête la capture et retire l’enregistreur des médias futurs ; conserver ou supprimer les séquences existantes relève de la politique applicable et la suppression est une action distincte. Une réactivation crée une nouvelle séquence, sans rétroactivité.

Refus, arrivée d’un participant, retrait d’accord, incident ou déconnexion doivent être gérés. En cas d’incertitude, la capture est suspendue. L’interface reflète l’état réel (`démarrage`, `actif`, `arrêt`, `erreur`). Un compte rendu incomplet porte la mention « compte rendu partiel ».

## Confidentialité et chiffrement

Le chiffrement de bout en bout est un prérequis de la messagerie. Aucun protocole maison ne sera créé. Le protocole et ses bibliothèques, les clés, appareils, révocations, récupération et changements de groupe doivent faire l’objet d’une validation dédiée.

Deux classes de contenu restent distinctes : contenu chiffré accessible aux appareils destinataires et contenu explicitement remis aux traitements IA. Pour un appel chiffré, l’enregistreur est un destinataire temporairement autorisé ; admission, retrait et renouvellement des clés doivent être vérifiés. Transcriptions et synthèses serveur sont chiffrées au repos, soumises aux permissions et à la conservation, mais ne sont pas présentées comme opaques au serveur.

Une interface ou un placeholder ne constitue jamais une preuve de chiffrement opérationnel.

## Mémoire projet

Un appel peut concerner plusieurs projets. L’IA peut proposer résumé, besoins, décisions confirmées, suggestions, engagements, actions, responsables et échéances identifiables, risques, questions et changements potentiels de périmètre. Chaque élément conserve un lien vers le message ou passage horodaté source.

Ni responsable ni date ne sont inventés ; une étude est distincte d’un engagement. Le chef de projet corrige, approuve ou rejette avant transfert. Associer un contenu à un projet n’élargit pas automatiquement ses permissions. Le Delivery OS porte les tâches validées et leur exécution ; Kladrichat conserve échanges, sources et liens.

## WhatsApp

Deux fonctions sont distinctes : import contrôlé d’un export, puis éventuel connecteur continu après étude de faisabilité. Elles exigent contrôle du compte, sélection des sources, prévisualisation, déduplication, origine et arrêt de collecte. Autoriser l’import n’autorise pas l’IA. Aucune synchronisation universelle de comptes personnels ni aucun enregistrement d’appels WhatsApp n’est promis ; les premiers appels enregistrables sont passés dans Kladrichat.

## Expérience

Navigation familière inspirée des usages WhatsApp, sans copie d’identité ; interface professionnelle, sobre, aérée, mobile-first, lisible et accessible. Les états réseau, IA et enregistrement sont explicites. Aucun logo officiel n’existe : seul le nom « Kladrichat » est utilisé provisoirement.

## Stories de lancement

### KC-001 — Rejoindre une organisation et échanger

Un administrateur crée une organisation et invite un membre. Deux membres échangent ensuite des messages texte privés chiffrés. Le résultat couvre authentification et invitation, annuaire autorisé, temps réel, états et non-lus, reprise idempotente, association sûre des appareils, cloisonnement des organisations et parcours Android/iOS/web.

### KC-002 — Collaborer dans un groupe

Un membre autorisé crée un groupe et partage textes, images, documents et vocaux. Le résultat couvre membres/administrateurs, réponses/mentions/réactions, chiffrement des contenus, règle d’historique des nouveaux membres, exclusion des futurs échanges, notifications, économie de données, reprise et trois plateformes.

Ces stories sont décomposées en tâches vérifiables dans le backlog sans perdre leur résultat utilisateur.

## Priorités après le socle

1. Appels audio multiplateformes.
2. Prototype chiffrement + toggle + enregistrement sélectif.
3. Gouvernance IA et budgets.
4. Transcription et comptes rendus par projet.
5. Validation et transfert au Delivery OS.
6. Assistant et enrichissement des messages.
7. Import WhatsApp, puis connecteur continu.
8. Réunions planifiées, vidéo et mémoire projet avancée.

## Critères de communication de livraison

Une version mobile attendue inclut un Android installable et un iOS distribuable en test. Compilation, installation et test sur appareil réel sont rapportés séparément, avec les prérequis de signature manquants. Aucune plateforme n’est dite validée sans test réel et aucune simulation n’est présentée comme terminée.
