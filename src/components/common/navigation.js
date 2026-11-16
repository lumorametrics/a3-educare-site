/**
 * Header navigation. Every href is an existing route or an existing in-page anchor:
 *   /about, /services, /gallery, /courses, /colleges, /states, /study-abroad, /scholarships, /blog, /contact,
 *   /registration (with ?form=<franchise|coordinator|placement> to open that form), /#about-a3, /#founder.
 * Dynamic parts (popular streams, latest posts) are loaded from WordPress when a menu first opens.
 */
import {
  Award, Book, Briefcase, Building, Compass, Flag, Globe, Handshake, ImageIcon, MapFold, Mic, Newspaper, Users,
} from "../ui/Icons";

export const NAV_SECTIONS = [
  { key: "home", label: "Home", href: "/", match: /^\/?$/ },
  {
    key: "about",
    label: "About A3",
    match: /^\/(about(-us)?|services|gallery)(\/|$)/,
    columns: [
      {
        heading: "Who we are",
        items: [
          { label: "About Us", href: "/about", text: "Our story, approach and offices", Icon: Building },
          { label: "Our Mission & Vision", href: "/#about-a3", text: "The purpose behind our work", Icon: Flag },
          { label: "Leadership", href: "/#founder", text: "A message from our founder", Icon: Mic },
        ],
      },
      {
        heading: "What we offer",
        items: [
          { label: "Our Services", href: "/services", text: "How we guide students and families", Icon: Compass },
          { label: "Gallery", href: "/gallery", text: "Photos from A3 EduCare Hub", Icon: ImageIcon },
        ],
      },
    ],
    feature: "credentials",
  },
  {
    key: "study",
    label: "Study Options",
    match: /^\/(courses?|course-directory|colleges?|states?|districts?|study-abroad|scholarships)(\/|$)/,
    columns: [
      {
        heading: "In India",
        items: [
          { label: "Explore Courses", href: "/courses", text: "Programmes by stream, duration and eligibility", Icon: Book },
          { label: "Find Colleges", href: "/colleges", text: "Campus profiles and admission details", Icon: Building },
          { label: "Explore by States", href: "/states", text: "Colleges and courses in every state and UT", Icon: MapFold },
        ],
      },
      {
        heading: "Beyond & funding",
        items: [
          { label: "Study Abroad", href: "/study-abroad", text: "Country guides, universities and visas", Icon: Globe },
          { label: "Scholarships", href: "/scholarships", text: "Central, state, institutional and private awards", Icon: Award },
        ],
      },
    ],
    feature: "streams",
  },
  {
    key: "resources",
    label: "Resources",
    match: /^\/blog(\/|$)/,
    columns: [
      {
        heading: "Read & learn",
        items: [
          { label: "Education Blog", href: "/blog", text: "Admission guides, comparisons and news", Icon: Newspaper },
        ],
      },
    ],
    feature: "posts",
  },
  {
    key: "partner",
    label: "Partner With Us",
    match: /^\/registration(\/|$)/,
    columns: [
      {
        heading: "Join our network",
        items: [
          { label: "Franchise Registration", href: "/registration?form=franchise", text: "Run an A3 EduCare Hub centre", Icon: Handshake },
          { label: "Coordinator Registration", href: "/registration?form=coordinator", text: "Join our education coordination network", Icon: Users },
          { label: "Placement Registration", href: "/registration?form=placement", text: "Job and placement assistance", Icon: Briefcase },
        ],
      },
    ],
    feature: "partner",
  },
  { key: "contact", label: "Contact", href: "/contact", match: /^\/contact(-us)?(\/|$)/ },
];
