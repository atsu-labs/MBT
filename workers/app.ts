import { createRequestHandler } from "react-router";
import type { Env } from "~/lib/context";

const handler = createRequestHandler(
  // @ts-expect-error - virtual module provided by vite plugin for Cloudflare
  () => import("virtual:react-router/server-build")
);

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    return handler(request, {
      cloudflare: { env },
    });
  },
} satisfies ExportedHandler<Env>;