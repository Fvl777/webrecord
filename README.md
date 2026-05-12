# Eduboard

A browser-based teaching console for capturing your screen, mixing in microphone and system audio, previewing in real time, and recording a polished local video file. Built with React + Vite.

> **Note:** The live-streaming feature (and the Node + FFmpeg relay server it depended on) has been removed. Eduboard now focuses purely on high-quality local screen recording. All capture and recording happens in the browser; nothing is uploaded anywhere.

## Features

- Screen / window / browser-tab capture via the standard `getDisplayMedia` API
- Output presets: Broadcast HD (1080p), HD 720, Vertical 9:16, Square 1:1
- Microphone mixing with device selection and live level meters
- Optional system-audio passthrough when supported by the source
- Real-time preview canvas at 30 fps
- WebM / MP4 recording with one-click download

## Browser requirements

Recording uses `MediaRecorder` and `getDisplayMedia`, which are widely supported in modern Chromium browsers (Chrome, Edge, Brave, Arc, Opera) and recent Firefox. System-audio capture is most reliable in Chromium.

The deployed site **must be served over HTTPS** — `getDisplayMedia` will refuse to work on plain `http://` origins other than `localhost`. GitHub Pages provides HTTPS automatically.

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

---

## Tech stack

- React 19 (functional components, hooks)
- Vite 8 (dev server and build)
- Tailwind CSS 4 (PostCSS pipeline)
- lucide-react for icons
- Web APIs: `getDisplayMedia`, `getUserMedia`, Web Audio API, `MediaRecorder`, Canvas 2D
