/**
 * Opens the site's single Apply Now popup (Fluent Form id 3), which the Header renders. Any component can call
 * openApplyForm() instead of rendering its own copy of the popup.
 */
export const APPLY_FORM_EVENT = "a3:open-apply-form";

export function openApplyForm() {
  window.dispatchEvent(new CustomEvent(APPLY_FORM_EVENT));
}
