/**
 * Verifies the Supabase connection using the values in apps/backend/.env.
 *
 * Run with: npm run db:check
 *
 * Never prints key values - only whether each check passed. Exits non-zero if
 * a required check fails, so it can be used in CI.
 *
 * Note on standards: AGENTS.md forbids console output in committed code. That
 * rule governs src/. This is a developer CLI whose entire purpose is to print a
 * report, and it is excluded from the build.
 */

const results = [];

/**
 * Records a check result for the final report
 */
function record(name, ok, detail) {
  results.push({ name, ok, detail });
}

/**
 * Performs a GET against Supabase and returns status plus a short body snippet
 */
async function probe(url, key) {
  try {
    const response = await fetch(url, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    const body = await response.text();
    return { status: response.status, body: body.slice(0, 200) };
  } catch (error) {
    return { status: 0, body: error.message };
  }
}

const url = process.env.SUPABASE_URL;
const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;
const secretKey = process.env.SUPABASE_SECRET_KEY;
const databaseUrl = process.env.DATABASE_URL;

if (!url) {
  console.error('SUPABASE_URL is not set. Copy .env.example to .env and fill it in.');
  process.exit(1);
}

// 1. Project reachable
const health = await probe(`${url}/auth/v1/health`, publishableKey ?? '');
record('Project reachable', health.status === 200, `HTTP ${health.status}`);

// 2. Publishable key accepted.
// A missing table (PGRST205) still proves the key authenticated, so treat 200
// and 404 as success and only a 401 as a genuine key failure.
if (publishableKey) {
  const rest = await probe(`${url}/rest/v1/articles?select=id&limit=1`, publishableKey);
  const accepted = rest.status !== 401 && rest.status !== 0;
  const schemaMissing = rest.body.includes('PGRST205');
  record(
    'Publishable key accepted',
    accepted,
    schemaMissing ? 'valid - schema not created yet' : `HTTP ${rest.status}`,
  );
} else {
  record('Publishable key accepted', false, 'SUPABASE_PUBLISHABLE_KEY not set');
}

// 3. Secret key accepted. The /rest/v1/ root is secret-key-only, which makes it
// the cleanest way to prove the secret key works.
if (secretKey) {
  const root = await probe(`${url}/rest/v1/`, secretKey);
  record('Secret key accepted', root.status === 200, `HTTP ${root.status}`);
} else {
  record('Secret key accepted', false, 'SUPABASE_SECRET_KEY not set - required for drafts and writes');
}

// 4. DATABASE_URL sanity. Only shape is checked; connecting needs the pg driver.
if (databaseUrl) {
  const placeholder = databaseUrl.includes('YOUR-PASSWORD');
  record('DATABASE_URL configured', !placeholder, placeholder ? 'password placeholder not replaced' : 'shape looks valid (not connected)');
} else {
  record('DATABASE_URL configured', false, 'not set');
}

console.log('\nSupabase connection check\n');
for (const { name, ok, detail } of results) {
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${name.padEnd(28)} ${detail}`);
}

const required = results.filter((r) => r.name !== 'Secret key accepted');
const failed = required.filter((r) => !r.ok);
console.log(failed.length === 0 ? '\nCore connection is working.\n' : `\n${failed.length} required check(s) failed.\n`);
process.exit(failed.length === 0 ? 0 : 1);
