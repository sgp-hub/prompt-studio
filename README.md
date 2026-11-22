# Prompt Studio — static build

This folder is the planner edition as a standalone static site. It has no
server and no Python: the workspace HTML/CSS/JS runs directly in the browser,
and saved packages live in that browser's `localStorage` (key
`lps-plan-versions`). Google Sites cannot host code, so it embeds this site from
GitHub Pages.

Rebuild after changing `planner/`:

```powershell
& E:\LocalPromptStudio\.venv\Scripts\python.exe E:\LocalPromptStudio\scripts\build_site.py
```

## Deploy to GitHub Pages

1. Create an empty repository on GitHub (for example `prompt-studio`).
2. Publish the contents of this folder as the repository root:

   ```powershell
   Set-Location E:\LocalPromptStudio\site
   git init
   git add .
   git commit -m "Static Prompt Studio"
   git branch -M main
   git remote add origin https://github.com/<user>/prompt-studio.git
   git push -u origin main
   ```

3. On GitHub: **Settings → Pages → Build and deployment**.
   Source: **Deploy from a branch**. Branch: **main**, folder: **/ (root)**. Save.
4. Wait for the green check, then open `https://<user>.github.io/prompt-studio/`.
   The planner should load, generate a package, save it, reload, and reopen it.

## Embed in Google Sites

1. Open the Google Site, then **Insert → Embed → Embed code**.
2. Paste this, replacing the URL with your Pages URL:

   ```html
   <iframe
     src="https://<user>.github.io/prompt-studio/"
     title="Prompt Studio"
     style="width:100%;height:1500px;border:0"
     loading="lazy"
     allow="clipboard-write; fullscreen"></iframe>
   ```

3. Insert, drag the frame to full width, and save the site. Publish it.

Notes:

- Use the **Embed code** block, not a plain link, so the app gets its own
  `github.io` origin. `localStorage`, the clipboard, and the theme toggle work
  there; inside a generic sandboxed embed they may be blocked.
- The frame keeps its own scrollbar. Increase `height` if the review or package
  screen feels cramped.
- Saved packages are per browser and per device. There is no shared backend.
- The original edition's Ollama "Quick test" is not part of this build; a
  hosted page cannot reach a local model.
