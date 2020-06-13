/* eslint-disable no-template-curly-in-string */
const pgp = require('pg-promise')();

const db = pgp({
  connectionString: process.env.POSTGRES_URL,
  max: 10,
});

const ensureMigrationsTable = (database) => database.query(
  'CREATE TABLE IF NOT EXISTS migrations (id integer PRIMARY KEY, data jsonb NOT NULL)',
);

const postgresStateStorage = {
  async load(fn) {
    await ensureMigrationsTable(db);
    // Load the single row of migration data from the database
    const { rows = [] } = await db.query('SELECT data FROM migrations');

    if (rows.length !== 1) {
      console.log(
        'Cannot read migrations from database. If this is the first time you run migrations, then this is normal.',
      );

      return fn(null, {});
    }

    // Call callback with new migration data object
    return fn(null, rows[0].data);
  },

  async save(set, fn) {
    // Check if table 'migrations' exists and if not, create it.
    await ensureMigrationsTable(db);

    const migrationMetaData = {
      lastRun: set.lastRun,
      migrations: set.migrations,
    };

    await db.query(
      'INSERT INTO migrations (id, data) VALUES (1, ${migrationMetaData}) ON CONFLICT (id) DO UPDATE SET data = ${migrationMetaData}', { migrationMetaData },
    );

    fn();
  },
};

module.exports = Object.assign(() => postgresStateStorage, postgresStateStorage);
