/// <reference types="@cloudflare/workers-types" />

declare module "*.css?url" {
  const value: string;
  export default value;
}

declare global {
  interface Env {
    DB: D1Database;
    LOCATION_SHARE_PASSCODE?: string;
  }
}
