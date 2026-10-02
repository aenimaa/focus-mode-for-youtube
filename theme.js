// Light / Dark / System for the site pages: the home page, the Persian page and the safety checker.
// Load it in <head> (not deferred) so a saved choice applies before the page paints.
(() => {
  // Prefixed, because every page on aenimaa.github.io shares one localStorage
  const KEY = "fmyt-theme";
  const OLD_KEY = "theme";   // used before 3.1.1; read once so nobody loses their choice
  const root = document.documentElement;

  const read = () => {
    try {
      return localStorage.getItem(KEY) || localStorage.getItem(OLD_KEY) || "system";
    } catch (_) {
      return "system";
    }
  };

  const apply = theme => {
    if (theme === "light" || theme === "dark") root.dataset.theme = theme;
    else delete root.dataset.theme;
  };

  apply(read());

  // Wire up the page's Light / Dark / System switch once it exists
  document.addEventListener("DOMContentLoaded", () => {
    const saved = read();
    document.querySelectorAll('input[name="theme"]').forEach(input => {
      input.checked = input.value === saved;
      input.addEventListener("change", () => {
        apply(input.value);
        try {
          localStorage.setItem(KEY, input.value);
          localStorage.removeItem(OLD_KEY);
        } catch (_) {}
      });
    });
  });
})();
