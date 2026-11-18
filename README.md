# Wedding Invitation

A static site (no build step). Files: `index.html`, `styles.css`, `script.js`, `config.js`, `og-image.jpg`, `favicon.svg`.

## 1. Edit the details
Everything lives in **`config.js`**: names, initials, dates, venues, RSVP WhatsApp number, dress code.
Also update the names in the `<title>` / `og:` tags at the top of `index.html` (that is what WhatsApp shows in the preview).

## 2. Music (optional)
Drop an mp3 at `assets/music.mp3`. It starts softly when the seal is broken, and a music button appears.
Leave it out and the button simply never shows.

## 3. Deploy on Vercel
- `npx vercel` in this folder, **or** push to GitHub and import the repo at vercel.com (Framework preset: *Other*).
- Then replace `YOUR-SITE.vercel.app` in `index.html` (`og:image` and `og:url`) with your real domain and redeploy.
  WhatsApp needs that absolute URL to show the preview image.

## 4. Personalised links for WhatsApp
Add `?to=` with the guest's name and the envelope is addressed to them (their name is also used in the RSVP message):

```
https://your-site.vercel.app/?to=The%20Rahman%20Family
https://your-site.vercel.app/?to=Ayesha%20%26%20Bilal
```
(`%20` = space, `%26` = &). Without `?to=` it reads "Our Dearest Guest".

## Preview locally
`python -m http.server` in this folder, then open http://localhost:8000
