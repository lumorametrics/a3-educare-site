import FormModal from "./FormModal";
import { PHONE_DISPLAY, PHONE_HREF } from "../../lib/contact";
import { getApplyFormPage } from "../../services/wordpress";

const APPLY_FORM_ID = 3; // [fluentform id="3"]

/** The Apply Now popup, opened from the header and the footer. */
export default function ApplyNowModal({ open, onClose }) {
  return (
    <FormModal
      open={open}
      onClose={onClose}
      title="Apply Now"
      description="Take the first step towards your brighter future."
      formId={APPLY_FORM_ID}
      getPage={getApplyFormPage}
      noun="application"
      fallback={
        <div role="status" className="rounded-xl border border-sand-200 bg-sand-50 p-5 text-sm text-ink-700">
          <p className="font-medium text-ink-900">The application form could not be loaded right now.</p>
          <p className="mt-1.5">Please call us on <a className="font-medium text-brand-700 underline underline-offset-3" href={PHONE_HREF}>{PHONE_DISPLAY}</a> or use the <a className="font-medium text-brand-700 underline underline-offset-3" href="/contact">contact page</a>.</p>
        </div>
      }
    />
  );
}
