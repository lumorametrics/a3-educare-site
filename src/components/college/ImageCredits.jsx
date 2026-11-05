const linkClass = "underline underline-offset-3 transition-colors hover:text-brand-700";

function External({ href, children }) {
  return (
    <a className={linkClass} href={href} target="_blank" rel="noreferrer noopener">
      {children}<span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

/** "Photo: Author · CC BY-SA 4.0 · Wikimedia Commons", linked to the licence and the source page. Used only on /image-credits. */
export function CreditLine({ credit }) {
  if (!credit) return null;
  return (
    <>
      Photo: {credit.author} ·{" "}
      {credit.licenseUrl ? <External href={credit.licenseUrl}>{credit.license}</External> : credit.license} ·{" "}
      <External href={credit.sourceUrl}>{credit.sourceName || "Wikimedia Commons"}</External>
    </>
  );
}
