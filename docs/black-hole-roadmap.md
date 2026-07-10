# Buco Nero — Roadmap sviluppi da fare

Stato e prossimi passi del simulatore di buco nero (`/lab/buco-nero` e `/en/lab/black-hole`).
Aggiornato durante la sessione di sviluppo lensing/Kerr + ottimizzazioni GPU.

---

## 0.8 Sessione 2026-07-10 (pomeriggio) — riscrittura testata della dinamica N-corpi del Playground

**Branch**: `fix/bh-playground-dynamics` (worktree isolato da `origin/init`). Commit `42859195`,
non pushato, nessuna PR. Non tocca `feat/bh-flow-tracers` (resta locale, non pushata) né inizia il
redesign WGSL dei filamenti, entrambi esplicitamente rimandati dall'utente.

- **Fisica estratta in un modulo puro e testabile**: `components/lab/black-hole/playground-physics.ts`,
  senza dipendenze React/R3F, usato sia dal componente di rendering sia dallo script di audit
  headless (`scripts/black-hole/audit-playground-dynamics.ts`).
- **Audit e fix applicati punto per punto**: seed deterministico (mulberry32, niente più
  `Math.random()`); leapfrog kick-drift-kick con snapshot immutabile delle posizioni e somma
  gravitazionale mutua accumulata in ordine canonico per id (verificato bit-esatto contro lo stesso
  scenario con array invertito); un solo `SIM_DT` fisso (0.01s) per orbite/disruzione/detriti/
  lifetime tramite accumulator a step fisso, sostituendo il vecchio `dtMax` calcolato dalla
  distanza del corpo più vicino; corpi sotto `DOOM_RADIUS` esclusi dalla somma N-corpi mutua sia
  come sorgente sia come bersaglio; gerarchia pianeta-luna reale (sfera di Hill istantanea,
  distacco su invasione di raggio O energia relativa positiva, collisioni luna-qualsiasi-corpo,
  reparenting dopo fusioni, ricattura in un host diverso); raggio visuale/massa/densità separati,
  raggio mareale calcolato da `cbrt(3·M_bh/(4π·densità))`; coda cometaria con velocità propria +
  spinta radiale; disruzione TDE con fase radiale→lungo-orbita e intensità legata a forza mareale/
  perdita di massa; assorbimento particelle al secondo attraversamento del piano, mai al primo.
- **Diagnostica `?bhDebug=1`** (`playground-debug-overlay.tsx`): corpi/particelle, simDt/substep/
  fattore di rallentamento, energia, momento angolare, quantità di moto, baricentro, per-corpo
  parent/distanza/raggio di Hill/accelerazione BH e mutua.
- **Preset ridisegnati**: "Sistema planetario" (pianeti spaziati per raggi di Hill propri,
  auto-inquadratura), "Sistema stellare in caduta" (stella con pianeti/lune legati su traiettoria
  in caduta); aggiunta dimensione minima a schermo, aloni, nomi/scie disattivabili.
- **7 scenari obbligatori implementati, 24 check totali, tutti verdi** — vedi report pubblicato
  (link in memoria di sessione) per i numeri: deriva energetica 3e-11% dopo 22 orbite,
  indipendenza dall'ordine bit-esatta (Δ=0.000e+0), distacco di Hill con causalità verificata, 24
  corpi/60s senza NaN, due TDE simultanee con stream indipendenti e verifica bound/unbound.
- **Audit indipendente (6 revisori + ri-verifica) ha trovato 3 bug reali, tutti corretti**:
  (1) l'overlay di debug non applicava l'esclusione dei corpi "doomed" nell'accelerazione mutua,
  mostrando numeri diversi da quelli usati dall'integratore reale; (2) una luna-di-pianeta-di-stella
  usava il buco nero come perturbatore della sua sfera di Hill invece della stella, rischiando di
  restare "legata" durante lo strippaggio mareale della stella stessa (violava l'ordine
  luna→pianeta→stella richiesto per il preset "Sistema stellare in caduta"); (3) i pareggi in
  `resolveCollisions`/ricattura gerarchica si risolvevano per posizione nell'array invece che per
  id, un caso concreto (dimostrato riproducendolo) in cui invertire l'array cambiava quale corpo
  sopravvive a una fusione. L'audit ha anche iniettato e smentito un'ipotesi (scambio massa
  sorgente/bersaglio nella somma gravitazionale) dimostrando che la suite lo intercetta già.
- **Igiene git**: `git diff --check`, `tsc --noEmit`, `eslint` sui file toccati tutti puliti;
  commit con file espliciti, `.pnpm-store/` escluso.

---

## 0.7 Sessione 2026-07-10 (mattina) — qualità del disco volumetrico (GLSL/WGSL), audit rotazione, disco particellare

**Branch**: `fix/bh-disk-quality` (worktree isolato, dopo il merge di PR #5). Non tocca il
governor né `diskBright`/`uExposure` (vincolo esplicito di questa sessione).

- **Falso allarme investigato e chiuso: "OrbitControls non ruota più con Disco 3D attivo"**
  (segnalato nella sessione precedente come bug bloccante). Diagnosi Phase-1 (log temporaneo di
  `OrbitControls.onChange` + `uCamPos`/`uCamBasis` per frame, rimosso a fine indagine): la camera
  **si muove correttamente** e gli uniform si aggiornano correttamente in ogni caso — verificato
  con drag orizzontali (azimutali) e verticali (polari) via Playwright, con lettura diretta di
  posizione/quaternione. La causa del "sembra fermo" nella sessione precedente era che i test
  precedenti usavano **solo drag orizzontali a spin=0**: per un buco nero di Schwarzschild (non
  rotante) l'ombra e il photon ring sono **esattamente assialsimmetrici**, quindi un'orbita
  puramente azimutale a distanza/elevazione costanti produce un'immagine quasi identica **per
  fisica**, non per un bug — solo lo sfondo (stelle) e l'asimmetria Doppler ruotano, in modo
  sottile e facile da non notare su screenshot "muddy". Un drag verticale di controllo (Δθ≈96°) ha
  prodotto un cambio di inquadratura netto e corretto (da quasi-edge-on a quasi-top-down),
  confermando che la pipeline camera→uniform→shader funziona. Nessuna modifica di codice necessaria.
- **Root cause trovata e corretta per l'aspetto "sporco/lavato" del Nero puro specifico di WebGL**:
  il termine di rinforzo "inner lip" in entrambi gli shader usava
  `smoothstep(rIn*3.0, rIn*1.15, rho)` con **estremi invertiti** (edge0 > edge1) — comportamento
  non definito per spec sia GLSL sia WGSL, con esito diverso a seconda del backend (ANGLE su
  WebGL vs Dawn/Metal su WebGPU), il candidato più probabile per la divergenza visiva osservata a
  fine sessione precedente. Corretto in entrambi i renderer a
  `1.0 - smoothstep(rIn*1.15, rIn*3.0, rho)` (estremi in ordine corretto). Non serve che questo
  termine annulli l'emissione esattamente all'ISCO: `diskFlux()` lo fa già (`rd<=rIn` → `0.0`) e il
  suo picco fisico cade a **rd ≈ 1.36·rIn** (radice di `d/dx[x³(1−√x)]=0`, x=rIn/rd) — il lip ora
  concentra il rinforzo nella banda 1.15–3×rIn che contiene quel picco, invece di avere una forma
  non definita. Verificato visivamente: il Nero puro su WebGL è passato da un'apparenza
  olivastra/lavata a un nucleo caldo saturo, coerente con il risultato WebGPU allo stesso angolo.
- **Ray-step refinement unificato** tra GLSL e WGSL (soglia verticale di innesco, fattore di passo,
  pavimento del passo, pavimento della pendenza — 4 costanti nuove in `disk-vol-spec.ts`): per
  ciascuna, tenuto il valore che soddisfa davvero l'obiettivo dichiarato in codice ("≳4 campioni per
  scala di altezza"), non una media dei due — il fattore di passo GLSL (0.45, ~2.2 campioni/H) è
  stato sostituito dal valore WGSL (0.22, ~4.5 campioni/H) che rispetta l'obiettivo.
- **Verifica H/r e silhouette (misurata, non solo impressione)**: il clamp `[0.012, 0.035]` è
  rispettato per costruzione in entrambi gli shader (invariato). Nota tecnica: con
  `thickCoef=0.03`, H/r pre-clamp supera il tetto 0.035 per quasi tutta l'estensione visibile del
  disco (tranne una stretta fascia entro ~10% dal ISCO) — il disco è quindi, di fatto, a spessore
  quasi costante piuttosto che genuinamente "flared" su gran parte del raggio; il clamp non è un
  bug ma vale la pena saperlo se in futuro si vuole un flare più pronunciato. Silhouette misurata
  via campionamento pixel (Playwright, riga/colonna centrale, soglia relativa al picco locale):
  a **spin=0** l'ombra resta circolare (rapporto larghezza/altezza ≈0.95) sia a inclinazione ~15°
  sia ~60°, come atteso per Schwarzschild; a **spin=0.9** emerge un'asimmetria sinistra/destra
  misurabile (fino a ~37% a inclinazione 60°) coerente con la forma a "D" del frame-dragging —
  conferma quantitativa, non solo visiva, che la fisica dello spin è implementata correttamente.
- **Griglia di screenshot comparativa** catturata per entrambi i renderer, stessi framing: face-on
  (~15°), 60°, edge-on (~85-88°) × spin {0, 0.9} × {cielo reale, nero puro}, più due scatti di
  controllo con Doppler OFF a spin 0.9/60°. Risultato coerente tra WebGL e WebGPU: nucleo caldo
  leggibile, gradiente radiale, asimmetria Doppler, self-occlusion, banda sottile leggermente
  flared in edge-on, nessun effetto sfera/nebbia/blob.
- **Audit del disco particellare (Playground)** — non toccato, solo documentato per lavoro futuro:
  ogni particella ha oggi un'inclinazione orbitale **indipendente e casuale**
  (`accretion-disk-particles.tsx`, Normal(0, σ≈7°) via Box–Muller, nodo ascendente anch'esso
  casuale per particella) e viene renderizzata come uno sprite **circolare** (`gl_PointSize` +
  `discard` a `d>0.5`). È quindi, per costruzione, uno **sciame collisionless di test-particle**
  (ogni particella sul proprio piano orbitale leggermente inclinato) e non una rappresentazione
  fisica alternativa del disco — molto più "spesso" del disco volumetrico proprio perché ogni
  particella oscilla verticalmente sul proprio piano invece di condividere un piano medio comune.
  **Direzione per un lavoro futuro** ("Traccianti del flusso", non implementata ora): stessa H(r)
  del disco volumetrico condivisa da `disk-vol-spec.ts`; piano medio comune (niente più
  inclinazione/nodo indipendenti per particella); distribuzione radiale legata a densità/emissività
  invece che a un semplice `pow(·,4)` di raggio; splat allungati/ribbon filamentari al posto dei
  punti sferici; dichiarare esplicitamente che non sono lensati (il disclosure esiste già nel
  commento in testa al file, va solo esteso quando la forma cambia).

---

## 0.6 Sessione 2026-07-09 — governor mobile, luminosità disco, fonti nuove

**Branch**: `fix/bh-mobile-disk` (worktree isolato da `origin/init`, `init` locale NON toccato —
vedi nota branch strategy in CLAUDE.md). Verificato con `tsc --noEmit` pulito. `eslint` resta
bloccato da debito pre-esistente non correlato: sul sottoinsieme black-hole rimangono errori in
`black-hole-view.tsx` e `black-hole-webgpu-view.tsx`, righe non toccate da questa sessione
(`react-hooks/set-state-in-effect` e `react-hooks/immutability`, da trattare a parte); il lint
repo-wide trova inoltre errori storici in altri lab/componenti.

**Contesto diagnosi**: nessun profiling on-device reale è stato possibile in questa sessione
(GPU disponibile: Apple M3 Pro via ANGLE, troppo veloce per riprodurre il fill-rate ceiling
mobile — frame-time misurato con `requestAnimationFrame` instrumentato, anche a CPU throttle
4× via CDP: ~8ms/frame, nessun hitch). La diagnosi sotto viene dalla lettura del codice + dal
confronto con il governor WebGPU (che aveva già risolto lo stesso problema).

- **Fix — oscillazione del governor DPR mobile (probabile causa principale dello "scatti" persistente).**
  `black-hole-scene.tsx` (governor mobile, dentro `useFrame`): mancava la logica anti-oscillazione
  che il governor **WebGPU** aveva già (commit `0a5b77c`, mai portata qui). Senza un "tetto di
  recupero" che ricorda la scala appena fallita + un cooldown, il governor scende e risale la DPR
  ogni ~1s indefinitamente quando l'FPS oscilla intorno alle soglie 35/56 (quantizzazione vsync
  60↔30 fps siede esattamente lì) — la riallocazione del framebuffer una volta al secondo **è**
  lo stutter, non (solo) il costo di rendering. Portata la stessa logica (recoverCeil + cooldown
  2.5s + reset EMA dopo ogni aggiustamento) dal governor WebGPU (`black-hole-webgpu-view.tsx`) al
  governor WebGL. Non toccati `stepFloor`/`minSteps` (110 passi): abbassarli avrebbe aggravato il
  bug aperto del photon-ring troncato su mobile (§0), un trade-off già documentato — se il device è
  genuinely troppo debole anche al pavimento attuale, resta un problema architetturale (WebGPU +
  accumulo temporale, §2), non risolvibile con altro tuning del governor.
- **`preserveDrawingBuffer`**: portato a `false` in `black-hole-orbit-scene.tsx` e
  `black-hole-playground-scene.tsx` (nessuna feature di cattura/share dipende da questi due canvas
  — verificato via grep prima di cambiare). **NON toccato** in `black-hole-scene.tsx` (la scena
  principale): `black-hole-view.tsx` ha un vero bottone "condividi" (`onShare` → `canvas.toBlob`)
  che **dipende** da `preserveDrawingBuffer: true` per funzionare in modo affidabile (senza, la
  cattura andrebbe fatta in modo sincrono dentro il render loop stesso — tecnica valida ma più
  invasiva, rischio di rompere silenziosamente lo share su alcuni browser senza un test cross-device
  reale). Lasciato com'è con la ragione esplicitata qui, invece di rompere una feature funzionante
  per rincorrere un item della diagnosi. **Prossimo passo per chiuderlo davvero**: catturare il
  canvas con un hook `useFrame` a *priority* più alta dell'EffectComposer (che disattiva
  l'autorender di R3F quando presente), scattando `toBlob` in modo sincrono subito dopo il render —
  su mobile (niente EffectComposer) serve chiamare `gl.render()` manualmente nello stesso hook.
- **Fix — luminosità disco ("non sembra più luminoso di prima")**: causa root confermata nel
  commit `958bb2f` (`diskBright` default 24→14, `uExposure` SDR 1.15→0.85 — combinato, un taglio
  di luminosità lineare pre-tonemap di circa il 57%), giustificato all'epoca per evitare che il
  disco clippasse a bianco piatto senza gradiente di colore. Notato che `diskBright=24` è anche il
  **riferimento fisico** assunto dalla formula di temperatura effettiva in `black-hole-view.tsx`
  (`effTemp = diskTemp·(diskBright/24)^0.25`) — il default a 14 introduceva quindi anche un
  raffreddamento non intenzionale del colore, non solo un taglio di luminosità. Fix: `diskBright`
  default ripristinato a **24** (in `black-hole-scene.tsx` e `black-hole-view.tsx`, così l'effTemp
  torna neutro al default), e `uExposure` SDR ricalibrato **0.85→0.80** (non-starless) /
  **0.82→0.77** (starless) come compenso — il prodotto risultante (~19.2) resta ben sotto il
  livello che clippava (24×1.15=27.6) ma recupera la maggior parte della luminosità persa.
  Stesso allineamento nel renderer **WebGPU** (`black-hole-webgpu-view.tsx`): costante
  `diskBright` non-vol-disk 14→24. Verificato visivamente via screenshot Playwright: gradiente di
  colore visibile (bianco-caldo interno → arancione tenue esterno, bande di turbolenza leggibili),
  nessun clipping a bianco piatto.
- **Disco "abbozzato" in tutte le simulazioni**: confermato che `black-hole-orbit-scene.tsx` e
  `black-hole-playground-scene.tsx` non hanno un loro modello disco — importano `BlackHoleQuad`
  da `black-hole-scene.tsx`, quindi un solo modello GLSL condiviso (più il WebGPU/WGSL separato).
  Il modello di default (ovunque, `volDisk` off) è un **foglio sottile** alla crossing dell'equatore
  + un "velo" verticale ad-hoc — non un vero volume: nessun self-shadowing reale, lo spessore
  verticale è un'esponenziale finta scollegata dalla fisica del flusso. Il modello volumetrico vero
  (`BH_VOLDISK`) esiste ed è fisicamente più credibile (Gaussiana idrostatica, auto-occlusione) ma
  è disattivato di default quasi ovunque (solo GPU discrete non-Apple, tier "high") dopo una storia
  di correzioni eccessive (0.10/6.0 → 0.03/0.9, ogni volta dopo un report "sfera gonfia"/"macchia
  scura"). **Non toccato in questa sessione** — il rischio di un'altra oscillazione estrema è reale
  e servirebbe verifica visiva iterativa su più dispositivi, non solo su questa GPU desktop.
  **Scoperto in questa sessione**: le costanti del volumetrico sono **divergenti tra GLSL e WGSL**
  (guadagno di emissione ~5× diverso, range di `H/r` diverso) — le due implementazioni si sono
  scollegate nel tempo. Prossimo passo concreto: riconciliare le costanti WGSL↔GLSL prima di
  toccare i valori assoluti, poi valutare se il foglio sottile di default meriti un octave di
  turbulenza in più (rischio basso, additivo) prima di riprovare a riabilitare il volumetrico più
  largamente.
- **Fonti nuove aggiunte a `black-hole-about-view.tsx`** (IT+EN, citate con URL): NASA/Goddard
  (2024) "New NASA Black Hole Visualization Takes Viewers Beyond the Brink" (numeri Sgr A*: massa
  4,3M M☉, orizzonte ~25M km, spaghettificazione 12,8s/~128.000 km — usati per verificare/arricchire
  le cifre già presenti, non per inventarne di nuove) e INAF (2026) "Un buco nero vicino per capire
  il passato lontano" (SDSS J110546: buco nero in rapida crescita, emissione radio persistente da
  8+ anni e getto relativistico di recente formazione — ancoraggio
  osservativo reale per il toggle "Getti", finora solo dichiarato "stilizzato" senza un esempio).
  **Scartato deliberatamente**: un testo virale sulla "retrocausalità quantistica" (nessuna fonte,
  nessuno studio/istituzione nominati, nessun link) girato dall'utente insieme ai due articoli
  sopra — verificato via web search: ripropone in forma sensazionalistica dibattiti di
  retrocausalità/weak-measurement decennali (delayed-choice quantum eraser anni '90-2000), non un
  risultato 2026 verificabile. Non aggiunto da nessuna parte, per la regola "fail loud, never fake".
- **Bug scoperto, non correlato, non corretto in questa sessione**: `/lab/buco-nero/about` genera
  un hydration mismatch React (SSR≠client) nei valori `ry`/coordinate delle ellissi SVG in
  `PolarizationFigure` (`black-hole-about-figures.tsx`) — differenze di precisione in floating
  point nell'ultima cifra, probabile calcolo trigonometrico non fissato a una precisione stabile
  tra server e client. Non blocca la resa (React ripara nel DOM) ma va sistemato: da investigare
  a parte, non toccato qui perché fuori scope.

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
