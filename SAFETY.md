# Safety & privacy

**Short version:** Focus Mode for YouTube only hides parts of YouTube's page. It runs only on `www.youtube.com`, its only permission is saving its own settings, and it sends nothing anywhere. You can check every claim on this page yourself; see [Verify it yourself](#verify-it-yourself).

## What it can access

| What | Why |
|---|---|
| **`storage` permission** | Saves your settings: the Master switch, the six section switches, a pause end time, the corner badge switch, and Light/Dark/System. It also remembers the date the badge last showed itself, so it does that only once a day. |
| **Site access: `https://www.youtube.com/*`** | Adds a stylesheet to YouTube pages that hides the sections you've switched on, and the small corner badge. |

That's all. It doesn't ask for your tabs, browsing history, cookies, downloads or any other site.

### "Read and change your data on www.youtube.com"

Chrome shows this warning for **any** extension that changes how a website looks, because the same permission that allows hiding a sidebar could, in a different extension, allow reading the page. This extension uses it only to apply CSS rules (`display: none`) to specific parts of the page. It never reads the page's content, your account, your watch history or your comments.

## What it doesn't do

- **No network requests.** The extension's code never contacts a server: no analytics, no tracking, no ads, no update checks of its own. Even the popup's font (Asap) is bundled inside the extension instead of being loaded from Google Fonts.
- **No data collection.** Nothing about you or your viewing is recorded, stored or sent.
- **No code from the internet.** Everything it runs is in the `extension/` folder. Chrome's Manifest V3 format forbids loading code from the web anyway.
- **No background process.** Nothing runs unless a YouTube tab is open.

The popup has three links: **"Check it yourself →"** opens this page, **"Let me know →"** opens a bug report (see below), and the **GitHub icon** in the footer opens the source code. Each opens in a new tab, and only when you click it.

## What it adds to YouTube's page

- **A stylesheet** that hides the sections you've switched on.
- **A marker on the page** (`data-ytnd-off`) listing the sections you've switched off. YouTube could use it to tell the extension is installed, as with any extension that changes a page.
- **The corner badge** (you can turn it off in the popup). It's built in a closed, isolated container so YouTube's styles can't change it, and its text is set as plain text, never as HTML. Its buttons only pause or resume the extension.

## The "Something still showing?" link

It opens a new GitHub issue form, pre-filled with the extension version, your Chrome version, and the *kind* of page you're on (for example "Video page"). It never includes the page's address, because that would show what you were watching, and issues are public. Nothing is sent until you review the form and submit it yourself.

## Where your settings live

Your settings are saved with `chrome.storage.sync`. If you've turned on Chrome sync, Chrome itself copies them to your other computers through your Google account, just like your bookmarks. The extension doesn't do any of that sending itself.

## Privacy policy

Focus Mode for YouTube does not collect, store, share or sell any personal or usage data. The only data it keeps is the on/off and theme settings described above, which stay in your browser (and in Chrome sync, if you use it). There are no third parties involved.

## How much access does an extension need?

Every extension asks Chrome for some access. More access isn't bad by itself (a tool that works on every website has to ask for every website), but it does mean more trust. Here's how common kinds of extensions compare:

| What the extension does | Access it typically asks for | What Chrome tells you when you install it |
|---|---|---|
| **Changes how one website looks** (this extension) | Saving its settings, plus that one site | "Read and change your data on www.youtube.com" |
| Works on any website you visit (ad blockers, translators, dark-mode tools) | Every website | "Read and change all your data on all websites" |
| Organises your tabs, history or bookmarks | Tabs, history or bookmarks | "Read your browsing history", "Read and change your bookmarks" |
| Watches or changes network traffic | Web requests | "Block content on any page" and similar |
| Works together with an app on your computer | Native messaging | "Communicate with cooperating native applications" |

Focus Mode for YouTube sits in the first row and asks for nothing more. To see what any extension can access, open `chrome://extensions`, click **Details**, and look under **Permissions** and **Site access**.

## Latest checks

Run on every release. Results for this version:

| Check | Result |
|---|---|
| Permissions | `storage` only; site access limited to `https://www.youtube.com/*` |
| Network calls, code loaded from the web, hidden or encoded code | None found by the [safety checker](https://aenimaa.github.io/focus-mode-for-youtube/tools/safety-check.html) |
| Automated tests of settings, pause, the corner badge, the popup and the hiding rules | All pass (run by the maker before each release; not yet published in this repo) |
| Loads and runs in a real browser | Yes (tested in a Chromium browser with a clean profile) |
| Secrets or private keys in the repository | None |

## Verify it yourself

1. **Read the code** in [`extension/`](extension/). Only four files ever run on YouTube, about 400 lines together:
   - `hide.css` holds the rules that hide each section.
   - `content.js` switches those rules off for the sections you've turned off.
   - `settings.js` loads and saves your settings.
   - `badge.js` draws the small corner badge.

   The rest (`popup.html`, `popup.css`, `popup.js`, `theme-init.js`) is the popup window, which never touches YouTube.
2. **Run the safety checker.** Open the [online checker](https://aenimaa.github.io/focus-mode-for-youtube/tools/safety-check.html) (or [`tools/safety-check.html`](tools/safety-check.html) from this repo, offline) and pick the extension folder. It reads the files on your computer, uploads nothing, and flags the usual red flags: broad permissions, network calls, code loaded at runtime, and hidden or minified code. It also prints a SHA-256 fingerprint for every file.
3. **Watch the network.** On a YouTube tab, open Chrome's developer tools (F12), go to the **Network** tab and reload the page. Every request you see comes from YouTube; none comes from the extension.
4. **Limit its access.** In `chrome://extensions`, click **Details** on the extension and set **Site access** to "On click" or to specific sites.

### About online scanners

- **[VirusTotal](https://www.virustotal.com/)** accepts a `.zip` of the extension folder. Two caveats: uploaded files become available to security researchers, and antivirus engines look for *known* malware, so a clean result says little about a small extension like this one.
- **Store-based scanners** (ExtensionTotal, Spin.AI, Chrome-Stats) only work on extensions published in the Chrome Web Store, so they can't scan this one yet.

### What the checker can't tell you

It's a static scan: it reads code, it doesn't run it. It catches the common warning signs, but a clean result isn't a guarantee. Reading the code is still the strongest check, and here that takes a few minutes.

## Reporting a security problem

If you find something that looks unsafe, please [open an issue](https://github.com/aenimaa/focus-mode-for-youtube/issues/new/choose). For anything sensitive, use **Report a vulnerability** in the repository's **Security** tab instead.
