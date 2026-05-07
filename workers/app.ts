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

async function validateCredentials(
  expectedUsername: string,
  expectedPassword: string,
  username: string,
  password: string
) {
  const encoder = new TextEncoder();
  const expectedDigest = new Uint8Array(
    await crypto.subtle.digest(
      "SHA-256",
      encoder.encode(`${expectedUsername}:${expectedPassword}`)
    )
  );
  const actualDigest = new Uint8Array(
    await crypto.subtle.digest("SHA-256", encoder.encode(`${username}:${password}`))
  );
  const comparisonLength = Math.min(expectedDigest.length, actualDigest.length);
  let diff = expectedDigest.length ^ actualDigest.length;

  for (let i = 0; i < comparisonLength; i += 1) {
    diff |= expectedDigest[i] ^ actualDigest[i];
  }

  return diff === 0;
}

export default {
  async fetch(request: Request, env: Env, _ctx: ExecutionContext) {
    const username = env.BASIC_AUTH_USERNAME;
    const password = env.BASIC_AUTH_PASSWORD;

    if (!username || !password) {
      console.error("Basic authentication credentials are not configured.");
      return unauthorizedResponse();
    }

    const credentials = parseBasicAuth(request.headers.get("Authorization"));

    if (
      !credentials ||
      !(await validateCredentials(
        username,
        password,
        credentials.username,
        credentials.password
      ))
    ) {
      return unauthorizedResponse();
    }

    return handler(request, {
      cloudflare: { env },
    });
  },
} satisfies ExportedHandler<Env>;
