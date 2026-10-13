/* =====================================================================================================
   SITE CONTENT — edit this file; the pages read everything from here (no build step).
   Lines marked  // EDIT  are guesses or placeholders: replace them with your real details.
   Empty strings ("") hide that item on the page.
   ===================================================================================================== */
window.SITE = {
  name: "Md. Tareque Abdullah",           // full name as on the CV
  monogram: "TA",
  years: "08",                            // years of design experience (big number on the CV): since May 2018
  role: "Creative Designer",
  roleLong: "Graphic & Creative Designer",
  focus: "AI product imagery · Campaigns & social · Brand · Print & web",
  location: "Dhaka, Bangladesh",
  timezoneNote: "Remote · daily EST overlap",
  availability: "Available immediately",   // EDIT if needed
  email: "mdmusafir4@gmail.com",
  phone: "+880 1995-086653",
  whatsapp: "",                           // EDIT: digits only with country code, e.g. "8801XXXXXXXXX"
  photo: "assets/img/profile/headshot_cut.webp", // background removed (source: portfolio_site_work/headshot_src.jpg)
  photoPlain: "assets/img/profile/headshot.webp", // the original on white, used on the CV
  siteUrl: "",                            // EDIT after publishing, e.g. "abdullah.design" (shown on the CV)
  cvPdf: "cv.pdf",

  links: [                                 // EDIT: add your real profiles; leave url "" to hide one
    { label: "Behance", url: "" },
    { label: "LinkedIn", url: "" },
    { label: "Instagram", url: "" },
  ],

  intro:
    "I make brands look worth buying — campaign visuals, realistic AI product imagery, social content, " +
    "brand systems and print. Eight years designing, the last four with my own online brand alongside, " +
    "so I design for what sells, not just for what looks good.",

  about: [
    "I'm a creative designer who has spent eight years making things people buy: three at Sahara IT, then four " +
    "designing sportswear at MonoTex and SportsVilla — product images, campaigns, social content, brand identities, " +
    "print, and apparel.",
    "Since 2022 I've also run my own online brand end to end, alongside my jobs — design, product photography, " +
    "social, ads and orders. That taught me what a design is for: it has to sell, it has to print correctly, " +
    "and it has to look like one brand on a phone, a banner and a product.",
    "Today a big part of my work is AI product imagery: I composite real products into campaign scenes with " +
    "image models, keep the product exact, and carry each idea into every format — still and motion. " +
    "I work in English with remote teams, plan my own work and deliver on time.",
  ],

  stats: [
    { n: "8", unit: "yrs", label: "Designing professionally" },
    { n: "4", unit: "yrs", label: "Running my own online brand" },
    { n: "36", unit: "", label: "Campaign assets from two product photos" },
    { n: "18", unit: "", label: "Animated cuts — story, feed and banner" },
  ],

  ticker: [
    "AI product imagery", "Campaign key visuals", "Social & marketing content", "Website & e-commerce visuals",
    "Brochures · flyers · product sheets", "Brand identity", "Motion for social", "Available for remote work",
  ],

  /* What I'll do for your team — mirrors the role's responsibilities */
  services: [
    { no: "01", title: "AI product imagery",
      text: "Realistic product images from a single photo: the product composited into a scene, kept exact, " +
            "then adapted to every format. No photoshoot, no reshoots.",
      deliver: ["Hero shots", "Lifestyle scenes", "Campaign key visuals"],
      proof: ["frostline", "ember", "mockup-suite"] },
    { no: "02", title: "Social & marketing content",
      text: "Feed posts, stories, reels and ad creatives that stay on-brand across a whole campaign — still and animated.",
      deliver: ["Feed 4:5 · 1:1", "Stories & reels 9:16", "Ads & short video"],
      proof: ["frostline", "ember"] },
    { no: "03", title: "Website & e-commerce",
      text: "Product imagery, banners, catalogue grids and landing visuals for online stores. I sell online every day, so I design for conversion.",
      deliver: ["Product images", "Web banners 16:9", "Catalogue layouts"],
      proof: [] },
    { no: "04", title: "Print & exhibition",
      text: "Brochures, flyers, product sheets, posters, covers and production-ready files — colour, bleed and file prep done right.",
      deliver: ["Posters & flyers", "Covers", "Print-ready files"],
      proof: [] },
    { no: "05", title: "Consistent branding",
      text: "Type, colour and layout systems that keep many pieces — and many people's work — looking like one brand.",
      deliver: ["Identity", "Campaign systems", "Templates"],
      proof: ["frostline", "ember"] },
    { no: "06", title: "Ownership",
      text: "I run a business: I plan my own work, communicate clearly in English, and hit deadlines without being chased.",
      deliver: ["Remote-ready", "Daily EST overlap", "Self-managed"],
      proof: [] },
  ],

  experience: [
    { years: "2022 — Now", title: "Founder & Creative Lead", org: "Poridheyo — my online apparel brand, run alongside my design jobs",
      points: [
        "Built the brand identity and run every visual touchpoint: products, social, ads and the online catalogue.",
        "Create all product images — photography, mockups and AI composites — and campaign key visuals.",
        "Produce social content and short video ads; plan and run Meta ad campaigns.",
        "Set up an AI imagery workflow (ComfyUI, FLUX.2, Qwen-Image-Edit, Wan 2.2) for product shots, campaigns and motion.",
      ] },
    { years: "Jun 2022 — Oct 2025", title: "Sports Apparel Designer", org: "SportsVilla — Jatrabari, Dhaka",
      points: [
        "Designed custom kits for teams and organisations, from the client's brief to the approved design.",
        "Presented concepts on realistic mockups so clients could sign off before production.",
        "Prepared production-ready files and worked side by side with the production and manufacturing teams.",
        "Ran several orders at once against delivery dates.",
      ] },
    { years: "Aug 2021 — May 2022", title: "Sports Apparel Designer", org: "MonoTex — Jatrabari, Dhaka",
      points: [
        "Built team uniforms around each client's branding, then refined them with the client until approval.",
        "Kept design files organised and handed finished designs over to manufacturing.",
      ] },
    { years: "May 2018 — Jul 2021", title: "Graphic Designer", org: "Sahara IT — Jatrabari, Dhaka",
      points: [
        "Designed print and digital work for a range of clients, in line with each client's brand guidelines.",
        "Took projects from concept presentation to final files, several at a time.",
        "Prepared artwork for print production and for digital media.",
      ] },
  ],

  /* shown as a layers panel; groups are folders, items are layers */
  toolkit: [
    { group: "Design", items: ["Adobe Photoshop", "Adobe Illustrator", "Figma", "CLO 3D"] },   // EDIT: confirm / add InDesign, CorelDRAW
    { group: "AI imagery", items: ["ComfyUI", "FLUX.2", "Qwen-Image-Edit", "Krea", "ChatGPT image"] },
    { group: "Motion", items: ["Wan 2.2 video", "HTML/CSS motion", "Video editing"] },  // EDIT: name your editor
    { group: "Production", items: ["Print production", "Mockups", "Meta Ads Manager"] },
  ],

  languages: [ { name: "Bangla", level: "Native" }, { name: "English", level: "" } ],
  education: [
    { years: "2016 — 2017", title: "Daowra-e-Hadith (Masters)", org: "Jamia Arabia Imdadul Ulom, Faridabad, Dhaka" },
    { years: "2004 — 2015", title: "Nurani – Meshkat", org: "Jamia Karimia Darul Ulom, Dhaka" },
  ],

  /* ----------------------------------------------------------------------------------------------
     BEHANCE — older work. Add one object per Behance project; the section hides while this is empty.
     Save each cover as assets/img/behance/<name>.webp (about 1600 px wide), then e.g.:
       { title: "Restaurant Brand Identity", cat: "Brand", year: "2023",
         cover: "assets/img/behance/restaurant.webp", url: "https://www.behance.net/gallery/..." },
     ---------------------------------------------------------------------------------------------- */
  behance: [],
};
