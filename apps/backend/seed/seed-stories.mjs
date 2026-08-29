/**
 * Posts the sample Stories and publishes them.
 *
 * Reads the session from a cookie jar you create by logging in, so the cookie
 * value is never typed, pasted or stored in this repo.
 *
 *   1. node seed/seed-stories.mjs --login
 *      Prompts for email and password, writes seed/.cookies (gitignored).
 *
 *   2. node seed/seed-stories.mjs
 *      Posts every Story in sample-stories.json and publishes it.
 *
 * Run from apps/backend.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';

const API = process.env.API_URL ?? 'http://localhost:4000';
const COOKIE_FILE = new URL('./.cookies', import.meta.url);
const STORIES_FILE = new URL('./sample-stories.json', import.meta.url);

/**
 * Reads a line from the terminal, masking nothing - the password is echoed by
 * the terminal, not by this script. Use a throwaway terminal if that matters.
 */
async function ask(question, { silent = false } = {}) {
  const rl = createInterface({ input: stdin, output: stdout, terminal: true });

  if (!silent) {
    const answer = await rl.question(question);
    rl.close();
    return answer.trim();
  }

  // Suppress echo for the password.
  stdout.write(question);
  const previousRawMode = stdin.isRaw;
  rl.close();

  return await new Promise((resolve) => {
    const chars = [];
    stdin.setRawMode?.(true);
    stdin.resume();

    const onData = (buffer) => {
      const char = buffer.toString('utf8');

      if (char === '\r' || char === '\n') {
        stdin.setRawMode?.(previousRawMode ?? false);
        stdin.pause();
        stdin.off('data', onData);
        stdout.write('\n');
        resolve(chars.join('').trim());
        return;
      }

      if (char === '') {
        process.exit(1);
      }

      if (char === '') {
        chars.pop();
        return;
      }

      chars.push(char);
    };

    stdin.on('data', onData);
  });
}

/**
 * Signs in and stores the session cookie for later runs.
 */
async function login() {
  const email = await ask('Admin email: ');
  const password = await ask('Password: ', { silent: true });

  const response = await fetch(`${API}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    console.error('Login failed:', payload?.message ?? response.statusText);
    process.exit(1);
  }

  const setCookie = response.headers.get('set-cookie');
  const match = setCookie?.match(/fs_session=([^;]+)/);

  if (!match) {
    console.error('Login succeeded but no session cookie was returned.');
    process.exit(1);
  }

  // Set-Cookie percent-encodes the value (base64%3A...), and the backend
  // compares against a literal "base64:" prefix. Decode before storing, the
  // same way the admin app does.
  let value = match[1].replace(/^"|"$/g, '');
  try {
    value = decodeURIComponent(value);
  } catch {
    // Already decoded.
  }

  writeFileSync(COOKIE_FILE, value, 'utf8');
  console.log('Signed in. Session saved to seed/.cookies');
}

/**
 * Posts every sample Story and publishes it.
 */
async function seed() {
  if (!existsSync(COOKIE_FILE)) {
    console.error('No session found. Run: node seed/seed-stories.mjs --login');
    process.exit(1);
  }

  const cookie = `fs_session=${readFileSync(COOKIE_FILE, 'utf8').trim()}`;
  const stories = JSON.parse(readFileSync(STORIES_FILE, 'utf8'));

  let created = 0;

  for (const story of stories) {
    const createResponse = await fetch(`${API}/api/articles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: cookie },
      body: JSON.stringify(story),
    });

    const createPayload = await createResponse.json().catch(() => null);

    if (!createResponse.ok || !createPayload?.data?.id) {
      console.error(`  FAILED  ${story.slug}: ${createPayload?.message ?? createResponse.status}`);
      continue;
    }

    const id = createPayload.data.id;

    const publishResponse = await fetch(`${API}/api/articles/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Cookie: cookie },
      body: JSON.stringify({ status: 'published' }),
    });

    if (!publishResponse.ok) {
      const publishPayload = await publishResponse.json().catch(() => null);
      console.error(`  CREATED BUT NOT PUBLISHED  ${story.slug}: ${publishPayload?.message ?? publishResponse.status}`);
      continue;
    }

    created += 1;
    console.log(`  published  /story/${story.slug}/${id}`);
  }

  console.log(`\n${created} of ${stories.length} Stories published.`);
}

if (process.argv.includes('--login')) {
  await login();
} else {
  await seed();
}
