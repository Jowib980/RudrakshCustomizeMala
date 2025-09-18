import {
  Links,
  Meta,
  Scripts,
  ScrollRestoration,
  Outlet,
} from "@remix-run/react";
import { Toaster } from "react-hot-toast";

export default function App() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <Links />
        <link rel="icon" href="https://customize-mala.cardiacambulance.com/favicon.ico" />
      </head>
      <body>
        <Outlet />
        <Toaster
          position="top-right"
          containerStyle={{
            position: "fixed",  // force fixed
            top: 20,
            right: 20,
            zIndex: 999999,
          }}
        />

        <ScrollRestoration />
        <Scripts />

        <script
          dangerouslySetInnerHTML={{
            __html: `(function() {
              const APP_DOMAIN = "https://customize-mala.cardiacambulance.com";
              const origFetch = window.fetch;
              const currentOrigin = window.location.origin;

              window.fetch = function(resource, options) {
                try {
                  // Normalize URL
                  let url;
                  if (typeof resource === "string") {
                    url = resource.startsWith("http") ? resource : currentOrigin + resource;
                  } else if (resource && resource.url) {
                    url = resource.url.startsWith("http") ? resource.url : currentOrigin + resource.url;
                  } else if (resource && resource.href) {
                    url = resource.href.startsWith("http") ? resource.href : currentOrigin + resource.href;
                  } else {
                    return origFetch.call(this, resource, options);
                  }

                  // 1️⃣ Handle manifest requests only
                  if (url.includes("/__manifest")) {
                    const parsed = new URL(url, APP_DOMAIN);
                    let p = parsed.searchParams.get("p") || "";

                    // Map Shopify proxy path to app route
                    // if (p === "/apps/customize-mala") p = "mala-builder";

                    parsed.searchParams.set("p", p);

                    return origFetch.call(this, APP_DOMAIN + "/__manifest" + parsed.search, options);
                  }

                  // 2️⃣ All other requests → untouched
                  return origFetch.call(this, resource, options);

                } catch (e) {
                  console.error("🔥 Fetch override error", e, resource);
                  return origFetch.call(this, resource, options);
                }
              };
            })();`,
          }}
        />

      </body>
    </html>
  );
}
