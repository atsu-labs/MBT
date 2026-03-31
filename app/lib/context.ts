import type { D1Database } from "@cloudflare/workers-types";

export interface Env {
  DB: D1Database;
  ASSETS: { fetch: typeof fetch };
}

declare module "react-router" {
  interface AppLoadContext {
    cloudflare: {
      env: Env;
    };
  }
}
