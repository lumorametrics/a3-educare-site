/**
 * Static home page copy about A3 EduCare Hub itself. Everything WordPress publishes (courses, colleges,
 * states, scholarships, destinations, articles) is loaded live in HomePage.jsx and never duplicated here.
 *
 * ZERO-REPETITION MAP: each fact, message, service, icon and image appears in exactly ONE section.
 *   Stats card    → the only numbers (courses, universities, states, abroad guides)
 *   About         → identity, founding year (seal only), mission, vision, operating foundation
 *   What we do    → working method in five stages (no service names, no links)
 *   Services      → the ten offerings, each with one card/row and one link; the "free" message lives here only
 *   Courses       → the streams (WordPress categories)
 *   Why choose    → credentials, institution network, offices, honesty about outcomes (the only "honest" message)
 *   Founder       → his own words (title line carries the credentials)
 *   FAQ           → audience, family involvement, what happens after an enquiry, documents to keep ready
 *   Final CTA     → the contact channels (the only phone/WhatsApp links)
 *
 * Facts come from the organisation (About and Contact pages): founded 2014, ISO 9001:2015, MSME registration,
 * Puja Social Empowerment Foundation (Section 8), six city offices. Keep any new claim verifiable.
 */
import {
  Award, BadgeCheck, Banknote, Briefcase, CalendarCheck, Calculator, Compass, FileText, LifeBuoy, ListChecks,
  Handshake, MessageCircle, Mic, Rocket, Sparkle, Star, Target, Users, Wrench,
} from "../ui/Icons";

export const FOUNDED_YEAR = 2014;
export const OPERATING_ENTITY = "Puja Social Empowerment Foundation";
export const OFFICES = ["Delhi", "Ranchi", "Bhopal", "Godda", "Palamu", "Shahdol"];

export const MISSION = "To make quality higher education reachable for every student, whatever their background or where they live.";
export const VISION = "A future where no deserving student misses the right course, college or scholarship for want of information.";

/** Photos in /public/home (Pexels licence). `-640` and `-1200` widths of each. Credits are listed below. */
export const homeImage = (name) => ({ name, small: `/home/${name}-640.webp`, large: `/home/${name}-1200.webp` });

/**
 * What we do: A3's working METHOD, in five stages. Deliberately not named after services (those are in the
 * services section) and without links, so the two sections never present the same thing twice.
 */
export const JOURNEY_STAGES = [
  {
    key: "direction",
    Icon: Compass,
    title: "Find your direction",
    summary: "Understanding comes before advice.",
    text: "We begin by learning about the student: interests, strengths, marks and what the family hopes for. Only then do we talk about options.",
    outcome: "A clear direction and a few career paths worth pursuing.",
    image: homeImage("journey-career"),
    position: "60% center",
    accent: "brand",
  },
  {
    key: "shortlist",
    Icon: ListChecks,
    title: "Compare and shortlist",
    summary: "Trade-offs explained in plain language.",
    text: "We set programmes and institutions side by side on approvals, eligibility, fees, location and outcomes, and explain what each choice gives up.",
    outcome: "A shortlist you understand and can defend.",
    image: homeImage("journey-selection"),
    position: "50% 40%",
    accent: "gold",
  },
  {
    key: "apply",
    Icon: CalendarCheck,
    title: "Apply on time",
    summary: "One calendar for every application.",
    text: "Every college on the list goes onto a single timeline of exams, deadlines and counselling rounds, so nothing is missed and nothing is rushed.",
    outcome: "Every application in, complete and before its deadline.",
    image: homeImage("journey-admission"),
    position: "50% center",
    accent: "coral",
  },
  {
    key: "cost",
    Icon: Calculator,
    title: "Plan the cost",
    summary: "The full price, before you commit.",
    text: "Tuition is only part of it. We work out fees, hostel, travel and living costs for each option, so money never derails a good choice late.",
    outcome: "The real cost of each option, known before you enrol.",
    image: homeImage("journey-funding"),
    position: "50% center",
    accent: "sky",
  },
  {
    key: "beyond",
    Icon: LifeBuoy,
    title: "Keep going together",
    summary: "A relationship, not a transaction.",
    text: "Admission is not where we stop. Your advisor remains a call away for the next decisions your course brings.",
    outcome: "Someone to call when the next big choice arrives.",
    image: homeImage("journey-development"),
    position: "50% 35%",
    accent: "mint",
  },
];

/**
 * Services: the ten offerings, each presented once. Core services have their own photo; career services share
 * one photo panel and have their own icon. `href` points to the page that covers the service; services without
 * a page of their own go to the contact page as an enquiry.
 */
export const CORE_SERVICES = [
  { key: "counselling", Icon: MessageCircle, title: "Free Career Counselling", text: "A one-to-one session, in person or by phone, to map your options before you commit to anything.", href: "/contact", label: "Book a session", image: homeImage("service-counselling"), position: "50% 30%", tag: "Free" },
  { key: "admission", Icon: FileText, title: "Admission Assistance", text: "We fill and verify your application forms and documents, and support you through counselling rounds.", href: "/apply-now", label: "Start your application", image: homeImage("service-admission"), position: "50% 40%" },
  { key: "scholarship", Icon: Award, title: "Scholarship Assistance", text: "An advisor checks which awards you qualify for and helps you put together a complete application.", href: "/scholarships", label: "Find a scholarship", image: homeImage("service-scholarship"), position: "60% 25%" },
  { key: "loan", Icon: Banknote, title: "Education Loan Assistance", text: "Compare education loans and prepare the paperwork, including for the Bihar Student Credit Card Yojana.", href: "/contact", label: "Ask about loans", image: homeImage("service-loan"), position: "65% center" },
];

export const CAREER_SERVICES_IMAGE = { ...homeImage("service-skills"), position: "55% center" };
export const CAREER_SERVICES = [
  { Icon: Briefcase, title: "Placement Support", text: "Register for job and placement assistance.", href: "/registration", label: "Register" },
  { Icon: Target, title: "Internship Support", text: "Internships that add real experience to your CV.", href: "/contact", label: "Enquire" },
  { Icon: Wrench, title: "Industrial Training", text: "Practical training for technical and diploma students.", href: "/contact", label: "Enquire" },
  { Icon: Sparkle, title: "Skill Development", text: "Job-ready skills alongside your degree or diploma.", href: "/contact", label: "Enquire" },
  { Icon: Mic, title: "Personality Development", text: "Communication, confidence and interview preparation.", href: "/contact", label: "Enquire" },
  { Icon: Rocket, title: "Project Funding Support", text: "Preparing project proposals and finding funding schemes.", href: "/contact", label: "Enquire" },
];

/** Why choose A3: differentiators that appear nowhere else on the page, each with an icon used nowhere else. */
export const TRUST_REASONS = [
  { Icon: BadgeCheck, title: "Quality-certified", text: "ISO 9001:2015 certified processes, and registered as an MSME with the Government of India." },
  { Icon: Star, title: "Recognised institutions", text: "Admission facilitation in NIRF-ranked, NBA-accredited and NAAC 'A' grade colleges and universities." },
  { Icon: Users, title: `${OFFICES.length} city offices`, text: `Meet an advisor in person in ${OFFICES.slice(0, -1).join(", ")} or ${OFFICES.at(-1)}.` },
  { Icon: Handshake, title: "Straight answers", text: "We never promise seats or visas. Those decisions rest with institutions and authorities, and we say so upfront." },
];

/** Practical questions whose answers appear nowhere else on the page. */
export const HOME_FAQS = [
  ["Who can come to A3 for guidance?", "Students after Class 10, Class 12 or graduation, working learners planning further study, and parents who want to understand the options for their child."],
  ["Can my parents join the counselling session?", "Yes, and we encourage it. Decisions about courses, colleges and fees usually involve the whole family, so parents are welcome in every conversation."],
  ["What happens after I send an enquiry?", "An advisor contacts you to understand what you are looking for and to arrange your first session at a time that suits you."],
  ["What should I keep ready before applying?", "Your marksheets and passing certificates, a valid photo ID, recent photographs, and category or income certificates if you plan to claim a reservation or scholarship."],
];

/** Photo credits for /public/home (Pexels licence: free to use; credited here as a courtesy and a record). */
export const HOME_IMAGE_CREDITS = {
  "journey-career": ["World Sikh Organization of Canada", "https://www.pexels.com/photo/student-and-a-teacher-in-a-classroom-18870248/"],
  "journey-selection": ["Arto Suraj", "https://www.pexels.com/photo/group-of-indian-students-on-campus-bench-in-santiniketan-39006532/"],
  "journey-admission": ["Kampus Production", "https://www.pexels.com/photo/a-person-signing-a-contract-8815849/"],
  "journey-funding": ["Ravi Roshan", "https://www.pexels.com/photo/close-up-of-indian-money-14907378/"],
  "journey-development": ["RDNE Stock project", "https://www.pexels.com/photo/man-in-black-long-sleeve-shirt-standing-in-front-of-his-colleagues-7581114/"],
  "service-counselling": ["Ketut Subiyanto", "https://www.pexels.com/photo/focused-tutor-and-student-doing-homework-assignment-using-laptop-4308095/"],
  "service-admission": ["Mikhail Nilov", "https://www.pexels.com/photo/a-teacher-pointing-at-a-student-s-laptop-during-class-9159087/"],
  "service-scholarship": ["Mikhail Nilov", "https://www.pexels.com/photo/a-woman-in-white-long-sleeves-thinking-while-holding-a-book-9159275/"],
  "service-loan": ["RDNE Stock project", "https://www.pexels.com/photo/a-man-and-woman-sitting-at-the-table-with-calculator-8292887/"],
  "service-skills": ["Multitech Institute", "https://www.pexels.com/photo/ac-repair-technician-at-work-in-new-delhi-33755641/"],
};
