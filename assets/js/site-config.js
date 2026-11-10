/* ==========================================================================
   VANTERA — SITE CONFIGURATION
   --------------------------------------------------------------------------
   This is the ONLY file you need to edit to update contact details or the
   portfolio. No build step: save the file and redeploy.

   PORTFOLIO — how to add or edit a project
   1. Copy one of the project blocks below (from { to },) and paste it
      where you want it to appear. Projects show in the order listed.
   2. Edit the text fields.
   3. demoUrl: paste the PUBLIC live link (must start with https://).
      Leave it as "" and the "View Live Demo" button is hidden automatically.
   4. images: put screenshots in assets/portfolio/ and reference them here.
        desktop   – first screen of the site, 16:10 (e.g. 1600 × 1000)  ← main image
        fullPage  – optional full-page screenshot (scrolls on hover)
        mobile    – optional phone screenshot, 390:844 (e.g. 480 × 1039)
      If there is no desktop image, an elegant placeholder is shown instead.
   5. visible: false hides a project without deleting it.
   ========================================================================== */

window.VANTERA_CONFIG = {
  contact: {
    phoneDisplay: "+91 93872 32918", // how the number is shown on the site
    phoneTel: "+919387232918", // used for the "Call" buttons
    whatsappNumber: "919387232918", // country code + number, digits only
    whatsappGreeting: "Hello VANTERA, I'd like to discuss a project.",
  },

  projects: [
    {
      visible: true,
      title: "Imperial Royal",
      subtitle: "Premium Real Estate Website",
      category: "Website Development", // used for the portfolio filters
      label: "Concept project",
      description:
        "An elegant property discovery experience featuring premium property presentations and intuitive navigation — set in a cinematic black-and-gold visual language.",
      highlights: [
        "Property search with keyword, location & type filters",
        "Curated collections and destination pages",
        "Responsive across phone, tablet and desktop",
      ],
      demoUrl: "https://royal-real-estate-4cpe.vercel.app/",
      tint: "rgba(207, 174, 109, 0.22)", // soft background glow behind the preview
      images: {
        desktop: "assets/portfolio/imperial-royal-desktop-1600.webp",
        desktopSmall: "assets/portfolio/imperial-royal-desktop-800.webp",
        fullPage: "assets/portfolio/imperial-royal-full-1200.webp",
        fullPageSmall: "assets/portfolio/imperial-royal-full-700.webp",
        mobile: "assets/portfolio/imperial-royal-mobile.webp",
        mobileFull: "assets/portfolio/imperial-royal-mobile-full.webp",
      },
      alt: "Imperial Royal real estate website — hero section with a luxury residence at night",
    },
    {
      visible: true,
      title: "ABC Estates",
      subtitle: "Luxury Real Estate Platform",
      category: "Website Development",
      label: "Concept project",
      description:
        "A refined property platform for homes to buy and rent, presented through featured residences, curated collections and neighbourhood guides.",
      highlights: [
        "Featured residences with full property details",
        "Collections and neighbourhood destination guides",
        "Private enquiry flow for buyers and tenants",
      ],
      demoUrl: "https://luxury-real-estate-platform-1.vercel.app/",
      tint: "rgba(150, 128, 210, 0.2)",
      images: {
        desktop: "assets/portfolio/abc-estates-desktop-1600.webp",
        desktopSmall: "assets/portfolio/abc-estates-desktop-800.webp",
        fullPage: "assets/portfolio/abc-estates-full-1200.webp",
        fullPageSmall: "assets/portfolio/abc-estates-full-700.webp",
        mobile: "assets/portfolio/abc-estates-mobile.webp",
        mobileFull: "assets/portfolio/abc-estates-mobile-full.webp",
      },
      alt: "ABC Estates real estate platform — hero section with a modern villa and pool at dusk",
    },
    {
      visible: true,
      title: "Elite Academy",
      subtitle: "Premium Coaching & Admission Landing Page",
      category: "Landing Page",
      label: "Concept project",
      description:
        "A modern admission-focused landing page designed to present educational services professionally — with clear programmes, a guided learning journey and simple enquiry paths.",
      highlights: [
        "Programme presentation, journey steps & FAQs",
        "Counselling and admission enquiry calls-to-action",
        "WhatsApp enquiry integration",
      ],
      demoUrl: "https://landing-page-bdgdy.vercel.app/",
      tint: "rgba(110, 124, 255, 0.2)",
      images: {
        desktop: "assets/portfolio/elite-academy-desktop-1600.webp",
        desktopSmall: "assets/portfolio/elite-academy-desktop-800.webp",
        fullPage: "assets/portfolio/elite-academy-full-1200.webp",
        fullPageSmall: "assets/portfolio/elite-academy-full-700.webp",
        mobile: "assets/portfolio/elite-academy-mobile.webp",
        mobileFull: "assets/portfolio/elite-academy-mobile-full.webp",
      },
      alt: "Elite Academy coaching landing page — hero section with admission call-to-action",
    },
    {
      visible: true,
      title: "The Food Garden",
      subtitle: "Single-Page Restaurant Website",
      category: "Website Development",
      label: "Concept project",
      description:
        "A warm, inviting single-page website for a multi-cuisine restaurant, bringing the menu, table requests and visit details together in one smooth scroll.",
      highlights: [
        "Searchable menu with dish photos, prices and ratings",
        "Table requests sent as a ready-to-send WhatsApp message",
        "Location, directions and opening hours in one place",
      ],
      demoUrl: "https://restaurant-lyart-ten.vercel.app/",
      tint: "rgba(200, 104, 66, 0.2)", // terracotta, from the restaurant's own palette
      images: {
        desktop: "assets/portfolio/the-food-garden-desktop-1600.webp",
        desktopSmall: "assets/portfolio/the-food-garden-desktop-800.webp",
        fullPage: "assets/portfolio/the-food-garden-full-1200.webp",
        fullPageSmall: "assets/portfolio/the-food-garden-full-700.webp",
        mobile: "assets/portfolio/the-food-garden-mobile.webp",
        mobileFull: "assets/portfolio/the-food-garden-mobile-full.webp",
      },
      alt: "The Food Garden restaurant website — hero section with a spread of biryani, curries, naan and pizza",
    },

    /* ----------------------------------------------------------------------
       Ready-to-use slots — set visible: true once a public demo is available.
       ---------------------------------------------------------------------- */
    {
      visible: false,
      title: "Contemporary Real Estate Platform",
      subtitle: "Modern Property Website",
      category: "Website Development",
      label: "Concept project",
      description:
        "A contemporary property website with clean listings, refined typography and a calm, modern browsing experience.",
      highlights: [],
      // NOTE: the link provided (…-staticv2-4qklu5ht7.vercel.app) is protected by
      // Vercel Deployment Protection, so visitors would see a Vercel login page.
      // Paste the PUBLIC production URL here, add screenshots, then set visible: true.
      demoUrl: "",
      images: {},
    },
    {
      visible: false,
      title: "Business Service Landing Page",
      subtitle: "Conversion-Focused Landing Page",
      category: "Landing Page",
      label: "Concept project",
      description:
        "A conversion-focused business landing page with persuasive messaging and strategic enquiry sections.",
      highlights: [],
      demoUrl: "",
      images: {},
    },
    {
      visible: false,
      title: "Creative Digital Business Website",
      subtitle: "Brand & Services Website",
      category: "Website Development",
      label: "Concept project",
      description:
        "A sophisticated business website focused on branding, services, and customer engagement.",
      highlights: [],
      demoUrl: "",
      images: {},
    },
  ],
};
