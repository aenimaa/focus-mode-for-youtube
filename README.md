<p align="center">
  <img src="docs/icon.png" width="88" height="88" alt="">
</p>

<h1 align="center">No Distractions for YouTube</h1>

<p align="center">
  Hide what pulls you away from the video you came for.<br>
  <sub>Free · open source · no tracking · not affiliated with YouTube</sub>
</p>

<p align="center">
  <a href="https://github.com/aenimaa/no-distractions-for-youtube/releases/latest/download/no-distractions-for-youtube.zip"><b>⬇️ Download the latest version</b></a>
</p>

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/before-after-dark.svg">
    <img src="docs/before-after-light.svg" width="800" alt="Before: a YouTube video page with related videos, description and comments. After: only the video, centered, with its title.">
  </picture>
</p>

---

## 🚀 Install in a minute

1. **Unzip** the download.
2. Open `chrome://extensions` and turn on **Developer mode** (top right).
3. Click **Load unpacked** and choose the unzipped folder.

📌 Then click the puzzle-piece icon in Chrome's toolbar and pin **No Distractions for YouTube**.

## 🙈 What it hides

Each has its own switch. **Master** turns them all off at once.

| | Section | Where |
|---|---|---|
| 🎞️ | **Related videos** | Beside the player; the video moves to the center |
| 💬 | **Comments** | Below the video |
| 📱 | **Shorts** | Rows, single Shorts in search, and the menu entry |
| 📝 | **Video description** | Under the title |
| 🎬 | **End of video** | Cards and suggestion grid as a video ends |
| 🧭 | **Explore menu** | Music, Gaming, News and more in the left menu |

## 🔒 Safe by design

Runs only on youtube.com, makes no network requests, and collects nothing.
[How to verify it yourself →](SAFETY.md) · [Online safety checker →](https://aenimaa.github.io/no-distractions-for-youtube/tools/safety-check.html)

## 🙋 Something broken? Got an idea?

YouTube changes its page often, so reports keep this working.

🐞 **[Report a problem](https://github.com/aenimaa/no-distractions-for-youtube/issues/new?template=bug_report.yml)** &nbsp;·&nbsp; 💡 **[Suggest a feature](https://github.com/aenimaa/no-distractions-for-youtube/issues/new?template=feature_request.yml)**

---

## 📚 More

👇 *Click a topic to open it.*

<details>
<summary><b>🔄 Updating to a new version</b></summary>
<br>

Download the new zip, unzip it over your old folder, and click **Reload** on the extension's card in `chrome://extensions`. Your settings stay, even if you move or rename the folder.

</details>

<details>
<summary><b>🌐 Other browsers</b></summary>
<br>

Works in Chrome 107+ and other Chromium browsers (Edge, Brave, Opera, Vivaldi). Their extensions page has the same **Developer mode** and **Load unpacked** options.

</details>

<details>
<summary><b>⚙️ How it works</b></summary>
<br>

The hiding rules are plain CSS, applied before YouTube draws the page, so nothing flashes on screen first. Changes apply to every open YouTube tab instantly, and with Chrome sync on, your choices follow you to your other computers.

```mermaid
flowchart LR
  A[YouTube page starts loading] --> B[hide.css hides every section]
  B --> C{Your settings}
  C -- switched on --> D[Section stays hidden]
  C -- switched off --> E[Section shows again]
```

```
extension/           The extension: what's in the download
  hide.css           Rules that hide each section
  content.js         Turns rules off for sections you've switched off
  settings.js        Loads and saves settings
  popup.*            The popup window
  fonts/             Asap typeface, bundled so nothing loads from the web
tools/
  safety-check.html  The safety checker
```

</details>

<details>
<summary><b>🤝 Contributing</b></summary>
<br>

Pull requests are welcome. For anything bigger than a small fix, please open an issue first so we can agree on the approach. New releases are built automatically when a version tag (like `v2.3.0`) is pushed.

</details>

<details>
<summary><b>📄 Credits and license</b></summary>
<br>

Vibe-coded by Nima Sh, who gets distracted too. [MIT License](LICENSE).
Font: [Asap](https://github.com/Omnibus-Type/Asap) by Omnibus-Type, [SIL Open Font License](extension/fonts/OFL.txt).
YouTube is a trademark of Google LLC. This project isn't endorsed by or affiliated with Google or YouTube.

</details>
