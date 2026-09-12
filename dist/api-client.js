(() => {
  "use strict";

  // GitHub Pages serves the public files. Cloudflare serves requests to /api.
  const apiOrigin = "https://worldwide-cargo-express.edgeformmedia.workers.dev";
  window.WCX_API_ORIGIN = apiOrigin;
  const nativeFetch = window.fetch.bind(window);

  window.fetch = (input, init = {}) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    if (url.startsWith("/api/")) {
      return nativeFetch(`${apiOrigin}${url}`, { ...init, credentials: "include" });
    }
    return nativeFetch(input, init);
  };
})();
