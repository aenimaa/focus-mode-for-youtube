// Runs before the popup paints, so a saved Light/Dark choice doesn't flash.
try {
  const theme = localStorage.getItem("ytnd-theme");
  if (theme === "light" || theme === "dark") {
    document.documentElement.dataset.theme = theme;
  }
} catch (_) {}
