/* ============================================================
   PORTFOLIO — data.js
   SINGLE SOURCE OF TRUTH for all copy.
   No content lives in components/markup — everything is here.
   Framework-agnostic plain object: reused as-is if/when this
   project migrates to React (import the same module).
   Exposed as window.PORTFOLIO_DATA for the no-build vanilla setup.
   ============================================================ */
(function (global) {
  "use strict";

  const data = {
    // ── identity / hero ──────────────────────────────────────
    profile: {
      name: "Mehul Jain",
      // roles[0] is the static fallback; the rest cycle in the typewriter
      roles: [
        "Software Engineer & Product Thinker",
        "AI & Automation Expert",
        "Mentor & Community Builder",
        "Rare Disease Advocate",
      ],
      tagline:
        "Building elegant systems at the intersection of technology and impact.",
      avatar: "assets/images/profile_pic_2.png",
      email: "mehuldj999@gmail.com",
      links: [
        { label: "Résumé", href: "assets/resume/resume.pdf", icon: "resume" },
        {
          label: "GitHub",
          href: "https://github.com/mehuldineshjain",
          icon: "github",
        },
        {
          label: "LinkedIn",
          href: "https://linkedin.com/in/mehuldjain",
          icon: "linkedin",
        },
        { label: "Email", href: "mailto:mehuldj999@gmail.com", icon: "mail" },
      ],
      bio: [
        "I'm a full-stack engineer with a passion for crafting software that feels effortless to use. I've worked across startups and scale-ups, shipping products that serve thousands of users daily.",
        "Outside of code, I mentor junior developers, volunteer for rare diseases and disability rights. I believe great software is equal parts craft and empathy.",
      ],
      // accessibility statement was here — moved into `skills` instead
    },

    // ── skills ───────────────────────────────────────────────
    skills: [
      "Python",
      "Ruby",
      "Javascript",
      "React",
      "TypeScript",
      "PostgreSQL",
      "REST & GraphQL APIs",
      "AI-Assisted Automation",
      "CRM Workflows",
      "AWS",
      "Docker",
      "Accessibility (WCAG Compliance)",
    ],

    // ── experience ───────────────────────────────────────────
    experience: [
      {
        role: "Software Engineer II",
        org: "Arcadia (Urjanet)",
        link: "https://www.arcadia.com/",
        date: "Apr 2023 – Mar 2024",
        location: "Remote",
        bullets: [
          "Managed the scraper bot move request feature, reducing account attrition and saving up to USD 250K.",
          "Led integration of third-party reward programs with Optimus Rewards, increasing customer acquisition.",
          "Implemented DocuSign integration and enhanced the waitlist experience program to streamline user workflows.",
          "Consolidated APIs and created Postman documentation, improving team productivity by 30%.",
          "Mentored two interns, both of whom successfully converted into full-time engineers.",
          "Received three awards for best project delivery and outstanding performance.",
        ],
        tags: [
          "Ruby on Rails",
          "TypeScript",
          "React",
          "GraphQL",
          "AWS",
          "PostgreSQL",
        ],
      },
      {
        role: "Software Engineer I",
        org: "Aknamed Pvt. Ltd.",
        link: "https://www.aknamed.com/",
        date: "Sep 2021 – Mar 2023",
        location: "Bengaluru, India",
        bullets: [
          "Owned the Rate Contract Module and automated selling price logic for internal business workflows.",
          "Reduced pricing errors by 99.9% and increased annual revenue by 1% through automation features.",
          "Improved user experience with pricing indicators, alerts, and operational workflow enhancements.",
          "Implemented a multi-tenant internal stock transfer system across branches and business units.",
          "Enhanced operational efficiency by 30% with bulk upload functionality and automated report generation.",
          "Optimized ElasticSearch performance across multiple modules, improving search speed by 20%.",
          "Automated recurring tasks with Ruby and Python scripts for bulk invoice downloads, data corrections, and internal operations.",
        ],
        tags: [
          "Ruby on Rails",
          "JavaScript",
          "jQuery",
          "AWS",
          "PostgreSQL",
          "ElasticSearch",
          "Bootstrap",
        ],
      },
      {
        role: "Software Engineer I",
        org: "Cerner (Oracle Health)",
        link: "https://www.oracle.com/in/health/",
        date: "Aug 2020 – Sep 2021",
        location: "Bengaluru, India",
        bullets: [
          "Automated AWS CloudFormation command generation, improving developer efficiency by 15%.",
          "Developed and maintained AWS EMR pipelines for population health algorithms using Clojure.",
        ],
        tags: ["Ruby on Rails", "Clojure", "AWS", "CloudFormation"],
      },
      {
        role: "Software Engineer Intern",
        org: "Cerner (Oracle Health)",
        link: "https://www.oracle.com/in/health/",
        date: "Feb 2020 – Jul 2020",
        location: "Bengaluru, India",
        bullets: [
          "Developed a React and Rails internal data fetching tool using the GitHub API.",
          "Achieved 100% data consistency and reduced manual effort for internal engineering workflows.",
        ],
        tags: ["Ruby on Rails", "React", "GitHub API"],
      },
    ],

    // ── projects ────────────────────────────────────────────
    projects: [
      {
        title: "South Asian Women in Rare",
        desc: "Website for South Asian Women in Rare Podcast.",
        link: "https://south-asian-women-in-rare.netlify.app/",
        // status: "live" -> green dot, "wip" -> yellow dot, omit -> no dot
        status: "live",
        tags: ["Healthcare", "Podcast", "Website Development"],
        bullets: [
          "Website for the podcast series for a non-profit.",
          "Built with Astro and automated with YouTube Data API.",
        ],
      },

      {
        title: "Physiobuddy (WIP)",
        desc: "A mobile-focused physiotherapy project that helps users perform physiotherapy remotely.",
        link: "",
        status: "wip",
        tags: ["Healthcare", "Remote Care", "Product Development"],
        bullets: [
          "Designed as a remote physiotherapy support tool for mobile users.",
          "Focused on improving access to guided physiotherapy outside traditional clinical settings.",
        ],
      },
      {
        title: "Attrition Predictor (Hackathon)",
        desc: "Predict attrition of users. (Global Innovation Award, Arcadia Hackathon 2023).",
        link: "",
        status: "nda",
        tags: ["AI", "Predictive Analytics", "Hackathon"],
        bullets: [
          "Built a predictive solution to estimate user attrition probability.",
          "Recognized with the Global Innovation Award during Arcadia Hackathon 2023.",
        ],
      },
      {
        title: "AI Annualized Usage (Hackathon)",
        desc: "Predict annual usage estimates. (Technical Innovation Award, Arcadia Hackathon 2023).",
        link: "",
        status: "nda",
        tags: ["AI", "Forecasting", "Automation"],
        bullets: [
          "Built an AI-driven solution to estimate annualized user usage.",
          "Received a Technical Innovation Award for innovation and business relevance.",
        ],
      },
      {
        title: "Donor Management System (NDA)",
        desc: "Donor Management system to comply with FCRA, 80G compliance and automations.",
        link: "",
        status: "nda",
        tags: ["Django", "Python", "Nonprofit Tech"],
        bullets: [
          "Implemented a donor management system for the Haemophilia Federation of India.",
        ],
      },
    ],

    // ── education ────────────────────────────────────────────
    education: [
      {
        role: "Master of Science in Software Engineering",
        org: "University of Europe for Applied Sciences",
        link: "https://www.ue-germany.com/",
        date: "Sep 2024 – Sep 2025",
        location: "Berlin, Germany",
        bullets: [
          "Graduate program focused on software engineering, modern development practices, and applied technology systems.",
        ],
        tags: ["Software Engineering", "Systems", "Product Development"],
      },
      {
        role: "Master of Science in Information Technology",
        org: "Jain University",
        link: "https://www.jainuniversity.ac.in/",
        date: "Jul 2018 – Jul 2020",
        location: "Bengaluru, India",
        bullets: [
          "Postgraduate study in information technology with a focus on software systems and applied computing.",
        ],
        tags: ["Information Technology", "Software Systems"],
      },
      {
        role: "Bachelor of Computer Applications",
        org: "St. Joseph's College",
        link: "https://www.sjc.ac.in/",
        date: "Jun 2015 – Jun 2018",
        location: "Bengaluru, India",
        bullets: [
          "Undergraduate foundation in computer applications, programming, databases, and software development.",
        ],
        tags: ["Computer Applications", "Programming", "Databases"],
      },
    ],

    // ── certifications ───────────────────────────────────────
    certifications: [
      {
        title: "Meta Full Stack Developer: Front-End & Back-End from Scratch",
        org: "Coursera by Meta",
        year: "2025",
        desc: "Covered HTML, CSS, JavaScript, React, Django, and API development.",
        link: "https://coursera.org/verify/specialization/BAUKZHSQA8WR",
        tags: ["React", "Django", "APIs", "Full Stack"],
        icon: "meta",
      },
      {
        title: "Claude Code 101",
        org: "Anthropic Academy",
        year: "2026",
        desc: "AI-assisted workflows,agentic loop, context window, tools, and permissions.",
        link: "https://verify.skilljar.com/c/itty2fhtrxq7",
        tags: ["Claude", "AI", "Agents", "Workflow"],
        icon: "claude",
      },
    ],

    // ── awards ───────────────────────────────────────────────
    awards: [
      // add a `link` to any award to make its title clickable (e.g. a
      // certificate, article, or proof URL). Empty/omitted -> plain text.
      {
        icon: "💡",
        year: "2023",
        title: "Technical Innovation Award",
        org: "Arcadia Hackathon",
        desc: "Recognized for the AI Annual Usage project, which predicted annual usage estimates for users.",
        link: "",
      },
      {
        icon: "🌍",
        year: "2023",
        title: "Global Innovation Award",
        org: "Arcadia Hackathon",
        desc: "Recognized for the Attrition Predictor project, which identified user attrition probability.",
        link: "",
      },
      {
        icon: "🦇",
        year: "Dec 2023",
        title: "Batman Award",
        org: "Arcadia",
        desc: "Received as best performer of the quarter for outstanding engineering performance.",
        link: "",
      },
      {
        icon: "🩺",
        year: "TBD",
        title: "NHM Recognition",
        org: "National Health Mission",
        desc: "Recognized for digitalizing the Hemophilia Treatment Centers map for National Health Mission magazine.",
        link: "",
      },
    ],

    // ── volunteering ─────────────────────────────────────────
    volunteering: [
      {
        role: "Youth Leadership Program",
        org: "Rare Disease International",
        date: "May 2025",
        location: "Geneva",
        bullets: [
          "Advocating for the rights of people with rare diseases and improved access to treatment around the world.",
        ],
      },
      {
        role: "Member",
        org: "Interessengemeinschaft Hämophiler eV (IGH)",
        date: "Oct 2024",
        location: "Berlin",
        bullets: [
          "Represented hemophilia advocacy at the World Health Summit 2025.",
        ],
      },
      {
        role: "Youth Leader — South Zone Representative",
        org: "Hemophilia Federation India",
        date: "Feb 2020",
        location: "India",
        bullets: [
          "Led camps focused on advocacy, training, awareness, and fundraising for the hemophilia community.",
        ],
      },
    ],

    // ── gallery ──────────────────────────────────────────────
    // Scaffold: drop real images into assets/images/gallery/ and set `img`.
    // While `img` is empty a placeholder tile shows. `section` (optional) is
    // a section id the tile links to (click jumps the deck there).
    gallery: [
      {
        img: "",
        caption: "Rare Disease International — Geneva",
        section: "volunteering",
      },
      {
        img: "",
        caption: "World Health Summit 2025 — Berlin",
        section: "volunteering",
      },
      {
        img: "",
        caption: "Arcadia Hackathon awards",
        section: "awards",
      },
      {
        img: "",
        caption: "Hemophilia Federation India camps",
        section: "volunteering",
      },
    ],
  };

  global.PORTFOLIO_DATA = data;
})(window);
