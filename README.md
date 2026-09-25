# Studio Grata website

Plain HTML and CSS. No build step. Every push to GitHub deploys automatically through Cloudflare Pages.

## What each file does

- `index.html`: the landing screen (the two panels and their links)
- `styles.css`: all colours, fonts and layout. The BRAND SETTINGS block at the top is the only part you normally need to touch.
- `main.js`: makes the panels open on tap on phones
- `404.html`: shown for any page that does not exist yet ("This page is on its way")

## Common edits

- Change a colour: edit the matching line in BRAND SETTINGS in `styles.css`.
- Change the font: replace the Google Fonts link in both HTML files, then update `--font` in `styles.css`.
- Change a link: edit the `href` in `index.html`.
- Go live for search engines: delete the `<meta name="robots" content="noindex">` line in `index.html`.
