(() => {
  "use strict";
  const video = document.querySelector("#heroVideo");
  if (!video || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const sources = [
    "/worldwidecargotruckingllc.com/assets/hero-1.mp4",
    "/worldwidecargotruckingllc.com/assets/hero-2.mp4",
    "/worldwidecargotruckingllc.com/assets/hero-3.mp4",
    "/worldwidecargotruckingllc.com/assets/hero-4.mp4",
    "/worldwidecargotruckingllc.com/assets/hero-5.mp4",
  ];
  let current = 0;

  video.muted = true;
  video.addEventListener("ended", () => {
    current = (current + 1) % sources.length;
    video.src = sources[current];
    video.play().catch(() => {});
  });
  video.addEventListener("error", () => {
    if (current >= sources.length - 1) return;
    current += 1;
    video.src = sources[current];
    video.play().catch(() => {});
  });
  video.play().catch(() => {});
})();
