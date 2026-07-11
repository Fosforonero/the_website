# Tre Corpi — laboratorio futuro (documento di design)

Documento di design per un nuovo laboratorio, **non implementato**: dinamica gravitazionale
classica a tre (e più) corpi, **senza buco nero centrale fisso**. Nessun codice funzionante è
incluso in questo documento: solo firme di interfaccia TypeScript (senza corpo/logica) per
descrivere una forma condivisa con lavori futuri, e la progettazione di un piano di test da
eseguire quando l'implementazione inizierà.

Questo documento non modifica, non estende e non generalizza
`components/lab/black-hole/playground-physics.ts` (il motore N-corpi pseudo-newtoniano del
Playground attuale, singolo buco nero fisso all'origine). Quel modulo resta esattamente com'è. Il
laboratorio qui descritto riusa alcuni **pattern architetturali** del Playground (integratore a
step fisso, accumulator, verifica per simmetrie/conservazione) ma il suo modello fisico è
diverso fin dalla base: non c'è alcun corpo dominante fisso, tutti i corpi si attraggono fra loro
simmetricamente.

Il documento tiene deliberatamente separati quattro livelli, da non mescolare in implementazione:
l'**architettura di prodotto** (route, componenti, indice Lab, identità visuale — sezione
"Architettura di prodotto e route", **requisito esplicito**: questo laboratorio è un prodotto
completamente separato dal laboratorio "Buco Nero", non una pagina/modalità/sottosezione del suo
Playground), il **core numerico condivisibile** (l'interfaccia di forza/potenziale, l'esecuzione
in Web Worker — sezione "Core numerico condivisibile"), il **modello fisico specifico di questo
laboratorio** (nessun potenziale centrale, i sei preset, il pianeta test-mass/massivo, lo scenario
"tre soli", collisioni/espulsioni — sezione "Modello fisico specifico del laboratorio"), e il
**rendering e la diagnostica** (scie, vettori, indicatori — sezione "Rendering e diagnostica").

## Obiettivo e motivazione

Il Playground attuale e il futuro laboratorio "Buco Nero Binario" (`docs/black-hole-binary-lab.md`)
condividono un tratto: c'è sempre almeno un corpo dominante attorno a cui gli altri orbitano (un
buco nero fisso, o due masse comparabili che comunque decadono verso un'unica massa finale). Il
problema classico dei tre corpi è qualitativamente diverso: **nessun corpo è privilegiato**, non
c'è un centro verso cui tutto converge, e già a partire da tre masse comparabili il sistema può
essere permanentemente instabile, periodico solo per configurazioni iniziali molto speciali, o
genuinamente caotico. È il caso didattico più diretto per mostrare che la gravità newtoniana pura
— senza alcuna relatività, senza buchi neri, senza dissipazione — è già sufficiente a produrre
comportamento imprevedibile: non serve un buco nero per avere un sistema "difficile".

Motivazione secondaria: è il banco di prova naturale per la terza interfaccia della famiglia di
potenziali condivisa (vedi "Core numerico condivisibile"), quella **senza** alcun potenziale
centrale fisso — complementare a `SingleBlackHolePotential` (Playground) e
`PostNewtonianBinaryPotential` (`docs/black-hole-binary-lab.md`).

## Non-goals / fuori scope

- **Nessuna implementazione ora.** Questo è un documento di design; niente componenti React,
  niente Web Worker funzionante, niente modulo di fisica funzionante.
- **Nessuna relatività.** Il laboratorio è puramente newtoniano (vedi "Dominio di validità"):
  niente correzioni PN, niente buchi neri, niente radiation reaction. Un sistema di tre corpi
  relativistico è un problema di ricerca a sé, fuori scope.
- **Non è un risolutore analitico del problema dei tre corpi.** Non si cerca (e non esiste, in
  generale) una soluzione in forma chiusa: il laboratorio integra numericamente, punto e basta.
- **Non tocca il redesign WGSL dei filamenti** (fuori scope, non pertinente).
- **Non è uno strumento di ricerca per l'individuazione di nuove orbite periodiche** (un campo di
  ricerca attivo in sé): i sei preset sono scelti come casi didattici noti e affidabili, non come
  punto di partenza per una ricerca numerica di nuove famiglie di soluzioni.
- **Il modello di flusso/temperatura dello scenario "tre soli" non è un modello climatico o
  atmosferico.** È un readout didattico di bilancio energetico a corpo nero, dichiarato
  esplicitamente come semplificato (vedi sezione dedicata).
- **Nessuna pretesa di calcolare un esponente di Lyapunov rigoroso e convergente.** L'indicatore di
  divergenza caotica (vedi "Rendering e diagnostica") è un aiuto visivo qualitativo/illustrativo,
  non uno strumento di analisi numerica pubblicabile.
- **Non è una pagina, modalità o sottosezione del laboratorio "Buco Nero".** È un prodotto
  completamente separato — vedi "Architettura di prodotto e route" per route, componenti e
  identità visuale propri, e per cosa (poco, ed esplicitamente non subito) può essere condiviso.

## Architettura di prodotto e route

**Requisito di prodotto esplicito**: il laboratorio "Tre Corpi" è completamente separato dal
laboratorio "Buco Nero" — non una pagina, una modalità o una sottosezione del suo Playground. È un
prodotto a sé, che deve funzionare, essere navigabile ed essere sviluppato **indipendentemente**.
Questa sezione fissa route e struttura ora, anche se l'implementazione resta fuori scope di questo
documento (nessun file viene creato qui).

### Route

- **IT**: `/lab/tre-corpi` — nuova cartella di primo livello `app/(it)/lab/tre-corpi/`, sorella di
  `app/(it)/lab/buco-nero/`, non annidata al suo interno. Stesso pattern già in uso per gli altri
  laboratori del sito (`app/(it)/lab/sistema-solare/`, `app/(it)/lab/tavola-periodica/`,
  `app/(it)/lab/verde-urbano/`).
- **EN**: `/en/lab/three-body` — nuova cartella `app/(en)/en/lab/three-body/`, sorella di
  `app/(en)/en/lab/black-hole/`.
- **About IT**: `/lab/tre-corpi/about` (`app/(it)/lab/tre-corpi/about/`) — stesso pattern già in
  uso (`app/(it)/lab/buco-nero/about/`, `app/(it)/lab/sistema-solare/about/`,
  `app/(it)/lab/tavola-periodica/about/`).
- **About EN**: `/en/lab/three-body/about` (`app/(en)/en/lab/three-body/about/`).

Tutte e quattro le route sono **autonome sotto `app/(it)` e `app/(en)`**, non annidate sotto
`app/(it)/lab/buco-nero/` né sotto nessun'altra route esistente.

### Componenti

- Cartella dedicata **sorella**, non annidata: `components/lab/three-body/` — stesso pattern di
  `components/lab/black-hole/`, ma un albero separato.
- **Nessun import da `components/lab/black-hole/` né da
  `components/lab/black-hole/playground-physics.ts`.** Il motore fisico di questo laboratorio
  (nome indicativo `components/lab/three-body/three-body-physics.ts`) vive interamente in
  `components/lab/three-body/`.

### Voce nell'indice Lab

Card/voce **indipendente** nell'indice Lab IT (`app/(it)/lab/page.tsx`) e nel suo equivalente EN
(`app/(en)/en/lab/page.tsx`), allo stesso livello delle card già esistenti per Buco Nero, Tavola
Periodica, Sistema Solare, Verde Urbano — non un link secondario dentro la card del Buco Nero.

### Metadata, titolo, navigazione

- Metadata (`<title>`, descrizione, eventuali Open Graph) **propri** del laboratorio "Tre Corpi",
  scritti per questo laboratorio specifico — non ereditati né derivati da quelli del Buco Nero.
- Navigazione propria (breadcrumb/link di ritorno all'indice Lab, cambio lingua IT/EN, eventuale
  link "About"/"Equazioni") che punta alle route di questo laboratorio, non a quelle del Buco Nero.

### Identità visuale e toolbar

Toolbar, palette, tipografia e terminologia **proprie**, non ereditate dal Buco Nero. In
particolare: **nessun controllo, preset o etichetta del Playground del Buco Nero** (es. "Disco",
"Doppler", "Getti", "Vento", "Onde grav.", "Ringdown" — concetti specifici del dominio buco nero)
deve comparire in questa interfaccia, nemmeno come eredità accidentale di un componente condiviso.
I preset di questo laboratorio (figure-eight, Lagrange, Euler, Pythagorean, hierarchical, chaotic)
e i suoi controlli (test-mass/massivo, scenario "tre soli", indicatore di divergenza caotica) sono
concettualmente e visivamente indipendenti dal vocabolario del Buco Nero.

### Cosa può essere condiviso — e quando

- **Solo primitive numeriche genuinamente generiche**, prive di qualunque nozione di dominio "buco
  nero" (es. il tipo `Vec3`, operazioni vettoriali, un helper di integrazione RK adattivo puro),
  estratte in un **modulo neutro senza dipendenze dal dominio black-hole** — se e quando servirà
  davvero. L'interfaccia `PotentialModel`/`BodyState` descritta in "Core numerico condivisibile"
  sopra è un candidato per questo modulo neutro, ma resta comunque solo una bozza di forma, non
  un'implementazione condivisa.
- **Non estrarre nulla in anticipo.** Questo documento non impegna a creare il modulo neutro ora,
  né a spostare codice esistente. L'estrazione va fatta **solo quando l'implementazione dimostra
  una condivisione reale** (es. quando sia il laboratorio binario sia questo laboratorio esistono
  già come codice e si scopre che riusano davvero la stessa primitiva), non come preparazione
  speculativa — un'estrazione prematura rischia di accoppiare due domini fisici diversi (buco nero
  vs tre corpi puro) attorno a un'astrazione decisa troppo presto.

### Relazione con gli altri laboratori

Il laboratorio "Tre Corpi", il laboratorio "Buco Nero" (Playground incluso) e il futuro
laboratorio "Buco Nero Binario" (route proprie `/lab/buco-nero-binario` e
`/en/lab/binary-black-hole` — vedi `docs/black-hole-binary-lab.md`) sono **tre prodotti separati**:
ciascuno funziona, è navigabile ed è sviluppato **indipendentemente** dagli altri. Possono
collegarsi fra loro come **"esperimenti correlati"** (un link o una card, in stile navigazione/
editoriale — non una dipendenza tecnica o di codice), ma questo è un collegamento di superficie,
non un accoppiamento architetturale.

## About scientifico e riproducibilità

Le route `/lab/tre-corpi/about` e `/en/lab/three-body/about` sono già fissate in "Architettura di
prodotto e route" — **ma la sola esistenza della route non basta**. Questa sezione specifica
contenuto e rigore richiesti: l'About è la superficie pubblica in cui il laboratorio dichiara cosa
è calcolato, cosa è approssimato e cosa è stilizzato — lo stesso principio di onestà già applicato
in tutto questo documento, qui reso pubblico e verificabile da chiunque.

**Livello e pubblico**: trattazione bilingue IT/EN di livello universitario avanzato, utile anche a
studenti magistrali e dottorandi in meccanica celeste/dinamica non lineare, con un'introduzione
accessibile per chi arriva senza background specifico. **Non deve copiare contenuti o UI
dall'About del Buco Nero**: struttura, tono, componenti e identità visuale sono propri di questo
laboratorio, coerenti con l'indipendenza già richiesta in "Architettura di prodotto e route".

### Struttura minima dei contenuti

1. **Abstract, obiettivi e domanda scientifica** — cosa il laboratorio permette di esplorare e
   perché (nessun corpo privilegiato, imprevedibilità senza bisogno di relatività, vedi "Obiettivo
   e motivazione"), in forma di abstract.
2. **Equazioni newtoniane N-corpi e scelta delle unità** — l'equazione del moto (già in "Modello
   fisico specifico del laboratorio", punto 1) e il sistema di unità del simulatore, dichiarato
   esplicitamente, non lasciato implicito.
3. **Riduzione al baricentro, quantità conservate, energia e momento angolare** — le formule usate
   nei readout diagnostici (vedi "Rendering e diagnostica") e perché sono conservate in assenza di
   collisioni.
4. **Perché il problema non è generalmente integrabile; caos e tempo di Lyapunov** — la
   distinzione fra le soluzioni esatte note (Lagrange, Euler, figure-eight) e il caso generico, e
   il tempo di Lyapunov come limite di predicibilità (già in "Dominio di validità").
5. **Soluzioni centrali di Lagrange ed Euler: esistenza, criterio Gascheau/Routh e stabilità** —
   trattazione completa (non solo la sintesi già in "Modello fisico specifico del laboratorio",
   punto 2), inclusa la derivazione concettuale del criterio `27` e perché masse uguali cadono
   sotto la soglia.
6. **Figure-eight: condizioni iniziali, simmetrie, monodromia e stabilità di Floquet** —
   condizioni iniziali esatte del preset, gruppo di simmetria della coreografia, e spiegazione
   concettuale (non solo il risultato) degli autovalori della matrice di monodromia citati nel
   risultato di Simó.
7. **Problema pitagorico: close encounter, formazione della binaria ed espulsione** —
   configurazione 3:4:5 di Burrau, sequenza qualitativa di incontri ravvicinati che porta
   all'esito noto (Szebehely & Peters), collegata ai grafici di distanza reciproca (vedi sotto).
8. **Sistemi gerarchici e dinamica Kozai-Lidov, con dominio di validità** — quando il meccanismo
   emerge (inclinazione relativa elevata) e onestamente quando NON è atteso emergere nella
   semplice integrazione N-corpi diretta di questo laboratorio.
9. **Pianeta aggiunto: differenza fra restricted/test-mass e vero problema a quattro corpi** — la
   stessa distinzione già al centro di questo documento ("La distinzione test-mass vs pianeta
   massivo"), qui con il rigore e i riferimenti di un'esposizione universitaria.
10. **Scenario "tre soli": flusso combinato, temperatura di equilibrio e limiti climatici** —
    derivazione della formula di temperatura di equilibrio (vedi "Modello fisico specifico del
    laboratorio", punto 4) e sezione esplicita sui limiti (nessun modello climatico/atmosferico
    reale, vedi Non-goals).
11. **Metodi numerici: integratore scelto, controllo errore, regolarizzazione, collisioni ed
    eventi** — RK adattivo ad alto ordine, perché non un KDK adattivo naive (vedi "Modello fisico
    specifico del laboratorio", punto 1, e "Collisioni, espulsioni, close encounter"), come
    funzionano controllo d'errore, regolarizzazione delle coordinate, sticky-sphere.
12. **Validazione, convergenza e riproducibilità** — cosa il "Piano di test/verifica proposto" di
    questo documento diventa, una volta implementato, in forma presentabile pubblicamente
    (risultati dei test, non solo la loro progettazione).
13. **Limiti fisici e numerici dichiarati** — la sezione "Dominio di validità" di questo documento,
    riscritta per il pubblico dell'About (stesso contenuto, stessa onestà, registro adattato).
14. **Bibliografia primaria completa con DOI/link verificati** — vedi "Citazioni" sotto.

### Grafici minimi (calcolati, non decorativi)

Nessuno di questi grafici è un'illustrazione stilizzata a scopo estetico: ognuno è l'output diretto
di una computazione reale, o dichiarato esplicitamente come schema quando non lo è (vedi il
requisito "calcolato dal simulatore / dato osservativo / schema" sotto). Elenco minimo:

1. Traiettorie dei sei preset (figure-eight, Lagrange, Euler, Pythagorean, hierarchical, chaotic),
   con condizioni iniziali dichiarate esplicitamente per ciascuno.
2. Energia e momento angolare: errore relativo nel tempo (verifica visiva del test di
   conservazione, vedi "Piano di test/verifica proposto").
3. Convergenza al variare della tolleranza dell'integratore (l'errore diminuisce come atteso al
   restringersi della tolleranza RK adattiva — verifica diretta della correttezza numerica).
4. Separazione fra traiettorie perturbate su scala logaritmica (l'indicatore di divergenza
   caotica di "Rendering e diagnostica", presentato come figura pubblicabile).
5. Mappa di stabilità di Gascheau/Routh (il rapporto `(Σm)²/Σ(mᵢmⱼ)` su una griglia di rapporti di
   massa, soglia `27` evidenziata, regione stabile/instabile colorata).
6. Moltiplicatori di Floquet/monodromia della figure-eight (gli autovalori citati da Simó,
   ricalcolati — o, se il ricalcolo non è alla portata dell'implementazione, dichiarati
   esplicitamente come "dato dalla fonte primaria", vedi sotto — mai presentati come calcolati se
   non lo sono davvero).
7. Distanze reciproche e close encounter nel problema pitagorico (le tre distanze a coppie nel
   tempo, con gli incontri ravvicinati visibili come minimi pronunciati).
8. Dimensione del passo adattivo durante un incontro ravvicinato (il passo `h` dell'integratore RK
   che si restringe visibilmente in corrispondenza di un close encounter — verifica diretta che
   l'adattività funzioni come descritto in "Modello fisico specifico del laboratorio").
9. Confronto test-mass vs pianeta massivo (stessa configurazione con un pianeta nelle due
   modalità, traiettorie dei tre corpi primari sovrapposte per mostrare la non-backreazione nel
   caso test-mass e la perturbazione nel caso massivo).
10. Flusso e temperatura del pianeta nello scenario "tre soli" (serie temporale di entrambe le
    grandezze mentre il pianeta orbita, con i picchi visibili ai passaggi ravvicinati alle stelle).

**Ogni figura, senza eccezioni, deve avere**:
- assi, unità e legenda;
- i parametri e le condizioni iniziali usati per generarla;
- l'equazione o il dataset esatto da cui deriva;
- una didascalia interpretativa (cosa il lettore deve notare, non solo cosa mostra l'asse);
- la fonte primaria pertinente (vedi "Citazioni");
- un'indicazione esplicita — **"calcolato dal simulatore"**, **"dato osservativo"**, o
  **"schema"** — nessuna figura può restare ambigua su quale di queste tre categorie sia;
- una versione IT/EN equivalente (stesso dato, stessa figura, didascalia tradotta — non
  rigenerata con parametri diversi);
- **nessun numero scritto a mano se può essere prodotto dal core numerico**: se un valore compare
  in una didascalia o un'etichetta ed è calcolabile dal motore fisico del laboratorio, deve essere
  effettivamente calcolato da esso al momento della build/render, non trascritto a mano da
  un'esecuzione precedente (che diverge silenziosamente dal codice reale alla prima modifica).

### Architettura dati per i grafici

I grafici di validazione **devono usare lo stesso core fisico del laboratorio**
(`components/lab/three-body/three-body-physics.ts` o nome equivalente) **o fixture deterministiche
condivise con esso** — mai una seconda implementazione delle formule scritta direttamente nel
componente React della figura. È lo stesso principio dietro l'audit richiesto per l'About del Buco
Nero esistente (vedi sotto, e `docs/black-hole-roadmap.md`): un grafico che reimplementa la fisica
per conto proprio diverge silenziosamente dal motore reale alla prima modifica di quest'ultimo, e
nessuno se ne accorge finché qualcuno non confronta manualmente i due.

- **Seed, tolleranze e versione del modello devono essere riproducibili**: ogni figura dichiara
  (in didascalia o metadata associato) il seed usato, la tolleranza dell'integratore, e un
  identificatore di versione del modello fisico — così un lettore (o un futuro sviluppatore) può
  rigenerare esattamente lo stesso risultato.
- **Export CSV/JSON dei dati delle figure**: da prevedere come funzionalità dell'About (un
  pulsante o link per scaricare i dati numerici dietro ciascun grafico) — coerente con il
  principio di riproducibilità già raccomandato per il Buco Nero (`docs/black-hole-roadmap.md`,
  §7.6, "Export delle geodetiche/dei dati in CSV").

### Citazioni

Citazioni **numerate, vicino alle affermazioni specifiche a cui si riferiscono** — non solo una
lista bibliografica finale scollegata dal testo (lo stile usato in "Riferimenti concettuali" di
questo documento di design è un punto di partenza, ma per l'About pubblicato non basta: lì le
citazioni sono raggruppate a fine sezione, nell'About devono comparire vicino a ogni affermazione
specifica che le richiede). Preferire paper originali, riviste peer-reviewed, monografie
universitarie e documentazione istituzionale. **Ogni formula, ogni condizione iniziale storica e
ogni affermazione sulla stabilità deve essere tracciabile** a una fonte precisa.

**Vincolo non negoziabile per la versione pubblicata**: nessun riferimento marcato "da verificare"
può restare nell'About effettivamente pubblicato. Questo documento di design (vedi "Riferimenti
concettuali") si è permesso di lasciare un paio di dettagli bibliografici come "da confermare in
sviluppo" proprio perché è un documento di design pre-implementazione, non una pagina pubblica —
quella tolleranza **non si trasferisce** all'About: prima della pubblicazione, ogni citazione
usata lì va verificata con titolo/DOI/edizione reali, esattamente come già fatto per la maggior
parte delle fonti in "Riferimenti concettuali" durante la revisione di questo documento.

## La distinzione test-mass vs pianeta massivo

Questa è la scelta di design più importante del documento, e va capita prima di tutto il resto:
**non è un dettaglio tardivo, cambia la classe del problema.**

Il laboratorio parte da tre corpi primari (i preset, vedi sotto) e permette all'utente di
inserire un quarto corpo — un "pianeta" — in due modalità esplicitamente distinte:

- **Modalità test-mass**: il pianeta viene integrato nel campo gravitazionale istantaneo generato
  dai tre corpi primari (riceve la loro accelerazione combinata, calcolata esattamente come per
  un corpo-test nel Playground attuale: sente il campo, non lo genera), ma **la sua massa non
  entra nella somma gravitazionale mutua dei tre corpi primari**. I tre corpi primari restano,
  dal loro punto di vista, un sistema chiuso a tre corpi esattamente come nel preset scelto —
  il pianeta è un osservatore passivo che può essere spostato, catapultato, distrutto in un
  incontro ravvicinato, senza mai alterare l'evoluzione dei tre corpi che lo ospitano. Questo è
  concettualmente analogo al problema ristretto dei tre corpi ("restricted three-body problem"),
  qui generalizzato a un campo che cambia nel tempo (i tre corpi primari non sono in orbita
  stazionaria l'uno rispetto all'altro, in generale).
- **Modalità massive**: il pianeta **entra nella somma gravitazionale mutua simmetricamente**,
  esattamente come un quarto corpo primario — a questo punto il sistema è un **vero problema a
  quattro corpi**: i tre corpi originari sentono anche la sua gravità, e la loro traiettoria
  cambia rispetto al preset "puro" a tre corpi. L'effetto pratico dipende dalla massa scelta per
  il pianeta e dalla sua distanza dagli altri: a massa piccola rispetto ai tre primari l'effetto è
  una perturbazione via via più forte man mano che la massa cresce; a massa comparabile il sistema
  smette semplicemente di essere "tre corpi con un ospite" e diventa un genuino sistema a quattro
  corpi comparabili, senza alcuna gerarchia privilegiata.

Perché questo conta più di un semplice parametro: i preset sotto hanno proprietà di stabilità
molto diverse fra loro (vedi punto 2 del Modello fisico per l'attribuzione corretta di ciascuna).
La configurazione di Lagrange a masse **uguali** e la configurazione di Euler sono **entrambe
linearmente instabili di per sé** (rispettivamente per il criterio di Routh/Gascheau non
soddisfatto a masse comparabili, e sempre nel caso di Euler) — un pianeta massivo introdotto lì si
somma a un'instabilità già presente nella configurazione stessa, senza bisogno di essere lui la
causa. La figure-eight è invece il caso più interessante per questo laboratorio: è **linearmente
stabile** per la configurazione esatta a tre corpi uguali (Simó, vedi punto 2), quindi un pianeta
massivo introdotto lì mette alla prova qualcosa di realmente diverso — non un'instabilità
preesistente, ma la robustezza di una soluzione stabile a una perturbazione **strutturale**
(un quarto corpo, non solo una piccola perturbazione della stessa configurazione a 3 corpi). Il
laboratorio deve rendere questa differenza (instabilità intrinseca del preset vs. perturbazione
strutturale di un preset stabile) visibile e comprensibile: se un pianeta massivo altera nel tempo
una figure-eight, è un fatto fisico genuinamente interessante da mostrare, non un bug — ma il
documento non ne dimostra qui l'esito quantitativo (vedi "Piano di test/verifica proposto").

Implicazioni di design dirette:
- L'interfaccia utente deve rendere la scelta test-mass/massivo un parametro di primo piano al
  momento dell'inserimento del pianeta, non un'opzione nascosta in un pannello secondario.
- Il piano di test (vedi sotto) deve verificare esplicitamente **entrambi** i rami: che un pianeta
  test-mass non alteri mai (entro tolleranza numerica) la traiettoria dei tre corpi primari
  rispetto allo stesso preset senza pianeta, e che un pianeta massivo la alteri in modo
  consistente con la sua massa (perturbazione che cresce con la massa del pianeta, non un
  comportamento binario tutto-o-niente).
- Il core numerico (vedi "Core numerico condivisibile") deve poter rappresentare entrambe le
  modalità senza due implementazioni completamente separate: la modalità test-mass è, nei termini
  dell'interfaccia `PotentialModel` condivisa con gli altri due laboratori, esattamente l'uso del
  metodo opzionale `accelerationOnTestBody` (che non genera backreazione); la modalità massiva è
  l'inclusione ordinaria del pianeta nell'array di corpi passato a `accelerationsFor`.

## Modello fisico specifico del laboratorio

### 1. Motore condiviso, nessun potenziale centrale fisso

Il laboratorio riusa alcuni pattern architetturali del Playground — l'**accumulator a step fisso**
per disaccoppiare il tempo simulato dal frame rate (stesso principio del Playground e del
laboratorio binario: quanto tempo simulato avanzare per chiamata è una cosa, come integrarlo
internamente è un'altra), seed deterministico per la riproducibilità, somma gravitazionale mutua
in ordine canonico per id (per l'indipendenza dall'ordine già verificata bit-esatta nel Playground)
— applicati a un caso fisico diverso: **gravità newtoniana pura fra corpi comparabili, nessun
corpo fisso al centro**. Non esiste alcuna nozione di "corpo doomed" da escludere vicino a un
orizzonte (non c'è alcun orizzonte); non esiste alcuna sfera di Hill calcolata rispetto a un
ospite fisso (nessun corpo è per costruzione più "centrale" di un altro).

**Sull'integratore — nessun "KDK adattivo" generico, non è una scelta già risolta**: a differenza
del caso binario PN (dove il KDK del Playground è scartato perché le forze sono dipendenti dalla
velocità e dissipative, vedi `docs/black-hole-binary-lab.md`), qui le forze sono puramente
posizionali e conservative — un KDK leapfrog simplettico è quindi in linea di principio
appropriato per corpi ben separati. **Ma un passo variabile applicato ingenuamente a un leapfrog
rompe le proprietà simplettiche standard**: le garanzie di conservazione dell'energia a lungo
termine di un integratore simplettico valgono per un passo **fisso**; un "KDK a passo adattivo"
naive (che cambia semplicemente `SIM_DT` step per step) non è più simplettico in senso stretto e
perde quella garanzia proprio nei momenti (gli incontri ravvicinati) in cui servirebbe di più —
descriverlo come una soluzione già risolta, come faceva una versione precedente di questo
documento, era impreciso. La scelta di design esplicita per questo laboratorio è quindi:

- **MVP**: un integratore Runge-Kutta esplicito a **passo adattivo e ordine elevato** (stessa
  famiglia di scelta del laboratorio binario per motivi analoghi — un metodo non-simplettico ma
  con controllo dell'errore locale esplicito, adatto sia al caso PN sia, qui, a un caso Newtoniano
  puro con range dinamico ampio negli incontri ravvicinati) — non un KDK a passo variabile.
- **KDK fisso, eventuale**: riservato a preset/tratti della simulazione lisci e ben separati (es.
  Lagrange nel dominio stabile, hierarchical non perturbato, lontano da incontri ravvicinati), dove
  un passo fisso è sufficiente e i benefici simplettici sono reali — una scelta di implementazione
  da valutare come ottimizzazione futura, non l'integratore di riferimento per l'MVP.
- **Regolarizzazione dedicata per i close encounter**: non un adattamento del passo del KDK, ma una
  tecnica separata (regolarizzazione delle coordinate, vedi punto 5) applicata specificamente
  attorno agli incontri ravvicinati, indipendentemente da quale integratore gestisca il resto della
  traiettoria.

I dettagli sono discussi al punto 5 ("Collisioni, espulsioni, close encounter"), che è il punto in
cui la scelta dell'integratore conta davvero per questo laboratorio.

L'equazione del moto per ciascun corpo `i` è semplicemente:

```
d²r_i/dt² = Σ_{j≠i} G·m_j·(r_j − r_i) / |r_j − r_i|³
```

sommata su **tutti** gli altri corpi presenti (i tre primari, più eventuali corpi-test e il
pianeta se in modalità massiva) — nessun termine è trattato in modo speciale. Questo è
concettualmente il caso `NewtonianNBodyPotential` descritto in "Core numerico condivisibile".

### 2. I sei preset

Ogni preset è una configurazione iniziale nota in letteratura, non una famiglia generica generata
a caso — la scelta copre lo spettro da "perfettamente periodico e delicato" a "violentemente
caotico":

- **Figure-eight**: la coreografia periodica a forma di otto per tre masse **uguali**, in cui i
  tre corpi si inseguono sulla stessa curva chiusa, equispaziati di un terzo di periodo l'uno
  dall'altro. Scoperta numericamente da C. Moore (1993) e dimostrata rigorosamente (esistenza,
  non stabilità) da Chenciner e Montgomery (2000). **La stabilità lineare è un risultato
  distinto**, dovuto a Simó (analisi numerica di stabilità pubblicata come "Dynamical properties
  of the figure eight solution of the three-body problem", in *Celestial Mechanics: Dedicated to
  Donald Saari for his 60th Birthday*, Contemporary Mathematics 292, AMS, 2002, pp. 209–228):
  Simó trova la figure-eight **linearmente (ellitticamente) stabile**, con autovalori della
  matrice di monodromia sul cerchio unitario — non "debolmente/marginalmente stabile" nel senso di
  "quasi instabile", ma stabile in senso lineare/ellittico, un caso peraltro raro fra le altre
  coreografie esaminate da Simó (che risultano perlopiù instabili). La cautela di design resta
  valida ma va motivata correttamente: la stabilità **ellittica** (autovalori sul cerchio unitario,
  non strettamente all'interno) è un caso di confine nella classificazione della stabilità dei
  sistemi hamiltoniani — a differenza di una stabilità iperbolica/dissipativa netta, non garantisce
  da sola la robustezza a lungo termine sotto una perturbazione **finita e strutturale** come
  l'aggiunta di un quarto corpo massivo (un problema qualitativamente diverso dalla stabilità
  lineare *della stessa* configurazione a 3 corpi, verificata da Simó solo per quel caso esatto).
  È comunque il preset "gioiello" del laboratorio: visivamente sorprendente (tre corpi, una sola
  curva) e un buon caso per mostrare la differenza test-mass/massivo (vedi sopra), con
  l'aspettativa realistica — non una certezza dimostrata in questo documento — che un pianeta
  massivo introdotto vicino alla configurazione la perturbi visibilmente nel tempo.
- **Lagrange**: la configurazione centrale a triangolo equilatero (Lagrange, 1772) **esiste** per
  **qualunque** rapporto di masse: se i tre corpi sono posizionati ai vertici di un triangolo
  equilatero con velocità iniziali scelte correttamente, il triangolo resta equilatero in ogni
  istante (ruota rigidamente, e nel caso di orbite non circolari si espande/contrae restando
  sempre simile a sé stesso). **La sua stabilità lineare, però, NON è generale: è condizionata dal
  criterio di Routh/Gascheau.** Gascheau (1843) mostrò che la configurazione è linearmente stabile
  se e solo se `(m1+m2+m3)² / (m1m2+m2m3+m3m1) > 27` (Routh, 1875, arrivò indipendentemente allo
  stesso criterio, spesso citato come "rapporto di massa critico di Routh"). **Per masse uguali
  questo rapporto vale esattamente 3, ben al di sotto di 27: la configurazione equilatera a masse
  uguali è quindi LINEARMENTE INSTABILE**, non un caso "prevedibile" di controllo come potrebbe
  sembrare dalla sola esistenza della soluzione esatta — serve una massa nettamente dominante
  perché la configurazione sia effettivamente stabile (lo stesso motivo per cui i punti L4/L5
  Sole-Giove sono stabili per gli asteroidi troiani: il rapporto di massa Sole/Giove soddisfa
  ampiamente il criterio di Gascheau). Il preset "Lagrange" del laboratorio deve quindi specificare
  esplicitamente **quale** rapporto di massa usa: un preset a masse comparabili è un caso
  instabile interessante (mostra che l'esistenza di una soluzione esatta non implica stabilità),
  un preset con una massa dominante è il caso stabile "di manuale" — le due varianti insegnano
  cose diverse e non vanno confuse in UI.
- **Euler**: la configurazione collineare (Eulero, 1767) è una soluzione **esatta** per rapporti di
  massa arbitrari (i tre corpi restano allineati in ogni istante, con la spaziatura relativa
  fissata dalla soluzione della cosiddetta quintica di Eulero — un'equazione polinomiale che
  dipende dai rapporti di massa, da calcolare al momento dell'implementazione per ciascuna
  combinazione di masse offerta, non hardcoded come costante universale) — **ma, a differenza
  della configurazione di Lagrange, è SEMPRE linearmente instabile, per qualunque rapporto di
  massa** (non esiste un analogo del criterio di Gascheau che la renda stabile). Va quindi
  presentata esattamente per quello che è: una soluzione esatta e didatticamente interessante (i
  tre corpi restano visibilmente allineati per un tratto), non una "baseline stabile" — qualunque
  errore numerico o perturbazione (inclusa l'introduzione di un pianeta) se ne allontanerà nel
  tempo, ed è un comportamento fisico atteso da comunicare in UI, non un difetto dell'integratore.
- **Pythagorean**: il problema dei tre corpi "pitagorico" di Burrau (1913) — tre masse in
  rapporto 3:4:5 poste, ferme, ai vertici di un triangolo rettangolo con lati proporzionali a
  3:4:5. Rilasciato da fermo, il sistema attraversa una sequenza di incontri ravvicinati
  estremamente caotici (un caso di riferimento storico per testare la robustezza numerica di un
  integratore, poi confermato/rifinito numericamente da Szebehely e Peters nel 1967, che ne
  determinarono l'esito finale: dopo una serie di incontri ravvicinati, uno dei tre corpi viene
  espulso mentre gli altri due restano legati in una coppia stretta). È il preset di stress-test
  del laboratorio: se l'integratore regge il Pitagorico senza NaN né blocchi, regge la maggior
  parte delle configurazioni ragionevoli.
- **Hierarchical**: una binaria stretta più un terzo corpo lontano. Non una singola orbita esatta
  ma una **categoria** di condizione iniziale (parametrizzata da separazione interna, separazione
  esterna, inclinazione reciproca). A inclinazioni relative elevate fra l'orbita interna e quella
  esterna, un sistema gerarchico può mostrare oscillazioni secolari di eccentricità/inclinazione
  note come meccanismo di Kozai–Lidov (Kozai, 1962; Lidov, 1962) — il laboratorio non promette di
  implementare la teoria secolare analitica, ma l'integrazione N-corpi diretta può mostrare
  l'effetto emergere naturalmente se l'utente sceglie un'inclinazione iniziale adatta; va
  presentato come un fenomeno che **può emergere**, non come una funzionalità dedicata.
- **Chaotic**: una configurazione generica, senza alcuna simmetria protettiva (né equilatera, né
  collineare, né gerarchica), scelta per mostrare la sensibilità estrema alle condizioni iniziali
  che caratterizza il problema dei tre corpi in generale — un fenomeno la cui prima osservazione
  risale al lavoro di Poincaré sul problema dei tre corpi (memoria del 1890), spesso considerato
  l'origine storica della teoria del caos.

### 3. Corpo aggiuntivo: pianeta test-mass o massivo

Vedi la sezione dedicata sopra ("La distinzione test-mass vs pianeta massivo") per la scelta di
design; qui solo il dettaglio implementativo minimo: in modalità test-mass il pianeta è integrato
nello stesso passo dell'integratore (RK adattivo, vedi punto 1) degli altri corpi ma la sua massa è
trattata come trascurabile ai fini della somma mutua (coerente con `accelerationOnTestBody` in
"Core numerico condivisibile"); in modalità massiva il pianeta è un corpo ordinario nell'array
`bodies` passato a `accelerationsFor`, senza alcun trattamento speciale.

### 4. Scenario "tre soli": flusso luminoso e temperatura del pianeta

Uno scenario didattico dedicato: tre corpi massivi trattati come stelle (con una luminosità `L_i`
associata a ciascuna, un parametro semplificato del laboratorio — **non derivato da una relazione
massa-luminosità stellare realistica**, per evitare di dover modellare fisica stellare che è
completamente fuori scope) e un pianeta (in una delle due modalità sopra) che riceve luce da tutte
e tre.

- **Flusso combinato**: il flusso ricevuto dal pianeta è la somma, sorgente per sorgente, della
  legge dell'inverso del quadrato: `S = Σ_i L_i / (4π·d_i²)`, dove `d_i` è la distanza istantanea
  fra il pianeta e la stella `i`. È un readout scalare che cambia in tempo reale con la geometria
  orbitale (il pianeta può passare più vicino a una stella e più lontano dalle altre).
- **Temperatura di equilibrio semplificata**: dallo stesso bilancio energetico a corpo nero usato
  per stimare la temperatura di equilibrio di un pianeta reale attorno a una singola stella,
  esteso qui alla somma multi-sorgente: potenza assorbita `(1−A)·S·π·R_p²` (sezione d'urto
  circolare, albedo `A`) uguagliata alla potenza riemessa da un corpo nero su tutta la superficie
  sferica `4π·R_p²·σ·T⁴`, da cui `T_eq = [(1−A)·S / (4σ)]^(1/4)` (`σ` = costante di
  Stefan-Boltzmann) — la stessa formula standard usata per un pianeta attorno a una singola
  stella, qui applicata al flusso combinato `S` sommato sopra. **Va dichiarato esplicitamente come
  modello semplificato**: tratta il flusso combinato come se arrivasse isotropicamente (nessuna
  view-factor geometrica separata per le tre direzioni di provenienza), assume ridistribuzione
  rapida del calore su tutta la superficie (equivalente a un pianeta a rotazione rapida o
  atmosfera efficiente), e non modella atmosfera, effetto serra, albedo variabile con la
  temperatura, o irraggiamento asimmetrico giorno/notte. È un readout didattico in tempo reale
  ("il pianeta si scalda quando passa vicino a due stelle insieme"), non un modello climatico.
- **Corpo test-mass o massivo**: lo scenario funziona in entrambe le modalità (vedi punto 3); in
  modalità massiva, il pianeta influenza anche l'orbita delle tre stelle, quindi la sua stessa
  storia di temperatura viene retroazionata dalla sua influenza gravitazionale sulle traiettorie
  stellari — un ulteriore motivo didattico per mostrare esplicitamente la differenza fra le due
  modalità in questo scenario specifico.

### 5. Collisioni, espulsioni, close encounter

Il problema dei tre corpi ha vere singolarità matematiche in caso di collisione binaria esatta
(`|r_i − r_j| → 0` ⇒ forza `→ ∞`), e gli incontri ravvicinati (senza collisione esatta) sono
proprio il meccanismo che genera il comportamento caotico nei preset come il Pitagorico — vanno
quindi gestiti esplicitamente, non solo tollerati:

- **RK adattivo ad alto ordine, non softening, come meccanismo primario per gli incontri
  ravvicinati (MVP)**: la scelta di design per l'MVP di questo laboratorio è lo stesso
  **Runge-Kutta esplicito a passo adattivo e ordine elevato** discusso al punto 1 (non un "KDK
  adattivo": vedi lì il motivo — un passo variabile rompe le proprietà simplettiche standard del
  leapfrog), che riduce automaticamente il passo quando due corpi si avvicinano, **senza alterare
  la legge di forza**. Questo è deliberatamente diverso dal Playground (che usa un passo fisso
  attorno a un potenziale pseudo-newtoniano già regolarizzato per costruzione vicino
  all'orizzonte): qui non c'è un orizzonte che regolarizzi nulla, e il problema a tre corpi ha vere
  singolarità matematiche in caso di collisione binaria esatta. Un KDK a passo fisso resta
  un'ottimizzazione facoltativa futura per i tratti di simulazione lontani da incontri ravvicinati
  (vedi punto 1), non il meccanismo primario per questa sezione.
- **Regolarizzazione propriamente detta (facoltativa, per incontri estremamente stretti)**: se il
  passo adattivo da solo non bastasse a restare stabile/accurato negli incontri più stretti (es.
  nel preset Pitagorico), la tecnica corretta è una **regolarizzazione delle coordinate** (es.
  trasformazione di Levi-Civita in 2D o di Kustaanheimo-Stiefel in 3D, tecniche standard che
  rimuovono analiticamente la singolarità di una collisione binaria tramite un cambio di
  variabili, non un softening della forza) — da valutare in sviluppo se necessaria, non decisa qui.
- **Niente softening quando l'obiettivo è riprodurre l'esito di un benchmark storico esatto**:
  è un vincolo esplicito e non negoziabile per il preset Pitagorico — **un termine di softening
  altera la legge di forza esattamente nella regione (gli incontri ravvicinati) che determina
  l'esito storico noto** (l'espulsione di un corpo, vedi punto 2 del Modello fisico); usare
  softening lì contaminerebbe il benchmark stesso, rendendo il test "il Pitagorico riproduce
  l'esito atteso" non significativo (si starebbe verificando una fisica leggermente diversa da
  quella del problema originale). Per il preset Pitagorico, quindi: integratore adattivo (e,
  se necessaria, regolarizzazione delle coordinate) sono gli strumenti ammessi; il softening
  descritto per il caso generale sotto va disattivato o non applicato in questo preset specifico
  quando si esegue il test di riproduzione dell'esito storico.
- **Softening (facoltativo, per configurazioni generiche non-benchmark)**: per preset e
  configurazioni generate dall'utente dove non si sta cercando di riprodurre un esito storico
  esatto, un termine di softening (tipo Plummer: si sostituisce `|r_i−r_j|³` con
  `(|r_i−r_j|² + ε²)^{3/2}` al denominatore) resta un'opzione pragmatica aggiuntiva per la
  robustezza generale — **`ε` è un parametro numerico dichiarato, da tarare in sviluppo, non un
  effetto fisico**, e la sua presenza/assenza deve essere un'impostazione esplicita e visibile
  (non un default nascosto che silenziosamente altera anche i preset a benchmark storico).
- **Collisione fisica (merge) come "sticky-sphere" dichiarato**: quando due corpi si avvicinano
  oltre una soglia di contatto fisico, la scelta di design per questo laboratorio è il modello
  **sticky-sphere** (terminologia standard nella simulazione N-corpi: due corpi la cui separazione
  scende sotto la somma dei rispettivi **raggi fisici** si fondono istantaneamente e
  inelasticamente) — non un rimbalzo elastico, che non è fisicamente motivato per masse puntiformi
  gravitazionali e complicherebbe senza benefici didattici la conservazione di energia. **Il
  raggio fisico/di collisione è un parametro esplicitamente separato dal raggio visuale/di
  rendering** (stesso principio già usato nel Playground per comprimere le dimensioni visive dei
  corpi per leggibilità): il raggio visuale può essere ingrandito per essere visibile a schermo
  senza che questo cambi quando due corpi effettivamente collidono nella simulazione — usare il
  raggio visuale (invece di uno fisico dedicato, tipicamente molto più piccolo) come soglia di
  collisione produrrebbe fusioni fisicamente premature, visibilmente sbagliate rispetto alla scala
  reale del sistema. Il corpo risultante dalla fusione ha massa somma e quantità di moto
  conservata (stesso principio delle fusioni già implementate nel Playground).
- **Espulsione — l'escaper resta integrato e nei bilanci; viene escluso SOLO dalla camera**: un
  corpo la cui energia relativa rispetto al resto del sistema diventa positiva e la cui distanza
  dal baricentro supera una soglia dichiarata (stesso principio dell'`EJECT_RADIUS` già usato nel
  Playground, ma qui senza alcun buco nero "da cui" cadere — la soglia è puramente
  geometrica/energetica rispetto al baricentro del sistema) è dichiarato "espulso" come evento
  visibile per l'utente, ma **NON viene rimosso dalla somma N-corpi mutua né dall'integrazione
  attiva**. A differenza del Playground (dove rimuovere corpi doomed/espulsi con molti corpi
  simultanei è una reale ottimizzazione di performance), qui il sistema ha per costruzione un
  numero di corpi piccolo (i tre primari più al più un pianeta, quindi 3-4 corpi totali): non c'è
  un motivo di performance per smettere di integrarlo, e continuare a integrarlo è **l'unico modo
  corretto di garantire la conservazione di energia e momento angolare**. Un corpo ancora in moto
  (anche se ormai lontano e debolmente accoppiato) ha energia cinetica che continua a evolvere; un
  "ledger" che ne congela massa/posizione/velocità a un valore costante al momento dell'espulsione
  smetterebbe di rappresentare correttamente il suo contributo reale a energia e momento angolare
  totali non appena la sua velocità (per quanto lentamente) continuasse a cambiare — un errore di
  bookkeeping, non solo un'approssimazione innocua. La scelta di design corretta è quindi: **il
  corpo espulso resta un corpo ordinario nell'array integrato e nei bilanci di conservazione**;
  l'unico posto in cui viene trattato diversamente è la camera (vedi "Rendering e diagnostica",
  modalità "sistema legato"), dove viene escluso dal calcolo del bounding box per non far
  scomparire visivamente il sistema legato rimasto — un'esclusione puramente di inquadratura, mai
  di fisica. Coerente con l'esito reale del preset Pitagorico, dove l'espulsione di un corpo è il
  comportamento fisico atteso, non un errore da correggere.
- **Close encounter senza collisione né espulsione**: il caso più comune e più importante da non
  rompere numericamente — un passaggio ravvicinato che altera bruscamente le velocità (motore
  della sensibilità caotica) ma non porta a fusione né espulsione. Deve restare numericamente
  stabile (nessun NaN, nessun salto di energia spurio) grazie alla regolarizzazione sopra e a un
  accumulator a step fisso che non dipende dal frame rate del rendering.

## Dominio di validità

Sezione dedicata: cosa il modello **non** cattura, onestamente.

- **Newtoniano puro, nessuna relatività — ma `v/c` è comunque calcolabile e va monitorato**: nessun
  effetto PN, nessuna radiation reaction, nessun limite di velocità imposto dalla luce (a
  differenza del Playground, che limita le velocità simulate con `C_CAP`, e del laboratorio
  binario, che è esplicitamente relativistico). Per configurazioni con masse e distanze
  realisticamente stellari questo è un'ottima approssimazione (la gravitazione newtoniana descrive
  bene i sistemi stellari non compatti); per configurazioni che l'utente spingesse verso
  separazioni artificialmente piccole o masse artificialmente grandi, il modello smette di essere
  fisicamente rappresentativo. **A differenza di quanto detto in una versione precedente di questo
  documento, questo non richiede di rinunciare a un avviso automatico**: il rapporto `v/c` di
  ciascun corpo è calcolabile direttamente dalla sua velocità istantanea (`|v|/c`), senza bisogno
  di integrare alcun termine PN — è pura cinematica, non richiede il parametro di espansione PN
  del laboratorio binario. Il laboratorio deve quindi mostrare un **warning automatico quando
  `v/c` di un corpo supera una soglia dichiarata** (es. un multiplo piccolo ma non trascurabile di
  1, da fissare in sviluppo), coerente con il principio di "rifiuto/warning esplicito, mai clamp
  silenzioso" del laboratorio binario — non un semplice avviso testuale statico nella pagina
  "about", ma un indicatore reattivo legato allo stato reale della simulazione.
- **Tempo di Lyapunov come limite intrinseco di predicibilità, non un bug**: per i preset caotici
  (Pitagorico, chaotic, e in generale qualunque preset perturbato da un pianeta massivo vicino a
  una configurazione delicata come la figure-eight) esiste un tempo caratteristico oltre il quale
  due traiettorie che partono da condizioni iniziali quasi identiche divergono esponenzialmente
  (il tempo di Lyapunov). Oltre questo tempo, **il dettaglio della traiettoria calcolata dipende
  in modo sensibile dagli arrotondamenti in virgola mobile stessi**, non solo dai parametri fisici
  scelti dall'utente — significa che due esecuzioni della stessa simulazione, con la stessa
  configurazione iniziale ma con un ordine di somma o una precisione numerica anche leggermente
  diversi, possono divergere visibilmente dopo un tempo sufficientemente lungo. Questo non è un
  difetto dell'integratore da correggere: è una proprietà matematica del sistema. Il laboratorio
  deve comunicarlo (es. tramite l'indicatore di divergenza caotica, vedi "Rendering e
  diagnostica"), non nasconderlo dietro un'apparenza di determinismo assoluto a tempi lunghi.
- **Precisione numerica vicino a incontri quasi-singolari**: anche con passo adattivo e
  regolarizzazione delle coordinate (punto 5 del Modello fisico), un incontro estremamente
  ravvicinato può comunque comportare una perdita di accuratezza locale (non necessariamente
  instabilità totale, ma un errore di integrazione più alto in quella finestra temporale) — un
  limite pratico noto, non nascosto: il piano di test (vedi sotto) include verifiche esplicite di
  conservazione dell'energia anche attorno a un incontro ravvicinato, non solo su orbite regolari.
  Il softening, quando attivo (mai nel benchmark Pitagorico, vedi punto 5), è un'ulteriore fonte
  dichiarata di scostamento dalla fisica esatta, distinta da questo limite di precisione numerica.
- **I sei preset sono condizioni iniziali esatte solo nel caso newtoniano puro e senza pianeta**:
  l'aggiunta di un pianeta in modalità massiva (per costruzione) o l'introduzione di softening
  numerico non nullo (per necessità pratica) allontanano leggermente il sistema dalla soluzione
  matematicamente esatta del preset — quanto velocemente questo scostamento cresce dipende dalla
  stabilità lineare della configurazione (vedi punto 2 del Modello fisico), **non** da quanto
  "regolare" appaia visivamente: per Lagrange nel dominio stabile di Gascheau/Routh (massa
  dominante) e per hierarchical non perturbato lo scostamento resta piccolo nel tempo; per Euler
  (sempre instabile) e per Lagrange a masse comparabili (instabile) lo scostamento **cresce**
  invece di restare trascurabile, esattamente perché quelle configurazioni sono linearmente
  instabili — non sono un caso "robusto" solo perché la soluzione di partenza è esatta. Per la
  figure-eight (stabile ma ellitticamente, un caso di confine) lo scostamento può comunque essere
  osservabile anche a softening piccolo, ed è un'informazione utile da comunicare, non un bug di
  implementazione.
- **Nessuna pretesa di accuratezza per lo scenario "tre soli"**: il flusso/temperatura è un
  readout didattico semplificato (vedi punto 4 del Modello fisico), non un modello climatico o
  di abitabilità planetaria realistico.

## Core numerico condivisibile

Questa sezione riguarda solo la parte di calcolo (integrazione N-corpi, forma dell'interfaccia di
forza/potenziale, esecuzione fuori dal thread principale) pensata per essere potenzialmente
condivisa con gli altri laboratori. Il modello fisico specifico di questo laboratorio (preset,
distinzione test-mass/massivo, scenario "tre soli", collisioni) resta descritto sopra in "Modello
fisico specifico del laboratorio"; il modo in cui il laboratorio viene disegnato a schermo è
descritto separatamente in "Rendering e diagnostica" più sotto.

### Interfaccia `NewtonianNBodyPotential`

Stessa famiglia di interfacce proposta in `docs/black-hole-binary-lab.md` (bozza — solo firme,
nessuna logica; framework-agnostica, nessuna dipendenza da React/R3F/three.js):

```ts
// Stessi tipi base della famiglia condivisa (vedi anche docs/black-hole-binary-lab.md):
export type Vec3 = { x: number; y: number; z: number };

export interface BodyState {
  readonly id: number;
  readonly mass: number;
  readonly position: Vec3;
  readonly velocity: Vec3;
}

export interface PotentialModel {
  readonly id: string;
  accelerationsFor(bodies: readonly BodyState[], t: number): Vec3[];
  // Per un pianeta in modalità test-mass (vedi "La distinzione test-mass vs pianeta massivo"):
  // sente il campo, non lo genera, nessuna backreazione sui corpi primari.
  accelerationOnTestBody?(
    testPosition: Vec3,
    testVelocity: Vec3,
    bodies: readonly BodyState[],
    t: number,
  ): Vec3;
}

// Per QUESTO laboratorio: N corpi comparabili, NESSUN potenziale centrale fisso — a differenza
// di SingleBlackHolePotential (Playground) e PostNewtonianBinaryPotential
// (docs/black-hole-binary-lab.md), qui ogni corpo è simmetricamente equivalente agli altri.
export interface NewtonianNBodyPotential extends PotentialModel {
  readonly kind: "newtonian-n-body";
  // Softening opzionale (vedi "Collisioni, espulsioni, close encounter") — un parametro di
  // regolarizzazione dichiarato, non un effetto fisico. DEVE essere disattivabile esplicitamente
  // (null/undefined) per riprodurre benchmark storici come il preset Pythagorean, dove alterare
  // la legge di forza vicino agli incontri ravvicinati contaminerebbe l'esito da riprodurre.
  readonly softeningLength: number | null;
}
```

Nota di design: come nel laboratorio binario, questa è **un'interfaccia per lavoro futuro**, non
un refactor da fare ora — `playground-physics.ts` non viene toccato né reso conforme a questa
forma in questo lavoro. **Cosa è condiviso e cosa non lo è**: la forma `PotentialModel`/`BodyState`
(lo stato dei corpi e la firma "dato lo stato, restituisci le accelerazioni") è condivisibile fra i
tre laboratori — un consumatore generico può interrogare `accelerationsFor` senza sapere se sta
parlando con un `NewtonianNBodyPotential` o un `PostNewtonianBinaryPotential`. **L'integratore che
consuma quella forma NON è necessariamente lo stesso**: `docs/black-hole-binary-lab.md` stabilisce
esplicitamente che il caso PN richiede un integratore dedicato (RK adattivo per l'MVP, non il KDK),
proprio perché le forze PN sono dipendenti dalla velocità e dissipative — condizioni che il KDK
simplettico di questo laboratorio (tre corpi, forze puramente posizionali e conservative) non
soddisfa. Condividere l'interfaccia di stato non implica condividere l'integratore: sono due
livelli distinti, e questo documento non impegna a un integratore unico per entrambi i casi.

### Web Worker: architettura di esecuzione

A differenza del Playground attuale (dove l'integrazione gira nel thread principale dentro
`useFrame`, con un numero di corpi tipicamente piccolo), questo laboratorio deve poter reggere
sessioni prolungate con incontri ravvicinati frequenti (in particolare nei preset caotici) senza
mai bloccare l'interfaccia React/R3F. La scelta di design è eseguire il loop fisico in un **Web
Worker** separato dal thread principale:

- **Protocollo di comunicazione — tre nozioni di tempo distinte, da non confondere**: il worker
  riceve lo stato iniziale (corpi, preset, parametri) via `postMessage` una volta, poi integra
  autonomamente. Con l'integratore RK adattivo scelto per l'MVP (punto 1 del Modello fisico),
  **non esiste più un unico `SIM_DT` fisso** che descriva tutto: vanno distinti tre concetti
  separati.
  1. **Passo interno dell'integratore** (`h`, variabile): la dimensione del singolo passo di
     integrazione RK, scelta automaticamente dal controllo d'errore dell'integratore — piccola
     vicino a un incontro ravvicinato, più grande altrove. Non è un parametro configurabile
     direttamente, è un output dell'integratore stesso.
  2. **Clock di simulazione / checkpoint** (accumulator, stesso principio concettuale del
     Playground ma qui un **traguardo di tempo simulato da raggiungere**, non un passo di
     integrazione letterale): il worker accumula tempo reale trascorso e lo converte in un
     obiettivo di tempo simulato da raggiungere; l'integratore RK adattivo compie internamente
     tutti i passi `h` (variabili) necessari per arrivarci, disaccoppiando il tempo simulato dal
     frame rate esattamente come nel Playground, ma senza implicare un passo di integrazione
     fisso.
  3. **Intervallo di pubblicazione snapshot** (indipendente dai due precedenti): ogni quanti
     checkpoint di clock di simulazione (o ogni quanto tempo simulato) il worker pubblica
     effettivamente uno snapshot verso il thread principale — un parametro scelto per non saturare
     il canale di messaggistica, che può essere più rado della frequenza dei checkpoint stessi.

  A ogni pubblicazione, il worker invia uno snapshot dello stato (posizioni, velocità, eventuali
  eventi come collisioni/espulsioni) verso il thread
  principale.
- **Double/triple buffering con acknowledgement esplicito — non un semplice "trasferisci e
  riusa"**: un `ArrayBuffer` passato come *transferable* a `postMessage` **diventa detached (di
  lunghezza zero) nel contesto che lo ha inviato** — il worker, dopo aver trasferito un buffer al
  thread principale, non può più scriverci dentro: non è un buffer condiviso, è un trasferimento
  di proprietà. "Il worker sovrascrive e ripubblica lo stesso buffer" descritto in una prima
  bozza di questo documento era quindi tecnicamente sbagliato. Il protocollo corretto è un piccolo
  **anello di 2-3 buffer** allocati una volta all'avvio: il worker scrive il nuovo snapshot in un
  buffer **non attualmente in transito**, lo trasferisce al thread principale, e passa a scrivere
  nel prossimo buffer libero dell'anello per il passo successivo. Il thread principale, dopo aver
  letto (consumato per il rendering) un buffer ricevuto, lo **ritrasferisce indietro al worker**
  con un messaggio di **acknowledgement** (`postMessage` con lo stesso buffer come transferable in
  senso inverso), rendendolo di nuovo disponibile per la scrittura — un ping-pong esplicito di
  proprietà, non una copia. Con 2 buffer il worker può restare bloccato in attesa dell'ack se il
  thread principale è lento; con 3 (o più) il worker ha più margine prima di dover rallentare —
  il numero esatto è un parametro di implementazione da tarare, non deciso qui.
- **Interpolazione temporale nel rendering**: gli snapshot arrivano al thread principale a una
  cadenza legata al passo/carico del worker (specialmente variabile con un integratore adattivo,
  vedi "Collisioni, espulsioni, close encounter"), non sincronizzata con il refresh del display.
  Il thread principale non deve "scattare" direttamente sull'ultimo snapshot ricevuto (movimento a
  scatti se gli snapshot arrivano più lentamente del frame rate): deve **interpolare** fra gli
  ultimi due snapshot ricevuti (per tempo simulato, non per numero di step) in base al tempo
  simulato corrispondente al momento del rendering — stesso principio generale di
  un'interpolazione posizione-velocità già comune quando la fisica e il rendering procedono a
  cadenze diverse, qui necessario perché il worker introduce esplicitamente quella cadenza
  disaccoppiata.
- **Backpressure**: se il worker rallenta (es. molti corpi, incontri ravvicinati che richiedono
  passi numericamente più delicati con l'integratore adattivo), il thread principale non deve
  bloccarsi: se un ack non è ancora arrivato per nessun buffer dell'anello, il worker
  semplicemente **salta la pubblicazione di uno o più step intermedi** (continua a integrare, ma
  pubblica solo quando un buffer si libera), così il thread principale vede sempre "il presente
  più recente disponibile del worker" senza dover processare un arretrato di messaggi in coda —
  la latenza di visualizzazione cresce quando il worker è sotto carico, ma non si accumula mai una
  coda.
- **Corpo-test e pianeta**: l'inserimento interattivo di un pianeta (test-mass o massivo, vedi
  sopra) è un messaggio dal thread principale al worker che aggiorna lo stato senza richiedere il
  riavvio dell'intera simulazione.

## Rendering e diagnostica

Sezione separata dal core numerico e dal modello fisico: qui si parla solo di come il laboratorio
viene disegnato a schermo e di quali readout numerici mostra, non di come viene calcolato.

- **Scie (trail)**: traccia visiva della traiettoria recente di ciascun corpo — utile in
  particolare per i preset periodici (figure-eight, Lagrange, Euler), dove la scia rivela la
  forma della curva percorsa, e per i preset caotici, dove la scia diventa visibilmente irregolare
  nel tempo.
- **Vettori velocità**: overlay opzionale che mostra la velocità istantanea di ciascun corpo come
  freccia — utile per capire visivamente un incontro ravvicinato (velocità che cambiano
  bruscamente in direzione/modulo) prima ancora che cambi la scia.
- **Marcatore di baricentro**: il baricentro del sistema (calcolato includendo o escludendo il
  pianeta a seconda della modalità, vedi sopra) come punto di riferimento visivo — per i preset
  Lagrange/Euler rimane vicino al centro della configurazione; per un sistema che sta per espellere
  un corpo, il suo comportamento nel tempo è un indicatore utile.
- **Readout di energia e momento angolare totali**: un proprio overlay diagnostico (nome/flag di
  attivazione da definire in sviluppo, non `?bhDebug=1` — quel nome è specifico del dominio buco
  nero, vedi "Architettura di prodotto e route"), concettualmente analogo per densità informativa
  a quello già presente nel Playground ma un componente indipendente — energia totale e momento
  angolare totale del sistema (compreso l'eventuale
  pianeta, se in modalità massiva; escluso, se in modalità test-mass, dato che per costruzione non
  contribuisce all'energia/momento angolare dei tre corpi primari; **compreso un eventuale corpo
  espulso**, che resta integrato e nei bilanci come descritto in "Collisioni, espulsioni, close
  encounter" — un'espulsione da sola non deve mai causare una discontinuità nel readout). In
  assenza di collisioni (che uniscono due corpi in uno, cambiando la struttura del bilancio),
  entrambe le quantità devono restare costanti entro tolleranza numerica (vedi "Piano di
  test/verifica proposto").
- **Indicatore di divergenza caotica**: una seconda copia "gemella" del sistema, integrata in
  parallelo con una perturbazione iniziale piccola e dichiarata (es. uno scostamento di posizione
  di ampiezza nota su un solo corpo), con un readout della distanza in spazio delle fasi fra le
  due copie nel tempo — qualitativamente, una crescita lineare o oscillante indica un preset
  stabile (**hierarchical non perturbato e Lagrange nel dominio stabile di Gascheau/Routh, massa
  dominante** — non Euler, sempre instabile, e non Lagrange a masse comparabili, ugualmente
  instabile), mentre una crescita esponenziale visibile indica un regime caotico (Pitagorico,
  chaotic, Euler o Lagrange a masse comparabili su tempi sufficientemente lunghi, o una
  figure-eight destabilizzata da un pianeta massivo). Il metodo standard per stimare rigorosamente un esponente di Lyapunov da una coppia di
  traiettorie gemelle (rinormalizzazione periodica della separazione, algoritmo di Benettin et al.,
  1980) è citato come riferimento per un'eventuale versione più quantitativa in sviluppo, ma il
  deliverable base di questo laboratorio è la visualizzazione qualitativa della divergenza, non
  una stima numerica convergente dell'esponente (vedi "Non-goals").
- **Nomi/etichette disattivabili**: scelta di UX propria di questo laboratorio, per non affollare
  la scena quando non servono — non un controllo ereditato dal Playground del Buco Nero (vedi
  "Architettura di prodotto e route": nessuna terminologia/controllo condiviso con quell'interfaccia).
- **UI/camera — due modalità di focus distinte, non un solo auto-framing globale**: l'auto-framing
  del Playground (che inquadra semplicemente tutti i corpi presenti) **non basta** qui: nel
  preset Pitagorico, un corpo espulso che si allontana rapidamente farebbe crescere il campo
  inquadrato fino a rendere il sistema legato rimasto (i due corpi vicini) visivamente
  invisibile — un difetto pratico concreto, non solo teorico, dato che l'espulsione è esattamente
  l'esito atteso di quel preset. La scelta di design è quindi **due modalità di focus separate e
  selezionabili**: **(a) "sistema legato"**, che inquadra solo i corpi ancora dinamicamente vicini
  fra loro (ignorando corpi espulsi nel calcolo del bounding box della camera), utile per
  continuare a osservare la dinamica interessante dopo un'espulsione; **(b) "escaper"**, che segue
  invece il corpo espulso stesso, utile per mostrare la sua traiettoria di fuga. Il passaggio da
  auto-framing globale a una di queste due modalità deve avvenire automaticamente al momento di
  un'espulsione (con un default dichiarato, es. "sistema legato"), non lasciare che il campo
  inquadrato cresca senza limite includendo un corpo ormai lontano per definizione.

## Piano di test/verifica proposto

Non eseguito in questo documento: solo la progettazione degli scenari da testare quando
l'implementazione inizierà, nello stesso stile di rigore già applicato all'audit del Playground
(simmetrie, conservazione, indipendenza dall'ordine, no NaN/blocchi).

- **Ciascuno dei sei preset riproduce la configurazione attesa**: per Lagrange ed Euler, verificare
  che la forma (triangolo equilatero / collinearità) sia preservata entro tolleranza numerica per
  l'intera durata di un'orbita di riferimento (questo vale indipendentemente dalla stabilità
  lineare del caso: è la soluzione esatta che si sta verificando su una durata breve, non la sua
  robustezza a lungo termine, che è oggetto del punto seguente). Per la variante Lagrange a masse
  **comparabili** (instabile per il criterio di Gascheau, vedi punto 2), e separatamente per
  **Euler** (sempre instabile, per qualunque rapporto di massa), verificare inoltre che la forma
  **si allontani** visibilmente dalla configurazione esatta (triangolo equilatero / collinearità)
  su una durata simulata più lunga — un test di sanità che l'instabilità prevista sia
  effettivamente presente, non solo teorica, e che **Euler in particolare non venga mai trattato
  come un caso stabile/di controllo** in nessun test successivo. Per la variante Lagrange a
  **massa dominante** (stabile), verificare invece che la forma resti vicina all'equilatero anche
  su quella stessa durata più lunga. Per la **figure-eight**, che è linearmente stabile (Simó,
  punto 2), verificare che i tre corpi restino sulla stessa curva chiusa entro tolleranza per un
  numero dichiarato di periodi **senza** allontanarsi in modo sistematico (coerente con la
  stabilità attesa) — un fallimento di questo test specifico segnalerebbe un bug dell'integratore,
  non un comportamento fisico atteso, proprio perché la configurazione è nota per essere stabile.
  Per il Pitagorico, verificare che l'esito qualitativo (un corpo finisce espulso, due restano
  legati) sia riprodotto, senza pretendere di matchare esattamente i tempi della letteratura
  storica (dipendenti da dettagli numerici non specificati qui).
- **Conservazione in assenza di collisioni**: energia e momento angolare totali del sistema restano
  costanti entro una tolleranza numerica dichiarata, per una durata simulata dichiarata — questa
  proprietà non dipende dalla stabilità lineare della configurazione (la conservazione è una
  proprietà della gravità newtoniana/dell'integratore, non della particolare forma iniziale), quindi
  il test va eseguito anche su preset linearmente instabili come Euler o Lagrange a masse
  comparabili, non solo su Lagrange nel dominio stabile e hierarchical non perturbato — l'instabilità
  fa divergere la *traiettoria* dalla configurazione di riferimento, ma non deve mai violare la
  conservazione di energia/momento angolare in sé. **Un'espulsione non esclude più questo test**
  (a differenza di una versione precedente di questo documento): dato che l'escaper resta integrato
  e nei bilanci (vedi "Collisioni, espulsioni, close encounter"), la conservazione deve continuare a
  valere anche attraverso un'espulsione, senza discontinuità — solo una **collisione** (che fonde
  due corpi, cambiando la struttura del bilancio) resta esclusa dallo scope di questo test
  specifico. Stesso stile del test di deriva energetica già superato dal Playground.
- **Indipendenza dall'ordine**: il risultato della somma gravitazionale mutua non deve dipendere
  dall'ordine di iterazione dell'array dei corpi — stesso principio già verificato bit-esatto nel
  Playground, qui applicato a un numero di corpi primari maggiore di due.
- **Test-mass non altera il sistema primario**: un pianeta in modalità test-mass, per qualunque
  preset e qualunque posizione iniziale del pianeta, non deve produrre alcuna differenza (entro
  tolleranza numerica) nella traiettoria dei tre corpi primari rispetto alla stessa simulazione
  senza pianeta — un test diretto della non-backreazione dichiarata al punto 3 del Modello fisico.
- **Backreaction locale proporzionale alla massa del pianeta (test a orizzonte temporale breve,
  non un test di "monotonia a lungo termine")**: **non** un test di "la deviazione a un tempo
  simulato fissato cresce sempre con la massa del pianeta" — per i preset caotici (Pitagorico,
  chaotic, o una figure-eight perturbata) *qualunque* perturbazione non nulla, per quanto piccola,
  produce eventualmente una divergenza O(1) rispetto al caso non perturbato dopo un tempo
  sufficientemente lungo (vedi "Dominio di validità": tempo di Lyapunov), quindi "più massa ⇒
  sempre più deviazione a un tempo fissato lungo" non è nemmeno un'affermazione fisicamente
  sensata per quei preset. Il test corretto è **locale**: su una finestra temporale breve rispetto
  al tempo di Lyapunov del preset scelto (dove la dinamica è ancora in regime di risposta
  lineare), la deviazione della traiettoria dei tre corpi primari rispetto al preset "puro" deve
  crescere in modo **proporzionale** (lineare al prim'ordine) alla massa assegnata al pianeta per
  masse piccole — nessun salto discontinuo per masse piccole, nessuna perturbazione "gratuita" a
  massa nulla — verifica di coerenza fisica della transizione test-mass → massivo nel suo regime
  di validità (breve termine), non un'estrapolazione a tempi lunghi né un numero esatto da
  matchare.
- **Nessun NaN/blocco negli incontri ravvicinati, CON il passo adattivo, SENZA softening**: il
  preset Pitagorico (il caso di stress-test per costruzione) deve restare numericamente stabile
  (nessun NaN, nessun blocco) per la durata simulata necessaria a raggiungere l'esito storico
  noto, usando l'integratore a passo adattivo (ed eventuale regolarizzazione delle coordinate) **e
  esplicitamente senza softening attivo** — un test che fallisse solo con il softening disattivato
  indicherebbe che l'integratore adattivo/la regolarizzazione non sono ancora sufficienti, non che
  serva riattivare il softening (che comprometterebbe la validità del test di riproduzione
  dell'esito, vedi sopra). Una configurazione "chaotic" scelta ad hoc, con softening attivo
  stavolta, è un test separato di robustezza generale — stesso principio del test "24 corpi/60s
  senza NaN" già superato dal Playground, qui applicato a incontri quasi-singolari anziché a un
  numero elevato di corpi.
- **Merge e conservazione della quantità di moto**: quando due corpi si fondono (vedi "Collisioni,
  espulsioni, close encounter"), il corpo risultante deve avere massa pari alla somma e quantità
  di moto pari alla somma delle quantità di moto pre-fusione (entro tolleranza numerica) — un
  controllo diretto di corretto wiring della fusione, indipendente dal preset in cui avviene.
- **Espulsione rilevata correttamente**: nel preset Pitagorico, il corpo che nella letteratura
  storica viene espulso deve, nella simulazione, superare la soglia di espulsione dichiarata entro
  un tempo simulato ragionevole — verifica qualitativa dell'esito, non dei tempi esatti.
- **Divergenza fra traiettorie gemelle cresce nei preset caotici e non in quelli stabili**: per
  l'indicatore di divergenza caotica (vedi "Rendering e diagnostica"), verificare che la distanza
  in spazio delle fasi fra le due copie gemelle cresca in modo qualitativamente diverso (più
  rapido, tipicamente super-lineare) per il Pitagorico/chaotic rispetto a **hierarchical non
  perturbato e Lagrange nel dominio stabile di Gascheau/Routh** (non Euler, sempre linearmente
  instabile, e non Lagrange a masse comparabili — entrambi atterrerebbero nel gruppo "diverge",
  contaminando il confronto) a parità di durata simulata e di perturbazione iniziale — un test di
  sanità sull'indicatore stesso, non una misura di esponente di Lyapunov rigorosa (vedi
  "Non-goals").
- **Flusso e temperatura nello scenario "tre soli"**: il flusso combinato calcolato dal
  laboratorio deve corrispondere (entro tolleranza numerica) alla somma diretta `Σ L_i/(4π d_i²)`
  calcolata indipendentemente dalle posizioni istantanee note in un caso di test — un controllo
  diretto della formula, non della fisica sottostante (già dichiarata semplificata).
- **Web Worker non blocca il thread principale**: durante una simulazione con molti corpi/incontri
  ravvicinati frequenti, il frame rate del rendering non deve degradare in modo proporzionale al
  carico del worker (verifica architetturale: il rendering continua a interpolare fra gli ultimi
  snapshot disponibili anche se il worker è in ritardo, saltando la pubblicazione di step
  intermedi come da "Backpressure") — un test architetturale, non di correttezza fisica.
- **Nessun buffer "perso" nell'anello di trasferimento**: dopo una sessione prolungata con molti
  cicli di trasferimento/ack fra worker e thread principale, nessuno dei 2-3 buffer dell'anello
  deve risultare permanentemente detached/irrecuperabile (un bug plausibile se un ack viene perso
  o gestito in ordine sbagliato) — un test diretto di correttezza del protocollo double/triple
  buffer descritto in "Core numerico condivisibile".

## Rischi noti e domande aperte

- **Costo computazionale della coppia di simulazioni gemelle** (per l'indicatore di divergenza
  caotica): integrare due copie del sistema in parallelo raddoppia il costo di calcolo nel worker;
  se risultasse un problema di performance per un numero elevato di corpi, la mitigazione
  (attivare l'indicatore solo su richiesta esplicita dell'utente, non di default) è una decisione
  di implementazione non presa qui.
- **Valore della lunghezza di softening**: quale valore di `ε` bilanci correttamente fedeltà
  fisica (non alterare visibilmente incontri "normali") e stabilità numerica (evitare esplosioni
  numeriche negli incontri più stretti) è una taratura empirica da fare in sviluppo, non decisa in
  questo documento. **Non riguarda il preset Pythagorean**: lì il softening resta escluso per
  costruzione quando si riproduce l'esito storico (vedi punto 5 del Modello fisico), quindi questa
  taratura si applica solo a incontri ravvicinati in preset/configurazioni generiche non-benchmark.
- **Precisione numerica scelta (es. `Float64Array` per i trasferimenti Worker vs. una precisione
  minore per ridurre banda)**: un trade-off esplicito fra fedeltà numerica (specialmente rilevante
  vicino a incontri ravvicinati, vedi "Dominio di validità") e overhead di comunicazione
  worker↔thread principale — non deciso qui.
- **Quintica di Eulero per rapporti di massa arbitrari nel preset "Euler"**: se il laboratorio
  espone il rapporto di massa come parametro libero anche per questo preset (anziché fissarlo a
  un caso canonico), la soglia/spaziatura esatta va ricalcolata risolvendo la quintica per ogni
  combinazione — una scelta fra "preset a rapporto di massa fisso" (più semplice) e "preset
  parametrico" (più ricco ma più costoso da implementare correttamente) non presa qui.
- **Relazione con il laboratorio "Buco Nero Binario"**: se e quanto dell'integratore/accumulator/
  pattern di verifica sviluppati per questo laboratorio debbano essere effettivamente condivisi
  (non solo concettualmente affini) con `docs/black-hole-binary-lab.md` è una decisione di
  sequenziamento implementativo, non presa qui.
- **Estensione del pianeta test-mass allo scenario "tre soli"**: se il pianeta debba poter avere
  anche una propria luminosità nulla ma un albedo/raggio configurabili dall'utente, o se questi
  parametri vadano fissati a valori didattici di default — decisione di UX non presa qui.

## Riferimenti concettuali

Nomi/attribuzioni reali, nessun coefficiente numerico inventato:

- **Moore, C. (1993)**, "Braids in classical dynamics", *Physical Review Letters* 70, 3675–3679.
  DOI: [10.1103/PhysRevLett.70.3675](https://doi.org/10.1103/PhysRevLett.70.3675) — prima scoperta
  numerica della coreografia a figura-otto per tre masse uguali.
- **Chenciner, A. & Montgomery, R. (2000)**, "A remarkable periodic solution of the three-body
  problem in the case of equal masses", *Annals of Mathematics* 152, 881–901. DOI:
  [10.2307/2661357](https://doi.org/10.2307/2661357) — dimostrazione rigorosa dell'**esistenza**
  della figure-eight (punto 2 del Modello fisico).
- **Simó, C. (2002)**, "Dynamical properties of the figure eight solution of the three-body
  problem", in *Celestial Mechanics: Dedicated to Donald Saari for his 60th Birthday*,
  Contemporary Mathematics 292, American Mathematical Society, pp. 209–228 — analisi numerica
  della **stabilità lineare/ellittica** della figure-eight (risultato distinto dall'esistenza,
  vedi punto 2); DOI/ISBN esatti da confermare in sviluppo.
- **Lagrange, J.-L. (1772)** — esistenza della configurazione centrale a triangolo equilatero,
  valida per rapporti di massa arbitrari (preset Lagrange). **Gascheau, G. (1843)** e **Routh,
  E.J. (1875)** — criterio di **stabilità lineare** della stessa configurazione,
  `(m1+m2+m3)²/(m1m2+m2m3+m3m1) > 27` (instabile per masse uguali, vedi punto 2); riferimenti
  bibliografici esatti (rivista/volume) da verificare in sviluppo, il risultato numerico stesso è
  documentato in letteratura di meccanica celeste moderna sulla stabilità dei punti triangolari.
- **Euler, L. (1767)** — configurazione centrale collineare, esatta per rapporti di massa
  arbitrari ma **sempre linearmente instabile** (a differenza di Lagrange), spaziatura determinata
  dalla quintica di Eulero in funzione dei rapporti di massa (preset Euler).
- **Burrau, C. (1913)**, "Numerische Berechnung eines Spezialfalles des Dreikörperproblems",
  *Astronomische Nachrichten* 195(6), 113–118 — formulazione del problema dei tre corpi
  "pitagorico" (masse 3:4:5 ai vertici di un triangolo rettangolo 3-4-5, la massa maggiore
  all'angolo retto). **Szebehely, V. & Peters, C.F. (1967)**, "Complete Solution of a General
  Problem of Three Bodies", *The Astronomical Journal* 72, 876 — integrazione numerica di
  riferimento che ne determina l'esito finale (preset Pythagorean).
- **Kozai, Y. (1962)**, "Secular perturbations of asteroids with high inclination and
  eccentricity", *The Astronomical Journal* 67, 591–598. DOI:
  [10.1086/108790](https://doi.org/10.1086/108790). **Lidov, M.L. (1962)**, "The evolution of
  orbits of artificial satellites of planets under the action of gravitational perturbations of
  external bodies", *Planetary and Space Science* 9(10), 719–759. DOI:
  [10.1016/0032-0633(62)90129-0](https://doi.org/10.1016/0032-0633(62)90129-0) — oscillazioni
  secolari di eccentricità/inclinazione in sistemi gerarchici molto inclinati (meccanismo
  Kozai–Lidov, citato come fenomeno che può emergere nel preset hierarchical, non come
  funzionalità implementata a parte).
- **Poincaré, H. (1890)**, memoria sul problema dei tre corpi (King Oscar II prize memoir) — prima
  osservazione storica di comportamento sensibile alle condizioni iniziali in un sistema
  gravitazionale, spesso considerata l'origine della teoria del caos (preset chaotic, sezione
  "Dominio di validità"); riferimento bibliografico esatto da confermare in sviluppo.
- **Benettin, G., Galgani, L., Giorgilli, A. & Strelcyn, J.-M. (1980)**, "Lyapunov Characteristic
  Exponents for smooth dynamical systems and for hamiltonian systems; a method for computing all
  of them", *Meccanica* 15, 9–20 (Parte 1) e 21–30 (Parte 2). DOI Parte 2:
  [10.1007/BF02128237](https://doi.org/10.1007/BF02128237) — metodo standard di rinormalizzazione
  per la stima numerica di esponenti di Lyapunov da traiettorie gemelle, riferimento concettuale
  per un'eventuale versione quantitativa dell'indicatore di divergenza caotica (sezione "Rendering
  e diagnostica"); nessun coefficiente riportato qui.
- **Temperatura di equilibrio planetario** — formula standard di bilancio energetico a corpo
  nero (assorbimento su sezione d'urto circolare, riemissione su superficie sferica completa),
  qui estesa a una somma di flussi da tre sorgenti (punto 4 del Modello fisico); nessuna sorgente
  specifica citata, è un risultato di bilancio energetico elementare, non un fit calibrato.
