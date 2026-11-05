import { useEffect, useRef, useState } from "react";
import { getContactFormPage, WP_AJAX_URL, WP_ORIGIN } from "../../services/wordpress";

const FLUENT_STYLES = ["fluent-forms-public.css", "fluentform-public-default.css"];
const LEGAL_LINKS = [[/terms/i, "/terms"], [/privacy/i, "/privacy-policy"]];

function loadFluentStyles() {
  FLUENT_STYLES.forEach((file) => {
    const href = `${WP_ORIGIN}/wp-content/plugins/fluentform/assets/css/${file}`;
    if (document.querySelector(`link[href="${href}"]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  });
}

/**
 * The form block WordPress rendered from the shortcode, or null when the page is missing or the
 * shortcode was not executed (raw "[fluentform …]" text). Inline scripts are dropped: they would not
 * run from innerHTML, and submission is handled below.
 */
function extractRenderedForm(html, formId) {
  const doc = new DOMParser().parseFromString(html || "", "text/html");
  const form = doc.querySelector(`form[data-form_id="${formId}"], form.fluent_form_${formId}`);
  if (!form) return null;
  const wrapper = form.closest(".fluentform") || form;
  wrapper.querySelectorAll("script").forEach((script) => script.remove());
  // Fluent Forms' own script removes this once it initialises; it is not used here.
  form.classList.remove("ff-form-loading");
  // The terms checkbox links are "#" placeholders in the form settings: point them at this site's pages.
  wrapper.querySelectorAll('a[href="#"]').forEach((link) => {
    const target = LEGAL_LINKS.find(([pattern]) => pattern.test(link.textContent))?.[1];
    if (target) link.setAttribute("href", target);
  });
  return wrapper.outerHTML;
}

/** Shows Fluent Forms' server-side validation messages on the matching fields (its own error classes). */
function showFieldErrors(form, errors) {
  const unmatched = [];
  Object.entries(errors).forEach(([name, messages]) => {
    // Fluent Forms returns { rule: message } per field; like Fluent Forms itself, show the first.
    const text = typeof messages === "string" ? messages : Object.values(messages || {})[0] || "";
    const input = form.querySelector(`[name="${CSS.escape(name)}"], [name^="${CSS.escape(name)}["]`);
    const group = input?.closest(".ff-el-group");
    if (!group) {
      unmatched.push(text);
      return;
    }
    group.classList.add("ff-el-is-error");
    const message = document.createElement("div");
    message.className = "error text-danger";
    message.setAttribute("role", "alert");
    message.textContent = text;
    (group.querySelector(".ff-el-input--content") || group).appendChild(message);
  });
  return unmatched;
}

function clearFieldErrors(form) {
  form.querySelectorAll(".ff-el-is-error").forEach((group) => group.classList.remove("ff-el-is-error"));
  form.querySelectorAll(".error.text-danger").forEach((message) => message.remove());
}

/**
 * Renders a real Fluent Forms form that WordPress produced from the shortcode on a page, and submits
 * it to Fluent Forms (admin-ajax `fluentform_submit`), so its fields, validation rules, entries,
 * notifications and integrations all stay in WordPress.
 * `getPage` loads the WordPress page holding `[fluentform id="formId"]`; `fallback` is shown when no
 * such page is published. `noun` names what is being sent in loading and error messages.
 * `enhance(form)` runs once on the rendered form, for changes the free plugin cannot make itself.
 */
export default function FluentFormEmbed({ formId = 1, getPage = getContactFormPage, noun = "enquiry", fallback, onSuccess, enhance, submittingLabel }) {
  const [state, setState] = useState({ status: "loading", html: "" });
  const [result, setResult] = useState(null); // { type: "success" | "error", html|text }
  const containerRef = useRef(null);
  const successRef = useRef(null);

  useEffect(() => {
    let active = true;
    getPage()
      .then((page) => {
        if (!active) return;
        const html = extractRenderedForm(page?.content?.rendered, formId);
        if (!html) {
          console.info(`Form ${formId} unavailable: publish a WordPress page containing [fluentform id="${formId}"].`);
          setState({ status: "unavailable", html: "" });
          return;
        }
        loadFluentStyles();
        setState({ status: "ready", html });
      })
      .catch((error) => {
        if (!active) return;
        console.error(`Unable to load form ${formId}:`, error);
        setState({ status: "unavailable", html: "" });
      });
    return () => { active = false; };
  }, [formId, getPage]);

  useEffect(() => {
    const container = containerRef.current;
    if (state.status !== "ready" || !container) return undefined;
    const onSubmit = async (event) => {
      const form = event.target.closest("form");
      if (!form) return;
      event.preventDefault();
      if (!form.reportValidity()) return;
      clearFieldErrors(form);
      setResult(null);
      const button = form.querySelector('[type="submit"]');
      button?.setAttribute("disabled", "");
      button?.classList.add("ff-working");
      const buttonText = button?.textContent;
      if (button && submittingLabel) button.textContent = submittingLabel;
      try {
        const body = new URLSearchParams({
          action: "fluentform_submit",
          form_id: String(formId),
          data: new URLSearchParams(new FormData(form)).toString(),
        });
        const response = await fetch(WP_AJAX_URL, { method: "POST", body, headers: { Accept: "application/json" } });
        const json = await response.json().catch(() => null);
        if (response.ok && json?.success !== false && json?.data?.result) {
          const { message, action, redirectUrl } = json.data.result;
          if (action === "redirect" && redirectUrl) {
            window.location.assign(redirectUrl);
            return;
          }
          setResult({ type: "success", html: message || `<p>Thank you. Your ${noun} has been sent.</p>` });
          onSuccess?.();
          return;
        }
        const errors = json?.errors || json?.data?.errors;
        const hasFieldErrors = errors && typeof errors === "object";
        const unmatched = hasFieldErrors ? showFieldErrors(form, errors) : [];
        // Form-level failures arrive as a plain string in `errors` (e.g. "No corresponding form found").
        const fallbackText = (typeof errors === "string" && errors) || json?.message || json?.data?.message || `Your ${noun} could not be sent. Please check the form or call us.`;
        if (!hasFieldErrors || unmatched.length) setResult({ type: "error", text: unmatched.join(" ") || fallbackText });
        form.querySelector(".ff-el-is-error input, .ff-el-is-error textarea, .ff-el-is-error select")?.focus();
      } catch (error) {
        console.error(`Form ${formId} submission failed:`, error);
        setResult({ type: "error", text: `Your ${noun} could not be sent right now. Please try again or call us.` });
      } finally {
        button?.removeAttribute("disabled");
        button?.classList.remove("ff-working");
        if (button && submittingLabel) button.textContent = buttonText;
      }
    };
    container.addEventListener("submit", onSubmit);
    return () => container.removeEventListener("submit", onSubmit);
  }, [state.status, formId, noun, onSuccess, submittingLabel]);

  useEffect(() => {
    const form = containerRef.current?.querySelector("form");
    if (state.status === "ready" && form) enhance?.(form);
  }, [state.status, enhance]);

  // The submit button disappears with the form: keep keyboard and screen-reader users on the confirmation.
  const succeeded = result?.type === "success";
  useEffect(() => {
    if (succeeded) successRef.current?.focus();
  }, [succeeded]);

  if (state.status === "loading") {
    return (
      <div aria-busy="true" aria-label={`Loading the ${noun} form`} className="space-y-4">
        {[0, 1, 2].map((row) => <div key={row} className="h-12 animate-pulse rounded-xl bg-sand-100" />)}
        <div className="h-28 animate-pulse rounded-xl bg-sand-100" />
        <div className="h-12 w-40 animate-pulse rounded-full bg-sand-100" />
      </div>
    );
  }
  if (state.status === "unavailable") return fallback;
  if (succeeded) {
    return <div ref={successRef} tabIndex={-1} role="status" className="ff-embed-success wp-content max-w-none rounded-xl border border-brand-200 bg-brand-50 p-6 text-ink-800 outline-none" dangerouslySetInnerHTML={{ __html: result.html }} />;
  }
  return (
    <>
      {result?.type === "error" && <p role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{result.text}</p>}
      <div ref={containerRef} className="ff-embed" dangerouslySetInnerHTML={{ __html: state.html }} />
    </>
  );
}
