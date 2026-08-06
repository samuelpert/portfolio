/**
 * Content for the Singularity scroll.
 *
 * The page is four chapters plus the black-hole intro; every string a visitor
 * reads lives here so copy edits never mean touching layout or scroll code.
 */

export const EMAIL = "samuelpertov@gmail.com";

export const RESUME_URL =
  "https://acrobat.adobe.com/id/urn:aaid:sc:US:047ab663-7ce6-4961-bb73-3ecd1bb59fb2";

/** Bottom stage bar. `short` is used on phones, where the cells are ~80px wide. */
export const chapters = [
  { id: "ch1", long: "01 Horizon", short: "01 Horizon" },
  { id: "ch2", long: "02 Disk", short: "02 Disk" },
  { id: "ch3", long: "03 Dilation", short: "03 Dilation" },
  { id: "ch4", long: "04 Singularity", short: "04 Core" },
];

/** Phase readout in the stage bar, indexed by the active chapter. */
export const phaseNames = [
  "Event horizon",
  "Accretion disk",
  "Time dilation",
  "Singularity",
];

export const copy = {
  // The hero paragraph is tightened on phones — the desktop sentence wraps to
  // five lines at 402px and pushes the buttons under the fold.
  introDesktop:
    "I am a Sophomore Computer Science Undergrad at Florida International University (FIU), focused on machine learning development and full-stack web applications. Open to software engineering and ML internships.",
  introMobile:
    "Sophomore Computer Science undergrad at FIU, focused on machine learning and full-stack web applications. Open to SWE and ML internships.",
  timelineNote: "Where I've been and what I shipped there, most recent first.",
  outro: "Let's connect and explore how I can contribute to your team.",
};

export const projects = [
  {
    id: 1,
    title: "Sign Language Recognizer Glove",
    tag: "ML / AI team",
    img: "/p1.webp",
    des: "As part of the AI team I worked on gesture recognition to increase the glove's precision, using a custom dataset built from recorded glove movements and classified with Random Forest.",
    iconLists: ["/py.svg", "/randomforest.png"],
    link: "https://github.com/ashleyprado/sign-language-ai",
  },
  {
    id: 2,
    title: "Personal Portfolio",
    tag: "Web / 3D",
    img: "/p2.webp",
    des: "A space-themed portfolio that simulates entering the singularity of a black hole, blending design with interactivity.",
    iconLists: ["/ts.svg", "/re.svg", "/next.svg", "/three.svg", "/ace.svg"],
    link: "https://samuelpt.dev/",
  },
  {
    id: 3,
    title: "Game Hub v1",
    tag: "Full stack",
    img: "/p3.webp",
    des: "A React application for exploring 350,000+ video games via an API, with detailed insights, ratings and platform availability.",
    iconLists: ["/ts.svg", "/re.svg", "/vite.svg", "/chakra.svg"],
    link: "https://game-hub-kappa-gray.vercel.app/",
  },
  {
    id: 4,
    title: "Stock Market Simulator",
    tag: "Full stack",
    img: "/p4.webp",
    des: "A full-stack simulator where users create an account to buy, sell and quote stocks and review their transaction history. Built for an academic course.",
    iconLists: ["/fl.svg", "/sql.svg"],
    link: "https://game-hub-kappa-gray.vercel.app/",
  },
];

/**
 * Chapter 03. These entries are the mockup's placeholders — swap `when` for
 * real dates (and drop the last row) once the timeline content exists.
 */
export const timeline = [
  {
    when: "Now",
    title: "Sophomore, Computer Science — FIU",
    body: "Coursework in algorithms and systems alongside self-directed ML and web work. Seeking a summer SWE or ML internship.",
  },
  {
    when: "Recent",
    title: "AI team — Sign Language Recognizer Glove",
    body: "Gesture recognition and custom dataset work that raised the glove's recognition precision.",
  },
  {
    when: "Recent",
    title: "Personal portfolio — samuelpt.dev",
    body: "Designed and shipped the Next.js + Three.js singularity site that brought you here.",
  },
  {
    when: "Earlier",
    title: "Game Hub v1 & Stock Market Simulator",
    body: "First full-stack builds: a 350k-title game explorer, and an account-based trading simulator.",
  },
  {
    when: "Horizon",
    title: "Placeholder — send me your dates",
    body: "These rows swap out the moment real timeline content lands.",
  },
];

export const socialMedia = [
  {
    id: 1,
    name: "GitHub",
    platform: "github",
    img: "/git.svg",
    link: "https://github.com/samuelpert",
  },
  {
    id: 2,
    name: "X",
    platform: "twitter",
    img: "/x.svg",
    link: "https://x.com/samuelpertov",
  },
  {
    id: 3,
    name: "LinkedIn",
    platform: "linkedin",
    img: "/link.svg",
    link: "https://www.linkedin.com/in/samuel-perez-tovar/",
  },
];
