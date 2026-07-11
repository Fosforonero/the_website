# Buco Nero Binario — laboratorio futuro (documento di design)

Documento di design per un nuovo laboratorio, **non implementato**: due buchi neri in dinamica
orbitale reciproca, fino alla fusione. Renderer e scena separati da `black-hole-scene.tsx`
(il Kerr singolo attuale su `/lab/buco-nero` e `/en/lab/black-hole`). Nessun codice funzionante è
incluso in questo documento: solo firme di interfaccia TypeScript (senza corpo/logica) per
descrivere una forma condivisa con lavori futuri, e la progettazione di un piano di test da
eseguire quando l'implementazione inizierà.

Questo documento non modifica, non estende e non generalizza
`components/lab/black-hole/playground-physics.ts` (il motore N-corpi pseudo-newtoniano del
Playground attuale, singolo buco nero fisso). Quel modulo resta esattamente com'è. Il laboratorio
qui descritto è un **modello fisico diverso**, con assunzioni proprie, che in fase di
implementazione potrà eventualmente riprendere alcuni pattern architetturali del Playground
(integratore a step fisso, accumulator, verifica per simmetrie/conservazione) ma non ne è
un'estensione.

Il documento tiene deliberatamente separati quattro livelli, da non mescolare in implementazione:
l'**architettura di prodotto** (route, componenti, indice Lab, identità visuale — sezione
"Architettura di prodotto e route", **requisito esplicito**: questo laboratorio è un prodotto
completamente separato dal Kerr singolo attuale, non una modalità aggiunta al suo renderer), il
**core numerico condivisibile** (l'interfaccia di forza/potenziale e i pattern di integrazione,
potenzialmente riusabili anche dal laboratorio "Tre Corpi"), il **modello fisico specifico di
questo laboratorio** (PN, radiation reaction, handoff di merger, fit del remnant — sezione
"Modello fisico"), e il **rendering** (sezione "Rendering", intenzionalmente a parte).

## Obiettivo e motivazione

Il Playground attuale mostra un singolo buco nero fisso con corpi di prova, comete, TDE. Un
laboratorio "Buco Nero Binario" affronta un problema qualitativamente diverso: due masse
compatte comparabili, nessun centro fisso, un'orbita relativa che decade per emissione di onde
gravitazionali fino a una fusione, un oggetto finale con massa/spin/velocità di rinculo propri.
È il caso didattico più diretto per mostrare **perché** esistono le onde gravitazionali (LIGO/Virgo/
KAGRA rilevano esattamente l'inspiral-merger-ringdown di sistemi come questo) e per introdurre
concetti che il Playground a singolo corpo non può mostrare: precessione del periastro
relativistica, decadimento orbitale, rinculo del remnant, ringdown come sovrapposizione di modi.

Motivazione secondaria: è un banco di prova naturale per l'interfaccia di potenziale/forza
condivisa (vedi "Core numerico condivisibile") prima di affrontare il caso a N corpi arbitrario
del laboratorio "Tre Corpi" (`docs/three-body-lab.md`), che usa la stessa famiglia di interfacce
ma senza alcun potenziale centrale fisso.

## Non-goals / fuori scope

- **Nessuna implementazione ora.** Questo è un documento di design; niente componenti React,
  niente shader, niente modulo di fisica funzionante.
- **Nessuna evoluzione numerica completa della relatività generale.** Non si risolvono le
  equazioni di Einstein su una griglia (niente NR "vera", niente BSSN/CCZ4, niente evoluzione di
  dati iniziali). La fase di merger è un handoff fenomenologico dichiarato (vedi sotto), non
  un'integrazione delle equazioni di campo.
- **Nessun ray-tracing esatto della metrica binaria** (trattato come punto fisico dedicato più
  sotto e ripreso in "Dominio di validità").
- **Nessuna modifica al renderer Kerr singolo esistente** (`black-hole-scene.tsx`,
  `black-hole-wgsl.ts`, `black-hole-webgpu-core.ts`). Il laboratorio binario vive in una scena e
  in shader propri.
- **Nessuna generalizzazione di `playground-physics.ts`** a questo caso: resta pseudo-newtoniano,
  singolo corpo centrale, invariato.
- **Non tocca il redesign WGSL dei filamenti** (fuori scope, non pertinente).
- **Non è uno strumento di accuratezza da parametric-estimation gravitazionale-waveform** (tipo
  LIGO/Virgo parameter estimation). È un laboratorio didattico/visivo: le scelte di fedeltà fisica
  privilegiano la comprensibilità e la correttezza qualitativa, non il matching millimetrico di
  un segnale osservativo reale.
- **Non supporta più di due buchi neri massivi primari.** Un terzo corpo massivo comparabile è
  dominio del laboratorio "Tre Corpi" (`docs/three-body-lab.md`); qui i soli corpi aggiuntivi
  ammessi sono corpi-test a massa trascurabile (vedi sotto).
- **Nessuna pretesa di accuratezza osservativa nei fit del remnant.** I fit NR usati (surrogate o
  formule di fitting) sono scelti per plausibilità fisica e copertura del dominio dei parametri,
  non validati qui contro dati LIGO/Virgo reali.
- **Non è una modalità aggiunta al renderer Kerr singolo attuale.** È un prodotto completamente
  separato — vedi "Architettura di prodotto e route" per route, componenti e identità visuale
  propri.

## Architettura di prodotto e route

**Requisito di prodotto esplicito**: il laboratorio "Buco Nero Binario" è completamente separato
dal laboratorio Kerr singolo attuale — non una pagina, una modalità o un parametro aggiunto al suo
renderer/Playground. È un prodotto a sé, che deve funzionare, essere navigabile ed essere
sviluppato **indipendentemente**. Questa sezione fissa route e struttura ora, anche se
l'implementazione resta fuori scope di questo documento (nessun file viene creato qui). Stesso
principio, stessa struttura di sezione, del laboratorio "Tre Corpi" (`docs/three-body-lab.md`).

### Route

- **IT**: `/lab/buco-nero-binario` — nuova cartella di primo livello
  `app/(it)/lab/buco-nero-binario/`, sorella di `app/(it)/lab/buco-nero/`, non annidata al suo
  interno. Stesso pattern già in uso per gli altri laboratori del sito.
- **EN**: `/en/lab/binary-black-hole` — nuova cartella `app/(en)/en/lab/binary-black-hole/`,
  sorella di `app/(en)/en/lab/black-hole/`.
- **About IT/EN**: `/lab/buco-nero-binario/about` e `/en/lab/binary-black-hole/about` — stesso
  pattern già in uso (`app/(it)/lab/buco-nero/about/`, `app/(en)/en/lab/black-hole/about/`).

Tutte le route sono **autonome sotto `app/(it)` e `app/(en)`**, non annidate sotto
`app/(it)/lab/buco-nero/` (che resta il Kerr singolo attuale, invariato).

### Componenti

- Cartella dedicata **sorella**, non annidata: `components/lab/binary-black-hole/` (o nome
  equivalente da fissare in sviluppo) — stesso pattern di `components/lab/black-hole/`, ma un
  albero separato.
- **Nessuna modifica a `black-hole-scene.tsx`, `black-hole-shader.ts`, `black-hole-wgsl.ts` né a
  `playground-physics.ts`** (già dichiarato nei Non-goals) — il renderer e il motore fisico di
  questo laboratorio vivono interamente nella propria cartella, non come parametri aggiuntivi su
  quelli esistenti (vedi anche "Perché un renderer separato dal Kerr singolo" più sotto per i
  motivi tecnici).

### Voce nell'indice Lab, metadata, identità visuale

- Card/voce **indipendente** negli indici Lab IT (`app/(it)/lab/page.tsx`) ed EN
  (`app/(en)/en/lab/page.tsx`), allo stesso livello del Kerr singolo, non un link secondario dentro
  la sua card.
- Metadata, titolo, descrizione e navigazione **propri** di questo laboratorio, non ereditati dal
  Kerr singolo.
- Toolbar, palette e terminologia **proprie**: i controlli/preset specifici di questo laboratorio
  (fase inspiral/merger/ringdown, `q`, spin `χ1`/`χ2`, corpi-test circumbinari) sono
  concettualmente e visivamente indipendenti da quelli del Playground del Kerr singolo, anche dove
  la fisica sottostante è imparentata.

### Cosa può essere condiviso — e quando

Stesso principio del laboratorio "Tre Corpi": **solo primitive numeriche genuinamente generiche**
(es. `Vec3`, l'interfaccia `PotentialModel`/`BodyState`), estratte in un modulo neutro senza
dipendenze dal dominio Kerr-singolo **se e quando l'implementazione dimostra una condivisione
reale** — non estratte in anticipo come preparazione speculativa.

### Relazione con gli altri laboratori

Il laboratorio "Buco Nero Binario", il laboratorio "Buco Nero" (Kerr singolo/Playground) e il
laboratorio "Tre Corpi" (`/lab/tre-corpi`, `/en/lab/three-body` — vedi `docs/three-body-lab.md`)
sono **tre prodotti separati**, sviluppati e navigabili indipendentemente; possono collegarsi come
"esperimenti correlati" (link/card editoriale), mai come dipendenza tecnica.

## About scientifico e riproducibilità

Le route `/lab/buco-nero-binario/about` e `/en/lab/binary-black-hole/about` sono già fissate in
"Architettura di prodotto e route" — **ma la sola esistenza della route non basta**. Stesso
principio del laboratorio "Tre Corpi" (`docs/three-body-lab.md`, sezione omonima, stessa struttura
qui replicata): l'About è la superficie pubblica in cui il laboratorio dichiara cosa è calcolato,
cosa è approssimato e cosa è stilizzato.

**Livello e pubblico**: trattazione bilingue IT/EN di livello universitario avanzato, utile anche a
studenti magistrali e dottorandi in relatività numerica/astrofisica dei sistemi compatti, con
un'introduzione accessibile per chi arriva senza background specifico. **Non deve copiare
contenuti o UI dall'About del Kerr singolo esistente**: struttura, tono, componenti e identità
visuale sono propri di questo laboratorio, coerenti con l'indipendenza già richiesta in
"Architettura di prodotto e route".

### Struttura minima dei contenuti

1. **Abstract, obiettivi e domanda scientifica** — perché un binario mostra qualcosa che il Kerr
   singolo non può mostrare (onde gravitazionali, decadimento orbitale, remnant con rinculo — vedi
   "Obiettivo e motivazione"), in forma di abstract.
2. **Dinamica baricentrica M1/M2**: equazioni newtoniane di partenza e scelta delle unità — la
   riduzione al centro di massa (punto 1 del Modello fisico) e il sistema di unità del simulatore,
   dichiarato esplicitamente.
3. **Espansione post-newtoniana ibrida**: 1PN conservativo, 1.5PN spin-orbita (con la distinzione
   esplicita fra precessione geodetica e Lense–Thirring, punto 2) e nota di gauge — dichiarando
   esplicitamente che è una selezione didattica di termini, non un'espansione PN formalmente
   completa (vedi punto 2).
4. **Radiation reaction 2.5PN**: derivazione concettuale di Peters, decadimento secolare, ruolo
   dell'eccentricità (`(1−e²)^(−7/2)`, punto 3) — con lo stesso avvertimento su cosa è verificato
   solo in senso secolare, non campione per campione (vedi "Piano di test/verifica proposto").
5. **Perché non esiste un'integrazione PN continua fino al merger**: il parametro
   `x = (GMΩ/c³)^(2/3)`, la soglia di handoff, e perché la separazione da sola non basta come
   criterio (punto 4).
6. **Handoff fenomenologico**: cosa fa e cosa NON fa — in particolare la distinzione esplicita fra
   modello di waveform (IMRPhenom) e traiettoria/geometria visiva del laboratorio, che l'About deve
   ribadire con la stessa chiarezza di questo documento (punto 4), non solo come nota a piè
   pagina.
7. **Remnant**: fit NR (NRSur7dq4Remnant vs Healy, Lousto & Zlochower, distinti — punto 5), massa/
   spin/velocità di rinculo, bound di Kerr sullo spin finale, e cosa succede fuori dal range
   calibrato (rifiuto/warning, mai un numero silenziosamente estrapolato — vedi "Dominio di
   validità").
8. **Ringdown come sovrapposizione di QNM**: decadimento per modo (non della somma, vedi "Piano di
   test/verifica proposto"), frequenze/tempi di smorzamento determinati da massa e spin del
   remnant (punto 5).
9. **Corpi-test e sistema circumbinario**: stabilità circumbinaria (Holman & Wiegert come
   riferimento concettuale, punto 6), corpi-test vicini e il loro destino atteso durante
   l'inspiral.
10. **Perché nessun ray-tracing esatto della metrica binaria**: assenza di soluzione analitica
    chiusa per due buchi neri in orbita (punto 7), e i limiti che questo impone al rendering (vedi
    "Rendering").
11. **Metodi numerici**: integratore RK adattivo, perché non il KDK newtoniano del Playground
    (vedi "Core numerico condivisibile", sotto-sezione "Integratore"), controllo d'errore.
12. **Validazione, convergenza e riproducibilità** — cosa il "Piano di test/verifica proposto" di
    questo documento diventa, una volta implementato, in forma presentabile pubblicamente.
13. **Limiti fisici e numerici dichiarati** — la sezione "Dominio di validità" di questo documento,
    riscritta per il pubblico dell'About, incluso lo scope ristretto dell'MVP (quasi-circolare,
    spin allineati, nessuna precessione visibile del piano orbitale in quel regime — punto 2).
14. **Bibliografia primaria completa con DOI/link verificati** — vedi "Citazioni" sotto.

### Grafici minimi (calcolati, non decorativi)

1. Traiettoria del binario per un caso quasi-circolare e uno eccentrico (fuori MVP, se
   implementato), con condizioni iniziali dichiarate.
2. Energia e momento angolare orbitale: errore relativo nel tempo, con la distinzione esplicita fra
   andamento istantaneo (può oscillare con termini PN attivi) e decadimento secolare (deve
   decrescere monotonicamente con radiation reaction attiva — vedi "Piano di test/verifica
   proposto").
3. Precessione del periastro 1PN: angolo di avanzamento per orbita al variare di separazione e
   masse, confrontato contro la direzione/ordine di grandezza atteso (non il coefficiente esatto).
4. Decadimento della separazione nel tempo per radiation reaction (Peters), caso e=0 (scala
   quartica) vs caso e>0 (accoppiamento `(1−e²)^(−7/2)`) a confronto esplicito.
5. Convergenza al variare della tolleranza dell'integratore RK adattivo.
6. Massa/spin/velocità di rinculo del remnant al variare di `q` e degli spin, con il range
   calibrato del fit evidenziato graficamente e il comportamento fuori range (reject/warning, non
   un valore silenzioso) mostrato esplicitamente, non solo descritto a parole.
7. Inviluppo di ciascun modo QNM nel tempo (decadimento esponenziale per modo, non della somma —
   coerente con "Piano di test/verifica proposto").
8. Stabilità circumbinaria: mappa distanza-vs-esito (legato/instabile) per un corpo-test
   circumbinario.
9. Continuità della grandezza scelta per rappresentare "dove sono i due buchi neri" attraverso
   l'handoff (nessun salto visibile oltre la tolleranza dichiarata, vedi punto 4 del Modello
   fisico).
10. `x`/frequenza orbitale nel tempo, per mostrare visivamente quando e perché scatta l'handoff
    inspiral→merger.

**Ogni figura, senza eccezioni, deve avere**: assi/unità/legenda; parametri e condizioni iniziali
usati; l'equazione o il dataset esatto da cui deriva; una didascalia interpretativa; la fonte
primaria pertinente; un'indicazione esplicita **"calcolato dal simulatore"** / **"dato
osservativo"** / **"schema"**; una versione IT/EN equivalente (stesso dato, didascalia tradotta);
**nessun numero scritto a mano se può essere prodotto dal core numerico** — stesso identico
requisito di `docs/three-body-lab.md`, non ripetuto qui per esteso.

### Architettura dati per i grafici

I grafici di validazione **devono usare lo stesso core fisico del laboratorio**
(`binary-physics.ts` o nome equivalente) **o fixture deterministiche condivise con esso** — mai
una seconda implementazione delle formule PN scritta direttamente nel componente React della
figura (lo stesso principio dietro l'audit richiesto per l'About del Buco Nero esistente, vedi
`docs/black-hole-roadmap.md`). Seed, tolleranze dell'integratore e versione del modello fisico
devono essere dichiarati e riproducibili per ogni figura; da prevedere export CSV/JSON dei dati
(coerente con `docs/black-hole-roadmap.md`, §7.6).

### Citazioni

Stessa politica del laboratorio "Tre Corpi": citazioni **numerate, vicino alle affermazioni
specifiche**, non solo una lista finale; preferire paper originali, riviste peer-reviewed,
monografie universitarie e documentazione istituzionale; ogni formula, ogni fit NR citato e ogni
affermazione sul dominio di validità deve essere tracciabile a una fonte precisa. **Nessun
riferimento "da verificare" nella versione pubblicata** — la tolleranza che questo documento di
design si concede in "Riferimenti concettuali" (dettagli bibliografici marcati "da confermare in
sviluppo") non si trasferisce all'About pubblico.

## Modello fisico

### 1. Dinamica baricentrica con masse M1/M2

Il sistema è descritto nel sistema del centro di massa (CoM). Con posizioni `r1`, `r2` (misurate
in un frame inerziale) e masse `M1`, `M2`:

- Centro di massa: `R_cm = (M1·r1 + M2·r2) / M`, con `M = M1 + M2` (massa totale). Nel laboratorio
  si sceglie il frame in cui `R_cm` è fisso all'origine (o si muove di moto rettilineo uniforme se
  si vuole permettere un "impulso di sistema" per scopi visivi — decisione di implementazione).
- Vettore di separazione relativa: `r = r1 − r2`, con `|r|` la separazione istantanea.
- Massa ridotta: `μ = M1·M2 / M`. Rapporto di massa libero: `q = M2 / M1` (parametro esposto
  all'utente; per convenzione `M1 ≥ M2`, quindi `q ∈ (0, 1]`, ma l'implementazione può scegliere di
  esporre `q` senza questo vincolo se preferisce). **Convenzione da riconciliare esplicitamente in
  sviluppo**: questa convenzione (`q ≤ 1`, massa minore su massa maggiore) è comune in letteratura
  PN, ma la letteratura dei surrogate NR citata al punto 5 (es. NRSur7dq4/NRSur7dq4Remnant) usa
  tipicamente la convenzione opposta `q = M1/M2 ≥ 1` (massa maggiore su massa minore, range
  calibrato `q ∈ [1, 4]`). Il codice dovrà quindi o esporre `q` internamente in un'unica
  convenzione e convertire esplicitamente all'interfaccia del fit scelto, o documentare
  chiaramente all'utente quale delle due convenzioni è in uso in UI — un errore di conversione qui
  produrrebbe silenziosamente un mass-ratio sbagliato passato al fit, senza generare alcun errore
  visibile.
- Rapporto di massa simmetrico (parametro naturale d'espansione PN): `ν = μ / M = q / (1+q)²`.
- Equazione del moto relativo, a ordine dominante (newtoniano):
  `d²r/dt² = −G·M·r / |r|³`.
  Le correzioni post-newtoniane (sotto) si aggiungono come termini correttivi a questa stessa
  equazione relativa; le posizioni individuali si ricostruiscono da `r` e `R_cm` con
  `r1 = R_cm + (M2/M)·r`, `r2 = R_cm − (M1/M)·r`.
- Momento angolare orbitale: `L = μ·(r × v)` dove `v = dr/dt`; energia orbitale newtoniana:
  `E = ½·μ·v² − G·M1·M2/|r|`. Entrambi compaiono nel piano di test/verifica come quantità da
  monitorare (in assenza di radiation reaction e termini PN, esattamente conservate; con termini
  PN attivi, la formula newtoniana può oscillare entro un'orbita senza essere un errore — vedi il
  test dedicato in "Piano di test/verifica proposto" per la distinzione fra andamento istantaneo e
  decadimento secolare quando la radiation reaction è attiva).

`q` è un parametro libero esposto in UI (slider o preset), non un valore fisso: il laboratorio
deve reggere sia binari quasi-uguali (`q≈1`, il caso calibrato meglio dai surrogate NR) sia
rapporti più estremi (vedi "Dominio di validità" per i limiti onesti).

### 2. Regime newtoniano e correzioni post-newtoniane (PN)

**Questo è un modello ibrido didattico, non un'espansione PN formalmente completa e troncata a un
ordine dichiarato.** Una vera espansione PN "completa fino a 2.5PN" includerebbe *tutti* i termini
conservativi fino a 2PN prima del termine dissipativo a 2.5PN; questo laboratorio invece
**seleziona** tre termini specifici (1PN conservativo, 1.5PN spin-orbita, 2.5PN dissipativo) e
**salta esplicitamente 2PN conservativo**, che formalmente viene prima di 2.5PN nell'espansione.
La selezione è motivata dall'impatto visivo/didattico di ciascun termine (vedi il criterio
esplicito più sotto), non dalla completezza formale a un ordine PN — e va comunicata come tale
nella documentazione utente, per non lasciar intendere che il laboratorio implementi "la PN fino a
2.5PN" nel senso in cui userebbe quell'espressione un fisico dei sistemi compatti.

**Scope dell'MVP, ristretto rispetto al caso generale trattato più sotto**: l'MVP di questo
laboratorio supporta **solo orbite quasi-circolari e spin nulli o allineati** all'asse orbitale.
Eccentricità iniziale elevata, spin genericamente orientati (precessing) e l'effetto di
"superkick" nel recoil del remnant (che emerge specificamente da configurazioni di spin
disallineati/anti-allineati, vedi punto 5) **sono rimandati a una fase successiva**, non parte
dell'MVP: sono fisicamente reali e restano descritti in questo documento per completezza di
design, ma implementarli fin dall'MVP amplierebbe significativamente la superficie di
verifica (più rami di validità, più casi limite nei fit NR) per un beneficio didattico marginale
nella prima versione. Le sezioni sotto restano scritte nella loro forma generale (includendo
eccentricità e spin generici) perché descrivono il design completo del laboratorio, non solo
l'MVP — ma l'MVP stesso parte dal sottoinsieme quasi-circolare/spin allineati.

L'equazione relativa diventa, schematicamente:

```
d²r/dt² = a_Newton(r)
        + a_1PN(r, v; M, ν)
        + a_1.5PN,SO(r, v, S1, S2; M, ν)   [solo se spin abilitati]
        + a_2.5PN,RR(r, v; M, ν)            [radiation reaction, vedi punto 3]
        + O(2PN, 3PN, spin-spin, ...)        [FUORI SCOPE, vedi sotto]
```

Ordini **in scope** per questo laboratorio:

- **1PN conservativo**: la correzione relativistica dominante al moto kepleriano, responsabile
  della precessione del periastro (l'analogo, enormemente amplificato, della precessione di
  Mercurio) — è l'effetto PN più visivamente riconoscibile e il più economico da verificare
  qualitativamente (l'orbita non si richiude più su sé stessa).
- **1.5PN spin-orbita (leading order)**, *se e quando gli spin sono abilitati in UI*: accoppiamento
  fra spin e momento angolare orbitale. Il termine 1.5PN spin-orbita somma concettualmente due
  meccanismi distinti della relatività generale, da NON trattare come intercambiabili: la
  **precessione geodetica** (de Sitter), cioè la precessione dello spin di ciascun corpo dovuta al
  proprio moto orbitale in uno spaziotempo curvato dall'altra massa, e il **trascinamento di
  sistemi inerziali** (Lense–Thirring / frame-dragging), cioè l'effetto della rotazione di ciascuna
  massa sull'orbita e sullo spin dell'altro corpo. Nel binario i due effetti sono reciproci (ogni
  corpo sente entrambi i contributi generati dall'altro) e contribuiscono insieme al termine 1.5PN,
  ma restano fisicamente distinti.
  **Visibilità nell'MVP vs. fase successiva**: con spin **allineati** all'asse orbitale (il caso
  dell'MVP, vedi "Scope dell'MVP" sopra), per simmetria **non c'è precessione visibile del piano
  orbitale** — il piano resta lo stesso, perché non c'è alcuna componente di spin trasversa che
  possa inclinarlo; l'effetto osservabile dell'MVP è più sottile (un contributo aggiuntivo
  all'evoluzione della fase orbitale nel piano, sommato alla precessione del periastro di 1PN, non
  una nuova geometria 3D visibile). La **precessione del piano orbitale** propriamente detta (il
  piano che ruota/oscilla nel tempo, l'effetto visivamente più interessante di questo termine)
  richiede spin **non allineati** (genericamente orientati o "precessing"), esplicitamente fuori
  dall'MVP e rimandata alla fase successiva insieme all'eccentricità elevata e al superkick (vedi
  "Scope dell'MVP"). Il laboratorio deve quindi restare comprensibile e onesto anche a spin
  allineati: **non promettere un piano orbitale visibilmente precessante nell'MVP**. Trattato come
  funzionalità disattivabile: il laboratorio deve restare comprensibile anche a spin nulli.
  (Nota di gauge: le quantità di posizione/spin usate nel bookkeeping PN, come in tutta la
  letteratura PN, sono definite in una scelta di coordinate — es. armoniche o ADM — e non sono di
  per sé osservabili invarianti; per uno strumento didattico questo non cambia il comportamento
  visivo, ma va tenuto presente se in futuro si confrontano numeri PN di questo laboratorio con
  altre fonti che usano un gauge diverso.)
- **2.5PN dissipativo (radiation reaction)**: trattato a parte al punto 3, perché è il termine che
  fa evolvere il sistema nel tempo (senza di esso l'orbita PN a ordini pari è conservativa e non
  decade mai).

Ordini **esplicitamente fuori scope** (non implementati, non promessi):

- 2PN e 3PN conservativi punto-massa (correzioni di ordine superiore alla precessione; effetto
  visivo marginale rispetto al costo di implementazione/verifica per uno strumento didattico).
- Accoppiamento spin-spin (self-spin e spin1-spin2) e termini di quadrupolo di spin: fisicamente
  reali ma di ordine superiore (tipicamente 2PN e oltre) e con un impatto visivo trascurabile
  rispetto a 1PN/1.5PN per gli scopi di questo laboratorio.
- Orbite completamente generiche a precessione di spin (spin "precessing" complessa, con piani
  orbitali che cambiano orientazione in modo non banale) al di là dell'effetto 1.5PN dominante.

Il criterio per fermarsi a questi ordini è esplicito: 1PN dà l'effetto didattico principale
(precessione visibile), 1.5PN spin-orbita dà l'effetto secondario più riconoscibile quando gli
spin sono attivi, 2.5PN è indispensabile perché senza dissipazione non c'è "storia" (l'orbita non
evolve mai verso una fusione). Tutto il resto aggiunge fedeltà numerica senza cambiare la
narrazione visiva, a un costo di implementazione e verifica sproporzionato per questo lab.
**I coefficienti PN esatti (i fattori numerici nelle espansioni 1PN/1.5PN/2.5PN) non sono
riportati qui: andranno presi dalla letteratura PN standard e verificati in fase di sviluppo, non
inventati.**

### 3. Radiation reaction a 2.5PN

Il termine dissipativo `a_2.5PN,RR` toglie energia orbitale e momento angolare al sistema per
emissione di onde gravitazionali, facendo decadere la separazione nel tempo — è il meccanismo per
cui *ogni* binario compatto isolato finisce, prima o poi, per fondersi. Riferimento concettuale:
**Peters 1964** (Phys. Rev. 136, B1224), che deriva i tassi di decadimento orbitale mediati su
un'orbita per semiasse maggiore ed eccentricità di un sistema di due masse puntiformi in caduta
libera per emissione di onde gravitazionali (il risultato classico usato anche per stimare i tempi
di coalescenza di binarie osservate, come le pulsar binarie storiche). Nel nostro caso:

- Il termine è usato in forma di accelerazione dissipativa aggiunta all'equazione relativa (non
  come formula chiusa di Peters per l'evoluzione media di `a`, `e` — quella è comoda per stime
  rapide ma la simulazione integra l'orbita passo-passo, quindi il termine 2.5PN entra come forza,
  coerente con l'integratore).
- Effetto atteso e verificabile qualitativamente: la separazione media decresce monotonicamente
  nel tempo e il decadimento accelera man mano che i due corpi si avvicinano, quindi la fase finale
  dell'inspiral è visivamente molto più rapida della fase iniziale, non lineare nel tempo. **La
  relazione quantitativa "tempo di coalescenza ∝ separazione⁴" è il risultato di Peters 1964 solo
  nel limite di orbita inizialmente circolare (e=0).** Per orbita con eccentricità iniziale non
  nulla la formula completa di Peters accoppia l'evoluzione di `a(t)` e `e(t)` con un fattore di
  potenziamento del decadimento proporzionale a `(1−e²)^(−7/2)`: a parità di semiasse maggiore, un
  binario più eccentrico decade più rapidamente di uno circolare, e la dipendenza dal tempo non è
  più semplicemente quartica nel semiasse. La scala quartica resta quindi un caso limite utile per
  l'intuizione (e per un preset a eccentricità nulla), non una legge generale da assumere per
  orbite eccentriche.
- Se è supportata eccentricità iniziale non nulla: Peters 1964 copre esplicitamente anche
  l'evoluzione dell'eccentricità (che tende a diminuire, "circolarizzando" l'orbita man mano che
  decade, tramite lo stesso accoppiamento `(1−e²)^(−7/2)` citato sopra) — ma vedi "Dominio di
  validità" per i limiti di questo comportamento vicino al merger.
- **Nessun coefficiente numerico esatto è dato qui**: il fattore di normalizzazione del termine
  2.5PN dipende da `G`, `c`, `M`, `ν` con una potenza precisa che va ripresa dalla letteratura PN
  al momento dell'implementazione, non stimata a occhio.

### 4. Transizione dichiarata da inspiral PN a merger fenomenologico

Non esiste, per il problema dei due corpi relativistico, un'integrazione continua che rimanga
valida dall'inspiral fino alla fusione: la PN è un'espansione in `v/c` (o equivalentemente nel
parametro `x` definito sotto) che smette di essere una buona approssimazione quando la separazione
si avvicina alla scala del merger (il parametro di espansione non è più piccolo). Questo
laboratorio adotta perciò un **handoff esplicito e dichiarato come approssimazione**.

**Importante distinzione da non confondere**: la famiglia di modelli fenomenologici **IMRPhenom**
(es. PhenomD — Khan, Husa, Hannam, Ohme, Pürrer, Jiménez Forteza & Bohé, Phys. Rev. D 93, 044007,
2016 — e successori) è citata qui come **ispirazione concettuale per la struttura in tre fasi**
(inspiral-merger-ringdown raccordate fenomenologicamente), non come sorgente diretta di dati per
questo laboratorio. IMRPhenom modella la **forma d'onda gravitazionale** (lo strain `h(t)` o
`h(f)`, la grandezza osservata da un rivelatore come LIGO/Virgo) — **non** la traiettoria dei due
corpi, non la posizione degli orizzonti, non una geometria del merger. Non fornisce alcuna
informazione su "dove sono i due buchi neri" in un dato istante: quell'informazione, per il
problema dei due corpi in relatività generale, non è nemmeno ben definita in modo univoco oltre un
certo punto (non esiste una nozione universalmente concordata di "posizione di un buco nero" a
ridosso della fusione). La transizione **visiva** di questo laboratorio (dove disegnare i due
"corpi" sullo schermo durante il merger) è quindi un dispositivo fenomenologico **proprio e
separato**, ispirato solo nello spirito generale (una fase calibrata, non derivata dalle equazioni,
che raccorda inspiral e ringdown) alla struttura IMRPhenom — non un uso implicito o esplicito dei
suoi dati di waveform per posizionare geometria sullo schermo.

- **Fase 1 — inspiral PN**: l'integrazione descritta ai punti 1-3, valida finché il sistema resta
  nel regime PN. Il criterio di handoff usato per decidere quando terminare questa fase è basato
  sulla **frequenza orbitale**, non su una soglia di separazione: il parametro di espansione PN
  standard è `x = (G·M·Ω/c³)^(2/3)` (con `Ω` la frequenza orbitale angolare), un parametro
  adimensionale che cresce monotonicamente durante l'inspiral ed è la grandezza naturale rispetto
  a cui la PN è troncata (più `x` cresce, meno l'espansione tronca è affidabile) — più robusto di
  una soglia di separazione perché la separazione da sola non cattura bene quanto "veloce" sia
  l'orbita per masse/spin diversi. La soglia esatta di `x` (o, equivalentemente, di frequenza
  orbitale) a cui avviene l'handoff va fissata in sviluppo confrontandola con la letteratura PN,
  non stimata qui.
- **Fase 2 — merger fenomenologico**: quando si raggiunge la soglia di handoff (in `x` o frequenza
  orbitale), l'integrazione PN **si interrompe** e viene sostituita da una transizione **visiva**
  calibrata fenomenologicamente (non derivata dall'integrazione PN stessa, e non presa da un
  modello di waveform come IMRPhenom — vedi sopra) che porta i due "corpi" verso una configurazione
  unica. Questa fase è dichiaratamente la parte meno "fisica" nel senso di derivazione diretta
  dalle equazioni: è un raccordo tarato per dare continuità visiva e per atterrare sui parametri
  del remnant (punto 5), non un'evoluzione dinamica integrata.
- **Fase 3 — ringdown**: il buco nero risultante rilassa verso la configurazione Kerr stazionaria
  finale tramite un'oscillazione smorzata, descritta come sovrapposizione di modi quasi-normali
  (QNM, vedi punto 5).
- **Continuità come vincolo di design, non come derivazione fisica**: la posizione/velocità (o
  l'equivalente visivo) deve essere continua attraverso l'handoff (nessun salto visibile), ma
  questa continuità è imposta dal design del raccordo, non è una conseguenza automatica
  dell'integrare "la stessa fisica" oltre la soglia — perché oltre quella soglia la PN troncata
  non è più la fisica giusta da integrare, e nessun modello di waveform sostituisce direttamente
  una traiettoria/geometria che questo laboratorio deve comunque disegnare a schermo.

### 5. Massa, spin e recoil del remnant; ringdown

Al termine della fase di merger, il buco nero risultante ha proprietà stimate da **fit calibrati
su simulazioni di relatività numerica (NR)**, non derivate dall'integrazione PN del laboratorio:

- **Massa finale**: leggermente inferiore a `M1 + M2` (l'energia irradiata in onde gravitazionali
  durante l'intero processo, dominata dalla fase di merger, viene sottratta) — la frazione esatta
  dipende da `q` e dagli spin e va presa da un fit di letteratura, non inventata.
- **Spin finale**: combinazione non banale degli spin iniziali `χ1`, `χ2` e del momento angolare
  orbitale residuo al momento del merger; anche qui da un fit calibrato su NR.
- **Velocità di rinculo (recoil "kick")**: il remnant può ricevere una velocità di rinculo per
  emissione asimmetrica di momento lineare nelle onde gravitazionali, tipicamente piccola per
  configurazioni simmetriche (mass-ratio ≈1, spin allineati o nulli) e potenzialmente grande per
  configurazioni asimmetriche — l'effetto **"superkick"** più estremo emerge specificamente da
  spin **disallineati/anti-allineati** di grande magnitudine, un caso reale e ben documentato in
  letteratura NR ma **esplicitamente fuori dall'MVP** di questo laboratorio (vedi "Scope
  dell'MVP" al punto 2): con spin nulli o allineati (MVP), il recoil atteso è piccolo o nullo per
  simmetria, e il superkick vero e proprio è una funzionalità di una fase successiva.
- **Due modelli surrogati NR distinti, da non confondere**: **NRSur7dq4** (Varma, Field,
  Scheel, Blackman, Chen, Boyle, Pfeiffer, Kidder & Pürrer, Phys. Rev. Research 1, 033015, 2019,
  DOI 10.1103/PhysRevResearch.1.033015) è un surrogato della **forma d'onda gravitazionale**, del
  **frame di precessione** (l'orientazione nel tempo del sistema orbitale-più-spin, una descrizione
  geometrica astratta usata per ricostruire i modi `h_lm`) e dell'**evoluzione degli spin** (spin
  precessing generico, `q ≤ 4` nella convenzione `q = M1/M2 ≥ 1`, spin `|χ| ≤ 0.8`, comincia circa
  20 orbite prima del merger, include i modi `l ≤ 4`). **Non è un surrogato di traiettorie o
  posizioni dei due orizzonti**: "frame di precessione" e "modi della forma d'onda" non sono
  coordinate spaziali dei due buchi neri, e chiamarlo genericamente surrogato dell'"intera
  dinamica" rischierebbe di far pensare il contrario — coerente con il punto 4 (IMRPhenom/nessun
  modello di waveform fornisce geometria/traiettoria). Per questo laboratorio è comunque più pesante
  e più informazione di quanta serva solo per il remnant. **NRSur7dq4Remnant** è un modello
  **separato**, dedicato
  esclusivamente a massa/spin/velocità di rinculo del remnant per binari con spin generico fino a
  `q ≤ 4`, valutabile via il pacchetto Python `surfinBH`, con un'accuratezza migliorata di un
  ordine di grandezza rispetto ai fit precedenti per questo scopo specifico — è il modello giusto
  da citare quando serve *solo* il remnant, non l'intera dinamica. In alternativa, per un percorso
  implementativo più leggero **e già allineato con lo scope dell'MVP** (spin nulli o allineati):
  le **formule di fitting di Healy, Lousto & Zlochower** (Phys. Rev. D 90, 104004, 2014, DOI
  10.1103/PhysRevD.90.104004) sono calibrate specificamente su binari a **spin allineati o
  anti-allineati** (36 simulazioni), polinomiali nei parametri iniziali e più economiche da
  valutare in tempo reale in un browser — una scelta naturale per l'MVP, con l'upgrade a
  NRSur7dq4Remnant come lavoro di una fase successiva quando si aggiungerà il supporto a spin
  generici. La scelta finale fra le due è comunque un trade-off esplicito da risolvere in sviluppo
  (vedi "Rischi noti e domande aperte"), non deciso in questo documento.
- **Ringdown come sovrapposizione di QNM**: il rilassamento del remnant verso Kerr stazionario è
  modellato come somma di modi quasi-normali smorzati (dominato dal modo fondamentale `l=2, m=2`,
  eventualmente con overtones), le cui frequenze e tempi di smorzamento dipendono solo da massa e
  spin finali del remnant (proprietà nota della perturbazione di Kerr: lo spettro QNM è
  determinato univocamente da massa e spin, non dalla storia del merger). Riferimento concettuale
  per le formule di fit delle frequenze/tempi di smorzamento QNM: la letteratura di fitting per
  perturbazioni di Kerr (es. la rassegna di Berti, Cardoso & Starinets). **Anche qui, nessun
  coefficiente/frequenza esatta è riportato in questo documento**: da verificare in sviluppo.

### 6. Corpi-test e sistema circumbinario

Oltre ai due buchi neri massivi, il laboratorio deve supportare corpi di prova (massa
trascurabile: sentono il campo del binario ma non contribuiscono forza su di esso, coerente col
concetto di "corpo-test" già usato concettualmente nel Playground per comete/detriti):

- **Corpi-test circumbinari**: orbitano l'intero sistema da una distanza grande rispetto alla
  separazione binaria — la zona rilevante per la **stabilità circumbinaria** (un corpo troppo
  vicino al binario, anche se nominalmente "esterno" a entrambi, può essere instabile per
  perturbazione periodica del binario stesso; la letteratura classica sulla stabilità di orbite
  circumbinarie, es. i risultati empirici di tipo Holman & Wiegert 1999 su sistemi binari
  stazionari, dà un'intuizione qualitativa della zona di instabilità anche se qui il "binario" è
  relativistico e in decadimento anziché stazionario — l'analogia è concettuale, non un numero da
  riusare direttamente).
- **Corpi-test vicini**: possono essere posizionati più vicino, anche vicino a uno dei due
  orizzonti durante la fase di inspiral (quando i due buchi neri sono ancora ben separati, ognuno
  ha localmente una regione simil-ISCO propria) — questi corpi sono attesi instabili/rapidamente
  espulsi o inghiottiti man mano che ci si avvicina al merger, e questo è un comportamento fisico
  atteso, non un bug da correggere.
- **Trattamento del campo sentito dai corpi-test**: nella fase di inspiral, il campo è
  l'espansione PN multipolare del binario trattata come campo esterno dipendente dal tempo (niente
  backreazione); durante merger/ringdown, il corpo-test sente il campo (approssimato) del remnant
  in formazione. Non si pretende di integrare geodetiche esatte in uno spaziotempo binario dinamico
  (problema di ricerca aperto in relatività numerica) — è un'approssimazione dichiarata, coerente
  con il punto 7.
- **Conservazione approssimata**: la massa totale del sistema (usata per il campo sentito dai
  corpi-test) diminuisce leggermente per emissione di onde gravitazionali nel tempo; l'effetto è
  piccolo tranne che a ridosso del merger, ma va tenuto presente nel bookkeeping (specialmente per
  i test di conservazione, vedi "Piano di test/verifica").

### 7. Nessuna pretesa di ray-tracing esatto della metrica binaria

A differenza del Kerr singolo (dove esiste una metrica analitica esatta e il renderer attuale
raymarcha quella soluzione chiusa), **non esiste una soluzione analitica chiusa nota per la
metrica di due buchi neri in orbita** (il problema dei due corpi in relatività generale non ha
soluzione esatta in forma chiusa per una configurazione dinamica interagente; le uniche soluzioni
esatte a due corpi note in letteratura sono casi molto specifici e non dinamici/realistici per
questo scopo). Di conseguenza:

- Qualunque visualizzazione di disco, lente gravitazionale o distorsione dell'immagine di sfondo
  per questo laboratorio sarà **un'approssimazione stilizzata**, costruita per essere visivamente
  plausibile e didatticamente onesta (due sagome distinte che si distorcono/oscurano l'un l'altra
  in modo qualitativamente corretto: ombra doppia, lente approssimata per sovrapposizione/blending
  attorno a ciascun buco nero preso singolarmente, transizione visiva verso un'ombra singola al
  momento del merger) — **mai spacciata per lensing fisicamente esatto della metrica binaria**.
- Il testo di accompagnamento del laboratorio (pagina "about"/FAQ, sul modello di quanto già
  esiste per il Kerr singolo) deve dichiarare esplicitamente questo limite, così come già fatto
  nel simulatore attuale per altri limiti di fedeltà.
- Questo vincolo è anche il motivo architetturale principale per un renderer separato (vedi sotto):
  il renderer Kerr singolo raymarcha una formula chiusa; questo laboratorio, non avendone una,
  userà tecniche di rendering diverse per natura (non solo parametri diversi sullo stesso shader).

## Dominio di validità

Sezione dedicata: cosa il modello **non** cattura, onestamente, e cosa succede se l'utente spinge
i parametri fuori dal range calibrato.

**Principio generale, non negoziabile: fuori dal dominio calibrato di un fit, il laboratorio
rifiuta esplicitamente o mostra un warning esplicito — MAI un clamp silenzioso.** Se i parametri
dell'utente escono dal range di un fit (`q`, spin, o qualunque combinazione), l'implementazione
NON deve riportare silenziosamente i parametri al bordo del range calibrato e continuare a
mostrare un numero come se fosse affidabile (un "clamp" invisibile produce un risultato che
*sembra* preciso ma non lo è, il peggior caso possibile per uno strumento didattico che si
dichiara onesto sui propri limiti). Il comportamento richiesto è uno dei due, esplicito e visibile
all'utente: **(a)** un warning in UI che dichiara "fuori dal range calibrato, risultato non
affidabile" mostrando comunque il numero grezzo del fit (con l'avviso ben visibile, non un
tooltip nascosto), oppure **(b)** il rifiuto di calcolare/mostrare quel numero (es. sostituendo il
readout con "non disponibile fuori range" invece di un valore numerico). Quale delle due scelte
adottare per quale grandezza è una decisione di UX non presa in questo documento, ma il "clamp
silenzioso senza segnalazione" è escluso a priori.

- **Rapporto di massa `q` estremo**: i surrogate NR più completi (es. NRSur7dq4/NRSur7dq4Remnant)
  sono calibrati tipicamente fino a `q` dell'ordine di 4 (nella loro convenzione `q ≥ 1`, vedi
  punto 1); le formule di fitting polinomiali per massa/spin/kick del remnant (tipo Healy, Lousto
  & Zlochower) coprono in genere un intervallo più ampio ma con incertezza sistematica crescente
  man mano che ci si allontana dal range in cui sono state calibrate. Al limite di mass-ratio
  estremo (una massa trascurabile rispetto all'altra) il problema tende al regime di perturbazione
  di un test-mass attorno a un buco nero singolo, un regime concettualmente diverso da quello per
  cui i fit NR di questo laboratorio sono stati pensati. **Comportamento previsto se l'utente
  spinge `q` oltre il range calibrato**: rifiuto/warning esplicito come da principio generale
  sopra, mai un clamp silenzioso; la soglia esatta dipende dal fit scelto in sviluppo.
- **Spin estremo (`|χ|` vicino a 1 per uno o entrambi i buchi neri)**: sia i termini PN
  spin-orbita troncati sia i fit NR del remnant sono meno bene campionati/più incerti vicino allo
  spin estremale; inoltre a spin alto i termini di ordine PN superiore (fuori scope, vedi punto 2)
  diventano relativamente più importanti rispetto al caso non rotante, quindi la troncatura scelta
  qui è meno accurata proprio nel regime a spin alto. Da comunicare in UI, non da nascondere.
- **Separazioni troppo strette per la PN troncata**: per costruzione (vedi punto 4), l'inspiral PN
  è valido solo finché il parametro di espansione resta piccolo; oltre la soglia di handoff la PN
  troncata **non deve essere estrapolata** — è esattamente per questo che esiste l'handoff
  fenomenologico. Un rischio di implementazione è la tentazione di "spingere un po' oltre" la PN
  per semplicità: va evitato, la soglia di handoff è un vincolo di validità fisica, non solo un
  dettaglio implementativo.
- **Eccentricità iniziale elevata**: il termine di radiation reaction di Peters copre
  esplicitamente l'evoluzione dell'eccentricità, ma i template di merger fenomenologico in stile
  IMRPhenom più diffusi in letteratura sono calibrati primariamente su binari quasi-circolari;
  binari fortemente eccentrici fino a ridosso del merger sono un caso meno coperto e vanno o
  ristretti (forzare/assumere circolarizzazione sostanziale prima dell'handoff, un effetto reale
  di Peters ma qui usato come semplificazione dichiarata) o segnalati come fedeltà ridotta.
- **Nessuna pretesa di accuratezza osservativa**: anche nel range "ben calibrato", questo non è
  uno strumento di stima di parametri da dati reali (vedi Non-goals) — è un laboratorio didattico.
- **Nessun ray-tracing esatto** (ripreso dal punto 7): qualunque disco/lente disegnati sono
  stilizzati, mai una soluzione esatta.
- **Costo computazionale dei fit del remnant in tempo reale**: un surrogato NR completo come
  NRSur7dq4 è pensato per generazione offline di forme d'onda/dinamica, con un costo di
  valutazione non necessariamente compatibile con un frame budget da browser a 60fps; questo è
  un vincolo di dominio pratico (non solo teorico) che può forzare la scelta verso fit polinomiali
  più leggeri per l'uso interattivo, con l'incertezza sistematica che questo comporta (vedi
  "Rischi noti e domande aperte").

## Core numerico condivisibile

Questa sezione riguarda solo la parte di calcolo (integrazione N-corpi, forma dell'interfaccia di
forza/potenziale) pensata per essere potenzialmente condivisa fra laboratori diversi. Il modello
fisico specifico di QUESTO laboratorio (PN, radiation reaction, handoff di merger, fit del
remnant) resta descritto in "Modello fisico" sopra; il modo in cui questo laboratorio viene
disegnato a schermo è descritto separatamente in "Rendering" più sotto — le tre cose non vanno
mescolate nell'implementazione futura.

### Interfaccia di potenziale/forza condivisa (bozza — solo firme, nessuna logica)

Bozza di un'interfaccia comune framework-agnostica (nessuna dipendenza da React/R3F, nessuna
dipendenza da three.js o da altra libreria di rendering) per un modello di forza/potenziale usato
da un integratore N-corpi. È **un'interfaccia per lavoro futuro**: descrive una forma condivisa
fra questo laboratorio, il laboratorio "Tre Corpi" e (retroattivamente, solo come confronto
concettuale) il caso già esistente nel Playground — **non è un refactor da fare ora**, e
`playground-physics.ts` non viene toccato né reso conforme a questa interfaccia in questo lavoro.

```ts
// Vettore minimale, strutturale — deliberatamente NON three.js/THREE.Vector3, così l'interfaccia
// resta testabile senza alcuna dipendenza di rendering. Un'implementazione concreta è libera di
// usare THREE.Vector3 (o altro) internamente.
export type Vec3 = { x: number; y: number; z: number };

// Stato di un corpo massivo in un dato istante — snapshot immutabile passato al modello.
export interface BodyState {
  readonly id: number;
  readonly mass: number;
  readonly position: Vec3;
  readonly velocity: Vec3;
  // Spin adimensionale (parametro di Kerr, |spin| <= 1), rilevante solo per modelli che lo usano.
  readonly spin?: Vec3;
}

// Forma comune: dato lo stato di un insieme di corpi massivi (e un istante t, per modelli
// non-autonomi come una fase di merger dipendente dal tempo), restituisce l'accelerazione
// sentita da ciascun corpo. Contratto kick-drift-kick: `bodies` è uno snapshot immutabile,
// l'implementazione non lo muta e non assume un ordine particolare nell'array (l'ordine
// canonico di accumulo, se rilevante, è responsabilità dell'implementazione, non dell'interfaccia).
export interface PotentialModel {
  readonly id: string; // identità leggibile per diagnostica/UI, es. "single-schwarzschild-pw"
  accelerationsFor(bodies: readonly BodyState[], t: number): Vec3[];
  // Accelerazione sentita da un corpo-test a massa trascurabile sotto lo stesso campo,
  // SENZA che il corpo-test contribuisca forza sui corpi massivi (niente backreazione).
  accelerationOnTestBody?(
    testPosition: Vec3,
    testVelocity: Vec3,
    bodies: readonly BodyState[],
    t: number,
  ): Vec3;
}

// Il caso GIÀ esistente nel Playground attuale (Paczyński-Wiita, singolo buco nero fisso
// all'origine, GM e raggio di Schwarzschild fissi). Qui espresso solo per dargli un nome/una
// forma comparabile — playground-physics.ts NON viene rifattorizzato per implementarlo davvero.
export interface SingleBlackHolePotential extends PotentialModel {
  readonly kind: "single-black-hole";
  readonly schwarzschildRadius: number; // r_s, buco nero fisso all'origine
  readonly gm: number; // G*M in unità del simulatore
}

// Nuovo, per questo laboratorio: due masse in dinamica reciproca, nessun corpo fisso.
export interface PostNewtonianBinaryPotential extends PotentialModel {
  readonly kind: "pn-binary";
  readonly mass1: number;
  readonly mass2: number;
  readonly massRatio: number; // q = mass2 / mass1
  // Ordini PN abilitati per QUESTA istanza — non tutti gli ordini sono sempre attivi
  // (es. termini di spin-orbita spenti se gli spin sono nulli/disabilitati in UI).
  readonly enabledOrders: readonly ("1PN" | "1.5PN-spin-orbit" | "2.5PN-radiation-reaction")[];
  // Fase corrente del ciclo di vita dichiarato (vedi Modello fisico, punto 4) — determina quale
  // legge di forza/raccordo fenomenologico è in vigore in un dato istante.
  readonly phase: "inspiral" | "merger" | "ringdown";
}

// Nuovo, per il laboratorio "Tre Corpi" (docs/three-body-lab.md): N corpi comparabili, NESSUN
// potenziale centrale fisso — puro N-corpi newtoniano/relativistico a seconda delle scelte di
// quel documento. Incluso qui solo per mostrare la forma condivisa fra i tre nomi richiesti;
// i dettagli restano di competenza dell'altro documento.
export interface NewtonianNBodyPotential extends PotentialModel {
  readonly kind: "newtonian-n-body";
}
```

Nota di design: le tre interfacce condividono `PotentialModel` (stessa forma:
`accelerationsFor(stato dei corpi, tempo) → accelerazioni`), il che rende in linea di principio
intercambiabile l'integratore che le consuma — ma questo documento non impegna a un integratore
condiviso concreto: descrive solo la forma, non un'implementazione.

### Perché questo NON è un'estensione di playground-physics.ts

`playground-physics.ts` oggi implementa, di fatto, esattamente il caso `SingleBlackHolePotential`
sopra descritto (Paczyński-Wiita, un solo buco nero fisso all'origine), più: gerarchia
pianeta-luna via sfere di Hill, raggio mareale da densità, disruzione TDE con stream di detriti,
integratore leapfrog kick-drift-kick con accumulator a step fisso. Tutta questa logica è
specificamente pensata per **un corpo centrale fisso e dominante**: le sfere di Hill sono
calcolate rispetto a quel corpo fisso, la nozione di "doomed" (corpo troppo vicino all'orizzonte,
escluso dalla somma N-corpi mutua) assume che esista un orizzonte fisso e unico. Nessuna di queste
assunzioni regge per un binario in dinamica reciproca (non c'è un corpo fisso, ci sono due
orizzonti che si muovono e alla fine si fondono in uno). Estendere `playground-physics.ts` per
coprire anche il caso binario significherebbe innestare in un modulo pensato per un caso
fisicamente diverso una fisica (PN, radiation reaction, handoff di merger, fit NR del remnant) che
non gli appartiene concettualmente. La scelta di design è quindi tenere i due motori separati:
`playground-physics.ts` resta il motore pseudo-newtoniano a singolo corpo centrale, invariato;
questo laboratorio avrà un proprio modulo di fisica (nome indicativo, da decidere in
implementazione, es. `components/lab/black-hole/binary-physics.ts`), che può **riprendere il
pattern architetturale di alto livello** dell'accumulator a step fisso del Playground (consumare
un `SIM_DT` di tempo simulato per chiamata, disaccoppiato dal frame rate) e la disciplina di
verifica per simmetrie/conservazione — **ma non il suo integratore leapfrog kick-drift-kick**, per
i motivi spiegati nella sotto-sezione seguente. L'accumulator a step fisso e la scelta interna
dell'integratore sono due cose distinte: il primo dice quanto tempo simulato avanzare per
chiamata, il secondo dice *come* — restano compatibili anche se il "come" è un integratore diverso
dal KDK del Playground.

### Integratore: perché non il KDK newtoniano del Playground

Il KDK del Playground è simplettico e appropriato per il suo caso: forze puramente posizionali
(dipendenti solo da `r`, non da `v`) e conservative (nessuna dissipazione). **Il caso binario non
soddisfa nessuna delle due condizioni**: il termine 1.5PN spin-orbita (e, in generale, i termini
PN oltre l'ordine dominante) dipende anche dalla velocità `v`, non solo dalla posizione, e il
termine 2.5PN è per costruzione **dissipativo** (non-Hamiltoniano: toglie energia al sistema per
costruzione, non per errore numerico). Un KDK applicato ingenuamente a forze dipendenti dalla
velocità richiede un trattamento implicito/iterativo per restare accurato al second'ordine
(altrimenti degrada silenziosamente a un ordine di accuratezza inferiore senza dare alcun
avviso); inoltre le proprietà di conservazione dell'energia "gratuite" di un integratore
simplettico non sono comunque la proprietà rilevante da preservare qui, dato che un sistema PN con
radiation reaction *non* conserva l'energia per costruzione (vedi "Piano di test/verifica
proposto": il test corretto per questo laboratorio è che l'energia orbitale *decada* in modo
monotono in senso secolare, non che si conservi). Riusare senza modifiche il KDK del Playground
per questo laboratorio sarebbe quindi un errore numerico, non solo una scelta architetturale
diversa.

Scelta di design per questo laboratorio:

- **MVP**: un integratore Runge-Kutta esplicito a **passo adattivo** (es. Dormand-Prince RK45, una
  scelta standard e ben verificata in letteratura numerica per equazioni differenziali con termini
  dipendenti dalla velocità e/o dissipativi, ampiamente usata anche in dinamica orbitale
  perturbata) — il passo si riduce automaticamente quando la dinamica cambia rapidamente (es.
  vicino alla soglia di handoff), senza richiedere alcuna proprietà simplettica che comunque non
  si applicherebbe a un sistema dissipativo come questo.
- **Percorso alternativo/successivo**: un integratore PN dedicato e verificato contro la
  letteratura di dinamica di sistemi compatti (schemi numerici specifici per equazioni PN sono un
  argomento a sé nella letteratura di relatività numerica) — da valutare in sviluppo se il costo
  computazionale dell'RK adattivo risultasse un problema per un frame budget da browser, non
  deciso qui.
- **In ogni caso**, un modulo di fisica proprio (`binary-physics.ts`), con un proprio integratore
  interno — mai il KDK di `playground-physics.ts` riusato senza modifiche per questo caso.

## Rendering

Sezione separata dal core numerico e dal modello fisico: qui si parla solo di come il laboratorio
viene disegnato a schermo, non di come viene calcolato.

### Perché un renderer separato dal Kerr singolo

Il rendering di questo laboratorio richiede un componente/scena nuovo e distinto da
`black-hole-scene.tsx`, non un parametro aggiuntivo sullo shader esistente, per motivi strutturali
e non solo di comodità implementativa:

- **Nessuna formula chiusa da raymarciare** (punto 7): il renderer Kerr singolo raymarcha una
  metrica analitica esatta; questo laboratorio non ne ha una, quindi la tecnica di rendering è
  necessariamente diversa (approssimazione stilizzata per-corpo con blending, non un'unica
  formula parametrica).
- **Doppio orizzonte**: due sagome/ombre distinte durante l'inspiral, che si avvicinano,
  si distorcono a vicenda e alla fine si fondono topologicamente in una sola all'atto del merger —
  una geometria intrinsecamente diversa da un singolo orizzonte Kerr con spin variabile.
- **Disco circumbinario vs. disco singolo**: un disco di accrescimento attorno a un binario stretto
  tende a strutturarsi come disco circumbinario esterno (con una cavità centrale scavata dal
  binario) più eventuali mini-dischi individuali attorno a ciascun buco nero nelle fasi meno
  strette — una topologia del tutto diversa dal disco sottile assialsimmetrico attorno a un unico
  buco nero già modellato in `black-hole-shader.ts`/`black-hole-wgsl.ts`.
- **Geometria di fusione**: la transizione visiva da "due ombre" a "un'ombra" nel momento del
  merger è un evento non stazionario che richiede una tecnica di rendering dedicata (es. blend/
  morph procedurale fra le due sagome), non rappresentabile come un semplice cambio di parametro
  in uno shader pensato per una configurazione stazionaria singola.
- **UI/camera dedicate**: framing che deve includere entrambi i buchi neri più l'eventuale zona
  circumbinaria, diverso dalla logica di camera del Playground/Kerr singolo attuale.

Route, cartella componenti, i18n IT/EN e voce nell'indice Lab sono ora fissati in "Architettura di
prodotto e route" (sopra) — non più una decisione rimandata allo sprint di implementazione.

## Corpi-test, sistema circumbinario e interazione con l'interfaccia utente

Dal punto di vista dell'esperienza utente (senza impegnarsi a un mockup, solo ai concetti):

- Parametri esposti in UI, presumibilmente per slider/preset: `q` (rapporto di massa), spin
  adimensionali `χ1`/`χ2` (magnitudine e, se supportato, orientazione), separazione iniziale,
  eccentricità iniziale (con l'avviso di fedeltà ridotta discusso in "Dominio di validità" se
  spinta oltre un certo valore).
- Preset didattici plausibili: binario simmetrico quasi-circolare (`q≈1`, spin nulli) come caso
  "da manuale"; binario asimmetrico con spin disallineati per mostrare un rinculo del remnant
  significativo ("kick dimostrativo"); binario con un corpo-test circumbinario per illustrare la
  stabilità di un'orbita esterna durante l'intero inspiral-merger.
- Indicatori diagnostici in stile `?bhDebug=1` del Playground attuale: fase corrente
  (inspiral/merger/ringdown), separazione, energia/momento angolare orbitale residui, massa/spin/
  velocità di rinculo stimati del remnant, eventuali avvisi "fuori dominio di validità" (vedi
  sopra) quando l'utente spinge `q` o gli spin oltre il range calibrato.
- I corpi-test (circumbinari o vicini) sono un elemento interattivo diretto: l'utente li piazza e
  osserva se restano legati (zona circumbinaria stabile) o vengono espulsi/assorbiti (zona vicina
  instabile, specialmente a ridosso del merger) — coerente con l'uso già fatto nel Playground di
  corpi/comete come sonde intuitive della dinamica sottostante, senza richiedere che l'utente
  legga equazioni.

## Piano di test/verifica proposto

Non eseguito in questo documento: solo la progettazione degli scenari da testare quando
l'implementazione inizierà, nello stile di rigore già applicato all'audit del Playground
(simmetrie, conservazione, indipendenza dall'ordine, no NaN/blocchi).

- **Limite newtoniano**: con tutti i termini PN e di spin disattivati, `PostNewtonianBinaryPotential`
  deve ridursi al problema kepleriano a due corpi puro (orbita ellittica chiusa, nessuna
  precessione, nessun decadimento) — confronto contro la soluzione kepleriana nota, non contro un
  numero inventato.
- **Precessione 1PN, verifica di segno/ordine di grandezza**: in una configurazione di test,
  misurare la precessione del periastro per orbita e verificare che sia nella direzione attesa e
  che scali in modo monotono con i parametri (cresce a separazione minore, a masse maggiori) —
  senza pretendere di validare qui il coefficiente esatto (quello va confrontato con la
  letteratura in sviluppo).
- **Direzione della radiation reaction — decadimento SECOLARE, non campione per campione**: con il
  termine 2.5PN attivo e i termini conservativi 1PN/1.5PN eventualmente attivi insieme,
  l'energia/momento angolare orbitale **calcolati con la formula newtoniana** non sono la quantità
  esattamente conservata del sistema PN completo (le correzioni conservative introducono le loro
  proprie correzioni alla definizione di energia/momento angolare "vera"), quindi possono oscillare
  entro una singola orbita anche senza alcun errore di implementazione — testare la monotonia
  campione per campione di quella formula sarebbe un test troppo severo e potenzialmente un falso
  negativo. Il test corretto è sul **decadimento secolare**: la media orbitale (o il valore
  campionato a ogni passaggio al periastro, periastro-su-periastro) di energia e momento angolare
  orbitale deve essere monotonamente decrescente nel tempo, e il tasso di decadimento secolare deve
  aumentare man mano che la separazione media si riduce — verifica di direzione/monotonia
  sull'andamento mediato, non sul singolo campione, e non di coefficiente esatto.
- **Conservazione in regime conservativo**: con la radiation reaction disattivata, energia e
  momento angolare orbitale totali devono restare costanti entro una tolleranza numerica dichiarata
  su molte orbite/passaggi al periastro — stesso stile del test di deriva energetica già superato
  dal Playground (soglia numerica esatta da fissare in sviluppo, non ancora misurata qui).
- **Simmetria per scambio delle etichette**: scambiare le etichette dei due buchi neri
  (`1↔2`, quindi `q ↔ 1/q` con spin e posizioni corrispondentemente scambiati) deve produrre
  un'orbita fisicamente equivalente (a meno di riflessione/rietichettatura) — verifica che nessuna
  parte del codice tratti "corpo 1" come implicitamente privilegiato.
- **Indipendenza dall'ordine**: per i corpi-test e per qualunque accumulo che coinvolga più di due
  entità (es. più corpi-test simultanei), il risultato non deve dipendere dall'ordine di iterazione
  dell'array — stesso principio già verificato bit-esatto nel Playground per l'N-corpi mutuo.
- **Continuità all'handoff**: al passaggio inspiral → merger, la configurazione (posizione
  equivalente, o la grandezza scelta per rappresentare "dove sono i due buchi neri" in quella fase)
  non deve presentare discontinuità visibili oltre una tolleranza dichiarata — un vincolo di design
  imposto (punto 4), verificabile numericamente confrontando lo stato appena prima e appena dopo
  la soglia di handoff.
- **Nessun NaN/blocco in condizioni estreme**: rapporti di massa estremi, spin vicini a 1,
  separazioni iniziali molto strette — il sistema deve restare numericamente stabile (nessun NaN,
  nessun blocco) per una durata simulata fissata, anche quando i risultati sono segnalati come
  "fuori dominio di validità" in UI — stesso principio del test "24 corpi/60s senza NaN" già
  superato dal Playground, qui applicato ai parametri specifici del binario.
- **Kick nullo per simmetria**: in una configurazione perfettamente simmetrica (mass-ratio 1, spin
  nulli o identici e allineati), la velocità di rinculo stimata del remnant deve risultare nulla
  (o trascurabile entro tolleranza numerica) per costruzione della simmetria — un controllo di
  corretto wiring della formula di fit, non solo di correttezza del fit in sé.
- **Bound di Kerr sullo spin finale — due test distinti, dentro e fuori dal dominio calibrato**:
  - **Dentro il dominio calibrato**: per qualunque combinazione di parametri iniziali **entro** il
    range calibrato del fit scelto (inclusi i punti vicini al bordo, ma comunque dentro), lo spin
    adimensionale del remnant **effettivamente restituito dal fit** non deve mai superare
    `|spin| = 1` (il limite fisico di un buco nero di Kerr) — un controllo diretto sul valore
    numerico prodotto dal fit in condizioni di uso legittimo.
  - **Fuori dal dominio calibrato**: qui il test **non verifica più il valore restituito dal
    fit** (perché, per il principio generale dichiarato in "Dominio di validità", fuori dal
    dominio calibrato il laboratorio non deve produrre né mostrare un numero come se fosse
    affidabile). Il test verifica invece che scatti il **rifiuto/warning esplicito richiesto**, e
    che **nessuna estrapolazione silenziosa** venga calcolata o mostrata — è un rischio concreto
    perché i fit polinomiali (tipo Healy, Lousto & Zlochower) sono espressioni chiuse che
    possono essere *valutate* matematicamente anche fuori dal range in cui sono stati calibrati
    (nulla in una formula polinomiale lo impedisce), quindi il test deve verificare che
    l'implementazione **rifiuti di usare** quel valore estrapolato, non che il valore stesso
    risulti per caso `|spin| ≤ 1`.
- **Decadimento del ringdown — inviluppo di ciascun modo, non della somma**: la sovrapposizione di
  più modi quasi-normali con frequenze/tempi di smorzamento diversi (es. il fondamentale `l=2,m=2`
  più eventuali overtones o altri `l,m`) può produrre, nella loro **somma**, un inviluppo NON
  monotono per interferenza/battimento fra modi a frequenza diversa — anche se ciascun modo preso
  singolarmente decade in modo puramente esponenziale. Testare la monotonia dell'ampiezza della
  somma sarebbe quindi un test fisicamente sbagliato (rischio di falso negativo su un battimento
  fisiologico). Il test corretto è: **l'inviluppo di ciascun singolo modo QNM** (ampiezza
  moltiplicata per `exp(t/τ)` con `τ` il suo tempo di smorzamento, cioè il residuo dopo aver
  fattorizzato via il decadimento atteso di quel modo) deve restare costante entro tolleranza per
  quel modo isolato, e l'ampiezza di ciascun modo prima di quella fattorizzazione deve decrescere
  monotonicamente — nessun modo, preso singolarmente, deve mai crescere, coerente con la stabilità
  nota della soluzione di Kerr risultante.
- **Stabilità circumbinaria qualitativa**: un corpo-test circumbinario collocato a distanza
  "sicura" (secondo l'intuizione della letteratura su binari stazionari, vedi punto 6) deve restare
  legato per molti periodi orbitali del binario durante l'inspiral, mentre un corpo-test collocato
  deliberatamente in una zona nota per essere instabile deve mostrare comportamento
  caotico/espulsione entro un tempo simulato ragionevole — verifica qualitativa di plausibilità,
  non una derivazione della soglia di stabilità in questo documento.

## Rischi noti e domande aperte

- **Costo in tempo reale dei fit/surrogate NR del remnant**: un surrogato completo come NRSur7dq4
  è pensato per generazione offline, non necessariamente per un frame budget da browser; se il
  costo risultasse incompatibile, la scelta ricadrebbe su formule di fitting polinomiali più
  leggere (tipo Healy/Lousto) con maggiore incertezza sistematica dichiarata — trade-off da
  risolvere in sviluppo, non deciso qui.
- **Soglia esatta di handoff inspiral→merger**: la variabile del criterio è già decisa (`x =
  (G·M·Ω/c³)^(2/3)`, o equivalentemente la frequenza orbitale — vedi punto 4 del Modello fisico);
  resta aperto **solo il valore numerico** della soglia (a quale `x` scattare l'handoff), non il
  criterio stesso — separazione, velocità relativa o un analogo dell'ISCO combinato **non** sono
  alternative da riconsiderare, sono state scartate a favore di `x`/frequenza orbitale proprio
  perché meno robuste al variare di masse/spin (vedi punto 4). Il valore numerico deve essere
  scelto per dare continuità visiva ragionevole in tutto il range di `q`/spin supportati, non solo
  nel caso simmetrico più semplice.
- **Supporto a eccentricità elevata fino al merger**: come gestire onestamente il caso in cui
  l'utente parte da un'orbita molto eccentrica e la spinge fino alla soglia di handoff, dato che i
  template di merger più diffusi assumono quasi-circolarità — restringere l'eccentricità
  ammissibile in prossimità dell'handoff, o accettare fedeltà ridotta dichiarata, è una scelta
  aperta.
- **Unità e convenzioni numeriche**: se riprendere la convenzione del Kerr singolo/Playground
  (`r_s = 1`, `G = c = 1`) estesa a due masse, o un'altra convenzione più comoda per esprimere `q`
  e le masse separatamente — decisione di implementazione, non risolta qui.
- **Copertura del range di `q` e spin dai fit scelti**: una volta scelta la libreria di fit
  concreta (surrogato vs. polinomiale), va determinato esattamente il range calibrato e il
  comportamento dichiarato dell'interfaccia utente quando l'utente lo supera (vedi "Dominio di
  validità") — i numeri esatti di questi range vanno presi dalla documentazione del fit scelto,
  non stimati qui.
- **Rappresentazione visiva onesta della fase di merger**: quanto "stilizzata" rendere la
  transizione fra due ombre e una sola, mantenendo la dichiarazione esplicita di non-esattezza
  (punto 7) senza però risultare visivamente povera rispetto alla qualità del Kerr singolo — un
  bilanciamento di design non risolto in questo documento.
- **Relazione con il laboratorio "Tre Corpi"**: se e quanto dell'integratore/accumulator/pattern
  di verifica sviluppati per questo laboratorio binario debbano essere effettivamente condivisi
  (non solo concettualmente affini) con `docs/three-body-lab.md` è una decisione di sequenziamento
  implementativo, non presa qui.

## Riferimenti concettuali

Nomi/attribuzioni reali, nessun coefficiente numerico inventato — tutti i dettagli quantitativi
citati sopra come "da verificare in sviluppo" vanno confrontati con queste fonti (o con la
letteratura da esse derivata) al momento dell'implementazione:

- **Peters, P.C. (1964)**, "Gravitational Radiation and the Motion of Two Point Masses", *Physical
  Review* 136, B1224–B1232. DOI: [10.1103/PhysRev.136.B1224](https://doi.org/10.1103/PhysRev.136.B1224).
  Decadimento orbitale per emissione di onde gravitazionali di un sistema di due masse puntiformi;
  riferimento concettuale per il termine dissipativo 2.5PN e per la scala di coalescenza (punto 3).
- **Formalismo post-newtoniano per binarie compatte** — Blanchet, L. (2014), "Gravitational
  Radiation from Post-Newtonian Sources and Inspiralling Compact Binaries", *Living Reviews in
  Relativity* 17, 2. DOI: [10.12942/lrr-2014-2](https://doi.org/10.12942/lrr-2014-2). Rassegna di
  riferimento per i termini 1PN conservativi e 1.5PN di accoppiamento spin-orbita (punto 2);
  nessun coefficiente specifico è riportato in questo documento.
- **Famiglia IMRPhenom (PhenomD)** — Khan, S., Husa, S., Hannam, M., Ohme, F., Pürrer, M., Jiménez
  Forteza, X. & Bohé, A. (2016), "Frequency-domain gravitational waves from non-precessing
  black-hole binaries. II. A phenomenological model for the advanced detector era", *Physical
  Review D* 93, 044007. DOI: [10.1103/PhysRevD.93.044007](https://doi.org/10.1103/PhysRevD.93.044007)
  (con l'articolo compagno Husa et al., Phys. Rev. D 93, 044006, 2016). Modello fenomenologico
  della **forma d'onda** inspiral-merger-ringdown calibrato su relatività numerica — riferimento
  concettuale SOLO per lo spirito della struttura a fasi dell'handoff del punto 4, non fonte di
  dati di traiettoria/geometria (vedi il chiarimento esplicito al punto 4).
- **NRSur7dq4** (surrogato di forma d'onda/dinamica) — Varma, V., Field, S.E., Scheel, M.A.,
  Blackman, J., Chen, T., Boyle, M., Pfeiffer, H.P., Kidder, L.E. & Pürrer, M. (2019), "Surrogate
  models for precessing binary black hole simulations with unequal masses", *Physical Review
  Research* 1, 033015. DOI:
  [10.1103/PhysRevResearch.1.033015](https://doi.org/10.1103/PhysRevResearch.1.033015). Spin
  precessing generico, `q ≤ 4` (convenzione `q ≥ 1`), `|χ| ≤ 0.8`.
- **NRSur7dq4Remnant** (surrogato dedicato al SOLO remnant — DA NON confondere con NRSur7dq4
  sopra, vedi punto 5) — stesso gruppo (Varma et al.), distribuito nel pacchetto Python
  `surfinBH`; massa/spin/velocità di rinculo del remnant per binari con spin generico, `q ≤ 4`.
- **Fit di Healy, Lousto & Zlochower (2014)** — Healy, J., Lousto, C.O. & Zlochower, Y. (2014),
  "Remnant mass, spin, and recoil from spin aligned black-hole binaries", *Physical Review D* 90,
  104004. DOI: [10.1103/PhysRevD.90.104004](https://doi.org/10.1103/PhysRevD.90.104004). Formule
  di fitting polinomiali calibrate su 36 simulazioni a **spin allineati/anti-allineati** — la
  scelta naturale per l'MVP (vedi punto 5), alternativa più leggera al surrogato completo.
- **Letteratura sui modi quasi-normali (QNM) di Kerr** — Berti, E., Cardoso, V. & Starinets, A.O.
  (2009), "Quasinormal modes of black holes and black branes", *Classical and Quantum Gravity* 26,
  163001. DOI: [10.1088/0264-9381/26/16/163001](https://doi.org/10.1088/0264-9381/26/16/163001).
  Riferimento concettuale per il ringdown come sovrapposizione di modi smorzati (punto 5); nessuna
  frequenza/tempo di smorzamento esatto riportato qui.
- **Stabilità di orbite circumbinarie** — Holman, M.J. & Wiegert, P.A. (1999), "Long-Term
  Stability of Planets in Binary Systems", *The Astronomical Journal* 117, 621. DOI:
  [10.1086/300695](https://doi.org/10.1086/300695). Riferimento concettuale, non un numero da
  riusare direttamente, per l'intuizione sulla zona di stabilità circumbinaria (punto 6).
