# Safety & privacy

**Short version:** No Distractions for YouTube only hides parts of YouTube's page. It runs only on `www.youtube.com`, its only permission is saving its own settings, and it sends nothing anywhere. You can check every claim on this page yourself; see [Verify it yourself](#verify-it-yourself).

## What it can access

| What | Why |
|---|---|
| **`storage` permission** | Saves your six settings (the Master switch, the four toggles, and Light/Dark/System). |
| **Site access: `https://www.youtube.com/*`** | Adds a stylesheet to YouTube pages that hides the sections you've switched on. |

That's all. It doesn't ask for your tabs, browsing history, cookies, downloads or any other site.

### "Read and change your data on www.youtube.com"

Chrome shows this warning for **any** extension that changes how a website looks, because the same permission that allows hiding a sidebar could, in a different extension, allow reading the page. This extension uses it only to apply CSS rules (`display: none`) to specific parts of the page. It never reads the page's content, your account, your watch history or your comments.

## What it doesn't do

- **No network requests.** The extension's code never contacts a server: no analytics, no tracking, no ads, no update checks of its own.
- **No data collection.** Nothing about you or your viewing is recorded, stored or sent.
- **No code from the internet.** Everything it runs is in the `extension/` folder. Chrome's Manifest V3 format forbids loading code from the web anyway.
- **No background process.** Nothing runs unless a YouTube tab is open.

The only link in the extension is **"Check it yourself →"** in the popup, which opens this page in a new tab when you click it.

## Where your settings live

The six settings are saved with `chrome.storage.sync`. If you've turned on Chrome sync, Chrome itself copies them to your other computers through your Google account, just like your bookmarks. The extension doesn't do any of that sending itself.

## Privacy policy

No Distractions for YouTube does not collect, store, share or sell any personal or usage data. The only data it keeps is the six on/off and theme settings described above, which stay in your browser (and in Chrome sync, if you use it). There are no third parties involved.

## Verify it yourself

1. **Read the code** in [`extension/`](extension/). Only three files ever touch YouTube, about 100 lines together:
   - `hide.css` holds the rules that hide each section.
   - `content.js` switches those rules off for the sections you've turned off.
   - `settings.js` loads and saves your settings.

   The rest (`popup.html`, `popup.css`, `popup.js`, `theme-init.js`) is the popup window, which never touches YouTube.
2. **Run the safety checker.** Open [`tools/safety-check.html`](tools/safety-check.html) in your browser and pick the extension folder. It reads the files on your computer, uploads nothing, and flags the usual red flags: broad permissions, network calls, code loaded at runtime, and hidden or minified code. It also prints a SHA-256 fingerprint for every file.
3. **Watch the network.** On a YouTube tab, open Chrome's developer tools (F12), go to the **Network** tab and reload the page. Every request you see comes from YouTube; none comes from the extension.
4. **Limit its access.** In `chrome://extensions`, click **Details** on the extension and set **Site access** to "On click" or to specific sites.

### About online scanners

- **[VirusTotal](https://www.virustotal.com/)** accepts a `.zip` of the extension folder. Two caveats: uploaded files become available to security researchers, and antivirus engines look for *known* malware, so a clean result says little about a small extension like this one.
- **Store-based scanners** (ExtensionTotal, Spin.AI, Chrome-Stats) only work on extensions published in the Chrome Web Store, so they can't scan this one yet.

### What the checker can't tell you

It's a static scan: it reads code, it doesn't run it. It catches the common warning signs, but a clean result isn't a guarantee. Reading the code is still the strongest check, and here that takes a few minutes.

## Reporting a security problem

If you find something that looks unsafe, please [open an issue](https://github.com/aenimaa/no-distractions-for-youtube/issues/new/choose). For anything sensitive, use **Report a vulnerability** in the repository's **Security** tab instead.
