import { Suspense, lazy, useCallback, useEffect, useId, useRef, useState } from "react";
import { Close } from "../ui/Icons";

const FluentFormEmbed = lazy(() => import("../contact/FluentFormEmbed"));

const EXIT_MS = 180; // keep in step with the apply-panel-out animation in index.css

function FormSkeleton({ noun }) {
  return (
    <div aria-busy="true" aria-label={`Loading the ${noun} form`} className="space-y-4">
      {[0, 1, 2, 3].map((row) => <div key={row} className="h-12 animate-pulse rounded-xl bg-sand-100" />)}
    </div>
  );
}

/**
 * A popup holding a real Fluent Forms form. A native <dialog> opened with showModal(), which provides
 * the focus trap, the inert background, Escape handling and focus return. What a visitor has typed
 * survives closing, because the form stays mounted; only a completed submission resets it.
 * `ready` keeps the skeleton up while the form's data loads; no `formId` shows `fallback` instead.
 * `doneLabel` adds a button after a successful submission that closes the popup.
 */
export default function FormModal({ open, onClose, title, description, formId, getPage, noun, fallback, enhance, ready = true, submittingLabel, doneLabel }) {
  const dialogRef = useRef(null);
  const pressedBackdrop = useRef(false);
  const closeTimer = useRef(null);
  const [submitted, setSubmitted] = useState(false);
  const [closing, setClosing] = useState(false);
  const [hasOpened, setHasOpened] = useState(false); // the form is only requested once it is needed
  const [formKey, setFormKey] = useState(0);
  const titleId = useId();
  const descriptionId = useId();

  if (open && !hasOpened) setHasOpened(true);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!open || !dialog) return undefined;
    if (!dialog.open) dialog.showModal();

    // Locked on <html>: the header's mobile menu manages the overflow of <body> on its own.
    const root = document.documentElement;
    const scrollbarWidth = window.innerWidth - root.clientWidth;
    root.style.overflow = "hidden";
    if (scrollbarWidth > 0) root.style.paddingRight = `${scrollbarWidth}px`;
    return () => {
      const top = window.scrollY;
      root.style.overflow = "";
      root.style.paddingRight = "";
      // Giving the scrollbar back reflows the page, which can pull it up when scrolled to the bottom.
      if (window.scrollY !== top) window.scrollTo({ top, behavior: "instant" });
    };
  }, [open]);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  const handleSuccess = useCallback(() => setSubmitted(true), []);

  const requestClose = () => {
    if (closeTimer.current) return;
    setClosing(true);
    closeTimer.current = setTimeout(() => dialogRef.current?.close(), EXIT_MS);
  };

  // Fires for every way of closing, including a repeated Escape that browsers will not let a page cancel.
  const handleClosed = () => {
    clearTimeout(closeTimer.current);
    closeTimer.current = null;
    setClosing(false);
    if (submitted) {
      setSubmitted(false);
      setFormKey((key) => key + 1);
    }
    onClose();
  };

  // A click whose press began inside the panel (e.g. selecting text and releasing outside) must not close it.
  const handleClick = (event) => {
    if (event.target === dialogRef.current && pressedBackdrop.current) requestClose();
    // A link to another page of this site (it navigates without a reload) would otherwise stay covered.
    else if (event.target.closest?.('a[href^="/"]:not([target="_blank"])')) requestClose();
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      data-closing={closing ? "" : undefined}
      onCancel={(event) => { event.preventDefault(); requestClose(); }}
      onClose={handleClosed}
      onPointerDown={(event) => { pressedBackdrop.current = event.target === dialogRef.current; }}
      onClick={handleClick}
      className="apply-dialog m-auto max-h-[calc(100dvh-1.5rem)] w-[calc(100vw-1.5rem)] max-w-xl overflow-hidden rounded-2xl bg-white p-0 text-ink-700 shadow-lift sm:max-h-[calc(100dvh-4rem)]"
    >
      <div className="flex max-h-[inherit] flex-col">
        <div aria-hidden="true" className="h-1 shrink-0 bg-brand-600" />
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-sand-100 py-4 pr-3 pl-5 sm:py-5 sm:pr-5 sm:pl-8">
          <div className="min-w-0 pt-1">
            <h2 id={titleId} className="text-2xl font-bold text-ink-900 sm:text-3xl">{title}</h2>
            <p id={descriptionId} className="mt-1 text-sm text-ink-500 sm:text-base">{description}</p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={requestClose}
            className="grid size-11 shrink-0 place-items-center rounded-full text-ink-700 transition-colors duration-200 hover:bg-sand-100 hover:text-ink-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
          >
            <Close className="size-5" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-8 sm:py-6">
          {hasOpened && !ready && <FormSkeleton noun={noun} />}
          {hasOpened && ready && !formId && fallback}
          {hasOpened && ready && formId && (
            <Suspense fallback={<FormSkeleton noun={noun} />}>
              <FluentFormEmbed
                key={formKey}
                formId={formId}
                getPage={getPage}
                noun={noun}
                enhance={enhance}
                submittingLabel={submittingLabel}
                onSuccess={handleSuccess}
                fallback={fallback}
              />
              {submitted && doneLabel && <button type="button" className="btn btn-outline mt-5 w-full" onClick={requestClose}>{doneLabel}</button>}
            </Suspense>
          )}
        </div>
      </div>
    </dialog>
  );
}
