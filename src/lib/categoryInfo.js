// FALLBACK ONLY. The source of truth is the "Course Category Content" ACF group on each course_category term in
// WordPress (category_introduction, category_description, category_entrance_exams, category_hero_image), read with
// getCategoryContent() in services/wordpress.js. These general descriptions are shown only for a category whose
// WordPress fields are still empty or when the API is unavailable. They match the values prepared for WordPress.
export const CATEGORY_CONTENT = {
  academic: {
    introduction: "Academic programmes cover arts and teacher education, including B.A., M.A., B.Ed., M.Ed. and B.P.Ed.",
    description: "Arts degrees and teacher-education degrees are offered by universities and affiliated colleges. Teacher-education programmes come under the National Council for Teacher Education (NCTE). Admission to central universities commonly runs through CUET, while teacher-education entrance tests vary by state. Eligibility and seats differ by institution, so check each college's official prospectus.",
    exams: "CUET (UG/PG) and state B.Ed. entrance tests (vary by state)",
  },
  agriculture: {
    introduction: "Agriculture programmes include B.Sc. and M.Sc. degrees in agriculture, horticulture and forestry.",
    description: "These degrees are often taught at state agricultural universities and ICAR-linked institutions. Many institutions admit through CUET (UG) or ICAR's postgraduate entrance test, and several state agricultural universities hold their own tests. Check each institution's official prospectus for eligibility and seats.",
    exams: "CUET (UG), ICAR AIEEA (PG) and state agricultural university tests",
  },
  diploma: {
    introduction: "Diploma routes include polytechnic diplomas, ITI trades and teacher education through D.El.Ed.",
    description: "These routes usually open after Class 10 or 12, and state boards and technical-education departments often run the admission process. Entrance tests and merit rules differ by state and institution, so check the relevant board or institute notice.",
    exams: "State polytechnic entrance tests or Class 10 merit (vary by state)",
  },
  engineering: {
    introduction: "Engineering programmes include B.Tech, B.Arch, B.Des and M.Tech in disciplines such as computer science, mechanical, civil and electronics.",
    description: "B.Tech, B.Arch and B.Des follow Class 12, and M.Tech follows a bachelor's degree. Technical education is overseen by AICTE, and architecture programmes also follow the Council of Architecture. JEE (Main) and JEE (Advanced) lead to national institutes, while many states run their own entrance tests and counselling. Eligibility, seats and fees differ by institution.",
    exams: "JEE (Main), JEE (Advanced), GATE (M.Tech), NATA (B.Arch) and state engineering tests",
  },
  general: {
    introduction: "General programmes cover science, commerce and multidisciplinary study, such as B.Sc., B.Com., M.Sc. and M.Com.",
    description: "Universities and their affiliated colleges set their own admission routes, which may include CUET or merit in the qualifying examination. Check each institution's official prospectus for eligibility and seats.",
    exams: "CUET (UG/PG) and university entrance tests",
  },
  law: {
    introduction: "Law programmes include the three-year LL.B., five-year integrated B.A. LL.B. and B.B.A. LL.B., and the LL.M.",
    description: "The LL.B. follows graduation, the integrated programmes follow Class 12, and the LL.M. follows an LL.B. The Bar Council of India oversees legal education. CLAT is the route to most National Law Universities, and several universities run their own tests.",
    exams: "CLAT, AILET, LSAT-India and state law entrance tests",
  },
  management: {
    introduction: "Management programmes include BBA, BCA, MBA, MCA and PGDM.",
    description: "BBA and BCA follow Class 12, while MBA, MCA and PGDM follow a bachelor's degree. Postgraduate admissions commonly use CAT, XAT, CMAT or GMAT scores, followed by the institution's own selection rounds. Some institutions and state counselling bodies use their own tests, so check each prospectus.",
    exams: "CAT, XAT, CMAT, MAT, GMAT, IPMAT and state MBA/MCA tests",
  },
  medical: {
    introduction: "Medical programmes include MBBS, BDS, BAMS, BHMS, BUMS, MD and MS.",
    description: "Undergraduate medical and dental admission runs through NEET UG, followed by central or state counselling, and postgraduate admission through NEET PG. The National Medical Commission oversees MBBS; other councils oversee dental and AYUSH degrees. Eligibility and counselling rules are published each year.",
    exams: "NEET UG, NEET PG",
  },
  nursing: {
    introduction: "Nursing programmes include GNM, B.Sc. Nursing, Post Basic B.Sc. Nursing and M.Sc. Nursing.",
    description: "Institutions set eligibility within Indian Nursing Council norms, and many B.Sc. routes use an entrance test or Class 12 merit. Check each institution's official prospectus for eligibility and seats.",
    exams: "State or institute entrance tests; some universities use CUET or Class 12 merit",
  },
  paramedical: {
    introduction: "Paramedical and allied health programmes include physiotherapy, medical laboratory technology, radiology, optometry, dialysis and operation theatre technology.",
    description: "Programmes run at diploma and degree level. Admission routes differ by university and state, and may use an entrance test or Class 12 merit. Check each institution's official prospectus for eligibility and seats.",
    exams: "University or state entrance tests, or Class 12 merit",
  },
  pharmacy: {
    introduction: "Pharmacy programmes include D.Pharm, B.Pharm, M.Pharm and Pharm.D.",
    description: "The Pharmacy Council of India regulates pharmacy education. Postgraduate entry commonly uses GPAT or NIPER JEE, while diploma and degree admissions are often run by state authorities.",
    exams: "GPAT, NIPER JEE and state pharmacy entrance tests",
  },
  professional: {
    introduction: "Professional programmes prepare students for specific industries, such as hotel management, fashion design, event management and film technology.",
    description: "These programmes run at diploma and degree level. Admission routes differ by institution and field, and may include entrance tests, portfolios or interviews. Check each institution's official prospectus.",
    exams: "NCHM JEE (hotel management), NIFT, NID DAT and UCEED (design); varies by field",
  },
};

/** Short text per category, used where a one-paragraph description is enough (home page course explorer). */
export const CATEGORY_INFO = Object.fromEntries(Object.entries(CATEGORY_CONTENT).map(([slug, value]) => [slug, value.introduction]));
