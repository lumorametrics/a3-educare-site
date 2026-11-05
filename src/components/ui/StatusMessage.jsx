import { useEffect } from "react";
import { setNoindex } from "../../lib/seo";

/** Empty / error / not-found states. Wrap with <main> when used as a whole page via `page`. */
export default function StatusMessage({ children, tone = "neutral", title, action, page = false }) {
  const error = tone === "error";

  // A whole-page error or "not found" screen must not be indexed as real content.
  useEffect(() => {
    if (page) setNoindex();
  }, [page]);

  const box = (
    <div
      role={error ? "alert" : "status"}
      className={`mx-auto flex max-w-xl flex-col items-center gap-3 rounded-2xl border border-dashed px-6 py-10 text-center ${
        error ? "border-coral-100 bg-coral-50/60 text-coral-600" : "border-sand-200 bg-white/70 text-ink-500"
      }`}
    >
      {title && <strong className="font-display text-xl text-ink-900">{title}</strong>}
      <div className="text-sm leading-relaxed">{children}</div>
      {action}
    </div>
  );
  if (!page) return box;
  return <main className="shell flex min-h-[60vh] items-center py-20">{box}</main>;
}
