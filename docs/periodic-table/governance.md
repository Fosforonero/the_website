# Tavola Periodica 3D — Governance

Documento di riferimento per decisioni di prodotto, design e architettura della Tavola Periodica Interattiva (`/lab/tavola-periodica`).

**Aggiornato:** 2026-05-29  
**Separato da:** `docs/solar-system/` — non usare questo doc per decisioni del simulatore solare e viceversa.

---

## Intento prodotto

Un laboratorio educativo interattivo per studenti di chimica (liceo / primo anno universitario) che permette di:

1. Esplorare i 118 elementi con dati scientifici verificati.
2. Visualizzare modelli atomici storici (Thomson → Quantistico) in 3D.
3. Confrontare proprietà fisico-chimiche attraverso mappe tematiche.
4. Capire struttura elettronica, cristallina e molecolare.

**Non è** un'app di flashcard, non è un gioco, non è un reference sheet piatto. È un *scientific instrument* — deve sembrare costoso e preciso.

---

## Identità visiva

**Direzione:** "dark scientific instrument / premium chemistry lab"

- Sfondo UI: dark slate profondo (`#0a0b14` o equivalente), non nero puro.
- Accenti: blu-viola scientifico, non colori vivaci o gradient arcobaleno.
- Tipografia: monospace per numeri e simboli chimici, sans-serif leggero per testo.
- Tone: contenuto, rigoroso, con micro-interazioni sottili. Niente bounce, niente confetti.
- Il canvas 3D (atomi, molecole, cristalli) è **sempre dark**, indipendentemente dal tema UI.

### Regole tema

| Superficie | Dark mode | Light mode |
|---|---|---|
| Chrome UI (header, toolbar, pannelli) | `#0a0b14` / slate scuro | Bianco / grigio chiaro |
| Canvas atomo / molecola / cristallo | **Sempre dark** | **Sempre dark** |
| Testo primario | `rgba(216,216,232,0.95)` | `#0a0a0a` |
| Bordi / separatori | `rgba(255,255,255,0.07)` | `rgba(0,0,0,0.09)` |

Il light mode cambia **solo** il chrome UI: header, toolbar, info panel, celle della tavola, legenda. Il "mondo 3D" non ne è influenzato.

**Eliminati** (non ripristinare senza decisione esplicita):
- Selettori colore sfondo chiaro (`pt-lightbg-selector`, `LightBgSelector`).
- Vignette scuro nel canvas light (`pt-canvas-vignette`).

---

## Regole scientifiche

### Dati
- Sorgente primaria: IUPAC, NIST WebBook, Royal Society of Chemistry.
- Masse atomiche: peso atomico standard IUPAC 2021.
- Configurazioni elettroniche: notazione shorthand con gas nobile precedente.
- Raggi atomici: van der Waals (in pm), salvo dove specificato.
- Punti di fusione/ebollizione: in Kelvin (mostrare anche °C nella UI).
- Elettronegatività: scala Pauling.

### Modelli atomici
Ogni modello è storico e didattico, non una simulazione quantomeccanica esatta:
- **Thomson (1904):** pudding con elettroni vibranti.
- **Rutherford (1911):** orbite circolari casuali.
- **Bohr (1913):** orbite quantizzate per shell — modello default.
- **Sommerfeld (1916):** ellissi kepleriane per sub-orbitale.
- **Quantistico (1926):** nuvola di probabilità con distribuzione s/p reale.

I sub-orbitali Sommerfeld devono restare **all'interno** del raggio della shell (clamp applicato).

### Strutture cristalline
Mostrare solo sistemi reali presenti in `element-extended-data.ts`. Non inventare strutture.

### Molecole
Dati da PubChem via API pubblica + fallback su dataset locale `lib/molecules-data.ts`. Non mostrare molecole senza struttura 3D verificata.

---

## Architettura — regole invarianti

- `atom-scene.tsx` è client-only (`"use client"`, caricato via `dynamic()` con `ssr: false`).
- Geometrie Three.js condivise (`nucleonGeo`, `electronGeo`) non vanno mai dispose al mount/unmount.
- Nessuna libreria di animazione esterna (no Framer Motion, no GSAP): solo CSS transitions e Three.js.
- TypeScript strict: niente `any`, `noUncheckedIndexedAccess` attivo.
- Prefix CSS: `.pt-` su tutto, BEM-light.

---

## SEO

- Ogni page (`page.tsx`) ha `generateMetadata` con title, description, OG, canonical.
- Canonical IT: `/lab/tavola-periodica`, EN: `/en/lab/tavola-periodica`.
- Sitemap: entrambe le route incluse in `app/sitemap.ts`.
- JSON-LD: `EducationalApplication` o `WebApplication` — non modificare il tipo senza valutazione.
- Deep-link `?z=26`: l'URL deve funzionare per condivisione social (l'elemento si apre sul load).

---

## Limiti attuali (da risolvere, non da ignorare)

| Limite | Impatto | Tier roadmap |
|---|---|---|
| Nessuno stato di ossidazione | Dato chiave per studenti | Tier 1 |
| Tm/Tb solo in Kelvin | Usabilità studenti italiani | Tier 1 |
| Nessun isotopo naturale | Dato mancante in nucleo view | Tier 2 |
| Raggio covalente assente | Rilevante per legami | Tier 2 |
| Molecole: solo ball-and-stick | Space-filling manca | Tier 4 (questo sprint) |
| Cristalli: unit cell non evidenziata | Leggibilità reticolo | Tier 5 (questo sprint) |

---

## Roadmap feature (ordine priorità)

### Tier 1 — Educativo, alta priorità
- [ ] Stati di ossidazione — badge colorati nel panel (es. Fe: +2 +3)
- [ ] Temperature in °C — accanto ai Kelvin
- [ ] Spin elettronico nel modello Bohr — ↑↓ per ogni elettrone
- [ ] Isotopi comuni — 2-3 isotopi naturali più abbondanti

### Tier 2 — Visualizzazione, media priorità
- [ ] Vista nucleo Level 1 — zoom protoni/neutroni in scala reale
- [ ] Raggio covalente — diverso da VdW, rilevante per legami
- [ ] Struttura cristallina — FCC/BCC/HCP/diamante in 3D mini

### Tier 3 — Avanzato / Powers of Ten
- [ ] Vista materiale Level 0 — cubo metallico + slider temperatura → cambio stato
- [ ] Orbitali reali Level 2 — forme s/p/d/f da Schrödinger
- [ ] Legami chimici — seleziona due elementi → legame covalente/ionico/metallico
- [ ] Vista nucleo avanzata Level 1b — quark up/down, gluoni

---

## Regole di separazione da Solar System

- Non usare `docs/solar-system/` per decisioni della Tavola Periodica.
- Non modificare file in `app/lab/solar-system/`, `components/lab/solar-system/`, `lib/solar-system/` durante sprint della Tavola.
- Non usare dati del catalogo solare (corpi, orbite, ephemeris) in questo lab.
- I due lab condividono solo: framework Next.js, CSS global, sitemap, layout root.
- Sprint planning e governance: documenti separati, nessun cross-reference.

---

## Fonti / riferimenti

- IUPAC: https://iupac.org/what-we-do/periodic-table-of-elements/
- NIST WebBook: https://webbook.nist.gov/
- Royal Society of Chemistry: https://www.rsc.org/periodic-table
- PubChem: https://pubchem.ncbi.nlm.nih.gov/
- CPK colors (Corey-Pauling-Koltun): standard de facto per molecole
