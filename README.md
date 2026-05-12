# Eduboard

A browser-based teaching console for capturing your screen (desktop) or camera (mobile), mixing in audio, previewing in real time, and recording a polished local video file. Built with React + Vite.

> All capture and recording happens in the browser; nothing is uploaded anywhere. The site is fully static and can be hosted on GitHub Pages.

## Features

### Desktop UI (auto-shown on tablets and computers)

- Screen / window / browser-tab capture via the standard `getDisplayMedia` API
- Output presets: Broadcast HD (1080p), HD 720, Vertical 9:16, Square 1:1
- Microphone mixing with device selection and live level meters
- Optional system-audio passthrough when supported by the source
- Real-time preview canvas at 30 fps
- WebM / MP4 recording with one-click download

### Mobile UI (auto-shown on phones)

When Eduboard detects a phone-sized viewport or a phone user agent, it loads a touch-friendly screen with two recording modes:

- **Camera mode** — records from the phone's front or back camera with the microphone. Works on every modern mobile browser: iOS Safari/Chrome, Android Chrome/Firefox/Edge.
- **Tab capture mode** — uses `getDisplayMedia` to record the active Chrome tab on Android. The button is shown but disabled on iPhones and iPads with a clear message, because **no iOS browser exposes screen capture to web pages** — Apple restricts that capability to native apps. For full-screen iPhone recording, users should fall back to iOS's built-in Screen Recording from Control Center.

The mobile UI also includes mic on/off, front/back camera flip, an in-app guide, and a download button that produces `.mp4` (where supported) or `.webm`.

## Browser requirements

Recording uses `MediaRecorder` and `getDisplayMedia` / `getUserMedia`, which are widely supported in modern Chromium browsers (Chrome, Edge, Brave, Arc, Opera) and recent Firefox. System-audio capture is most reliable in Chromium.

| Capability | Desktop | Android | iOS |
| --- | --- | --- | --- |
| Camera recording | ✅ | ✅ | ✅ |
| Screen / window capture | ✅ | tab only (Chrome) | ❌ (Apple restriction) |
| MP4 output | varies | varies | ✅ |

The deployed site **must be served over HTTPS** — `getDisplayMedia` and `getUserMedia` refuse to work on plain `http://` origins other than `localhost`. GitHub Pages provides HTTPS automatically.

---

## Local development

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

To produce a production build locally:

```bash
npm run build
npm run preview
```

---

## Hosting on GitHub Pages — step by step

The repository ships with a GitHub Actions workflow (`.github/workflows/deploy.yml`) that builds and publishes the site to GitHub Pages automatically every time you push to `main`. You don't need a `gh-pages` branch or any third-party action.

### 1. Create the GitHub repository

1. Sign in to [github.com](https://github.com) and click **New repository** (the green button on the top-left or via the `+` menu).
2. Pick a name — e.g. `eduboard`. Public is recommended (private repos need a paid plan for Pages on some accounts).
3. Leave "Initialize this repository" unchecked. Click **Create repository**.

### 2. Push this project to the new repository

From the project folder on your computer:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

Replace `<your-username>` and `<your-repo>` with your actual values.

### 3. Enable GitHub Pages with "Actions" as the source

1. In your repo on GitHub, click **Settings** (top tab).
2. In the left sidebar, click **Pages**.
3. Under **Build and deployment → Source**, choose **GitHub Actions**.

That's the only Pages configuration you need to touch — no branch selection, no folder selection.

### 4. Confirm permissions for the Actions workflow

1. Still in **Settings**, open **Actions → General** in the left sidebar.
2. Scroll to **Workflow permissions**.
3. Make sure **Read and write permissions** is selected, then click **Save**.

This lets the deploy job upload the build artifact and publish it to Pages.

### 5. Trigger the first deploy

Push any commit to `main` (the initial `git push` above is enough), or run the workflow manually:

1. Go to the **Actions** tab in your repo.
2. Click **Deploy to GitHub Pages** in the left list.
3. Click **Run workflow → Run workflow** (top right).

Watch the run. Both the **build** and **deploy** jobs should turn green in roughly 30–60 seconds.

### 6. Open your site

When the **deploy** job finishes, GitHub prints a `page_url` in the job summary. It will look like:

```
https://<your-username>.github.io/<your-repo>/
```

Open it. Eduboard should load. Click **Add Display Source**, grant the screen-capture permission, and you're live.

---

## Updating the site

Every push to `main` automatically rebuilds and republishes. There is no manual deploy step after the first-time setup.

```bash
# edit some files
git add .
git commit -m "tweak preset description"
git push
```

A new Actions run kicks off; about a minute later your updated site is live.

---

## Configuration notes

- `vite.config.js` sets `base: './'`, which uses relative asset paths. That means the build works without modification whether your site is served from the root of a custom domain or from a project sub-path like `https://<user>.github.io/<repo>/`. You do **not** need to change this when you rename the repo.
- The `dist/` folder is git-ignored — only the source is committed; GitHub Actions builds the artifact.
- All `localStorage` keys from the removed streaming feature (`bcast.streamKey`, `bcast.relayUrl`, `bcast.rtmpUrl`) are cleared on first load so older users don't carry around stale stream keys.
- Desktop vs mobile routing happens in `src/App.jsx`, which calls `useIsMobile()` (in `src/useIsMobile.js`) and renders either `DesktopApp` or `MobileApp`. The default mobile breakpoint is `768px`; you can override it by passing a value to `useIsMobile(...)`. Resizing or rotating the device re-evaluates the choice.

---

## Project layout

```
src/
├── App.jsx           # Tiny router: picks desktop or mobile component
├── DesktopApp.jsx    # Full broadcast-console UI (sources, mixer, presets)
├── MobileApp.jsx     # Touch-friendly UI: camera + Android tab capture
├── useIsMobile.js    # Viewport / UA detection hook
├── main.jsx          # Vite entry
└── index.css         # Tailwind directives
```

---

## Tech stack

- React 19 (functional components, hooks)
- Vite 8 (dev server and build)
- Tailwind CSS 4 (PostCSS pipeline)
- lucide-react for icons
- Web APIs: `getDisplayMedia`, `getUserMedia`, Web Audio API, `MediaRecorder`, Canvas 2D
