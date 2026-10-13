# Portfolio site — Abdullah, Creative Designer

A static site: plain HTML, CSS and JavaScript. No build step, no framework, no server code — upload the folder
anywhere that hosts static files.

```
index.html        home: hero (input → delivered), case studies, image wall, motion reel, AI Lab, services,
                  experience, toolkit (layers panel), about, Behance archive, contact
project.html      one case study, chosen by ?p=<id>  (e.g. project.html?p=frostline)
cv.html           the CV, A4, printable;  cv.pdf is the same page as a PDF
data/site.js      ALL personal text: name, contact, intro, about, stats, services, experience, tools, Behance
data/projects.js  the case studies, the image wall and the hero examples
assets/           css, js, fonts (OFL), img (webp), video (H.264 mp4)
```

## Before publishing — fill these in

Open `data/site.js`; every line marked `// EDIT` needs your real details:

- `name` — your full name as on official documents
- `location` — your city
- `email`, `phone`, `whatsapp`
- `links` — Behance, LinkedIn, Instagram URLs (an empty `url` hides that button)
- `siteUrl` — the address once it is live (it is printed on the CV)
- `experience` — real client names and numbers if you have them (orders, followers, campaigns)
- `toolkit` — confirm the tools, add InDesign / CorelDRAW / Premiere / After Effects if you use them
- `languages`, `education`

In `data/projects.js`, confirm the lines marked `// EDIT` (years, clients, and that the logo, book cover and mascots
are your designs).

After any change to the CV text, refresh `cv.pdf`: open `cv.html` in Chrome → **Print / Save as PDF** → A4, margins
none, background graphics on. (Or ask Claude to regenerate it.)

## Adding Behance projects

1. Save each project's cover image into `assets/img/behance/` (about 1600 px wide, `.webp` or `.jpg`).
2. Add one line per project to `behance: [...]` at the end of `data/site.js`:
   ```js
   { title: "Restaurant Brand Identity", cat: "Brand", year: "2023",
     cover: "assets/img/behance/restaurant.webp", url: "https://www.behance.net/gallery/..." },
   ```
3. Put your Behance profile URL in `links`. The "More on Behance" section appears as soon as either exists.

To turn a Behance project into a full case study on this site instead, copy one object in `data/projects.js`
and replace its images.

## Publishing (free options)

- **Netlify Drop** — go to app.netlify.com/drop and drag this whole folder onto the page. Live in a minute;
  rename the site in its settings, or connect your own domain.
- **Cloudflare Pages** — Workers & Pages → Create → Pages → *Upload assets* → upload this folder.
- **GitHub Pages** — push the folder to a repository, then Settings → Pages → deploy from the main branch.

Every host above serves `index.html` automatically. Total size is about 55 MB (mostly the videos).

## Preview locally

```
F:\comfy\venv-studio\Scripts\python.exe -m http.server 8765 --bind 127.0.0.1
```
run inside this folder, then open http://127.0.0.1:8765. (Opening `index.html` by double-click also works.)

## Rebuilding the media

`F:\comfy\output\portfolio_site_work\build_assets.py` pulls the images from the Studio library and the campaign
folders and writes the web-sized `webp` / `mp4` files here. It skips files that already exist.
