import type { D1Database } from "@cloudflare/workers-types";

export interface Env {
  DB: D1Database;
  ASSETS: { fetch: typeof fetch };
  LOCATION_SHARE_PASSCODE?: string;
  BASIC_AUTH_USERNAME?: string;
  BASIC_AUTH_PASSWORD?: string;
}

declare module "react-router" {
  interface AppLoadContext {
    cloudflare: {
      env: Env;
    };
  }
}
