import { useCallback, useEffect, useMemo, useState } from "react";
import { getRegistrationPage } from "../services/wordpress";
import FormModal from "../components/apply/FormModal";
import { enhanceRegistrationForm, loadRegistrationData } from "../components/registration/wpDropdowns";
import Breadcrumb from "../components/ui/Breadcrumb";
import CtaBand from "../components/ui/CtaBand";
import Reveal from "../components/ui/Reveal";
import SectionHeading from "../components/ui/SectionHeading";
import { ArrowDown, ArrowUpRight, Briefcase, Building, Graduation, Users } from "../components/ui/Icons";
import { PHONE_DISPLAY, PHONE_HREF } from "../lib/contact";

const CATEGORIES = [
  { key: "student", formTitle: "A3 Student Registration Form", title: "Student Registration", description: "Register to explore courses, admission opportunities and educational guidance.", cta: "Register as Student", Icon: Graduation },
  { key: "franchise", formTitle: "A3 Franchise Registration Form", title: "Franchise Registration", description: "Apply to become an A3 Educare Hub franchise partner and explore business opportunities.", cta: "Apply for Franchise", Icon: Building },
  { key: "coordinator", formTitle: "A3 Coordinator Registration Form", title: "Coordinator Registration", description: "Register to join our education coordination network and explore opportunities.", cta: "Register as Coordinator", Icon: Users },
  { key: "placement", formTitle: "A3 Placement Registration Form", title: "Placement Registration", description: "Register for job and placement assistance and explore career opportunities.", cta: "Register for Placement", Icon: Briefcase },
];

const STEPS = ["Choose your registration category", "Fill in your details in the form", "Our team will contact you soon"];

/** Form title -> form ID for the forms on the WordPress "registration" page, whose shortcodes render them. */
function findFormIds(html) {
  const doc = new DOMParser().parseFromString(html || "", "text/html");
  return new Map([...doc.querySelectorAll("form[data-form_id]")].map((form) => [form.querySelector("legend")?.textContent.trim(), Number(form.dataset.form_id)]));
}

export default function Registration() {
  const [page, setPage] = useState(null);
  const [pageSettled, setPageSettled] = useState(false);
  const [data, setData] = useState(null); // stays null if WordPress data fails: the forms keep their text fields
  const [dataSettled, setDataSettled] = useState(false);
  const [openKey, setOpenKey] = useState(null);

  useEffect(() => {
    let live = true;
    getRegistrationPage()
      .then((result) => live && setPage(result))
      .catch((error) => console.error("Unable to load the registration forms:", error))
      .finally(() => live && setPageSettled(true));
    loadRegistrationData()
      .then((result) => live && setData(result))
      .catch((error) => console.error("Registration dropdowns fell back to text fields:", error))
      .finally(() => live && setDataSettled(true));
    return () => { live = false; };
  }, []);

  const formIds = useMemo(() => findFormIds(page?.content?.rendered), [page]);
  const enhance = useCallback((form) => { if (data) enhanceRegistrationForm(form, data); }, [data]);
  const closeModal = useCallback(() => setOpenKey(null), []);

  return (
    <main>
      <section className="relative isolate overflow-hidden bg-ink-950 text-white">
        <div aria-hidden="true" className="pointer-events-none absolute -top-40 -right-32 size-[34rem] rounded-full bg-brand-600/30 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-48 -left-32 size-[30rem] rounded-full bg-gold-400/15 blur-3xl" />
        <div className="shell relative grid grid-cols-1 items-center gap-10 pt-8 pb-16 sm:pb-20 lg:grid-cols-[1.25fr_0.75fr] lg:gap-16 lg:pt-14 lg:pb-24">
          <div className="min-w-0">
            <div className="motion-safe:animate-page-in"><Breadcrumb tone="dark" items={[{ label: "Home", href: "/" }, { label: "Registration" }]} /></div>
            <h1 className="text-[2.1rem] leading-[1.08] font-bold tracking-[-0.03em] text-white motion-safe:animate-fade-up min-[375px]:text-[2.4rem] sm:text-5xl lg:text-[3.5rem]">
              Start Your Journey with <span className="text-brand-300">A3 Educare Hub</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/75 motion-safe:animate-fade-up motion-safe:[animation-delay:90ms] sm:text-lg">
              Whether you are a student looking for educational opportunities, interested in becoming a franchise partner, joining our team as a coordinator, or exploring career opportunities, choose your registration category below.
            </p>
            <div className="mt-9 flex flex-col gap-3 motion-safe:animate-fade-up motion-safe:[animation-delay:180ms] min-[420px]:flex-row">
              <a className="btn btn-primary px-7 py-3.5" href="#registration-categories">Choose a category <ArrowDown /></a>
            </div>
          </div>
          <ol className="min-w-0 space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm motion-safe:animate-fade-up motion-safe:[animation-delay:150ms] sm:p-7">
            {STEPS.map((step, index) => (
              <li key={step} className="flex items-center gap-4">
                <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-full bg-gold-400 text-sm font-semibold text-ink-900">{index + 1}</span>
                <span className="text-white/90">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="registration-categories" className="shell section-y scroll-mt-20">
        <SectionHeading eyebrow="Registration categories" title={<>Choose Your <em>Registration</em></>} align="center" />
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {CATEGORIES.map(({ key, title, description, cta, Icon }, index) => (
            <Reveal as="li" key={key} delay={index * 70} className="h-full">
              <div className="group card-interactive flex h-full cursor-pointer flex-col p-6 sm:p-7" onClick={() => setOpenKey(key)}>
                <span aria-hidden="true" className="grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand-700 transition-colors duration-300 group-hover:bg-brand-600 group-hover:text-white"><Icon className="size-7" /></span>
                <h3 className="mt-5 text-xl font-semibold text-ink-900">{title}</h3>
                <p className="mt-2 mb-6 text-sm leading-relaxed text-ink-500">{description}</p>
                {/* Clicking anywhere on the card opens the popup; the button is the keyboard and screen-reader route. */}
                <button type="button" aria-haspopup="dialog" className="btn btn-primary mt-auto min-h-11 w-full whitespace-normal">
                  {cta} <ArrowUpRight />
                </button>
              </div>
            </Reveal>
          ))}
        </ul>
      </section>

      <CtaBand
        eyebrow="Need help?"
        title={<>Not sure which <em>one fits?</em></>}
        description="Talk to an A3 Educare Hub advisor and we will point you to the right registration."
        actionHref="/contact"
      />

      {CATEGORIES.map(({ key, formTitle, title, description }) => (
        <FormModal
          key={key}
          open={openKey === key}
          onClose={closeModal}
          title={formIds.has(formTitle) ? formTitle : title}
          description={description}
          formId={formIds.get(formTitle)}
          getPage={getRegistrationPage}
          noun="registration"
          enhance={enhance}
          ready={pageSettled && dataSettled}
          submittingLabel="Submitting…"
          doneLabel="Back to Registration"
          fallback={
            <div role="status" className="rounded-xl border border-sand-200 bg-sand-50 p-5 text-sm text-ink-700">
              <p className="font-medium text-ink-900">This form could not be loaded right now.</p>
              <p className="mt-1.5">Please try again, call us on <a className="font-medium text-brand-700 underline underline-offset-3" href={PHONE_HREF}>{PHONE_DISPLAY}</a> or use the <a className="font-medium text-brand-700 underline underline-offset-3" href="/contact">contact page</a>.</p>
            </div>
          }
        />
      ))}
    </main>
  );
}
