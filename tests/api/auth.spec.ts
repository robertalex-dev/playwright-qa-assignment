import { test, expect } from '@fixtures/test';
import type { LoginResponse, MeResponse } from '@api/DummyJsonClient';
import { config } from '@data/env';
import { decodeJwt, isJwtExpired, maskToken } from '@utils/jwt';

const { username, password } = config.dummyJson;

test.describe('DummyJSON — Scenario 7: login via API and validate the user', () => {
  test('POST /auth/login returns a JWT, GET /auth/me with it returns the same user', async ({
    dummyJson,
  }) => {
    // Step 1 — authenticate
    const loginResponse = await dummyJson.login(username, password);
    expect(loginResponse.status(), 'login should succeed').toBe(200);
    expect(loginResponse.headers()['content-type']).toContain('application/json');

    const login = (await loginResponse.json()) as LoginResponse;
    expect(login.username).toBe(username);
    expect(login.id).toEqual(expect.any(Number));

    // Step 2 — extract the token
    const { accessToken } = login;
    expect(accessToken, 'accessToken must be present').toBeTruthy();
    expect(accessToken.split('.'), 'a JWT has exactly three dot-separated segments').toHaveLength(3);

    // Step 7 — log the JWT (the task asks for the full value; in a real project we'd log maskToken() only)
    console.log('accessToken (full):', accessToken);
    console.log('accessToken (masked):', maskToken(accessToken));

    // Step 6 — inspect / decode the token (header + payload are base64url JSON; no secret needed to *read* them)
    const decoded = decodeJwt(accessToken);
    console.log('JWT header:', decoded.header);
    console.log('JWT payload:', decoded.payload);

    expect(decoded.header.alg).toMatch(/^(HS|RS|ES)\d{3}$/); // a real signing algorithm, never "none"
    expect(decoded.payload['username']).toBe(username);
    expect(decoded.payload['id']).toBe(login.id);
    expect(decoded.payload.exp).toBeGreaterThan(decoded.payload.iat ?? 0);
    expect(isJwtExpired(decoded.payload), 'freshly issued token must not be expired').toBe(false);

    // Step 3 — call a protected endpoint with the Bearer token
    const meResponse = await dummyJson.me(accessToken);
    expect(meResponse.status()).toBe(200);
    const me = (await meResponse.json()) as MeResponse;

    // Step 4 — the required assertion
    expect(me.username).toBe('emilys');

    // Step 5 — additional assertions: /auth/me describes the same identity that logged in
    expect(me.id).toBe(login.id);
    expect(me.email).toBe(login.email);
    expect(me.firstName).toBe(login.firstName);
    expect(me.lastName).toBe(login.lastName);
    expect(me.email).toMatch(/^[^@\s]+@[^@\s]+\.[^@\s]+$/);
    expect(me).not.toHaveProperty('accessToken'); // profile endpoint must not leak tokens
  });

  test('GET /auth/me without a valid token is rejected', async ({ dummyJson }) => {
    const response = await dummyJson.me('not-a-real-token');
    expect(response.ok()).toBe(false);
    expect([401, 403]).toContain(response.status());
  });

  test('POST /auth/login with wrong credentials is rejected', async ({ dummyJson }) => {
    const response = await dummyJson.login(username, 'definitely-wrong');
    expect(response.ok()).toBe(false);
    expect([400, 401]).toContain(response.status());
    const body = (await response.json()) as { message?: string };
    expect(body.message).toBeTruthy();
  });
});
