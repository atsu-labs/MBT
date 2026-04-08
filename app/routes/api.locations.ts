import type { Route } from ".react-router/types/app/routes/+types/api.locations";
import { upsertLocation, deleteLocation, getActiveLocations } from "~/lib/db.server";

export async function loader({ context }: Route.LoaderArgs) {
  const db = context.cloudflare.env.DB;
  const locations = await getActiveLocations(db);
  return { locations };
}

export async function action({ request, context }: Route.ActionArgs) {
  const db = context.cloudflare.env.DB;
  const expectedPasscode = context.cloudflare.env.LOCATION_SHARE_PASSCODE || "dummy";

  if (request.method !== "POST" && request.method !== "DELETE") {
    return new Response("Method not allowed", { status: 405 });
  }

  const formData = await request.formData();
  
  if (request.method === "DELETE") {
    const sessionId = formData.get("sessionId")?.toString();
    if (!sessionId) {
      return Response.json({ error: "Missing sessionId" }, { status: 400 });
    }
    await deleteLocation(db, sessionId);
    return Response.json({ success: true });
  }

  if (request.method === "POST") {
    const passcode = formData.get("passcode")?.toString();
    if (passcode !== expectedPasscode) {
      return Response.json({ error: "Invalid passcode" }, { status: 401 });
    }

    const sessionId = formData.get("sessionId")?.toString();
    const userName = formData.get("userName")?.toString();
    const latitudeStr = formData.get("latitude")?.toString();
    const longitudeStr = formData.get("longitude")?.toString();

    if (!sessionId || !userName || !latitudeStr || !longitudeStr) {
      return Response.json({ error: "Missing parameters" }, { status: 400 });
    }

    const latitude = parseFloat(latitudeStr);
    const longitude = parseFloat(longitudeStr);

    if (isNaN(latitude) || isNaN(longitude)) {
      return Response.json({ error: "Invalid coordinates" }, { status: 400 });
    }

    const location = await upsertLocation(db, sessionId, userName, latitude, longitude);
    return Response.json({ success: true, location });
  }
}
