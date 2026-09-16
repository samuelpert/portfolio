/**
 * Content for the Singularity scroll.
 *
 * The page is four chapters plus the black-hole intro; every string a visitor
 * reads lives here so copy edits never mean touching layout or scroll code.
 */

export const EMAIL = "samuelpertov@gmail.com";

export const RESUME_URL =
  "https://acrobat.adobe.com/id/urn:aaid:sc:US:7dd0f739-a72f-48ac-87e7-fa2f0ad8801c";

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
    "I am a Junior Computer Science Undergrad at Florida International University (FIU), focused on machine learning development and full-stack web applications. Open to software engineering and ML internships.",
  introMobile:
    "Junior Computer Science undergrad at FIU, focused on machine learning and full-stack web applications. Open to SWE and ML internships.",
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
];

/** Chapter 03. Roles and builds, most recent first. */
export const timeline = [
  {
    when: "May 2026 — Present",
    title: "Future Innovators Mentorship Program — Blackstone",
    body: "Connecting future interns with Blackstone Technology & Innovations professionals for 1:1 guidance, career advice and industry insight ahead of their internships.",
  },
  {
    when: "Mar 2026 — Present",
    title: "Computer Support Technician — Student Athlete Academic Center, FIU",
    body: "Diagnosing software and hardware issues for staff and students, and imaging and deploying machines alongside the IT team to keep the center running.",
  },
  {
    when: "May — Jun 2025",
    title: "Software Engineering Intern — PantherSoft, FIU",
    body: "Crawled 15+ FIU sites with Crawl4AI and tuned accuracy ~15%, embedded 80,000+ data points into Qdrant on Google Cloud, and built the N8N proof-of-concept adopted for FIU's AI student response system serving 50,000+ students.",
  },
  {
    when: "Feb — May 2025",
    title: "E3 Recruitment Lead — CodePath",
    body: "Grew the E3 scholars community at FIU through campus recruitment and 1:1 mentorship, registering 118+ students during the spring term.",
  },
  {
    when: "Feb — Apr 2025",
    title: "AI team — Sign Language Recognizer Glove",
    body: "Built the Python ML pipeline for a glove that translates ASL in real time from flex-sensor and gyroscope data, reaching 95% accuracy with a Random Forest model.",
  },
  {
    when: "Expected Spring 2028",
    title: "B.S. Computer Science — Florida International University",
    body: "Junior in Miami, FL. Coursework across algorithms, discrete structures and systems, alongside INIT, CodePath and Break Through Tech Miami.",
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
