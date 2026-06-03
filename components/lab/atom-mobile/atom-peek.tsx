"use client";
export function AtomPeek({
  z, symbol, mass, name, configHtml, onOpen, openLabel,
}: {
  z: number; symbol: string; mass: string; name: string;
  configHtml: string;
  onOpen: () => void; openLabel: string;
}) {
  return (
    <button type="button" className="pt-atomm-peek" onClick={onOpen} aria-label={openLabel}>
      <span className="pt-atomm-peek__glyph">
        <span className="pt-atomm-peek__z">{z}</span>
        <span className="pt-atomm-peek__sym">{symbol}</span>
        <span className="pt-atomm-peek__m">{mass}</span>
      </span>
      <span className="pt-atomm-peek__meta">
        <span className="pt-atomm-peek__nm">{name}</span>
        <span className="pt-atomm-peek__cfg" dangerouslySetInnerHTML={{ __html: configHtml }} />
      </span>
      <span className="pt-atomm-peek__chev" aria-hidden="true">›</span>
    </button>
  );
}
