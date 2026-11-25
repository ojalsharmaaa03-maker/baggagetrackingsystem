// Local test harness (CJS): bundles the Netlify function as CommonJS and runs
// the handler with mock Netlify events. CJS is what makes dynamic require()
// (depd/express/etc.) work at runtime.
const esbuild = require('esbuild');

const OUT = '/tmp/airbag-fn-test.cjs';

esbuild.build({
  entryPoints: ['netlify/functions/api.js'],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  outfile: OUT,
  logLevel: 'info'
}).then(async () => {
  delete require.cache[OUT];
  const mod = require(OUT);
  const handler = mod.handler;

  function mockEvent({ method = 'GET', path, body }) {
    return {
      httpMethod: method,
      path,
      headers: { 'content-type': 'application/json' },
      queryStringParameters: {},
      isBase64Encoded: false,
      body: body ? JSON.stringify(body) : null,
      requestContext: { identity: { sourceIp: '127.0.0.1' } }
    };
  }

  function show(label, r) {
    let body = r.body;
    try { body = JSON.parse(r.body); } catch {}
    console.log('\n=== ' + label + ' ===');
    console.log('statusCode:', r.statusCode);
    console.log('body:', typeof body === 'string' ? body : JSON.stringify(body));
  }

  // 1. Health
  let r = await handler(mockEvent({ path: '/.netlify/functions/api/api/health' }), {});
  show('GET /api/health', r);

  // 2. Register
  const email = 'testuser_' + Date.now() + '@example.com';
  r = await handler(mockEvent({
    method: 'POST',
    path: '/.netlify/functions/api/api/auth/register',
    body: { full_name: 'Test User', email, password: 'Password123', confirmPassword: 'Password123', role: 'Passenger' }
  }), {});
  show('POST /api/auth/register', r);
  const reg = JSON.parse(r.body);

  // 3. Login with new account
  r = await handler(mockEvent({
    method: 'POST',
    path: '/.netlify/functions/api/api/auth/login',
    body: { email, password: 'Password123' }
  }), {});
  show('POST /api/auth/login (new account)', r);

  // 4. Wrong password
  r = await handler(mockEvent({
    method: 'POST',
    path: '/.netlify/functions/api/api/auth/login',
    body: { email, password: 'WrongPassword!' }
  }), {});
  show('POST /api/auth/login (wrong password)', r);

  // 5. Unregistered email
  r = await handler(mockEvent({
    method: 'POST',
    path: '/.netlify/functions/api/api/auth/login',
    body: { email: 'nobody@nowhere.com', password: 'Password123' }
  }), {});
  show('POST /api/auth/login (unregistered)', r);

  // 6. Duplicate registration
  r = await handler(mockEvent({
    method: 'POST',
    path: '/.netlify/functions/api/api/auth/register',
    body: { full_name: 'Dup User', email, password: 'Password123', role: 'Passenger' }
  }), {});
  show('POST /api/auth/register (duplicate)', r);

  console.log('\nRegister success flag:', reg.success);
  process.exit(0);
}).catch((e) => { console.error(e); process.exit(1); });
