# Tavola Periodica 3D — Governance

Documento di riferimento per decisioni di prodotto, design e architettura della Tavola Periodica Interattiva (`/lab/tavola-periodica`).

**Aggiornato:** 2026-06-01 (post ChEMBL pharmacology layer v0, chemblId data corrections)  
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
- Canonical IT: `/lab/tavola-periodica`, EN: `/en/lab/periodic-table`.
- Il vecchio slug `/en/lab/tavola-periodica` ha redirect permanente verso `/en/lab/periodic-table`.
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

---

## Limiti attuali (da risolvere, non da ignorare)

| Limite | Impatto | Tier roadmap |
|---|---|---|
| Trend heatmap non annotati (il "perché" della variazione) | Valore educativo | P1 |
| Story Mode: 31/118 elementi | Engagement narrativo | P2 |
| Molecule Dataset v3: XeF4, PCl5, etanolo, acido acetico | Copertura vista molecolare | P2 |
| Crystal UX v2: site-coloring, single-cell/extended-lattice toggle, reset camera | UX reticolo | P2 |
| Light mode mobile: smoke test incompleto (non verificato nel run 2026-06-01) | Qualità QA | P2 |
| Landscape >680px: MaterialLegend e TempControl si sovrappongono (pre-existing) | Layout landscape edge-case | P3 |
| Banner "RUOTA IL DISPOSITIVO" sempre visibile, non dismissibile | UX mobile | P3 |
| ChEMBL EBI latenza alta (~2-8s sulla prima richiesta) — cache 24h mitiga | UX percepito | P2 |
| ChEMBL v0: auranofin mechanism="Unknown" (target thioredoxin reductase non nel dataset EBI) | Accuratezza dati | P2 |
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
- [x] Story Mode — espanso a 31 elementi chiave (Z: 1–3, 6–17, 19–20, 22, 26–27, 29–30, 47, 53–54, 78–80, 82–83, 92)
- [x] SEO/GA hardening — hreflang EN, consent reload, sitemap IT+EN (sprint 1313)
- [x] Temperature Slider MVP — slider 0–12 000 K, badge solid/liquid/gas/unknown, marcatori fusione/ebollizione
- [x] Material Level 0 — modello particellare concettuale (solid/liquid/gas); scene Three.js per fase; MaterialLegend; esclusività con crystal/molecule/inspector/nucleus; auto-close su unknown. Commit: feat(periodic-table): add material phase view driven by temperature
- [x] InfoPanel restructure — 4 sezioni semantiche (Identità / Proprietà periodiche / Struttura / Scoperta), fallback "—"
- [x] Applications Panel v1 — `lib/element-applications-data.ts`: 23 elementi, 48 entry totali; badge categoria, link esterno verificato (PubChem CID), disclaimer medico su `isMedical`; sezione collassata `<details>` nell'InfoPanel
- [x] Applications → Molecule Viewer links — 16 entry con `relatedMolecule` attivo: click su app card apre direttamente la molecola nel 3D viewer locale (riuso puro)
- [x] PubChem formula symbol fix — correzione simboli formula per metalli
- [x] Crystal UX Pass v1 — `CRYSTAL_STATS` con CN (coordination number) e APF (atomic packing factor) per 5 tipi strutturali (sc/bcc/fcc/hcp/diamond); overlay canvas con nome elemento + codice struttura + CN; CrystalLegend bottom-center con APF e full name; legenda mobile compatta (hide verbose note)
- [x] Molecule Dataset Premium v2 — 6 molecole aggiunte: Cisplatino (Pt), Carbonato di litio (Li), Protossido d'azoto (N), Ossido di zinco (Zn), Solfato ferroso (Fe), Benzene (C); coordinate 3D verificate, descrizioni bilingue
- [x] Mobile UX portrait — bottom sheet Orbital Inspector con close button; back button ≥44px; font floor ≥12px su tutti i target touch; compact temp control portrait; view-mode row ordinato su singola riga
- [x] Mobile InfoPanel single-column — fix scroll orizzontale (~840px scrollWidth); root cause: flex-wrap:wrap + max-height:44vh creava colonne flex; fix: nowrap + align-items:stretch + overflow-x:hidden
- [x] Mobile Material overlay — MaterialLegend riposizionata top-right in portrait ≤680px per eliminare collisione con TemperatureControl (bottom-center); disclaimer verboso nascosto in portrait
- [x] Mobile thematic selector discoverability — mask-image right-fade su ≤900px per segnalare pulsanti fuori schermo; touch target 44px in portrait ≤680px
- [x] ChEMBL pharmacology layer v0 — accordion "Azione farmacologica" lazy-loaded nelle application card con `chemblId`; server proxy `/api/periodic-table/chembl`; dati: mechanism_of_action, action_type, indicazione principale (MeSH), max_phase, badge "Approvato (Fase 4)"; cache 24h; fallback 503 graceful; attribution CC BY-SA 3.0; 10 compound mappati: cisplatin (CHEMBL11359), aspirin (CHEMBL25), auranofin (CHEMBL1366), nitrous oxide (CHEMBL1234579), sodium fluoride (CHEMBL1528), lithium carbonate (CHEMBL1200826), silver sulfadiazine (CHEMBL1382627), magnesium hydroxide (CHEMBL1200718), calcium carbonate (CHEMBL1200539), zinc oxide (CHEMBL3988900)

### Architettura fonti dati (invariante)

| Fonte | Ruolo | Auth | Costo | Note |
|-------|-------|------|-------|------|
| **PubChem** | Struttura chimica: formula, SMILES, InChIKey, 3D coordinates, CID | No | $0 | CORS-OK, browser-direct |
| **ChEMBL** | Farmacologia: mechanism of action, indicazioni terapeutiche, max_phase | No | $0 | Server proxy necessario (latenza EBI); CC BY-SA 3.0 |
| **Locale** (`molecules-data.ts`, `element-applications-data.ts`) | Dataset curato: molecole 3D verificate, applications con source | — | $0 | Fonte primaria per tutto ciò che è curato manualmente |
| **PharmaDive** | Similarity/recommendations editoriali tra farmaci | Sì (non-retrievable) | $15–50/mese | **Non dati primari** — solo layer opzionale similarity se e solo se partnership |

**Regola invariante:** PubChem fornisce la chimica, ChEMBL fornisce la farmacologia. Non invertire i ruoli. Non usare ChEMBL come fonte per strutture molecolari (usare PubChem).

### Regole scientifiche Material View (invariante)
- **NON è un reticolo cristallino**: solid = griglia didattica 3×3×3, NON collegata a crystalStructure
- **Crystal View è l'unica vista** per struttura cristallina/cella unitaria reale
- **Fase dalla temperatura corrente**: `inferredPhase` da `temperatureK` via `inferPhaseAtTemperature`, NON dal campo statico `state`
- **Disclaimer obbligatorio**: "modello concettuale · non simulazione fisica quantitativa"
- **Nessuna proprietà termica nuova**: velocità/distanze sono puramente visive, non fisiche
- **unknown → view disabilitata**: bottone disabled + tooltip, niente MaterialScene renderizzata

### Regola visiva orbite–nucleo (invariante)
- **Scale didattiche**: distanze nucleo–orbite NON sono in scala fisica. Scopo: leggibilità.
- **`ORBIT_CLEARANCE = 0.30` scene units**: periapsis orbite (Bohr/Sommerfeld) e raggio orbite (Rutherford) sono clamped a `visualNucleusR(z, n, nucleonScale) + 0.30`.
- **Quantum model escluso**: densità al nucleo fisicamente corretta per orbitali s — non clampare mai la nuvola quantistica.
- **In REAL scale**: non necessario (nucleo scala 0.25, orbite scala 3.6 → abbondante clearance automatico).
- **Sommerfeld**: clamp su `a` preserva l'eccentricità, modifica solo la dimensione dell'ellisse; orbita resta geometricamente corretta.
- **Modificare solo con motivazione esplicita** — il clamp è un compromesso estetico/educativo consapevole.

### Regole scientifiche temperatura (invariante)
- `state` field (ElementExtended): stato fisico a 25°C / 1 atm — NON modificare, NON re-interpretare con lo slider
- `temperatureK` (slider): produce solo `phaseAtTemperature` e gate crystal view — nient'altro cambia
- Pressione: 1 atm — disclaimer obbligatorio in ogni vista che mostra lo slider
- Struttura cristallina: invariante con T (solo α-form a STP nel dataset) — nessun polimorfismo
- Densità, raggio, EN, IE, EA: non variano con lo slider — richiederebbero dataset termici non disponibili
- Arsenico (Z=33): mp ≥ bp → sublimazione; nessun liquid window; gestire con `note: "sublimation"`
- Elementi Z 98-103: mp noto, bp null → solid sotto mp, unknown sopra
- Elementi Z 104-118: entrambi null → always unknown/no-data

### P1 — Leggibilità e valore educativo
- [ ] Annotazione trend sulle heatmap EN/raggio vdW/covalente/IE (il "perché" del trend)
- [ ] Fallback "—" per proprietà core null (no riga sparita per gas nobili e sintetici)

### P2 — Copertura contenuto
- [ ] Story Mode: completare da 31 a ~40 elementi chiave
- [ ] Molecule Dataset v3: XeF4, PCl5, etanolo, acido acetico (4 molecole prioritarie)
- [ ] Crystal UX v2: site-coloring per tipo atomo, toggle single-cell/extended-lattice, reset camera button

### P2 — ChEMBL v1 (possibile sprint successivo)
- [ ] ChEMBL v1: aggiungere `first_approval` + ATC class per compound approvati
- [ ] ChEMBL v1: risolvere auranofin mechanism ("Unknown" in EBI — aggiungere nota manuale thioredoxin reductase)
- [ ] ChEMBL v1: versione EN bilingue completa delle label farmacologiche

### P3 — Feature avanzate
- [ ] Legami chimici (Bonding Lab) — selezione due elementi → tipo legame da ΔEN

### Escluso (non implementare senza decisione esplicita)
- Vista nucleo avanzata Level 1b (quark/gluoni) — impatto didattico marginale per il target liceo/triennio
- Vista materiale / Powers of Ten avanzata — scope troppo ampio rispetto al valore
- **PharmaDive core data** — non è un database chimico/farmaceutico primario (niente SMILES, CID, meccanismo). Possibile layer opzionale solo per similarity/recommendations "farmaci simili a X" se partnership commerciale — non dati di chimica.

---

## Audit: PharmaDive / Moore Metrics (2026-05-31)

**Decisione: NO** — integrazione diretta esclusa permanentemente.

### Motivazione
- Non è un database chimico/farmaceutico primario: è un motore di raccomandazione consumer (uno dei 13 domini "Dive", accanto a MovieDive e ChowDive).
- Non espone formula molecolare, struttura, SMILES, PubChem CID, ChEMBL/DrugBank ID, né ATC therapeutic class.
- Non esiste nessun campo "elemento" o "composizione" — nessun join possibile tra Z e farmaco senza name-matching fragile e non verificabile.
- Free tier (50 req/mese) inutilizzabile per qualsiasi feature pubblica che si attiva su click-elemento.
- Tier utili (Basic $15/mese, Pro $50/mese) richiedono un proxy server-side per proteggere la API key non-retrievable — costo e complessità senza valore proporzionato.
- I 16 score (es. "ionic_inorganic", "neuroactive") sono valutazioni soggettive editoriali, non proprietà scientifiche verificabili — incompatibili con il principio "fail loud, never fake".

### Direzione Element → Medicine/Applicazioni reali (rimane valida)
La roadmap Element→Composto→Farmaco→Applicazione Biologica ha valore educativo alto, **ma non passa attraverso PharmaDive**.

Roadmap alternativa raccomandata (ordine ROI):

| Phase | Contenuto | Effort | Fonte | Costo |
|-------|-----------|--------|-------|-------|
| **1** | Tabella statica curata `lib/element-applications-data.ts` — 23 elementi con applicazione reale nota (v1 completato). | Basso | Manuale (PubChem/ChEMBL) | $0 |
| **2** | Link farmaco curato → molecule viewer esistente tramite `relatedMolecule` (16 link attivi in v1). | Bassissimo | PubChem (già integrato) | $0 |
| **3** | `lib/pharma-chembl.ts` (specchio di `molecules-pubchem.ts`) — ChEMBL REST no-key, CORS-OK, per "altri farmaci / meccanismo / indicazione" on-demand, cached per elemento. | Medio | ChEMBL (free, CC-BY-SA) | $0 |
| **4** | RCSB PDB per strutture proteiche 3D degli elementi biologicamente centrali (Fe→emoglobina, Zn→insulina). Visivamente spettacolare e on-brand con il rendering 3D. | Alto | RCSB PDB (free) | $0 |

### Fonti competitive (sintesi)
| Fonte | Gratuita | API key | Dati strutturali | Valore educativo | Rischio |
|-------|---------|---------|-----------------|-----------------|---------|
| PubChem (già integrato) | Sì | No | Sì (SMILES, 3D) | Alto | Nessuno |
| ChEMBL | Sì | No | Sì + indicazioni | Alto | Basso |
| RCSB PDB | Sì | No | Strutture proteiche 3D | Alto | Nessuno |
| DrugBank | No (commercial) | Licenza commerciale | Ottima curation clinica | Alto | Alto (costi) |
| PharmaDive | 50/mese / $15–50 | Sì (non-retrievable) | **Nessuno** | Basso | Medio |

### Backlog: Applicazioni reali elementi
- [x] **Applications Panel v1** — `lib/element-applications-data.ts`: 23 elementi, 48 entry totali, badge categoria, link PubChem verificati, disclaimer medico su `isMedical`. Sezione collassata `<details>` nell'InfoPanel.
- [x] **relatedMolecule links v1** — 16 entry con `relatedMolecule` attivo: click apre molecola nel 3D viewer locale senza round-trip esterno.
- [x] **ChEMBL pharmacology layer v0** — accordion lazy-loaded in ogni app card con `chemblId`; proxy server `/api/periodic-table/chembl`; mechanism + indicazione + approval badge; 10 compound verificati; cache 24h; fallback graceful. Commit: `543e333`.
- [x] **Disclaimer obbligatorio** — presente su tutte le entry `isMedical: true` con copia IT/EN verificata ("Contesto educativo, non consiglio medico." / "Educational context, not medical advice.").

### Regole invarianti Applications Panel
- **Fonte obbligatoria per ogni entry**: ogni `ElementApplication` deve avere `sourceUrl` verificabile (PubChem, ChEMBL, WHO, NIST). Nessun claim senza fonte.
- **Disclaimer medico su `isMedical: true`**: obbligatorio in UI. Non rimuovere senza decisione esplicita.
- **Max 3 entry per elemento**: non superare senza revisione governance.
- **Nessun consiglio medico**: descrizioni contestualizzano la chimica/biologia, non indicano trattamenti. Non usare frasi imperative ("usa", "prendi", "assume").
- **PharmaDive non usato**: vedi sezione audit. Dataset sempre offline e curato manualmente.

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
