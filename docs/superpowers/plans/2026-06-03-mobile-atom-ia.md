# Mobile Atom-View IA Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sostituire la chrome mobile dell'atom view della Tavola Periodica (header con ~13 controlli + overlay che collidono) con un sistema unico: top-bar + model-row (5 modelli sempre visibili) + canvas full-bleed + peek + tab bar a 4 voci (Info · Viste · Orbitali · Strumenti) + un solo bottom-sheet per volta. Fisica (`atom-scene.tsx`) e desktop (≥901px) invariati.

**Architecture:** Chrome mobile separata in sottocomponenti client sotto `components/lab/atom-mobile/`, che **riusano i controlli esistenti** dentro gli sheet. **Render-both + CSS media query** per nascondere desktop/mobile sul breakpoint (NIENTE gating JS del markup → niente flash header desktop né CLS). Lo stato vive nel parent `PeriodicTableView`; i nuovi componenti sono presentazionali + callback.

**Tech Stack:** Next.js App Router, React, TypeScript (strict, `noUncheckedIndexedAccess`), React Three Fiber/Three.js (solo riuso, non si tocca), CSS in `periodic-table.css` (token esistenti), SVG inline.

**Spec di riferimento (fonte di verità):** `docs/periodic-table/mobile-atom-ia-spec.md` (v2). Mockup visivo: `_design_reference/atom-mobile-redesign.html`. Entrambi committati da Matteo.

**Nota su TDD:** non esiste harness di unit test per la chrome UI. Il ciclo di verifica per ogni task è: `pnpm tsc --noEmit` (o `pnpm typecheck`) + `pnpm lint` (non peggiora) + check Playwright al breakpoint/elemento pertinente. Il "test che fallisce" è lo stato visivo/comportamentale prima della modifica, catturato con screenshot baseline nel Task 0.

**Breakpoint:** mobile/touch attivo a `(max-width: 680px)` **e** landscape stretto (vedi Task 8). Desktop = il resto. Confine desktop invariato: ≥901px.

---

## File Structure

| File | Responsabilità | Azione |
|---|---|---|
| `components/lab/atom-mobile/use-is-mobile.ts` | hook `useIsMobile()` SSR-safe — **solo logica non-visiva** (es. listener), mai per gating del markup | Create |
| `components/lab/atom-mobile/atom-top-bar.tsx` | top-bar: ‹ tavola · nome · simbolo Z · sottotitolo modalità · toggle IT/EN · (i)→manuale | Create |
| `components/lab/atom-mobile/atom-model-row.tsx` | chip dei 5 modelli (wrap, sempre visibili) **o** orbital-row se inspector | Create |
| `components/lab/atom-mobile/atom-peek.tsx` | peek elemento (glyph + nome + config), tap → sheet Info | Create |
| `components/lab/atom-mobile/atom-tab-bar.tsx` | 4 `<button>` (Info·Viste·Orbitali·Strumenti) con `aria-expanded`/`aria-pressed` | Create |
| `components/lab/atom-mobile/atom-sheet.tsx` | bottom-sheet condiviso (`role="dialog"`, focus trap, Esc/scrim/grab) | Create |
| `components/lab/atom-mobile/atom-sheet-contents.tsx` | render del contenuto per sheet `info`/`views`/`tools` (riusa controlli/dati esistenti) | Create |
| `components/lab/atom-mobile/index.ts` | barrel export | Create |
| `components/lab/periodic-table-view.tsx` | parent: nuovo stato `sheet`, invarianti, render-both della chrome | Modify |
| `components/lab/periodic-table.css` | nuova sezione "Mobile atom IA"; rimozione media-query obsolete + `!important` | Modify |
| `docs/periodic-table/governance.md`, `docs/HANDOFF.md` | aggiornamento a fine sprint | Modify |

I nuovi componenti sono **presentazionali**: ricevono props + callback, nessuno stato proprio salvo UI-locale (es. drag dello sheet). Tutto lo stato di dominio resta in `PeriodicTableView`.

---

## Task 0: Preparazione, recon, baseline

**Files:**
- Verify: branch, spec, mockup
- Read: `components/lab/periodic-table-view.tsx`, `components/lab/periodic-table.css`

- [ ] **Step 1: Verifica branch e stato**

Run:
```bash
git status --short --branch
git log --oneline -4
```
Expected: branch `fix/pt-mobile-atom-ia` allineato a `origin/init`; lo spec `docs/periodic-table/mobile-atom-ia-spec.md` e `_design_reference/atom-mobile-redesign.html` presenti (committati da Matteo). Se il branch non esiste: `git checkout -b fix/pt-mobile-atom-ia origin/init`. NON mischiare file non-Periodic-Table.

- [ ] **Step 2: Leggi lo spec e il mockup**

Read `docs/periodic-table/mobile-atom-ia-spec.md` (decisioni + punti tecnici + acceptance) e `_design_reference/atom-mobile-redesign.html` (IA, token, comportamento sheet/row). Il mockup è riferimento di IA/look, NON codice da copiare 1:1.

- [ ] **Step 3: Recon — mappa i controlli e gli stati esistenti**

Run:
```bash
grep -nE "ModelSwitch|ScaleToggle|SpeedSlider|StarsToggle|VdWToggle|SpinToggle|TempToggle|TemperatureControl|InfoPanel|OrbitalInfoPanel|pt-header__right|pt-view-mode-row|inspectorOrbital|setInspectorOrbital" components/lab/periodic-table-view.tsx
```
Annota: nome esatto, props e range di righe di ogni controllo dell'header `.pt-header__right`; lo stato `inspectorOrbital` (valori) e `OrbitalInfoPanel` (cosa renderizza, lista orbitali per elemento); `TemperatureControl` (props/handler) e `InfoPanel` (campi mostrati, per la parità). Stati view-mode: `nucleusView`, `crystalView`, `moleculeView`, `materialView`, `storyMode` (già booleani mutuamente esclusivi, ~righe 1612–1628; handler ~1884–1974; rendering ~2062–2303).

- [ ] **Step 4: Avvia il dev server e cattura baseline**

Run: `pnpm dev` (porta di progetto). Con Playwright (mcp browser) apri `/lab/tavola-periodica`, seleziona Fosforo (P) per entrare in atom view. Cattura screenshot baseline a 390px portrait (dark) e desktop 1440px. Servono per (a) il confronto "test fallisce ora" e (b) la garanzia desktop invariato a fine sprint. Salva in `_design_reference/baseline/` (gitignored o non committato).

- [ ] **Step 5: Commit di setup (se servono file di lavoro)**

Nessun commit di codice qui. Se crei `_design_reference/baseline/`, verifica che NON venga committato (è artefatto). Procedi al Task 1.

---

## Task 1: Hook `useIsMobile()` (solo comportamento)

**Files:**
- Create: `components/lab/atom-mobile/use-is-mobile.ts`

- [ ] **Step 1: Scrivi l'hook SSR-safe**

```ts
"use client";
import { useEffect, useState } from "react";

/**
 * Solo per LOGICA non-visiva (es. registrare listener, evitare drag handler su desktop).
 * NON usare per decidere quale markup montare: il markup desktop/mobile è sempre
 * presente nel DOM e nascosto via CSS media query (no flash, no CLS, SSR corretto).
 */
export function useIsMobile(query = "(max-width: 680px)"): boolean {
  const [isMobile, setIsMobile] = useState(false); // SSR/first paint = false, aggiornato dopo mount
  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [query]);
  return isMobile;
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm tsc --noEmit`
Expected: PASS (nessun errore nuovo).

- [ ] **Step 3: Commit**

```bash
git add components/lab/atom-mobile/use-is-mobile.ts
git commit -m "feat(periodic-table): add SSR-safe useIsMobile hook (behavior-only)

Co-Authored-By: Fosforonero <hello@fosforonero.com>"
```

---

## Task 2: Componenti chrome mobile (presentazionali, scaffold)

Crea i componenti presentazionali con props tipizzate, senza ancora collegarli al parent. Usano token CSS esistenti via classi (definite nel Task 3).

**Files:**
- Create: `components/lab/atom-mobile/atom-top-bar.tsx`
- Create: `components/lab/atom-mobile/atom-model-row.tsx`
- Create: `components/lab/atom-mobile/atom-peek.tsx`
- Create: `components/lab/atom-mobile/atom-tab-bar.tsx`
- Create: `components/lab/atom-mobile/index.ts`

- [ ] **Step 1: `atom-tab-bar.tsx` — tab bar NON-tablist**

```tsx
"use client";
import type { ReactNode } from "react";

export type AtomTab = "info" | "views" | "orbital" | "tools";

type TabDef = { id: AtomTab; label: string; icon: ReactNode };

export function AtomTabBar({
  tabs,
  openSheet,        // sheet attualmente aperto: 'info'|'views'|'tools'|null
  inspectorActive,  // true se inspector orbitali ON
  onTab,
}: {
  tabs: TabDef[];
  openSheet: Exclude<AtomTab, "orbital"> | null;
  inspectorActive: boolean;
  onTab: (tab: AtomTab) => void;
}) {
  return (
    <nav className="pt-atomm-tabbar" aria-label="Atom view">
      {tabs.map((t) => {
        const isOrbital = t.id === "orbital";
        // Orbitali = toggle di un MODO (aria-pressed); le altre APRONO un dialog (aria-expanded)
        const active = isOrbital ? inspectorActive : openSheet === t.id;
        const ariaProps = isOrbital
          ? { "aria-pressed": inspectorActive }
          : { "aria-expanded": openSheet === t.id, "aria-haspopup": "dialog" as const };
        return (
          <button
            key={t.id}
            type="button"
            className={`pt-atomm-tab${active ? " pt-atomm-tab--active" : ""}`}
            onClick={() => onTab(t.id)}
            {...ariaProps}
          >
            <span className="pt-atomm-tab__ic" aria-hidden="true">{t.icon}</span>
            <span className="pt-atomm-tab__lbl">{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
```

- [ ] **Step 2: `atom-model-row.tsx` — model-row (wrap) o orbital-row**

```tsx
"use client";
import type { ReactNode } from "react";

export type Chip = { id: string; label: ReactNode; active: boolean; dotColor?: string };

export function AtomModelRow({
  mode,            // 'models' | 'orbitals'
  chips,
  onSelect,
}: {
  mode: "models" | "orbitals";
  chips: Chip[];
  onSelect: (id: string) => void;
}) {
  return (
    <div
      className={`pt-atomm-row${mode === "models" ? " pt-atomm-row--models" : " pt-atomm-row--orbitals"}`}
      role="group"
      aria-label={mode === "models" ? "Modelli atomici" : "Orbitali"}
    >
      {chips.map((c) => (
        <button
          key={c.id}
          type="button"
          className={`pt-atomm-chip${c.active ? " pt-atomm-chip--active" : ""}`}
          onClick={() => onSelect(c.id)}
          aria-pressed={c.active}
        >
          {c.dotColor && <span className="pt-atomm-chip__dot" style={{ background: c.dotColor }} aria-hidden="true" />}
          {c.label}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: `atom-peek.tsx` — peek elemento**

```tsx
"use client";
export function AtomPeek({
  z, symbol, mass, name, configHtml, onOpen, openLabel,
}: {
  z: number; symbol: string; mass: string; name: string;
  configHtml: string; // già localizzato/sanificato dal parent
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
```
Nota: `configHtml` deve essere costruito dal parent da dati locali (config con `<sup>`/`<b>` già usati altrove), non da input utente — nessun rischio XSS.

- [ ] **Step 4: `atom-top-bar.tsx` — top-bar con lingua e (i)**

```tsx
"use client";
import Link from "next/link";

export function AtomTopBar({
  name, symbol, z, modeSubtitle, locale, onBack, langHref, manualHref, t,
}: {
  name: string; symbol: string; z: number; modeSubtitle: string;
  locale: "it" | "en";
  onBack: () => void;
  langHref: string;     // URL versione altra lingua (mantiene ?z= se in atom view)
  manualHref: string;   // /lab/tavola-periodica/manuale o /en/.../manual
  t: { back: string; manual: string };
}) {
  return (
    <div className="pt-atomm-topbar">
      <button type="button" className="pt-atomm-iconbtn" onClick={onBack}>‹ {t.back}</button>
      <div className="pt-atomm-title">
        <h1 className="pt-atomm-title__h1">
          {name} <em className="pt-atomm-title__sub">· {symbol} {z}</em>
        </h1>
        <p className="pt-atomm-title__mode">{modeSubtitle}</p>
      </div>
      <Link href={langHref} className="pt-atomm-lang" aria-label={locale === "it" ? "English" : "Italiano"}>
        {locale === "it" ? "EN" : "IT"}
      </Link>
      <Link href={manualHref} className="pt-atomm-info" aria-label={t.manual}>
        {/* SVG inline info (i) */}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <circle cx="12" cy="12" r="9" /><path d="M12 16v-5M12 8h.01" strokeLinecap="round" />
        </svg>
      </Link>
    </div>
  );
}
```
Nota densità @375 (spec #6): `.pt-atomm-title__h1` con `text-overflow:ellipsis`; simbolo+Z, lingua e (i) sempre interi (Task 3).

- [ ] **Step 5: `index.ts` barrel**

```ts
export { useIsMobile } from "./use-is-mobile";
export { AtomTopBar } from "./atom-top-bar";
export { AtomModelRow, type Chip } from "./atom-model-row";
export { AtomPeek } from "./atom-peek";
export { AtomTabBar, type AtomTab } from "./atom-tab-bar";
export { AtomSheet } from "./atom-sheet";              // creato nel Task 6
export { AtomSheetContents } from "./atom-sheet-contents"; // creato nel Task 5
```
Nota: tieni gli export di `atom-sheet`/`atom-sheet-contents` commentati finché i file non esistono, oppure crea stub vuoti per far passare il typecheck; scommenta nei task relativi.

- [ ] **Step 6: Typecheck**

Run: `pnpm tsc --noEmit`
Expected: PASS. (I componenti non sono ancora usati: nessun errore d'uso.)

- [ ] **Step 7: Commit**

```bash
git add components/lab/atom-mobile/
git commit -m "feat(periodic-table): scaffold mobile atom-view chrome components

Co-Authored-By: Fosforonero <hello@fosforonero.com>"
```

---

## Task 3: CSS render-both + sezione Mobile atom IA

**Files:**
- Modify: `components/lab/periodic-table.css`

- [ ] **Step 1: Aggiungi la sezione mobile IA e la regola render-both**

In fondo a `periodic-table.css`, aggiungi una sezione che (a) nasconde la chrome mobile su desktop e mostra quella desktop, (b) inverte sul breakpoint. La chrome mobile è sempre nel DOM ma `display:none` di default.

```css
/* ── Mobile atom IA (≤680px + landscape stretto) ───────────────── */
/* default (desktop): chrome mobile assente dal layout */
.pt-atomm-topbar,
.pt-atomm-row,
.pt-atomm-peek,
.pt-atomm-tabbar,
.pt-atomm-sheet,
.pt-atomm-scrim { display: none; }

@media (max-width: 680px), (max-height: 480px) and (orientation: landscape) {
  /* nascondi la chrome desktop dell'atom view */
  .pt-header__right { display: none; }
  .pt-view-mode-row { display: none; }
  /* mostra la chrome mobile */
  .pt-atomm-topbar { display: flex; }
  .pt-atomm-row { display: flex; }
  .pt-atomm-peek { display: flex; }
  .pt-atomm-tabbar { display: grid; }
  /* sheet/scrim restano display:none finché .--open (Task 6) */
}
```
Token: usa le custom property già nel file (`--bg`, `--canvas`, ink/hairline, proton/neutron/electron, s/p/d/f, teal/rosa). NON reinventare colori. Light mode: gli override `.pt-root--light` esistenti devono coprire le nuove classi — aggiungi override mirati dove serve contrasto.

- [ ] **Step 2: Stili dei componenti (top-bar, row, peek, tab bar)**

Porta gli stili dal mockup `_design_reference/atom-mobile-redesign.html` alle classi `.pt-atomm-*`, adattando i nomi. Requisiti vincolanti:
- `.pt-atomm-row--models { flex-wrap: wrap; justify-content: center; }` → tutti e 5 i modelli visibili, niente scroll orizzontale, niente `<select>`.
- `.pt-atomm-row--orbitals { overflow-x: auto; }` (scorrevole).
- target ≥44px: `.pt-atomm-tab`, `.pt-atomm-chip`, righe sheet → `min-height: 44px`.
- `.pt-atomm-title__h1 { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }`; `.pt-atomm-lang`, `.pt-atomm-info` `flex-shrink: 0`.
- canvas wrap ≥60% altezza: assicura che la regione canvas usi `flex: 1; min-height: 0` e la colonna atom view sia `display:flex; flex-direction:column; height:100%`.

- [ ] **Step 3: Typecheck + lint + visual check desktop**

Run: `pnpm tsc --noEmit && pnpm lint`
Expected: PASS / lint non peggiora.
Con Playwright a 1440px: la chrome mobile NON è visibile (desktop invariato vs baseline Task 0). A 390px: header desktop nascosto, scheletro chrome mobile visibile (anche se non ancora cablato).

- [ ] **Step 4: Commit**

```bash
git add components/lab/periodic-table.css
git commit -m "feat(periodic-table): mobile atom IA CSS (render-both, no JS markup gating)

Co-Authored-By: Fosforonero <hello@fosforonero.com>"
```

---

## Task 4: Stato e invarianti nel parent

**Files:**
- Modify: `components/lab/periodic-table-view.tsx`

- [ ] **Step 1: Aggiungi lo stato `sheet`**

Vicino agli altri stato (≈ riga 1612–1628):
```tsx
const [sheet, setSheet] = useState<"info" | "views" | "tools" | null>(null);
```

- [ ] **Step 2: Helper invarianti (un solo overlay per volta)**

Aggiungi funzioni nel componente:
```tsx
// apre uno sheet non-orbitale; entrare in uno sheet NON disattiva l'inspector (doppio stato attivo intenzionale per Orbitali+Info, vedi spec)
function openAtomSheet(which: "info" | "views" | "tools") { setSheet(which); }
function closeAtomSheet() { setSheet(null); }

// toggle inspector orbitali (riusa lo stato esistente inspectorOrbital)
function toggleOrbitalInspector() {
  setInspectorOrbital((cur) => (cur === null ? DEFAULT_ORBITAL_FOR(selected.z) : null));
  // entrare in inspector chiude SOLO sheet non-orbitali coerenti col mockup:
  setSheet((s) => (s === "info" || s === "views" || s === "tools" ? s : s)); // info può restare aperto (intenzionale)
}

// selezionare una vista takeover chiude la tab bar implicitamente (la CSS nasconde la chrome quando crystal/molecule/material/story sono attivi → Task 8)
```
Nota: `DEFAULT_ORBITAL_FOR(z)` = primo orbitale di valenza dell'elemento secondo la capability già esistente dell'inspector desktop (mappare al valore che `setInspectorOrbital` già accetta — leggerne il tipo nel Task 0 Step 3). Se l'inspector desktop usa già un default, riusalo.

- [ ] **Step 3: Handler tab bar**

```tsx
function handleAtomTab(tab: "info" | "views" | "orbital" | "tools") {
  if (tab === "orbital") { toggleOrbitalInspector(); return; }
  // riapri/chiudi toggle dello stesso sheet
  setSheet((cur) => (cur === tab ? null : tab));
}
```

- [ ] **Step 4: Typecheck**

Run: `pnpm tsc --noEmit`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/lab/periodic-table-view.tsx
git commit -m "feat(periodic-table): mobile sheet state + single-overlay invariants

Co-Authored-By: Fosforonero <hello@fosforonero.com>"
```

---

## Task 5: Contenuti degli sheet (Info parità, Viste, Strumenti, Orbitali)

**Files:**
- Create: `components/lab/atom-mobile/atom-sheet-contents.tsx`
- Modify: `components/lab/periodic-table-view.tsx` (passa dati/handler)

- [ ] **Step 1: `atom-sheet-contents.tsx` — switch sul tipo di sheet**

Componente che riceve `kind` e tutte le props necessarie e renderizza il contenuto. RIUSA i componenti esistenti dove possibile invece di reimplementare:
- `info` → griglia core sempre visibile (Z, massa, config, gusci, stato, gruppo/periodo) + sezioni avanzate **espandibili** (`<details>` nativo) per ossidazione, isotopi, cristallo, raggi, energie, scopritore/fonte + legenda p/n/e + descrizione + share/Ko-fi. Estrai il contenuto dati da `InfoPanel` (stessa fonte dati `EXTENDED[z]`), riusando i formatter esistenti (`fmt()`), per **parità** con desktop.
- `views` → lista righe: Nucleo (toggle, resta atom view), Cristallo, Molecola, Materiale, Story → invocano `onNucleus`, `onCrystal`, `onMolecule`, `onMaterial`, `onStory` (gli stessi setter già esistenti). Mostra disabilitato/⚠ quando la fase rende instabile cristallo (riusa la logica `phaseUnstable` esistente).
- `tools` → riusa `<TemperatureControl ... />` esistente + righe toggle per Scala reale, Velocità, Stelle, VdW, Spin, Unità temp (riusa gli stessi handler/stato del parent: `setScale`, `setSpeed`, `setStars`, `setVdw`, `setSpin`, `setTempUnit` — nomi esatti dal recon Task 0).

Struttura (firma; il corpo riusa simboli esistenti — non reimplementare i dati):
```tsx
"use client";
import type { ReactNode } from "react";

export type AtomSheetKind = "info" | "views" | "tools" | "orbital";

export function AtomSheetContents(props: {
  kind: AtomSheetKind;
  // info
  infoContent?: ReactNode;     // costruito nel parent riusando i dati di InfoPanel
  // views
  views?: { id: string; title: string; desc: string; icon: ReactNode; active?: boolean; disabled?: boolean; onSelect: () => void }[];
  // tools
  toolsContent?: ReactNode;    // <TemperatureControl/> + righe toggle, costruito nel parent
  // orbital
  orbitalContent?: ReactNode;  // riusa OrbitalInfoPanel
}): ReactNode {
  if (props.kind === "info") return <div className="pt-atomm-info-body">{props.infoContent}</div>;
  if (props.kind === "views") {
    return (
      <div className="pt-atomm-list">
        {props.views?.map((v) => (
          <button key={v.id} type="button" className={`pt-atomm-listrow${v.active ? " pt-atomm-listrow--active" : ""}`} disabled={v.disabled} onClick={v.onSelect}>
            <span className="pt-atomm-listrow__ic" aria-hidden="true">{v.icon}</span>
            <span className="pt-atomm-listrow__tx"><span className="pt-atomm-listrow__t">{v.title}</span><span className="pt-atomm-listrow__d">{v.desc}</span></span>
          </button>
        ))}
      </div>
    );
  }
  if (props.kind === "tools") return <div className="pt-atomm-tools">{props.toolsContent}</div>;
  return <div className="pt-atomm-orbital">{props.orbitalContent}</div>;
}
```
Rationale del riuso: `infoContent`/`toolsContent`/`orbitalContent` vengono costruiti nel parent dai componenti/dati GIÀ esistenti → parità garantita, zero duplicazione di dati, niente valori finti (fail-loud: se un dato manca, mostra `—` come fa già `InfoPanel`).

- [ ] **Step 2: Nel parent, costruisci i ReactNode di contenuto**

In `periodic-table-view.tsx`, dove hai accesso a `selected`, `EXTENDED[z]`, `locale`, i formatter e i controlli, costruisci `infoContent`, `toolsContent`, `orbitalContent` riusando rispettivamente i blocchi di `InfoPanel`, `TemperatureControl`+toggle, `OrbitalInfoPanel`. Per Info usa `<details>` per le sezioni avanzate (disclosure progressiva).

- [ ] **Step 3: Typecheck**

Run: `pnpm tsc --noEmit`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add components/lab/atom-mobile/atom-sheet-contents.tsx components/lab/periodic-table-view.tsx
git commit -m "feat(periodic-table): mobile sheet contents reusing existing panels/controls

Co-Authored-By: Fosforonero <hello@fosforonero.com>"
```

---

## Task 6: Bottom-sheet con a11y (dialog, focus trap, Esc, scrim, drag)

**Files:**
- Create: `components/lab/atom-mobile/atom-sheet.tsx`
- Modify: `components/lab/periodic-table.css` (stili sheet/scrim + animazione)

- [ ] **Step 1: `atom-sheet.tsx`**

```tsx
"use client";
import { useEffect, useRef, type ReactNode } from "react";

export function AtomSheet({
  open, title, onClose, children, returnFocusRef,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  returnFocusRef?: React.RefObject<HTMLElement>;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Esc + focus trap + return focus
  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const prevFocus = document.activeElement as HTMLElement | null;
    const focusables = () => panel?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    focusables()?.[0]?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "Tab" && panel) {
        const f = focusables(); if (!f || f.length === 0) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      (returnFocusRef?.current ?? prevFocus)?.focus?.();
    };
  }, [open, onClose, returnFocusRef]);

  return (
    <>
      <div className={`pt-atomm-scrim${open ? " pt-atomm-scrim--open" : ""}`} onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        className={`pt-atomm-sheet${open ? " pt-atomm-sheet--open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        aria-hidden={!open}
      >
        <div className="pt-atomm-sheet__grab" />
        <div className="pt-atomm-sheet__head">
          <h3 className="pt-atomm-sheet__title">{title}</h3>
          <button type="button" className="pt-atomm-sheet__x" onClick={onClose} aria-label="Chiudi">×</button>
        </div>
        <div className="pt-atomm-sheet__body">{children}</div>
      </div>
    </>
  );
}
```
Nota: drag-to-close è enhancement opzionale; se incluso, usa `pointer` events e rispetta `prefers-reduced-motion` (nessuna transizione forzata). Non bloccante per la DoD.

- [ ] **Step 2: CSS sheet/scrim + reduced-motion**

Aggiungi a `periodic-table.css` (token esistenti):
```css
.pt-atomm-scrim { position: absolute; inset: 0; z-index: 44; background: rgba(4,4,10,.5); opacity: 0; pointer-events: none; transition: opacity .25s; }
.pt-atomm-scrim--open { opacity: 1; pointer-events: auto; }
.pt-atomm-sheet { position: absolute; left: 0; right: 0; bottom: 0; z-index: 46; max-height: 76%;
  display: flex; flex-direction: column; transform: translateY(100%); transition: transform .3s cubic-bezier(.16,1,.3,1);
  border-radius: 22px 22px 0 0; }
.pt-atomm-sheet--open { transform: translateY(0); }
.pt-atomm-sheet__body { overflow-y: auto; }
@media (prefers-reduced-motion: reduce) {
  .pt-atomm-scrim, .pt-atomm-sheet { transition: none; }
}
```
Ma sopra c'è `display:none` di default su `.pt-atomm-sheet/.pt-atomm-scrim` (Task 3): nel blocco mobile imposta `display:flex`/`block` e usa `transform`/`opacity` per aprire/chiudere (non `display`) così l'animazione funziona. Riconcilia: nel media query mobile, `.pt-atomm-sheet{display:flex}` sempre, e lo stato chiuso è `transform:translateY(100%)` + scrim `pointer-events:none`.

- [ ] **Step 3: Typecheck + lint**

Run: `pnpm tsc --noEmit && pnpm lint`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add components/lab/atom-mobile/atom-sheet.tsx components/lab/periodic-table.css
git commit -m "feat(periodic-table): accessible mobile bottom-sheet (dialog, focus trap, Esc)

Co-Authored-By: Fosforonero <hello@fosforonero.com>"
```

---

## Task 7: Cablaggio nel parent (render-both della chrome mobile)

**Files:**
- Modify: `components/lab/periodic-table-view.tsx`

- [ ] **Step 1: Importa e renderizza la chrome mobile nell'atom view**

Dentro il ramo atom view del JSX (la colonna che contiene scena + InfoPanel desktop), aggiungi la chrome mobile **sempre montata** (nascosta via CSS su desktop). Passa nome/simbolo/Z/sottotitolo modalità, `locale`, `langHref` (riusa la logica esistente di switch lingua che mantiene `?z=`), `manualHref` (route manuale per `locale`). Costruisci `chips` per model-row dai 5 modelli esistenti (con `active` = modello corrente) e per orbital-row dalla lista orbitali dell'inspector (quando `inspectorOrbital !== null`).

```tsx
import { AtomTopBar, AtomModelRow, AtomPeek, AtomTabBar, AtomSheet, AtomSheetContents, type AtomTab } from "./atom-mobile";
// ...
{/* CHROME MOBILE — sempre nel DOM, nascosta via CSS ≥681px (no flash/CLS) */}
<AtomTopBar name={selected.name} symbol={selected.symbol} z={selected.z}
  modeSubtitle={inspectorOrbital !== null ? t.inspectorSubtitle : modelSubtitle}
  locale={locale} onBack={handleBackToTable} langHref={otherLangHref} manualHref={manualHref}
  t={{ back: t.backToTable, manual: t.manualTitle }} />
<AtomModelRow
  mode={inspectorOrbital !== null ? "orbitals" : "models"}
  chips={inspectorOrbital !== null ? orbitalChips : modelChips}
  onSelect={inspectorOrbital !== null ? handleOrbitalSelect : handleModelSelect} />
<AtomPeek z={selected.z} symbol={selected.symbol} mass={massStr} name={selected.name}
  configHtml={configHtml} onOpen={() => openAtomSheet("info")} openLabel={t.openInfo} />
<AtomTabBar tabs={ATOM_TABS} openSheet={sheet} inspectorActive={inspectorOrbital !== null}
  onTab={handleAtomTab} />
<AtomSheet open={sheet !== null} title={sheetTitle(sheet, t)} onClose={closeAtomSheet}>
  {sheet && <AtomSheetContents kind={sheet} infoContent={infoContent} views={viewItems} toolsContent={toolsContent} />}
</AtomSheet>
```
Nota: la model-row/peek/temp-pill seguono lo spec — model-desc e legenda restano visibili (no `display:none`). La temp-pill (indicatore + shortcut a Strumenti) può essere resa dentro la regione canvas con `onClick={() => openAtomSheet("tools")}`.

- [ ] **Step 2: Verifica comportamento (Playwright, 390px)**

Run: `pnpm dev` → `/lab/tavola-periodica`, seleziona P.
Verifica: tap tab Info/Viste/Strumenti apre lo sheet relativo; aprirne uno chiude gli altri (un solo overlay); tab Orbitali fa toggle inspector (model-row→orbital-row, stato attivo persistente); selezione modello aggiorna canvas+sottotitolo; tutti e 5 i modelli visibili senza scroll; lingua e (i) funzionano.

- [ ] **Step 3: Typecheck + lint**

Run: `pnpm tsc --noEmit && pnpm lint`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add components/lab/periodic-table-view.tsx
git commit -m "feat(periodic-table): wire mobile atom chrome (render-both) into view

Co-Authored-By: Fosforonero <hello@fosforonero.com>"
```

---

## Task 8: Takeover viste + landscape + pulizia CSS obsoleta

**Files:**
- Modify: `components/lab/periodic-table.css`
- Modify: `components/lab/periodic-table-view.tsx` (se serve un flag per nascondere la chrome durante takeover)

- [ ] **Step 1: Nascondi la chrome mobile durante i takeover**

Quando `crystalView || moleculeView || materialView || storyMode` è attivo, la tab bar/top-bar/model-row mobile devono sparire (queste scene hanno chrome propria + tasto chiudi, vedi spec Decisione 1). Aggiungi una classe sul contenitore atom view (es. `pt-atom--takeover`) quando uno di questi è attivo, e in CSS:
```css
@media (max-width: 680px), (max-height: 480px) and (orientation: landscape) {
  .pt-atom--takeover .pt-atomm-topbar,
  .pt-atom--takeover .pt-atomm-row,
  .pt-atom--takeover .pt-atomm-peek,
  .pt-atom--takeover .pt-atomm-tabbar { display: none; }
}
```
Nucleo NON è takeover (è un prop dell'atom scene): resta sotto la chrome.

- [ ] **Step 2: Landscape telefono esplicito**

Il media query del Task 3 già include `(max-height: 480px) and (orientation: landscape)` → l'IA mobile si applica anche al telefono orizzontale (largo ~812 ma alto ~375), evitando di ricadere nell'header desktop. Verifica con Playwright a 844×390 landscape: chrome mobile attiva, niente header desktop a 13 controlli.

- [ ] **Step 3: Rimuovi/assorbi le media-query obsolete dell'atom view**

Rimuovi o neutralizza i blocchi resi inutili dalla nuova IA: hack portrait di `.pt-view-mode-row`, `.pt-info` row-mode mobile, `.pt-orbital-grid`/`.pt-orbital-panel` mobile, `.pt-temp-control` portrait, e i relativi `!important`. NON toccare gli stili desktop di questi (≥681px restano). Procedi un blocco alla volta verificando dopo ognuno che desktop e mobile siano corretti.

- [ ] **Step 4: Typecheck + lint + visual desktop diff**

Run: `pnpm tsc --noEmit && pnpm lint`
Con Playwright 1440px: diff visivo nullo vs baseline Task 0 (desktop invariato). 390px e 844×390: chrome mobile corretta; takeover Cristallo/Molecola/Materiale/Story senza tab bar.

- [ ] **Step 5: Commit**

```bash
git add components/lab/periodic-table-view.tsx components/lab/periodic-table.css
git commit -m "feat(periodic-table): view takeovers hide mobile chrome; explicit landscape; drop obsolete media queries

Co-Authored-By: Fosforonero <hello@fosforonero.com>"
```

---

## Task 9: Verifica completa (DoD)

**Files:** nessuna modifica salvo fix emersi.

- [ ] **Step 1: Gate automatici**

Run:
```bash
pnpm tsc --noEmit
pnpm lint
pnpm seo:audit
pnpm build
```
Expected: typecheck PASS; lint non peggiora; `seo:audit` 0/0; build PASS.

- [ ] **Step 2: Matrice Playwright**

Per ogni combinazione { 375, 390, 412 portrait } × { dark, light } su elementi { H, C, P, Hg } **+ 1 landscape (es. 844×390)**: verifica gli acceptance criteria dello spec — canvas ≥60% altezza, nessun overlay sovrapposto, niente flash header desktop al primo paint, un solo sheet per volta, model-desc/legenda visibili, 5 modelli senza `<select>`, orbital-row + info nello sheet, Info parità, lingua dalla top-bar (no overflow @375 col nome più lungo, testare es. "Rutherfordio"/"Darmstadtio"), (i)→manuale, Temperatura in Strumenti, takeover senza tab bar, focus trap+Esc, target ≥44px, reduced-motion. Annota ogni check.

- [ ] **Step 3: Console + hydration**

Verifica nessun warning di hydration in console e CLS ≈ 0 (DevTools/Playwright). Se emerge un warning, è un bug del render-both → correggi prima di chiudere.

- [ ] **Step 4: Desktop invariato**

Confronta screenshot desktop (1440px) con baseline Task 0: diff visivo nullo su atom view e tavola.

- [ ] **Step 5: Commit fix eventuali**

```bash
git add -A
git commit -m "fix(periodic-table): address mobile atom IA verification findings

Co-Authored-By: Fosforonero <hello@fosforonero.com>"
```

---

## Task 10: Docs + push

**Files:**
- Modify: `docs/periodic-table/governance.md`, `docs/HANDOFF.md`

- [ ] **Step 1: Aggiorna i docs**

In `governance.md` e `docs/HANDOFF.md`: nota che la chrome mobile dell'atom view è stata rifondata (tab bar + single-sheet), che il bug Hg (collisione overlay) è risolto per costruzione, e che desktop è invariato. Rimuovi note obsolete sul bug overlay.

- [ ] **Step 2: Commit docs**

```bash
git add docs/periodic-table/governance.md docs/HANDOFF.md
git commit -m "docs(periodic-table): record mobile atom IA redesign + Hg overlay fix

Co-Authored-By: Fosforonero <hello@fosforonero.com>"
```

- [ ] **Step 3: Verifica scope branch (solo file Periodic Table)**

Run:
```bash
git diff --name-only origin/init..HEAD
```
Expected: solo `components/lab/atom-mobile/*`, `components/lab/periodic-table-view.tsx`, `components/lab/periodic-table.css`, `docs/periodic-table/*`, `docs/HANDOFF.md` (+ eventualmente lo spec/mockup se committati qui). NESSUN file Solar System o altro progetto.

- [ ] **Step 4: Push (branch strategy CLAUDE.md)**

```bash
git push -u origin fix/pt-mobile-atom-ia
git push origin fix/pt-mobile-atom-ia:init
```

---

## Self-Review (svolta dall'autore del piano)

**Spec coverage:** ogni acceptance criterion v2 è coperto → canvas ≥60% (T3 S2), header nascosto/controlli da tab bar (T3+T7), no flash/CLS (T1+T3+T9 S3), un solo sheet (T4), model-desc/legenda visibili (T3+T5), 5 modelli senza select (T3 S2), inspector orbital-row+sheet (T5+T7), Info parità disclosure (T5), lingua top-bar + no overflow @375 (T2 S4+T3 S2+T9), (i)→manuale (T2 S4), temp in Strumenti (T5), takeover senza tab bar (T8), landscape esplicito (T8), tab bar `aria-expanded`/`aria-pressed` non-tablist (T2 S1), sheet focus trap+Esc+scrim (T6), ≥44px (T3 S2), desktop invariato (T3+T8+T9 S4), reduced-motion (T6), typecheck/lint/seo (T9). Nessun gap.

**Placeholder scan:** nessun TBD/TODO; i punti dove si riusano simboli esistenti (formatter `fmt`, `TemperatureControl`, `InfoPanel`, `OrbitalInfoPanel`, setter view-mode, switch lingua, `inspectorOrbital`) sono **deliberati** e ancorati al recon del Task 0 — non placeholder, ma riuso esplicito di codice esistente nominato.

**Type consistency:** `AtomTab` ('info'|'views'|'orbital'|'tools'); `sheet` state esclude 'orbital' (l'inspector è uno stato separato `inspectorOrbital`); `AtomTabBar.openSheet` = `Exclude<AtomTab,'orbital'> | null` coerente con `sheet`. Classi CSS `.pt-atomm-*` coerenti tra TSX e CSS.

**Rischio noto:** i nomi esatti di alcuni setter/props dei controlli secondari (`setScale`/`setSpeed`/`setStars`/`setVdw`/`setSpin`/`setTempUnit`) e la firma di `inspectorOrbital`/lista orbitali per elemento vanno confermati nel Task 0 Step 3 prima di T4/T5. È l'unica incertezza; il recon la chiude.
