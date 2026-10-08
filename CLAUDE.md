# Studio Grata website

This is the Studio Grata website. Plain HTML, CSS and a little JavaScript, no frameworks, no build step.

## Rules

- Only the `public` folder is published. Never put anything outside `public` that should be on the website.
- Colours and fonts live as CSS variables in the BRAND SETTINGS block at the top of `public/styles.css`, because the brand is not final.
- Write "Grata" in body text, URLs and metadata. "Grāta" with the macron is only for the logo or wordmark.
- No em dashes anywhere, in copy or comments.
- Keep the code small and readable, and explain every change in plain language.
- Landing photos: when adding or changing one in `public/index.html`, choose its phone movement (`data-move`: right, left, zoom-in or zoom-out) to suit that photo. Wide photos drift so they end on the best part; upright ones zoom.
