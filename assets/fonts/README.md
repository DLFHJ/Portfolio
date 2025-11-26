This folder is where you can add local font files used in the project.

Aspekta (headings - variable font):
- If you have the Aspekta typeface variable font, download the WOFF2 variable file from the Aspekta releases or build it from sources: https://github.com/ivodolenc/aspekta/releases
- Add the variable font file to this folder using the name that the CSS expects (or change the CSS accordingly):
  - `aspekta-variable.woff2` (preferred) and optionally `aspekta-variable.woff` as fallback.
- The CSS file currently expects the font at `/assets/fonts/aspekta-variable.woff2` and uses the `wght` axis to choose a 700 weight for headings.

IBM Plex Sans (body):
- IBM Plex Sans is loaded from Google Fonts in `index.html` via a <link> tag (no local files required).

- Notes:
- Check the typeface licensing before distributing fonts in a public repository.
- If you prefer using a hosted font provider, you can remove the @font-face block and load Aspekta via a CDN (if available).

How to test locally:
- Run `python -m http.server 8000` from the project root and open `http://localhost:8000/` in your browser.
- If you added `aspekta-variable.woff2`, confirm via DevTools > Network that the font file loads. Verify headings render using Aspekta (font name will appear in the computed styles).
