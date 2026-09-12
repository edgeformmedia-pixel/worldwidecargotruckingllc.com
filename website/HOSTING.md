# Hosting layout

The public website is published from the repository's `main` branch to `https://worldwidecargoexpressllc.com/`.
The application API and D1 database stay at `https://worldwide-cargo-express.edgeformmedia.workers.dev/`.

## Before the first deployment

1. Push the `main` branch to `edgeformmedia-pixel/worldwidecargotruckingllc.com`.
2. In the repository's **Settings → Pages**, use the `main` branch and set `worldwidecargoexpressllc.com` as the custom domain.
3. Keep `ADMIN_PASSWORD` and `AUTH_SECRET` as Cloudflare secrets; do not commit them.

The public-page API address is defined in `dist/api-client.js`. The Worker accepts requests from GitHub Pages by default.
