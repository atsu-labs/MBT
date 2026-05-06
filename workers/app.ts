import { createRequestHandler } from "react-router";
import type { ServerBuild } from "react-router";
import type { Env } from "~/lib/context";
import * as build from "../build/server";

const handler = createRequestHandler(build as unknown as ServerBuild, "production");

function unauthorizedResponse() {
  return new Response("Unauthorized", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="MBT", charset="UTF-8"',
    },
  });
}

function parseBasicAuth(header: string | null) {
  if (!header || !header.startsWith("Basic ")) {
    return null;
  }

  try {
    const encoded = header.slice(6).trim();
    const decoded = atob(encoded);
    const separatorIndex = decoded.indexOf(":");

    if (separatorIndex < 0) {
      return null;
    }

    return {
      username: decoded.slice(0, separatorIndex),
      password: decoded.slice(separatorIndex + 1),
    };
  } catch {
    return null;
  }
}

export default {
  async fetch(request: Request, env: Env, _ctx: ExecutionContext) {
    const username = env.BASIC_AUTH_USERNAME;
    const password = env.BASIC_AUTH_PASSWORD;

    if (!username || !password) {
      return new Response("Basic authentication is not configured.", {
        status: 500,
      });
    }

    const credentials = parseBasicAuth(request.headers.get("Authorization"));

    if (
      !credentials ||
      credentials.username !== username ||
      credentials.password !== password
    ) {
      return unauthorizedResponse();
    }

    return handler(request, {
      cloudflare: { env },
    });
  },
} satisfies ExportedHandler<Env>;
