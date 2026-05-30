# Tavola Periodica 3D — Governance

Documento di riferimento per decisioni di prodotto, design e architettura della Tavola Periodica Interattiva (`/lab/tavola-periodica`).

**Aggiornato:** 2026-05-30 (audit post-sprint d1ebfbd)  
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

Due sorgenti distinte, mai mescolate silenziosamente:

| Tipo | Sorgente | Curata? | Avvertenza in UI |
|---|---|---|---|
| Molecole locali | `lib/molecules-data.ts` — dataset curato manualmente | Sì | Nessuna |
| Ricerca PubChem | API pubblica NIH/NLM — live lookup | No | Badge "PubChem" + nota "dati esterni" |

**Regole:**
- Le molecole locali sono la sorgente primaria. Vengono mostrate come tab nel Molecule Lab.
- La ricerca PubChem è una funzione secondaria, visivamente separata e chiaramente etichettata.
- Il rendering 3D è sempre del viewer Fosforonero — le coordinate vengono da PubChem, la visualizzazione no.
- Non usare PubChem per sostituire silenziosamente dati locali verificati.
- Non mostrare molecole senza struttura 3D verificata (conformer con coordinate x/y/z).

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

## Copertura dati (audit 2026-05-29)

| Campo | Copertura | Gap documentato |
|---|---|---|
| OX (stati ossidazione) | 118/118 | — |
| ISO (isotopi naturali) | 84/118 | Tc(43), Pm(61) senza isotopi stabili; Po–Ac (84–89) solo tracce radioattive; Z≥93 sintetici — tutti corretti |
| COV (raggio covalente) | 96/118 | Z=97–118 (Bk–Og): nessun dato affidabile in Alvarez 2008 — gap documentato e scientifico |
| CRYSTAL (struttura) | 88/118 | Gas, liquidi, sintetici: null appropriato |
| EN (elettronegatività) | 97/118 | Gas nobili (Z=2,10,18,36,86): EN Pauling non definita; Z=103–118 sintetici |
| atomicRadius (vdW) | 103/118 | Z=104–118: nessun raggio VdW misurato sperimentalmente |
| IE (ionizzazione I) | 104/118 | Z=105–118: nessuna misura sperimentale disponibile |
| EA (affinità e⁻) | 90/118 | Z=90–118: dati non disponibili o non affidabili per attinidi pesanti e transattinidi |
| density | 96/118 | Gas, sintetici: null appropriato |

**Regola dato mancante:** se un valore non è disponibile da fonte primaria verificata, resta `null` e viene mostrato come "—" nel pannello (mai omesso silenziosamente, mai inventato).

## Limiti attuali (da risolvere, non da ignorare)

| Limite | Impatto | Tier roadmap |
|---|---|---|
| InfoPanel: lista piatta di 16 righe senza gerarchia | Leggibilità, percezione di strumento preciso | P1 |
| Trend heatmap non annotati (il "perché" della variazione) | Valore educativo | P1 |
| Story Mode: 27/118 elementi | Engagement narrativo | P2 |
| Molecole predefinite: ~19 Z con dati locali | Copertura vista molecolare | P2 |
| Legami chimici tra due elementi (Bonding Lab) | Feature educativa avanzata | P3 |

---

## Roadmap feature (ordine priorità)

### Completato (non riaprire)
- [x] Stati di ossidazione — badge colorati, OX 118/118
- [x] Temperature °C/°F — toggle ciclico K→°C→°F
- [x] Spin elettronico ↑↓ — toggle su Bohr/Rutherford/Sommerfeld (Hund's rule, spin ↑↓ accurato)
- [x] Isotopi naturali — ISO 84/118, gaps documentati
- [x] Vista nucleo Level 1 — overlay protoni/neutroni
- [x] Raggio covalente — COV 96/118, gap Z=97–118 documentato (Alvarez 2008)
- [x] Struttura cristallina 3D — CRYSTAL 88/118, unit cell wireframe (sprint 82e7962)
- [x] Canvas 3D sempre dark — rimosso lightBg selector/vignette (sprint 82e7962)
- [x] Sommerfeld subshell colorati per tipo s/p/d/f — chiarezza visiva orbite ellittiche
- [x] Nucleus packing refactor — rejection sampling, separazione minima garantita
- [x] Molecule Lab — ball-and-stick + space-filling (riempimento) + polarity mode
- [x] PubChem search — live lookup NIH/NLM, visivamente secondario, badge + nota "dati esterni" (sprint c4fea99)
- [x] Orbital Inspector — 8 orbitali idrogenoidi (1s, 2s, 2px/y/z, 3dz², 3dxy, 3dx²−y²), fase, nodi, marker nucleo (sprint 0915df5–d1ebfbd)
- [x] Story Mode — espanso da 11 a 27 elementi chiave (sprint 458702f)
- [x] SEO/GA hardening — hreflang EN, consent reload, sitemap IT+EN (sprint 1313)

### P1 — Leggibilità e valore educativo
- [ ] Raggruppamento InfoPanel in 4 sezioni semantiche (Identità / Proprietà periodiche / Struttura / Storia)
- [ ] Fallback "—" per proprietà core null (no riga sparita per gas nobili e sintetici)
- [ ] Annotazione trend sulle heatmap EN/raggio vdW/covalente/IE (il "perché" del trend)

### P2 — Copertura contenuto
- [ ] Story Mode: completare da 27 a 30 elementi chiave (mancano ~3)
- [ ] Molecole predefinite: aggiungere benzene, etanolo, acido acetico, LiF, PCl5, XeF4 (dataset premium)

### P3 — Feature avanzate
- [ ] Legami chimici (Bonding Lab) — selezione due elementi → tipo legame da ΔEN
- [ ] Crystal UX pass — info struttura nel pannello, link da InfoPanel a vista reticolo
- [ ] Vista materiale Level 0 — cubo + slider temperatura → cambio stato

### Escluso (non implementare senza decisione esplicita)
- Vista nucleo avanzata Level 1b (quark/gluoni) — impatto didattico marginale per il target liceo/triennio
- Vista materiale / Powers of Ten avanzata — scope troppo ampio rispetto al valore

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
