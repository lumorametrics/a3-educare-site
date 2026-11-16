import { Building, Globe, Graduation, Shield } from "../ui/Icons";

/** The four guidance services, shown in full on /services and summarised on /about. */
export const SERVICES = [
  {
    number: "01",
    title: "Course & career guidance",
    text: "Turn your interests and strengths into a practical shortlist of courses, specialisations and career directions.",
    points: ["Interest-led course matching", "Career pathway conversations", "Clear next-step recommendations"],
    icon: Graduation,
    tone: "bg-brand-50 text-brand-700",
  },
  {
    number: "02",
    title: "College shortlisting",
    text: "Compare colleges with the details that matter: eligibility, fees, location, facilities, reputation and outcomes.",
    points: ["Personalised college shortlist", "Course and fee comparison", "Admission timeline planning"],
    icon: Building,
    tone: "bg-gold-100 text-ink-800",
  },
  {
    number: "03",
    title: "Study abroad guidance",
    text: "Plan your international education journey with destination research, university selection and application support.",
    points: ["Country and university research", "Application document checklist", "Visa preparation guidance"],
    icon: Globe,
    tone: "bg-ink-50 text-ink-700",
  },
  {
    number: "04",
    title: "Application readiness",
    text: "Move from research to action with a structured plan that keeps deadlines, documents and decisions organised.",
    points: ["Profile and document review", "Deadline tracking", "Confident application planning"],
    icon: Shield,
    tone: "bg-coral-50 text-coral-600",
  },
];
