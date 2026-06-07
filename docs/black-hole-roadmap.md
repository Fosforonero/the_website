# Buco Nero — Roadmap sviluppi da fare

Stato e prossimi passi del simulatore di buco nero (`/lab/buco-nero` e `/en/lab/black-hole`).
Aggiornato durante la sessione di sviluppo lensing/Kerr + ottimizzazioni GPU.

---

## 0. Bug aperto — PRIORITÀ

### Photon ring rotto
- **Sintomo**: a forte zoom (e, secondo Matteo, **anche a zoom normale**) attorno all'ombra
  compaiono due **falci/“artigli” luminosi** dentro la regione dell'ombra, asimmetrici,
  con la **punta tagliata di netto**. Visibile in “Nero puro”, mobile.
- **Ipotesi**: immagini di ordine superiore (returning radiation) **troncate** perché i raggi
  che si avvolgono **esauriscono il budget di passi** dell'integratore; peggiorato su mobile
  (Eulero 1° ordine + meno passi in modalità Auto).
- **Da fare per diagnosticare**: serve uno **screenshot da desktop** dello stesso inquadramento.
  - se su desktop (RK4/Yoshida + più passi) è pulito → causa = integratore/passi mobile (risolvibile alzando i passi vicino alla sfera fotonica o l'integratore).
  - se è rotto anche su desktop → problema più strutturale nella returning radiation / accumulo disco.
- **Non aggiustare alla cieca**: prima localizzare con lo screenshot desktop.

---

## 1. Rifiniture in sospeso (da verificare su dispositivo, valori tarati a occhio)

- **Disco 3D volumetrico** (`uVolThick=0.06`, `uVolOpacity=1.8`, gain emissione 0.9 in shader):
  era prima “macchia scura” poi “sfera gonfia”; ora più sottile/luminoso ma **va verificato**
  su build aggiornato e tarato (luminosità/spessore).
- **Cielo reale meno grigio**: applicato `pow(sky,1.4)` + saturazione +50% + `uSkyBright=1.7`.
  Verificare che non sia troppo scuro/contrastato.
- **Auto-qualità / rilevamento GPU**: controllare nel pannello Controlli che la GPU venga
  classificata bene (specie mobile: Adreno per numero, Mali/Apple via deviceMemory/core).
  Se sbaglia tier, affinare le regex/soglie in `detectGpu()`.

---

## 2. Versione WebGPU — pagina separata (dopo il bug)

**Approccio deciso**: NON integrare nel path WebGL attuale (che resta stabile e gira ovunque),
ma una **route a parte** es. `/lab/buco-nero/webgpu` (+ `/en/...`), etichettata “Ultra / sperimentale”.
Se il browser non ha `navigator.gpu` → avviso + link alla versione WebGL.

**Perché vale (vantaggi reali vs WebGL2 attuale):**
1. **Compute shaders** (assenti in WebGL2): N-body del playground su GPU (milioni di particelle),
   buffer di storage, ping-pong.
2. **Accumulo temporale (feature di punta)**: a camera ferma, accumulare pochi raggi/frame nel
   tempo (stile path-tracer) → **qualità quasi offline (DNGR-like) nel browser**: photon ring di
   ordine alto nitido, disco volumetrico pulito, supersampling enorme. È il vero differenziatore.
3. Fine della **fragilità del budget di compilazione shader** (il problema dei `#define` su mobile).
4. **Headroom per più passi** → risolve strutturalmente i limiti di fedeltà (incluso il ring).
5. Pipeline a basso overhead CPU.

**Verità scomode da tenere a mente:**
- Per il solo fragment raymarch il guadagno *grezzo* WebGL2→WebGPU **non** è un magico 2×;
  i vantaggi sono **architetturali** (compute, accumulo, robustezza), non frame-rate doppio gratis.
- Serve browser moderno (Chrome/Edge, Android Chrome, Safari/iOS 18+, Firefox in arrivo) →
  gestito dalla pagina separata con avviso.
- Costo: **secondo core di rendering da mantenere** (shader riscritto in WGSL/TSL), attenzione al
  canonical SEO (pagina distinta, non contenuto duplicato).

**Da preparare**: piano WebGPU concreto (cosa si porta in WGSL/TSL, implementazione dell'accumulo
temporale, stima di lavoro).

---

## 3. Versione C# / Unity per Steam (più avanti)

**Quando**: solo se l'obiettivo diventa **prodotto / VR / export / portfolio game-dev**.
- Vantaggi: compute shaders nativi senza limiti WebGL, performance, **VR (Quest)**, export
  immagini/video 4K-8K offline, N-body massiccio, GRMHD-lite su GPU compute.
- Costi: terza codebase (fisica riscritta in HLSL/compute), store (fee/review Apple/Google/Valve),
  firma, manutenzione. **Si perde il browser** (zero-install, SEO) → per questo resta vetrina il web.
- La fisica **non migliora** (stesse equazioni): migliorano potenza, piattaforme, fedeltà.

---

## 4. Funnel / cross-link

- **Web (WebGL/WebGPU)** = vetrina condivisibile e indicizzabile → porta scoperta.
- **Steam (Unity)** = prodotto full-power → linkato dal blog e dalla versione web.
- Linkare a vicenda **solo quando le pagine esistono davvero** (no link a pagine fantasma —
  regola “fail loud, never fake”).
- Sequenza raccomandata: **(1) bug ring → (2) rifinitura web → (3) WebGPU pagina separata →
  (4) Unity/Steam**. Un binario alla volta, non tutti insieme.

---

## 5. Articolo blog in sospeso

- **Tema**: performance engineering — qualità adattiva in WebGL, rilevamento GPU, governatore FPS,
  desktop vs mobile (passi vs fill-rate), la war-story dei `#define` (budget compilazione shader),
  i limiti onesti di WebGL (niente codice vendor-specifico).
- **Taglio**: primo articolo non-fisica → aggiunge spessore “CV tecnico”. Tag **Dev**, bilingue,
  cross-link a “Noi vs Interstellar” (i 16 ms a fotogramma).
- **Titolo proposto**: «Un solo shader, dal telefono entry-level alla RTX: qualità adattiva e i limiti di WebGL».
- Stato: **approvato come idea, da scrivere** (Matteo lo voleva dopo il fix del ring).

---

## Nota ambiente
Il container cloud si è resettato più volte a un commit vecchio durante la sessione: il lavoro è
sempre **salvo su `origin` (branch `claude/black-hole-solar-system-NWdiX` e `init`)**. In caso di
reset: `git fetch origin <branch>` poi `git reset --hard origin/<branch>` per recuperare.
