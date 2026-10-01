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
    theme: "system"
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
