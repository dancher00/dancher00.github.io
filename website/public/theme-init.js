/* Shared by the project page and static documentation, before first paint. */
(() => {
  const key = "wasserman-theme";
  const system = matchMedia("(prefers-color-scheme: dark)");
  let syncingPalette = false;
  const read = () => { try { return localStorage.getItem(key); } catch { return null; } };
  const resolve = () => read() === "dark" ? "dark" : read() === "light" ? "light" : system.matches ? "dark" : "light";
  const apply = theme => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "dark" ? "#081a28" : "#163e70");
    const icon = document.querySelector('link[rel="icon"]');
    if (icon) {
      icon.dataset.lightHref ??= icon.getAttribute("href");
      icon.setAttribute("href", theme === "dark" ? icon.dataset.lightHref.replace(/wasserman-logo\.png$/, "wasserman-logo-dark.svg") : icon.dataset.lightHref);
      icon.setAttribute("type", theme === "dark" ? "image/svg+xml" : "image/png");
    }
    if (document.body?.hasAttribute("data-md-color-scheme")) {
      document.querySelectorAll(".md-logo img").forEach(logo => {
        logo.dataset.lightSrc ??= logo.getAttribute("src");
        logo.src = theme === "dark" ? logo.dataset.lightSrc.replace(/wasserman-logo\.png$/, "wasserman-logo-dark.svg") : logo.dataset.lightSrc;
      });
      document.body.dataset.mdColorScheme = theme === "dark" ? "slate" : "default";
      const palette = document.querySelector(`input[name="__palette"][data-md-color-scheme="${theme === "dark" ? "slate" : "default"}"]`);
      if (palette) {
        palette.checked = true;
        syncingPalette = true;
        palette.dispatchEvent(new Event("change", { bubbles: true }));
        syncingPalette = false;
      }
    }
    dispatchEvent(new Event("wasserman-theme-change"));
  };
  window.wassermanTheme = {
    set(theme) {
      if (theme !== "dark" && theme !== "light") return;
      try { localStorage.setItem(key, theme); } catch { /* Session-only choice. */ }
      apply(theme);
    },
  };
  apply(resolve());
  addEventListener("DOMContentLoaded", () => apply(resolve()));
  addEventListener("storage", event => { if (event.key === key || event.key === null) apply(resolve()); });
  system.addEventListener("change", () => { if (!["dark", "light"].includes(read())) apply(resolve()); });
  document.addEventListener("change", event => {
    if (!syncingPalette && event.target instanceof HTMLInputElement && event.target.name === "__palette") {
      window.wassermanTheme.set(event.target.dataset.mdColorScheme === "slate" ? "dark" : "light");
    }
  });
})();
