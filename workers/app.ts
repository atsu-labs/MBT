import { createRequestHandler } from "react-router";
import type { ServerBuild } from "react-router";
import type { Env } from "~/lib/context";
import * as build from "../build/server";

const handler = createRequestHandler(build as unknown as ServerBuild, "production");

export default {
  async fetch(request: Request, env: Env, _ctx: ExecutionContext) {
    return handler(request, {
      cloudflare: { env },
    });
  },
} satisfies ExportedHandler<Env>;