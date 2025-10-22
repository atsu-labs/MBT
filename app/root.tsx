import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import stylesheet from "./styles/app.css?url";
import caseMarkerStyles from "./styles/case-marker.css?url";

export const links = () => [
  { rel: "stylesheet", href: stylesheet },
  { rel: "stylesheet", href: caseMarkerStyles },
  { rel: "stylesheet", href: "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" },
  { rel: "stylesheet", href: "https://fonts.googleapis.com/icon?family=Material+Icons" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function Root() {
  return <Outlet />;
}
