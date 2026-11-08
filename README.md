# Personal Finance Tracker API

Backend API untuk aplikasi Personal Finance Tracker.

## Production deployment with Docker Compose

Requirements: Docker Engine and Docker Compose v2.

1. Copy the environment template and set production-safe values:

   ```bash
   cp .env.example .env
   ```

   Set a strong, unique `JWT_SECRET`, `DB_PASS`, and `DB_ROOT_PASSWORD`. Keep `.env` private.

2. Build and start the API and MySQL database:

   ```bash
   docker compose up -d --build
   ```

   The database data is stored in the `mysql_data` Docker volume. The API is available at
   `http://localhost:3000` (or the port configured by `APP_PORT`).

3. Check service status and logs:

   ```bash
   docker compose ps
   docker compose logs -f api
   ```

4. Stop the services without deleting database data:

   ```bash
   docker compose down
   ```

5. To remove the database and all stored data, explicitly remove the volume:

   ```bash
   docker compose down -v
   ```

## Database lifecycle commands

Install dependencies and compile the TypeScript code before running database commands:

```bash
npm install
npm run build
```

Configure `DB_NAME`, `DB_USER`, `DB_PASS`, and `DB_HOST` in `.env`, then use:

| Command | Purpose |
| --- | --- |
| `npm run db:migrate` | Creates or alters tables to match the Sequelize models. Safe for normal deployments. |
| `npm run db:seed` | Creates an idempotent demo user, categories, and wallet. Set `SEED_EMAIL`, `SEED_PASSWORD`, and `SEED_NAME` first. Use only for development or staging. |
| `npm run db:setup` | Runs migration followed by the demo seed. |
| `npm run db:reset` | Drops all tables and recreates an empty schema. **Destructive: all data is deleted.** |

For a Compose deployment, run lifecycle commands inside the API container:

```bash
docker compose exec api npm run db:migrate
docker compose exec api npm run db:seed
docker compose exec api npm run db:reset
```

Run `db:reset` only after confirming that the database volume can be discarded. The API also synchronizes the schema during startup, but `db:migrate` is provided for an explicit deployment step.

## Fitur

- User 
    - Authentication with JWT.
    - Create, Read, Update, Delete User.
    - User statistics.

- Wallet
    - Create, Read, Update, Delete Wallets.

- Category
    - Create, Read, Update, Delete User.

- Transactions
    - Create, Read, Update, Delete Transactions.
    - Automated Calculation.
- Budgets
    - Set a general amount and inclusive start/end dates.
    - Track spending across all wallets and calculate today's remaining allowance.

## Features

- User authentication with JWT and user statistics.
- Wallet and category management.
- Transaction CRUD with automated wallet balance updates.
- Budget tracking and spending analysis.

## Documentation

- Comprehensive Technical Specification & Rebuilding Blueprint: [API_SPECIFICATION.md](API_SPECIFICATION.md)
- Web documentation can also be viewed at [fintrack.sendiko.dev/api_docs.html](https://fintrack.sendiko.dev/api_docs.html)


## Contributing

Saran dan kritik sangat saya terima, anda dapat berpartisipasi melewati issues dan pull requests.