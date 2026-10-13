# GitHub Pages: how this repo is published

**Live site:** https://drordehartog.github.io/huji_agp/. It currently serves the Lab 1 placeholder
from `index.html` at the repo root.

## What went wrong

With Pages set to **"Deploy from a branch"**, GitHub's built-in build clones every submodule.
The `lab_#` submodules point to `huji_agp_lab_#` repos that the build can't reach, so it fails:

```
fatal: repository 'https://github.com/DrordeHartog/huji_agp_lab_1.git/' not found
fatal: clone of 'git@github.com:DrordeHartog/huji_agp_lab_1.git' into submodule path '.../lab_1' failed
```

## The fix (already pushed)

`.github/workflows/pages.yml` deploys the repo root to Pages and **skips the submodules**
(`submodules: false`). It runs on every push to `main` and can also be started by hand from the
Actions tab. The submodules themselves were not touched.

## One setting for the repo owner (recommended, takes 10 seconds)

The site is live without it. Without the change, though, every push also runs GitHub's old
"pages build and deployment" job, which keeps failing on the submodules and shows a red ✗.

1. Open https://github.com/DrordeHartog/huji_agp/settings/pages.
2. Under **Build and deployment → Source**, change **"Deploy from a branch"** to **"GitHub Actions"**.
3. It saves immediately. Ignore the suggested workflow cards; `pages.yml` is already in the repo.

Only the owner can change this. Collaborators get a 404 from the settings API.

## Updating the site

Edit `index.html` (or add files next to it), commit and push to `main`. The "Deploy to GitHub
Pages" run in the Actions tab takes about 20 s, then reload the live URL.
