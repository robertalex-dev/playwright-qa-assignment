import type { APIRequestContext, APIResponse } from '@playwright/test';

/** Shape of POST /auth/login (fields we rely on; the API returns a few more). */
export interface LoginResponse {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
  accessToken: string;
  refreshToken: string;
}

/** Shape of GET /auth/me — the full user record, minus tokens. */
export interface MeResponse {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
}

/**
 * Thin typed wrapper over Playwright's APIRequestContext.
 * Returns the raw APIResponse so specs can assert on status/headers as well as the body.
 * `baseURL` comes from the `api` project config, so paths are relative here.
 */
export class DummyJsonClient {
  constructor(private readonly request: APIRequestContext) {}

  login(username: string, password: string): Promise<APIResponse> {
    return this.request.post('/auth/login', {
      data: { username, password },
    });
  }

  me(accessToken: string): Promise<APIResponse> {
    return this.request.get('/auth/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  }
}
