// Shared by content.js and popup.js.
const YTND = {
  ATTR: "data-ytnd-off",
  FEATURES: ["sidebar", "comments", "shorts", "description", "endscreen", "explore"],
  DEFAULTS: {
    master: true,
    sidebar: true,
    comments: true,
    shorts: true,
    description: true,
    endscreen: true,
    explore: true,
    theme: "system",
    // When a pause should end (a timestamp), or 0 for "off until I turn it back on"
    pausedUntil: 0,
    // The small badge in the corner of YouTube
    badge: true
  },

  // "back at 14:30", or "back tomorrow at 06:00"
  backAt(ts) {
    const when = new Date(ts);
    const time = when.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    return when.toDateString() === new Date().toDateString() ? `back at ${time}` : `back tomorrow at ${time}`;
  },

  async load() {
    const keys = Object.keys(this.DEFAULTS);
    const synced = await chrome.storage.sync.get(keys);

    // v2.0 kept settings in storage.local; move them to sync once.
    if (!Object.keys(synced).length) {
      const old = await chrome.storage.local.get(keys);
      if (Object.keys(old).length) {
        await chrome.storage.sync.set(old);
        await chrome.storage.local.remove(keys);
      }
    }

    return chrome.storage.sync.get(this.DEFAULTS);
  },

  save(patch) {
    return chrome.storage.sync.set(patch);
  }
};
