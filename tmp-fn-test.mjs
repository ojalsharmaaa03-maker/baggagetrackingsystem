// Local test harness: bundles the Netlify function with esbuild (ESM, like Netlify)
// and exercises the handler with mock Netlify events.
import { build } from 'esbuild';
import { pathToFileURL } from 'url';

const OUT = '/tmp/airbag-fn-test.mjs';

await build({
  entryPoints: ['netlify/functions/api.js'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile: OUT,
  logLevel: 'info'
});

const mod = await import(pathToFileURL(OUT).href);
const handler = mod.handler;

function mockEvent({ method = 'GET', path, body }) {
  const event = {
    httpMethod: method,
    path,                       // Netlify sets event.path to the function invocation path
    headers: { 'content-type': 'application/json' },
    queryStringParameters: {},
    isBase64Encoded: false,
    body: body ? JSON.stringify(body) : null,
    requestContext: { identity: { sourceIp: '127.0.0.1' } }
  };
  return event;
}

function show(label, r) {
  let body = r.body;
  try { body = JSON.parse(r.body); } catch {}
  console.log(`\n=== ${label} ===`);
  console.log('statusCode:', r.statusCode);
  console.log('headers:', JSON.stringify(r.headers));
  console.log('body:', typeof body === 'string' ? body : JSON.stringify(body));
}

// 1. Health
let r = await handler(mockEvent({ path: '/.netlify/functions/api/api/health' }), {});
show('GET /api/health', r);

// 2. Register
const email = 'testuser_' + Date.now() + '@example.com';
r = await handler(
  mockEvent({
    method: 'POST',
    path: '/.netlify/functions/api/api/auth/register',
    body: { full_name: 'Test User', email, password: 'Password123', confirmPassword: 'Password123', role: 'Passenger' }
  }),
  {}
);
show('POST /api/auth/register', r);
const reg = JSON.parse(r.body);

// 3. Login with the new account
r = await handler(
  mockEvent({
    method: 'POST',
    path: '/.netlify/functions/api/api/auth/login',
    body: { email, password: 'Password123' }
  }),
  {}
);
show('POST /api/auth/login (new account)', r);

// 4. Login with wrong password
r = await handler(
  mockEvent({
    method: 'POST',
    path: '/.netlify/functions/api/api/auth/login',
    body: { email, password: 'WrongPassword!' }
  }),
  {}
);
show('POST /api/auth/login (wrong password)', r);

// 5. Unregistered email
r = await handler(
  mockEvent({
    method: 'POST',
    path: '/.netlify/functions/api/api/auth/login',
    body: { email: 'nobody@nowhere.com', password: 'Password123' }
  }),
  {}
);
show('POST /api/auth/login (unregistered)', r);

console.log('\nRegister success flag:', reg.success);
