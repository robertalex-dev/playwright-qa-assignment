/**
 * Single source of truth for environment-driven config.
 * Defaults are the public demo credentials, so the suite runs with zero setup;
 * `.env` overrides them without touching code.
 */
const env = (key: string, fallback: string): string => process.env[key]?.trim() || fallback;

export const config = {
  sauce: {
    baseUrl: env('SAUCE_BASE_URL', 'https://www.saucedemo.com'),
    username: env('SAUCE_USERNAME', 'standard_user'),
    password: env('SAUCE_PASSWORD', 'secret_sauce'),
  },
  playground: {
    baseUrl: env('PLAYGROUND_BASE_URL', 'http://uitestingplayground.com'),
  },
  dummyJson: {
    baseUrl: env('DUMMYJSON_BASE_URL', 'https://dummyjson.com'),
    username: env('DUMMYJSON_USERNAME', 'emilys'),
    password: env('DUMMYJSON_PASSWORD', 'emilyspass'),
  },
} as const;

/** Dummy checkout identity — Sauce Demo only validates that the fields are non-empty. */
export const checkoutCustomer = {
  firstName: 'Test',
  lastName: 'User',
  postalCode: '030001',
} as const;
