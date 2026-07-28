export const profile = {
  name: "Saifullah Khan",
  role: "Software Engineer | Full Stack Developer",
  email: "saifullahkhank66@gmail.com",
  phone: "03007117755",
  location: "Lahore, Pakistan",
  linkedin: "https://linkedin.com/in/saifullah-khan",
  github: "https://github.com/saifullahkhancs",
  summary:
    "Full Stack Developer with professional experience building web applications, REST APIs, and data-driven systems using Python, .NET, JavaScript and React. Experienced in backend development with Flask, FastAPI, Django, ASP.NET and microservice-based architectures — API design, authentication and authorization (JWT, RBAC), database design, and integrating frontend applications with backend services across MySQL, PostgreSQL, MongoDB, Elasticsearch, Neo4j and Kafka.",
};

export const experience = [
  {
    role: "Software Engineer",
    company: "Technogenics",
    location: "Lahore, Pakistan",
    period: "Aug 2024 – Jan 2026",
    points: [
      "Developed and maintained Python backend services and RESTful APIs using Flask and FastAPI within a microservice-based architecture.",
      "Maintained a CMS built on Django REST Framework and React, backed by MongoDB and Neo4j, managing data spanning millions of URLs, IPs and domains plus thousands of ransomware, malware and threat-actor records.",
      "Built REST APIs, GraphQL endpoints and Kafka consumer pipelines for automated ingestion across 4 databases (MySQL, MongoDB, Elasticsearch, Neo4j).",
      "Developed and customized Scrapy crawlers running weekly to collect and process PSIRT advisory data for the intel system.",
      "Worked with Docker-based development environments for building, running and debugging backend services.",
    ],
  },
  {
    role: "Associate Software Engineer",
    company: "DSME Global Links",
    location: "Lahore, Pakistan",
    period: "Oct 2023 – Aug 2024",
    points: [
      "Developed and maintained backend web and mobile applications using ASP.NET, C# and MySQL.",
      "Contributed to workflow-driven features including scheduling, reporting, booking and user management modules.",
      "Performed API testing and validation using Postman and custom Python scripts.",
      "Collaborated directly with clients to translate business needs into technical solutions.",
    ],
  },
  {
    role: "Research Engineer",
    company: "Valyrian System Incorporation",
    location: "Remote",
    period: "Aug 2022 – Aug 2023",
    points: [
      "Conducted research on high-performance packet processing using XDP and DPDK in Linux environments.",
      "Evaluated network performance and throughput using iperf, TRex and mpstat.",
      "Participated in experiments demonstrating packet filtering and rerouting at multi-million packet throughput.",
      "Studied Linux networking internals and system performance optimization techniques.",
    ],
  },
];

export const projects = [
  {
    name: "LinkeFlow",
    tagline: "LinkedIn Automation Platform",
    period: "May 2026 – Present",
    description:
      "Backend automation platform that schedules and executes LinkedIn actions with human-mimicking browser behavior and per-account rate limiting. JWT auth with RBAC, AES-256-GCM credential encryption and a Redis-backed daily action limiter. Deployed on an Azure VM with Nginx and systemd.",
    stack: ["FastAPI", "Celery", "Redis", "PostgreSQL", "Playwright", "Azure"],
  },
  {
    name: "Job Easy",
    tagline: "Job Application Automation Platform",
    period: "Personal Project",
    description:
      "Job-application automation platform with a FastAPI backend and React/Vite frontend. SQLAlchemy and Alembic for data modeling and migrations, JWT-based auth and a role-based approval workflow (visitor → customer → admin) gating email-sending features with encrypted credential storage.",
    stack: ["FastAPI", "React", "SQLAlchemy", "Alembic", "JWT"],
  },
  {
    name: "Strike Ready",
    tagline: "Cybersecurity Intelligence Platform",
    period: "Technogenics",
    description:
      "Contributed to backend services and data ingestion workflows. Managed ingestion from crawler systems, multiple databases and research sources into Elasticsearch and Neo4j, maintaining pipelines across several microservices.",
    stack: ["Python", "Elasticsearch", "Neo4j", "Kafka", "Scrapy"],
  },
  {
    name: "OOMS",
    tagline: "Online Order Management System",
    period: "Mar 2026 – Apr 2026",
    description:
      "Scalable architecture for an online food ordering system using .NET 10 and Clean Architecture, with authentication, authorization and role-based access control for user permissions.",
    stack: [".NET 10", "Clean Architecture", "RBAC"],
  },
  {
    name: "Social Media Platform",
    tagline: "Twitter Clone",
    period: "Personal Project",
    description:
      "Twitter-like web application with user authentication, tweets, likes, sharing and follow functionality, plus clean UI layouts and lightweight animations.",
    stack: ["Flask", "JavaScript", "MySQL"],
  },
];

export const skills = [
  { group: "Programming Languages", items: ["Python", "C#", "JavaScript"] },
  { group: "Backend Frameworks", items: ["Flask", "FastAPI", "Django", "Django REST Framework", "Scrapy", "ASP.NET Core"] },
  { group: "Databases", items: ["MySQL", "PostgreSQL", "MongoDB", "Elasticsearch", "Neo4j", "Redis"] },
  { group: "Messaging & Realtime", items: ["Kafka"] },
  { group: "Frontend", items: ["React", "HTML/CSS"] },
  { group: "Architecture", items: ["Microservices", "Clean Architecture", "MVC", "MVT"] },
  { group: "Auth & Security", items: ["JWT", "Role-Based Access Control", "API Security", "Rate Limiting"] },
  { group: "Familiar With", items: ["Docker", "Kubernetes", "Azure", "Playwright", "Celery"] },
];

export const education = {
  school: "Namal University, Mianwali",
  degree: "Bachelor of Computer Science",
  period: "Jul 2019 – Jul 2023",
  cgpa: "3.42 / 4.0",
  coursework:
    "Artificial Intelligence, Machine Learning, Database Management, Software Engineering, Computer Networks, Operating Systems, Data Analysis, Human Computer Interaction",
};

export const certifications = [
  {
    name: "Software Engineer",
    issuer: "HackerRank",
    year: "14 Jul 2026",
    detail: "Passed the HackerRank Software Engineer role certification test (ID 9E9A5564F2E7).",
    image: "hackerrank",
  },
  {
    name: "Introduction to JavaScript",
    issuer: "Sololearn",
    year: "20 Jul 2026",
    detail: "Course certificate CC-C9GOLPIL — theoretical and practical understanding of JavaScript.",
    image: "javascript",
  },
  {
    name: "Introduction to Cloud Infrastructure: Describe cloud concepts",
    issuer: "Microsoft",
    year: "10 Jun 2026",
    detail: "Azure cloud fundamentals — core cloud concepts and infrastructure services.",
    image: "azure",
  },
] as const;

// NOTE: these assets are still served from the original Lovable deployment.
// Download them from https://saif-portofolio.lovable.app and place them in
// src/assets/ (see README) then swap these for local imports, e.g.
//   import heroBanner from "@/assets/hero-banner.png"
const ASSET_HOST = "https://saif-portofolio.lovable.app";

export const assets = {
  heroBanner: `${ASSET_HOST}/__l5e/assets-v1/f21d14cc-ba6a-4abe-b699-4f4e323f56a2/hero-banner.png`,
  portrait: `${ASSET_HOST}/__l5e/assets-v1/728ff80c-dbea-4bb8-b824-f88615386187/saifullah-portrait.jpeg`,
  resume: `${ASSET_HOST}/__l5e/assets-v1/6d656b6e-0513-40c3-a30a-03fc6c99c836/Saifullah_Khan_Resume.pdf`,
  certAzure: `${ASSET_HOST}/__l5e/assets-v1/66495578-9a67-4d94-aabf-ac2cc3472fec/cert-azure.png`,
  certHackerrank: `${ASSET_HOST}/__l5e/assets-v1/dca8e020-cad0-4cd9-970f-5f290ab7e18c/cert-hackerrank.png`,
  certJavascript: `${ASSET_HOST}/__l5e/assets-v1/81ff7ef3-a02d-49d3-98ec-73e43dac5c87/cert-javascript.jpg`,
};
