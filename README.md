# WanderVienna

Source of [www.wandervienna.com](https://www.wandervienna.com), rebuilt from Webflow as a static [Astro](https://astro.build) site.

- **Content** lives in plain files:
  - `src/content/guides/*.md` – the two Hallstatt guides (the comparison table is in the front matter, the article is Markdown)
  - `src/content/pages/about.md` – About page
  - `src/data/home.json` – homepage cards
  - `src/data/site.json` – analytics IDs, footer links, contact form settings
  - `public/images/` – all images (downloaded from the old Webflow CDN)
- **URLs** are identical to the Webflow site (`/about`, `/vienna-to-hallstatt-day-trip`, …).
- **Search** (`/search`) is built with [Pagefind](https://pagefind.app) at build time.

## Editing in the browser (Pages CMS)

1. Go to <https://app.pagescms.org> and sign in with GitHub.
2. Open the `Wandervienna` repository. The editor reads `.pages.yml`.
3. Edit and save: every save is a commit, and Cloudflare Pages rebuilds the site automatically.

## Hosting (Cloudflare Pages)

Create a Pages project connected to this repository with:

| Setting | Value |
| --- | --- |
| Framework preset | Astro |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Node version | 22 (from `.nvmrc`) |

Then add the custom domains `www.wandervienna.com` and `wandervienna.com` (redirect the apex to `www`).

## Contact form

Webflow handled form submissions; that stops when the site leaves Webflow. The form posts to the endpoint in
`src/data/site.json` (`contactFormAction`, `contactFormAccessKey`). With [Web3Forms](https://web3forms.com)
(free): request an access key for your email address, then set
`contactFormAction` to `https://api.web3forms.com/submit` and `contactFormAccessKey` to the key.

## Local development

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # static site in dist/ (+ search index)
```
