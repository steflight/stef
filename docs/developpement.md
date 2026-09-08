# Développement et vérifications

## Prérequis communs

- Node.js 22+ ; npm 11+ ; `npm install` à la racine. Les versions directes sont verrouillées dans les manifestes ; le lockfile devra être généré dès que le registre npm est accessible.
- Docker Compose est facultatif pour lancer PostgreSQL, Redis et MinIO : `docker compose -f deploy/compose.yaml up -d`.
- La tranche actuelle utilise une mémoire volatile : chaque redémarrage API efface ses données.

## API

```bash
npm run dev:api
curl http://localhost:4000/health
```

`POST /dev/sessions` est une facilité locale et **pas une authentification de production**. Le parcours test automatisé documente les appels organisation, invitation, conversation et message dans `apps/api/test/api.test.ts`.

## Web

```bash
npm run dev:web
# ouvrir http://localhost:3000
```

L’écran est une amorce responsive fidèle à la direction visuelle. Ses données sont encore statiques : il ne faut pas le présenter comme le parcours KC-001 terminé.

## Mobile Android et iOS

```bash
npm run dev:mobile
npm run android -w @kladrichat/mobile
npm run ios -w @kladrichat/mobile
```

Ces commandes démarrent Expo ; elles ne prouvent ni build signé ni installation réelle. Pour distribuer : configurer un compte Expo/EAS, les credentials Android (keystore), un compte Apple Developer, certificats/profils et appareils/TestFlight, puis produire des builds EAS. Aucun credential de signature n’est présent dans le dépôt.

État de vérification initial : typecheck seulement. Android et iOS n’ont pas été compilés, installés ou testés sur appareil réel dans cette livraison.

## Workers et recorder

```bash
npm run start -w @kladrichat/workers
npm run start -w @kladrichat/recorder
```

Ces processus matérialisent uniquement les frontières de déploiement. Le recorder est inactif et n’enregistre aucun média. L’implémentation attend la preuve consentement + LiveKit + chiffrement décrite dans l’ADR-0003.

## Qualité

```bash
npm run typecheck
npm test
npm run build -w @kladrichat/web
```

Les tests couvrent l’usage unique et le destinataire d’une invitation, le cloisonnement inter-organisation, la participation aux conversations, la livraison idempotente, la reprise par curseur et le chiffrement authentifié d’une enveloppe. Les E2E navigateur/appareil et WebSocket sous coupure réseau restent au backlog.
