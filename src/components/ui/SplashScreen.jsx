export default function SplashScreen({ label = "Loading your experience" }) {
  return (
    // Fills the viewport below the header so the footer is never visible (then pushed down) while
    // content loads — that jump was the page's main layout-shift (CLS) source.
    <div className="flex min-h-[calc(100svh-4rem)] flex-col items-center justify-center gap-5 px-5 py-20 text-center sm:min-h-[calc(100svh-5rem)]" role="status" aria-live="polite">
      <div className="relative grid size-20 place-items-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-brand-200/60 [animation-duration:2s]" />
        <span className="relative grid size-20 place-items-center rounded-full bg-white shadow-lift ring-1 ring-sand-200">
          <img className="size-12 object-contain" src="/a3-educare-logo-96.webp" width="48" height="48" alt="" />
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <strong className="font-display text-lg text-ink-900">A3 EduCare Hub</strong>
        <span className="text-sm text-ink-500">{label}</span>
      </div>
      <div className="flex gap-1.5" aria-hidden="true">
        {[0, 150, 300].map((delay) => (
          <i key={delay} className="size-2 animate-pulse-dot rounded-full bg-brand-500" style={{ animationDelay: `${delay}ms` }} />
        ))}
      </div>
    </div>
  );
}
