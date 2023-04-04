import path from 'node:path';
import fs from 'node:fs/promises';
import pg from 'pg';
import pgFormat from 'pg-format';

await main();

async function main() {
  let client;

  console.log('1. Establishing connection to PostgreSQL database...');
  client = await createConnection();
  try {
    console.log('   Connection established.');

    console.log('2. Loading Hadley Centre observations dataset from file...');
    const hadcetRaw = await loadHadcetDataRaw();
    console.log('   Dataset loaded. Total size:  %d characters (probably bytes).', hadcetRaw.length);

    console.log('3. Parsing dataset lines...');
    const hadcetEntries = parseHadcetDatasetEntries(hadcetRaw);
    console.log('   Finished parsing.');

    console.log('4. Aggregating dataset by year and day...');
    const hadcetAggregated = aggregateDatasetEntries(hadcetEntries);
    console.log('   Finished aggregating data. Total rows: %d', hadcetAggregated.size);

    console.log('5. Creating a table called "hadcet" into which the data will be inserted...');
    await createHadcetTable(client);
    console.log('   Table "hadcet" has been created.');

    console.log('6. Uploading data to database table...');
    await insertHadcetData(client, hadcetAggregated);
    console.log('   Finished uploading data.');

    console.log('7. Committing transaction...');
    await client.query('commit');
    console.log('   Transaction committed.');

    console.log('8. Closing connection to database...');
  } finally {
    if (client) {
      await client.end();
    }
  }
  console.log('   Connection closed.');
  console.log('\nALL DONE!');
}

async function createConnection() {
  const client = new pg.Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres_hadcet',
    password: '1234!@#$',
    database: 'postgres',
  });
  try {
    await client.connect();
  } catch (error) {
    throw new Error(`Failed to connect to PostgreSQL database. Error: ${error.message}`);
  }
  return client;
}

async function loadHadcetDataRaw() {
  const relativePath = './hadcet/meantemp_daily_totals.txt';
  const absolutePath = path.join(process.cwd(), relativePath);
  try {
    return await fs.readFile(absolutePath, 'utf8');
  } catch (error) {
    throw new Error(`Failed to load Hadley Centre dataset from file [${absolutePath}]. Error: ${error.message}`);
  }
}

function parseHadcetDatasetEntries(hadcetRaw) {
  return hadcetRaw
    .split('\n') // Split into lines.
    .filter(line => line.length > 0) // Remove empty lines.
    .slice(1) // Remove header line.
    .map(line => line.split(/\s+/)) // Split each line into columns.
    .map(([yyyymmdd, temperature]) => {
      const date = new Date(yyyymmdd);
      return {
        year: date.getUTCFullYear(),
        month: date.getUTCMonth() + 1,
        day: date.getUTCDate(),
        temperature: Number(temperature) * 10,
      };
    });
}

function aggregateDatasetEntries(hadcetEntries) {
  const map = new Map();
  for (const row of hadcetEntries) {
    const key = `${row.year}-${row.day}`;
    let entry = map.get(key);
    if (!entry) {
      entry = [
        row.year,
        row.day,
      ];
      map.set(key, entry);
    }
    entry.push(row.temperature);
  }
  const aggregateData = Array.from(map.values());
  for (const entry of aggregateData) {
    while (entry.length < 14) {
      entry.push('-999');
    }
  }
  return aggregateData;
}

async function createHadcetTable(client) {
  await client.query(`
      create table hadcet (
        yr int,
        dy int,
        m1 int,
        m2 int,
        m3 int,
        m4 int,
        m5 int,
        m6 int,
        m7 int,
        m8 int,
        m9 int,
        m10 int,
        m11 int,
        m12 int
      );
    `);
}

async function insertHadcetData(client, hadcetAggregated) {
  const template = `
    INSERT INTO public.hadcet (
      yr,
      dy,
      m1,
      m2,
      m3,
      m4,
      m5,
      m6,
      m7,
      m8,
      m9,
      m10,
      m11,
      m12
    ) VALUES %L
  `;
  const query = pgFormat(template, hadcetAggregated);
  await client.query(query);
}
