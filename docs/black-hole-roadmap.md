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

## 0.5 Diagnosi stutter (mobile + desktop) — 2026-06-16

> Diagnosi **da lettura del codice**, NON da profiling on-device (non eseguito in questa
> sessione). I candidati vanno confermati con un trace Performance (DevTools) o Spector.js sul
> dispositivo reale. Distinguere **stutter** (frame-time spikes / hitching irregolare) da
> **FPS basso costante** (lentezza sostenuta). Il codice ha GIÀ un governor adattivo evoluto
> (`black-hole-scene.tsx`): lo stutter che resta nonostante questo punta ai costi sotto.

Candidati ordinati per ROI (impatto / sforzo):

1. **`preserveDrawingBuffer: true` — `black-hole-scene.tsx:371` (entrambe le piattaforme).**
   Forza il browser a preservare il backbuffer dopo il compositing → disabilita lo swap veloce,
   copia del framebuffer **ogni frame** (costosa ad alto DPI). Causa nota di frame pacing
   irregolare. Quasi certamente attivo per la cattura screenshot/share. **Fix**: default `false`,
   attivarlo solo durante la cattura.
2. **Oscillazione `setDpr()` del governor — `black-hole-scene.tsx:213-236` (stutter periodico ~1s, mobile).**
   Il governor campiona l'FPS 1×/s e chiama `setDpr()` per cambiare risoluzione → reallocazione
   del framebuffer (hitch visibile). Soglie 35↓ / 56↑: se il device oscilla vicino al confine il
   DPR fa flip-flop, un hitch a ogni cambio. **Fix**: isteresi più ampia, N campioni consecutivi
   prima di agire, debounce, niente inversione di direzione entro qualche secondo.
3. **Ricompilazione shader sui toggle — `black-hole-scene.tsx:281-309` (entrambe, one-time ma molto visibile).**
   Cambiare qualità / "3D disk" setta `mat.needsUpdate = true` → recompile+relink GLSL di uno
   shader da 879 righe (50-300 ms su GPU/driver lenti). Già segnalato in §2.3 ("fragilità budget
   compilazione `#define`"). **Fix**: pre-warm async di entrambe le varianti, o branch uniform.
4. **Upload texture cielo grande — `black-hole-scene.tsx:121-143` (entrambe, one-time).**
   "Real sky" carica un JPEG equirettangolare 4k-16k; decode + upload GPU blocca la pipeline al
   bind → grosso hitch. **Fix**: `createImageBitmap` off-thread, fade-in (`fitNasaUrl` già limita
   la variante al `maxTextureSize`).
5. **Tetto fill-rate del raymarch (FPS basso costante, soprattutto mobile).**
   Core = raymarch geodetico per-pixel fino a ~300 passi + fbm 5 ottave + (BH_VOLDISK) trasporto
   radiativo per-step. A DPR mobile è il costo fondamentale; il governor mitiga ma non elimina.
   È il punto debole già noto (§6: "lento su mobile, WebGL"); soluzione architetturale = WebGPU +
   accumulo temporale (§2). Non è "stutter" ma alimenta la percezione di scatti insieme al #2.
6. **Bloom / EffectComposer desktop — `black-hole-scene.tsx:401-411`.**
   Passi fullscreen extra (HalfFloat + mipmapBlur + dither) ogni frame; sommati alla copia di
   `preserveDrawingBuffer` possono dare irregolarità su desktop. **Fix**: verificare risoluzione/passi.

**Ordine consigliato (quick-win prima):** 1 → 2 → 4 → 3 → (architetturale) 5 / WebGPU.

**Escluso come causa primaria:** le particelle disco (300k) sono calcolate in GPU
(nessun costo CPU/frame, `accretion-disk-particles.tsx`) e off di default nella scena principale.

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

## 5. Articoli blog in sospeso

### Articolo #1 — Qualità adattiva in WebGL (performance engineering)
- **Tema**: qualità adattiva in WebGL, rilevamento GPU, governatore FPS, desktop vs mobile
  (passi vs fill-rate), la war-story dei `#define` (budget compilazione shader), i limiti onesti
  di WebGL (niente codice vendor-specifico).
- **Taglio**: primo articolo non-fisica → aggiunge spessore “CV tecnico”. Tag **Dev**, bilingue,
  cross-link a “Noi vs Interstellar” (i 16 ms a fotogramma).
- **Titolo proposto**: «Un solo shader, dal telefono entry-level alla RTX: qualità adattiva e i limiti di WebGL».
- **Stato**: approvato come idea, da scrivere (Matteo lo voleva dopo il fix del ring).

### Articolo #2 — WebGPU spiegato attraverso i miei progetti (DECISO: opzione B)
- **Decisione (Matteo)**: **opzione B** — scriverlo **DOPO aver spedito la versione WebGPU del
  buco nero**, fondato su **risultati reali** (prima/dopo, benchmark, l'accumulo temporale che
  funziona). NON un esplicativo generico “forward-looking”, NON prima di aver spedito (regola
  “fail loud, never fake”: niente claim su tecnologia non ancora in produzione).
- **Angolo unico (il punto di forza)**: cos'è WebGPU, cosa sblocca, e **dove serve DAVVERO e dove NO**,
  usando i progetti reali come reality-check — dimostra giudizio, non hype:
  - **Buco nero → enorme**: compute shaders, accumulo temporale (qualità quasi offline nel browser),
    fine fragilità budget compilazione shader, più passi → photon ring/disco volumetrico risolti.
  - **Tavola periodica → utile *se* si spinge**: orbitali atomici **volumetrici** (ray-marching del
    |ψ|² in tempo reale via compute), reticoli cristallini grandi (instancing a basso overhead +
    generazione su compute). Per le scene attuali WebGL basta; beneficio reale solo se si alza l'ambizione.
  - **SplitVote → praticamente nulla, ed è giusto dirlo**: app web CRUD, niente 3D/compute pesante.
    Dichiarare apertamente “qui WebGPU non serve” è la parte che dimostra di scegliere lo strumento
    giusto invece della tecnologia di moda.
- **Struttura proposta**:
  1. Cos'è WebGPU (non “WebGL 2.0 più veloce”: è compute + pipeline esplicita).
  2. Cosa sblocca: compute shaders, storage buffer, accumulo/ping-pong, meno overhead CPU.
  3. Reality-check sui progetti: buco nero (enorme) → tavola periodica (se spingi) → SplitVote (zero).
  4. Limiti onesti: supporto browser (Chrome/Edge/Android, Safari/iOS 18+, Firefox in arrivo),
     non è un “2× gratis” sul fragment shader, secondo core di rendering da mantenere.
  5. Conclusione: lo strumento giusto al posto giusto.
- **Taglio**: Tag **Dev**, bilingue, cross-link a “Noi vs Interstellar”, all'articolo #1 e (quando esiste)
  alla versione WebGPU del buco nero.
- **Stato**: deciso (opzione B), **bloccato fino a quando la versione WebGPU del buco nero non è spedita**.

---

## 6. Pitch a studi e collaborazioni (No Man's Sky & co.)

**Domanda (Matteo)**: mandare la demo a uno studio (es. Hello Games / No Man's Sky)
perché la integri nel gioco. Con quale tecnologia, e a che punto della roadmap.

**Valutazione onesta:**
- Come «integratela nel gioco» l'hit rate è ~zero, e non è un difetto della demo.
  NMS gira su un **motore C++ proprietario** (non Unity): integrare codice di rendering
  esterno significa IP, legale, lavoro sul motore, manutenzione. Hello Games è ~30 persone,
  testa bassa; i loro buchi neri sono **warp gate per scelta narrativa**, non una feature mancante.
- Ha invece valore reale come **credibilità / visibilità / networking**: l'esito realistico è
  feedback, un contatto, interesse verso **di te** (contratto/lavoro), non l'integrazione.
- **Target più adatti di Hello Games** per il real-time GR: **Giant Army (Universe Sandbox)**
  è il match migliore (il loro prodotto È simulazione fisica); poi Frontier (Elite), CIG
  (Star Citizen), studi di space-sim. E soprattutto i **graphics programmer dove guardano davvero**:
  Shadertoy, r/GraphicsProgramming, community grafica su X/Bluesky, demoscene. Più occhi rilevanti
  di una mail fredda a un inbox di studio.
- **Cosa spedire** (non la codebase): un **video catturato 60–90s** (render offline ad alta qualità)
  + link live + l'articolo di metodologia + due righe su di te. Uno studio guarda una clip corta
  prima di cliccare qualunque cosa.

**Con quale tecnologia, se si puntasse all'integrazione:**
- Non si spedisce WebGL dentro un gioco. L'asset portabile è il **core matematico** (integratore
  hamiltoniano di geodetiche Kerr–Schild), **agnostico rispetto al motore** → si porta in un
  **compute/HLSL shader**.
- Engine realistici: **Unreal** (post-process material + compute) è il default per visual spaziali
  AAA; **Unity HDRP** (custom render feature + compute) è quello già previsto per Steam (sez. 3).
  L'unità di integrazione è «un compute shader + una piccola libreria documentata», non il sito.

**Quando farlo (timing):**
- **NON adesso.** Il punto debole attuale è «lento su mobile, WebGL»: pitchare così ci sottovende.
- Sequenza: **(1) fix bug ring → (2) WebGPU con accumulo temporale** (è ciò che lo fa sembrare
  professionale e toglie la critica performance) **→ (3) video demo HQ + articolo pronti →
  (4) outreach**. Si pitcha dalla forza, con un artefatto rifinito.
- Posizione in roadmap: **step ~3.5**, dopo la WebGPU (sez. 2), in parallelo/prima di Unity (sez. 3).

---

## 7. Modulo scientifico / valore per la ricerca (DA FARE — sprint domani)

**Contesto**: il progetto NON è e non sarà research-grade (niente GRMHD, niente trasporto
radiativo del plasma, GLSL a precisione singola, nessuna barra d'errore). Il suo contributo reale
alla scienza è come **strumento di didattica, divulgazione e intuizione**. Questi 6 punti alzano il
valore scientifico **onestamente**: lo rendono *verificabile* e *agganciato alle osservazioni reali*,
senza fingere capacità di ricerca. Ordine consigliato di esecuzione: 1 → 2 → 3, poi 4/6, poi 5.

### 7.1 — Layer quantitativo / validazione (priorità massima)
- Mostrare i **numeri**, non solo le immagini: diametro dell'ombra, raggio del photon ring, ISCO,
  angolo di deflessione, al variare di spin e inclinazione.
- Confrontarli **dal vivo** con i valori analitici noti (Bardeen) e con le misure EHT, dichiarando
  lo scarto: «shadow a spin 0 = X, analitico = 2·3√3 M, scarto Y%».
- Una pagina/pannello «Validazione» è il modo «fail loud» di essere credibili.
- **Base già pronta**: i 4 grafici SVG calcolati aggiunti all'about (`black-hole-about-figures.tsx`)
  e la verifica numerica della deflessione (campo debole 4M/b + 15π/4·(M/b)², forte = Bozza).
- Output: tabella/pannello con i valori vivi + colonna «atteso (analitico/EHT)» + scarto.

### 7.2 — Modalità a parametri reali (ombra in µas)
- Far inserire M e distanza di oggetti veri e calcolare la **dimensione angolare apparente
  dell'ombra in microarcosecondi**, confrontabile con l'EHT.
- Preset: **M87\*** (M = 6,5×10⁹ M☉, D = 16,8 Mpc → ombra ~42 µas misurata) e
  **Sgr A\*** (M = 4,1×10⁶ M☉, D = 8,1 kpc → ~52 µas).
- Formula: θ_shadow = 2·b_c·(GM/c²)/D (con b_c = 3√3 per Schwarzschild, dipendente da spin/inclinazione per Kerr).
- Collega il giocattolo all'osservazione reale.

### 7.3 — Confronto fianco a fianco con le immagini reali
- Mostrare le immagini EHT reali (M87\* 2019, Sgr A\* 2022, **pubblico dominio**) accanto al nostro
  render, e a un esempio ipole/GRMHD, **spiegando il divario** (perché il nostro è più «pulito»/analitico).
- Didattico proprio sui limiti del nostro modello. Asset: scaricare le immagini ufficiali EHT/ESO,
  citarle, mai spacciarle per nostre.

### 7.4 — Permalink e preset condivisibili + embeddabile
- URL che codifica lo stato (spin, inclinazione, modalità, preset) → un docente linka una
  configurazione precisa.
- Versione **embeddabile** (iframe) per slide/lezioni.
- Utilità reale e concreta per l'insegnamento; basso sforzo, alto ritorno.

### 7.5 — Polarizzazione stilizzata (overlay)
- Overlay dei vettori di polarizzazione sul disco (schematico, **dichiarato come tale**).
- Attualissimo: l'EHT ha pubblicato l'immagine **polarizzata** di M87\* nel 2021.
- NON un calcolo di trasporto polarizzato vero (sarebbe research-grade): è un overlay didattico.

### 7.6 — Open-source + export riproducibile
- Pubblicare lo **shader** e le derivazioni dell'about (auditabilità = ciò che la scienza chiede).
- **Export** delle geodetiche / dei dati in CSV, così i risultati sono riproducibili e confrontabili.

**Regola trasversale (fail loud, never fake)**: niente «GRMHD-lite» che sembri vero. Se si aggiunge
plasma o polarizzazione, dichiararli schematici come già si fa per la turbolenza procedurale.

---

## Nota ambiente
Il container cloud si è resettato più volte a un commit vecchio durante la sessione: il lavoro è
sempre **salvo su `origin` (branch `claude/black-hole-solar-system-NWdiX` e `init`)**. In caso di
reset: `git fetch origin <branch>` poi `git reset --hard origin/<branch>` per recuperare.
