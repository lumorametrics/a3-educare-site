/**
 * Banner slides for the 12 college categories. Images are in /public/hero: `{image}-1024.webp` and `{image}-1408.webp`
 * (tablet/desktop) plus `{image}-mobile.webp`, a 600x768 portrait crop around the subject for phones.
 * `position` is the CSS object-position that keeps the people in frame on wide screens.
 * `credit` is shown on /image-credits. Pexels does not require credit; it is listed as a courtesy and a record.
 * The diploma and paramedical photos are mirrored so the people sit clear of the slide text.
 */
const pexels = (author, path) => ({ author, license: "Pexels License", licenseUrl: "https://www.pexels.com/license/", sourceUrl: `https://www.pexels.com/photo/${path}/`, sourceName: "Pexels", note: "" });

export const HERO_SLIDES = [
  {
    image: "academic",
    position: "78% center",
    eyebrow: "Academic Colleges",
    title: "Shape Your Future with",
    accent: "Expert Guidance on Academic Colleges",
    text: "Compare arts, science and commerce programmes and find a college that fits your goals, with clear advice on eligibility, fees and admissions.",
    credit: pexels("Sanket Mishra", "portrait-of-a-smiling-young-indian-student-reading-a-book-in-a-library-16461275"),
  },
  {
    image: "agriculture",
    position: "64% center",
    eyebrow: "Agriculture Colleges",
    title: "Grow a Career Rooted in",
    accent: "Modern Agriculture",
    text: "Explore agriculture and allied programmes that combine classroom science with practical learning in the field.",
    credit: pexels("EqualStock IN", "farming-in-india-20327958"),
  },
  {
    image: "diploma",
    position: "50% center",
    eyebrow: "Diploma Colleges",
    title: "Build Job-Ready Skills with a",
    accent: "Practical Diploma",
    text: "Find diploma and polytechnic programmes built around workshops, hands-on training and technical skills employers look for.",
    credit: pexels("Andrea Piacquadio", "master-showing-apprentice-how-handling-detail-3846255"),
  },
  {
    image: "engineering",
    position: "60% center",
    eyebrow: "Engineering Colleges",
    title: "Design What Comes Next at",
    accent: "Engineering Colleges",
    text: "Compare engineering branches, labs and entrance routes, and choose a college that matches your interests and rank.",
    credit: pexels("Mikhail Nilov", "people-sitting-at-the-table-9242834"),
  },
  {
    image: "general",
    position: "50% center",
    eyebrow: "General Colleges",
    title: "Find the Campus That",
    accent: "Feels Right for You",
    text: "Browse colleges by state, district and course, and get clear guidance on what to compare before you apply.",
    credit: pexels("Miguel Andres Parra", "group-of-students-on-the-walkway-in-front-of-the-university-building-17893014"),
  },
  {
    image: "law",
    position: "60% center",
    eyebrow: "Law Colleges",
    title: "Prepare for the Profession at",
    accent: "Leading Law Colleges",
    text: "Understand integrated and postgraduate law programmes, entrance exams and how to shortlist the right law school.",
    credit: pexels("Mikhail Nilov", "law-book-in-a-podium-8730785"),
  },
  {
    image: "management",
    position: "70% center",
    eyebrow: "Management Colleges",
    title: "Lead with Confidence through",
    accent: "Management Education",
    text: "Compare BBA, MBA and specialised programmes, with support on entrance exams, shortlisting and applications.",
    credit: pexels("Moe Magners", "men-presenting-using-a-whiteboard-7495605"),
  },
  {
    image: "medical",
    position: "66% center",
    eyebrow: "Medical Colleges",
    title: "Begin Your Journey in",
    accent: "Medical Education",
    text: "Get clear guidance on medical programmes, entrance requirements and counselling, so you can plan each step with confidence.",
    credit: pexels("Gustavo Fring", "group-of-medical-students-at-the-hallway-3985162"),
  },
  {
    image: "nursing",
    position: "66% center",
    eyebrow: "Nursing Colleges",
    title: "Train to Care as a",
    accent: "Skilled Nursing Professional",
    text: "Explore nursing programmes with clinical training, and understand eligibility and admissions before you apply.",
    credit: pexels("RDNE Stock project", "nurse-taking-the-blood-pressure-of-a-patient-6129688"),
  },
  {
    image: "paramedical",
    position: "58% center",
    eyebrow: "Paramedical Colleges",
    title: "Power Modern Healthcare with",
    accent: "Paramedical Skills",
    text: "Discover programmes in medical laboratory, radiology and allied health, with practical training for healthcare careers.",
    credit: pexels("MART PRODUCTION", "people-men-technology-room-7089617"),
  },
  {
    image: "pharmacy",
    position: "62% center",
    eyebrow: "Pharmacy Colleges",
    title: "Shape the Future of Medicine at",
    accent: "Pharmacy Colleges",
    text: "Compare diploma and degree programmes in pharmacy, and get advice on eligibility, fees and admissions.",
    credit: pexels("Tima Miroshnichenko", "a-woman-holding-a-bottle-8376235"),
  },
  {
    image: "professional",
    position: "80% center",
    eyebrow: "Professional Colleges",
    title: "Turn Your Ambition into a",
    accent: "Career-Ready Qualification",
    text: "Explore career-focused programmes with hands-on training, and find the course that leads where you want to go.",
    credit: pexels("Sony Feo", "a-woman-in-white-chef-uniform-holding-stainless-tong-7437731"),
  },
];
