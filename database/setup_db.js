const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config();

async function runMigration() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('ERROR: DATABASE_URL is not defined in .env');
    process.exit(1);
  }

  console.log('Connecting to Supabase PostgreSQL database...');
  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('Successfully connected to database.');

    const sqlPath = path.join(__dirname, 'schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Executing schema.sql...');
    await client.query(sql);
    console.log('Schema migration and seeding completed successfully!\n');

    // Verification queries
    console.log('--- Verifying Tables and Counts ---');
    const tables = ['schemes', 'channel_partners', 'applications', 'application_guidance'];
    for (const table of tables) {
      const res = await client.query(`SELECT COUNT(*) FROM ${table}`);
      console.log(`Table '${table}': ${res.rows[0].count} rows`);
    }

    console.log('\n--- Schemes Summary ---');
    const schemesRes = await client.query('SELECT id, name, scheme_type, min_amount, max_amount, rate_min, rate_max FROM schemes');
    console.table(schemesRes.rows);

    console.log('\n--- Channel Partners Summary ---');
    const partnersRes = await client.query('SELECT id, name, partner_type, city, is_real_verified FROM channel_partners');
    console.table(partnersRes.rows);

    console.log('\n--- Application Guidance Summary ---');
    const guidanceRes = await client.query('SELECT g.id, s.name as scheme_name, array_length(g.required_documents, 1) as doc_count, array_length(g.application_steps, 1) as step_count FROM application_guidance g JOIN schemes s ON g.scheme_id = s.id');
    console.table(guidanceRes.rows);

    console.log('\n--- RLS Status ---');
    const rlsRes = await client.query(`
      SELECT tablename, rowsecurity 
      FROM pg_tables 
      WHERE schemaname = 'public' AND tablename IN ('schemes', 'channel_partners', 'applications', 'application_guidance')
    `);
    console.table(rlsRes.rows);

  } catch (err) {
    console.error('Migration failed:', err);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

runMigration();
