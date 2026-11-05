import PageHero from "../components/ui/PageHero";
import FluentFormEmbed from "../components/contact/FluentFormEmbed";
import { Phone } from "../components/ui/Icons";
import { useSeo } from "../lib/seo";
import { PHONE_DISPLAY, PHONE_HREF } from "../lib/contact";
import { getApplyFormPage } from "../services/wordpress";

const APPLY_FORM_ID = 3; // [fluentform id="3"], the same form as the Apply Now popup

/** /apply-now: the Apply Now form as a page of its own. */
export default function ApplyNow() {
  useSeo({ title: "Apply Now", description: "Apply to A3 Educare Hub for admission guidance, course and college selection support." });
  return (
    <main>
      <PageHero
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Apply Now" }]}
        eyebrow="Admissions"
        title={<>Apply <em>Now</em></>}
        description="Take the first step towards your brighter future. Fill in the form and our team will contact you."
      />
      <section className="shell section-y">
        <div className="card mx-auto max-w-3xl p-6 sm:p-10">
          <FluentFormEmbed
            formId={APPLY_FORM_ID}
            getPage={getApplyFormPage}
            noun="application"
            fallback={(
              <div className="flex flex-col items-start gap-4">
                <p className="text-lg font-semibold text-ink-900">The application form could not be loaded right now.</p>
                <a className="btn btn-primary" href={PHONE_HREF}><Phone className="size-4" /> Call {PHONE_DISPLAY}</a>
              </div>
            )}
          />
        </div>
      </section>
    </main>
  );
}
