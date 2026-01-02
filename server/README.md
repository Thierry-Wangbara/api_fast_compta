# API Fast Compta - Backend

## Structure

- `database.ts` - Configuration et initialisation de SQLite
- `db-schema.ts` - Schéma de base de données (adapté de l'application mobile)
- `index.ts` - Serveur Express avec les routes API
- `utils/uid.ts` - Utilitaires pour générer et valider les UID

## Base de données

La base de données SQLite est créée automatiquement dans `data/compta.db` avec le schéma complet de l'application mobile.

### Tables principales

- **accountings** - Comptabilités (master, linked, standalone)
- **transactions** - Transactions (income, expense, transfer)
- **app_settings** - Paramètres de l'application
- **goals** - Objectifs financiers
- **debts** - Dettes et crédits
- **savings** - Épargnes
- Et autres tables du schéma mobile

## Endpoints API

### Health Check
- `GET /api/health` - Vérifier l'état de l'API

### UID
- `POST /api/uid` - Générer un UID unique pour identifier un utilisateur

### Accountings
- `GET /api/accountings` - Liste des comptabilités
- `GET /api/accountings/:code` - Détails d'une comptabilité
- `POST /api/accountings` - Créer une comptabilité

### Transactions
- `GET /api/transactions` - Liste des transactions (query: ?accounting_code=, ?kind=, ?limit=)
- `GET /api/transactions/:tx_code` - Détails d'une transaction
- `POST /api/transactions` - Créer une transaction

### Settings
- `GET /api/settings` - Tous les paramètres
- `GET /api/settings/:key` - Un paramètre spécifique
- `PUT /api/settings/:key` - Mettre à jour un paramètre

## Utilisation

### Démarrer le serveur

```bash
npm run dev:server
```

Le serveur démarre sur `http://localhost:3001`

### Vérifier que le serveur fonctionne

```bash
curl http://localhost:3001/api/health
```

Réponse:
```json
{
  "status": "ok",
  "message": "API Fast Compta is running"
}
```

### Générer un UID

```bash
curl -X POST http://localhost:3001/api/uid
```

Réponse:
```json
{
  "uid": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Utiliser l'UID dans les requêtes

Pour les routes qui nécessitent un UID (si implémenté), utilisez le header:
```
X-User-Id: 550e8400-e29b-41d4-a716-446655440000
```

## Notes

- Pas de système d'authentification classique
- Utilisation d'un UID unique pour distinguer les utilisateurs
- Les timestamps sont en millisecondes depuis epoch (comme dans l'app mobile)
- Les montants sont en entiers (centimes pour XAF)


