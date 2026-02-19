// Simple page fade for case slug navigation
// Prevent browser restoring scroll on history navigation which can cause jumps
if ("scrollRestoration" in history) history.scrollRestoration = "manual";

document.documentElement.classList.add("is-loading");

const DURATION = 340; // ms — should match CSS transition duration

const DISABLE_SMOOTH_KEY = "noSmoothOnLoad";

window.addEventListener("DOMContentLoaded", () => {
  // If requested, disable smooth scroll briefly so anchors jump immediately
  if (sessionStorage.getItem(DISABLE_SMOOTH_KEY) === "1") {
    sessionStorage.removeItem(DISABLE_SMOOTH_KEY);
    const prev = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "auto";
    if (location.hash) {
      const id = location.hash.slice(1);
      const el = document.getElementById(id);
      if (el) el.scrollIntoView();
    }
    setTimeout(() => {
      document.documentElement.style.scrollBehavior = prev || "";
    }, 60);
  }

  // ensure we're at the top before showing content to avoid jump
  try {
    const prev = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
    setTimeout(() => {
      document.documentElement.style.scrollBehavior = prev || "";
    }, 60);
  } catch (e) {}
  requestAnimationFrame(() => {
    document.documentElement.classList.remove("is-loading");
    document.documentElement.classList.add("is-ready");
  });
});

document.addEventListener("click", (e) => {
  const a = e.target.closest("a");
  if (!a) return;
  const href = a.getAttribute("href");
  if (!href) return;

  // If clicking a link back to homepage with an anchor (e.g. /#cases),
  // mark that we should disable smooth scroll on the next load so it doesn't animate through the page.
  try {
    const _tmpUrl = new URL(href, location.href);
    if (_tmpUrl.pathname === "/" && _tmpUrl.hash) {
      sessionStorage.setItem(DISABLE_SMOOTH_KEY, "1");
      return; // allow native navigation
    }
  } catch (err) {}

  // Ignore external, mailto, tel, and hash links
  if (href.startsWith("http") && !href.includes(location.host)) return;
  if (
    href.startsWith("mailto:") ||
    href.startsWith("tel:") ||
    href.startsWith("#")
  )
    return;
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

  // Only add transition for case slug pages: /cases/...
  const url = new URL(href, location.href);
  if (!url.pathname.startsWith("/cases/")) return;

  e.preventDefault();
  // scroll to top to avoid native navigation restoring an odd offset
  try {
    const prevSB = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
    // restore shortly after (page will navigate away)
    setTimeout(() => {
      document.documentElement.style.scrollBehavior = prevSB || "";
    }, 60);
  } catch (err) {}
  document.documentElement.classList.remove("is-ready");
  document.documentElement.classList.add("is-exiting");
  setTimeout(() => (window.location.href = url.href), DURATION);
});

// Register service worker (caches images) — non-blocking
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        // console.log('ServiceWorker registered', reg);
      })
      .catch((err) => {
        // registration failed (likely in dev or unsupported)
        // console.warn('ServiceWorker failed:', err);
      });
  });
}
