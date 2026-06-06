"use client";

import Link from "next/link";
import katex from "katex";

// ---------------------------------------------------------------------------
// Black-hole lab — methodology page (bilingual, in depth).
// A rigorous account of the mathematics and physics implemented in the
// renderer: metric, geodesics (null & timelike), accretion disk, invariant
// radiative transfer, returning radiation / photon ring, frame dragging, the
// spatial embedding, the playground dynamics and the numerical methods — with
// citations to international university sources, per the project's
// "fail loud, never fake" rule. Equations typeset with KaTeX.
// ---------------------------------------------------------------------------

type Locale = "it" | "en";

type Section = { heading: string; body: string[]; eqs?: { label: string; tex: string }[] };
type Ref = { cite: string; url?: string };

type Copy = {
  kicker: string;
  title: string;
  abstractHeading: string;
  abstract: string;
  tocHeading: string;
  intro: string[];
  sections: Section[];
  openHeading: string;
  open: string[];
  faqHeading: string;
  faq: { q: string; a: string }[];
  refsHeading: string;
  refs: Ref[];
  backToLab: string;
  openSim: string;
};

function Tex({ tex }: { tex: string }) {
  const html = katex.renderToString(tex, { throwOnError: false, displayMode: true });
  return <span className="bh-about__tex" dangerouslySetInnerHTML={{ __html: html }} />;
}

const COPY: Record<Locale, Copy> = {
  it: {
    kicker: "Fosforonero Lab",
    title: "Buco nero: trattazione matematica e fisica",
    abstractHeading: "Abstract",
    tocHeading: "Moduli",
    abstract:
      "Questa pagina racconta, con tutta la matematica in chiaro, come abbiamo costruito un buco nero di Schwarzschild che vive davvero dentro il browser, in tempo reale. L'idea di fondo è semplice e radicale: non disegniamo un buco nero, lo calcoliamo. Per ogni singolo pixel lanciamo, dalla camera a ritroso, un raggio e lo facciamo cadere nello spazio-tempo curvo lungo la geodetica nulla esatta della metrica: la stessa traiettoria che percorre un fotone reale, ottenuta risolvendo numericamente le equazioni della relatività generale (tracciare all'indietro dà esattamente la stessa immagine, perché in RG i cammini della luce sono reversibili). È una simulazione vera del lensing, non un effetto grafico. Da questo unico gesto nascono da sole tutte le cose che vedete: la luce piegata, la sfera fotonica, l'ombra e — grazie alla luce che torna dopo aver girato attorno al buco — il sottile photon ring. Il disco di accrescimento non ha un colore inventato: brilla del vero colore di corpo nero della sua temperatura, spostato dal redshift e dal beaming relativistico. Accanto ci sono due esperimenti: una demo che integra le orbite esatte di una particella (precessione, ISCO) e un playground in cui lanciare pianeti, stelle e comete e guardarle disgregarsi. Tutto ciò che è approssimato è dichiarato apertamente — lo spin ora è la metrica di Kerr esatta (geodetiche nulle ray-tracciate in tempo reale), e anche il disco lo segue (bordo interno all'ISCO prograda, Doppler/redshift esatti di Kerr); il profilo radiale del flusso è quello relativistico di disco sottile (Shakura–Sunyaev) con bordo interno all'ISCO di Kerr (il flusso esatto di Page–Thorne, nelle equazioni, è il riferimento relativistico); la turbolenza è procedurale (non GRMHD) e i getti sono stilizzati. Niente trucchi nascosti.",
    intro: [
      "Lavoriamo in unità geometrizzate, G = c = 1 — il modo dei fisici di dire «misuriamo tutto con lo stesso righello». Fissiamo il raggio di Schwarzschild rₛ = 2M = 1, che diventa la nostra unità naturale di lunghezza. Con questa scelta l'ultima orbita circolare stabile (ISCO) cade a r = 3 e la sfera fotonica a r = 1.5. Tenete a mente questi due numeri: sono i due cerchi invisibili attorno a cui ruota tutta la storia.",
    ],
    sections: [
      {
        heading: "1. Metrica di Schwarzschild e geodetiche nulle",
        body: [
          "Cominciamo dal teatro. Attorno a una massa sferica che non ruota lo spazio-tempo vuoto può avere una sola forma — la soluzione di Schwarzschild, trovata nel 1916. È il modo in cui la massa dice allo spazio e al tempo come incurvarsi. Due simmetrie ci regalano due regali: poiché la geometria non cambia né nel tempo né ruotando attorno all'asse, ci sono due quantità che un fotone conserva lungo tutto il viaggio — un'energia E e un momento angolare L. Sono i nostri punti fermi in un mondo che si piega.",
          "Ora mettiamoci la luce. Un fotone non ha massa e viaggia su una geodetica nulla: la sua «lunghezza» spazio-temporale è esattamente zero. Confiniamolo nel piano equatoriale e l'intero problema collassa in qualcosa di sorprendentemente familiare — una pallina che rotola in una valle, con un potenziale efficace. Il trucco classico è cambiare variabile, u = 1/r: l'orbita diventa l'equazione di Binet. Rispetto a Newton c'è un solo termine in più, quel 3M u², ed è tutta la relatività generale racchiusa in tre simboli: trascurabile lontano, padrone vicino.",
          "Quel termine fa una cosa spettacolare: a r = 3M la luce può addirittura mettersi in orbita circolare. È la sfera fotonica, un'orbita così instabile che il minimo soffio butta il fotone dentro o lo libera — ed è il bordo dell'ombra.",
          "Vale la pena vederlo nascere, non solo enunciarlo (l'equazione è qui sotto). Dal potenziale efficace, un fotone inverte la marcia dove la velocità radiale si annulla, e questo lega il suo parametro d'impatto al raggio di massimo avvicinamento: 1/b² = (1/r²)(1 − 2M/r). Il fotone «critico» è quello che gira sul filo, e corrisponde al massimo di quella curva. Derivando e ponendo a zero — d/dr[1/r² − 2M/r³] = −2/r³ + 6M/r⁴ = 0 — si trova r = 3M: la sfera fotonica esce dal calcolo, non la mettiamo a mano. Rimettendo r = 3M nella formula del parametro d'impatto si ottiene la soglia esatta dell'ombra: 1/b_c² = (1 − 2/3)/(9M²) = 1/(27M²), cioè b_c = 3√3·M ≈ 2,6 rₛ.",
          "Tradotto in ciò che vede l'occhio lontano: ogni raggio con parametro d'impatto b = L/E sotto questo b_c è condannato a cadere, quelli appena sopra si avvolgono attorno alla sfera fotonica e tornano — ed è da questa luce che ritorna che nasce il sottile anello luminoso. Il renderer non fa che integrare questa traiettoria, raggio per raggio (Eulero simplettico, o Runge–Kutta del 4° ordine in qualità Alta). (Carroll, Caltech; Kokkotas, Univ. Tübingen; Hirata, Ohio State; MTW.)",
        ],
        eqs: [
          { label: "Elemento di linea di Schwarzschild", tex: "ds^2 = -\\left(1-\\tfrac{2M}{r}\\right)dt^2 + \\left(1-\\tfrac{2M}{r}\\right)^{-1}dr^2 + r^2\\,d\\Omega^2" },
          { label: "Quantità conservate (vettori di Killing)", tex: "E = \\left(1-\\tfrac{2M}{r}\\right)\\dot t, \\qquad L = r^2\\dot\\varphi" },
          { label: "Potenziale efficace nullo", tex: "\\left(\\frac{dr}{d\\lambda}\\right)^{2} = E^{2} - \\frac{L^{2}}{r^{2}}\\left(1-\\frac{2M}{r}\\right)" },
          { label: "Equazione orbitale dei fotoni (Binet)", tex: "\\frac{d^{2}u}{d\\varphi^{2}} + u = 3M\\,u^{2}, \\qquad u = 1/r" },
          { label: "Parametro d'impatto e sfera fotonica (dal massimo del potenziale)", tex: "\\frac{1}{b^{2}} = \\frac{1}{r^{2}}\\left(1-\\frac{2M}{r}\\right), \\quad \\frac{d}{dr}\\!\\left(\\frac{1}{b^{2}}\\right)=0 \\;\\Rightarrow\\; r_{\\mathrm{ph}}=3M" },
          { label: "Parametro d'impatto critico (bordo dell'ombra)", tex: "b_c = \\left.\\frac{r}{\\sqrt{1-2M/r}}\\right|_{r=3M} = 3\\sqrt{3}\\,M \\approx 2.6\\,r_s" },
        ],
      },
      {
        heading: "2. Geodetiche di tipo-tempo: orbite, ISCO, precessione",
        body: [
          "Sostituiamo il fotone con un sasso. Ora la «lunghezza» della traiettoria non è zero ma −1 — è il battito del suo orologio proprio — e ricompare lo stesso schema: una pallina in un potenziale efficace V_eff. Ma la valle ha una forma nuova. In Newton c'è sempre una conca dove sistemare un'orbita stabile, per quanto stretta; in Schwarzschild quella conca scompare se ci si avvicina troppo. Il punto di non ritorno è r = 6M = 3 rₛ, l'ISCO, l'ultima orbita circolare stabile: un passo più dentro e nessuna orbita regge più, il sasso scivola dentro senza appello. Questo non ha analogo newtoniano — è la firma del campo forte.",
          "E le orbite che non precipitano? Non si chiudono. Lo stesso 3M u² che governava la luce qui fa ruotare lentamente l'ellisse a ogni giro: il periastro avanza e l'orbita disegna una rosetta. È, alla lettera, la matematica dei famosi 43 secondi d'arco per secolo «di troppo» nella precessione di Mercurio — l'anomalia che nel 1915 diede a Einstein la prima conferma osservativa. Nella demo «Orbite» basta spingere L sotto la soglia 2√3·M per vedere la rosetta trasformarsi in tuffo.",
          "Una nota geometrica: per la simmetria sferica ogni orbita di Schwarzschild giace in un piano fisso. Lo slider «Inclinazione» orienta quel piano nello spazio — l'integrazione resta esatta — così l'orbita si vede davvero in 3D rispetto al disco equatoriale. Le orbite genuinamente non-planari, quelle che riempiono un guscio sferico, esistono solo attorno a un buco rotante (Kerr) e sono governate da una quarta quantità conservata, la costante di Carter. Tradotto: per integrare un'orbita servono tante «leggi di conservazione» quante sono le dimensioni del moto. La simmetria sferica di Schwarzschild ne regala già abbastanza (energia, momento angolare); Kerr, che è simmetrico solo attorno all'asse, ne perderebbe una — ma Carter scoprì nel 1968 che ne sopravvive una quarta, nascosta, ed è lei a rendere le equazioni di nuovo risolvibili invece che caotiche.",
        ],
        eqs: [
          { label: "Potenziale efficace (tipo-tempo)", tex: "\\left(\\frac{dr}{d\\tau}\\right)^{2} = E^{2} - V_{\\mathrm{eff}}^{2}, \\quad V_{\\mathrm{eff}}^{2} = \\left(1-\\frac{2M}{r}\\right)\\left(1+\\frac{L^{2}}{r^{2}}\\right)" },
          { label: "Equazione orbitale (precessione dal termine 3Mu²)", tex: "\\frac{d^{2}u}{d\\varphi^{2}} + u = \\frac{M}{L^{2}} + 3M\\,u^{2}" },
          { label: "ISCO e momento angolare circolare", tex: "r_{\\mathrm{ISCO}} = 6M = 3\\,r_s, \\qquad L^{2}_{\\mathrm{circ}} = \\frac{M r^{2}}{r-3M}" },
          { label: "Precessione del periastro (campo debole)", tex: "\\Delta\\varphi_{\\mathrm{prec}} \\simeq \\frac{6\\pi M}{p} \\quad(\\text{Mercurio}:\\ 43''/\\text{secolo})" },
        ],
      },
      {
        heading: "3. Disco di accrescimento relativistico",
        body: [
          "Il disco è gas che spiraleggia verso il buco, e mentre cade attrito e turbolenza lo scaldano finché non splende. Il modello classico è quello di Shakura e Sunyaev (1973), poi messo in salsa relativistica da Novikov e Thorne, con una condizione al contorno elegante: all'ISCO lo sforzo si annulla, perché lì il gas perde la presa e precipita. Da quanta energia ogni anello irraggia segue — via Stefan–Boltzmann — la sua temperatura, che cresce verso il centro come r⁻³ᐟ⁴. Il renderer usa questo profilo di disco sottile in forma analitica, con il bordo interno inchiodato all'ISCO di Kerr; l'integrale esatto orbita-mediato di Page–Thorne è quello che trovi nelle equazioni qui sotto — il riferimento relativistico da cui il profilo discende.",
          "Ma cosa manca, davvero? Un disco vero non è una superficie liscia che irraggia: è plasma — gas ionizzato — intrecciato a campi magnetici, e a spingerlo verso il buco è una turbolenza ben precisa. Qui entra la sigla che uso spesso senza spiegarla: GRMHD, «magnetoidrodinamica in relatività generale». Vuol dire risolvere insieme, sulla griglia dello spazio-tempo curvo, le equazioni del fluido e quelle del campo magnetico (Maxwell). Serve perché nei dischi è l'instabilità magnetorotazionale — la MRI, un'instabilità del plasma magnetizzato in rotazione differenziale scoperta applicarsi ai dischi da Balbus e Hawley nel 1991 — a trasportare il momento angolare verso l'esterno e a lasciar cadere il gas. Senza campi magnetici, un disco non saprebbe nemmeno come accrescere. Una simulazione GRMHD calcola tutto questo: la turbolenza reale, l'emissione di sincrotrone degli elettroni che spiraleggiano nei campi, il trasporto radiativo completo. È lo stato dell'arte — i codici si chiamano HARM, Athena++, BHAC, KORAL — ed è ciò che ha permesso di interpretare le immagini dell'Event Horizon Telescope. Ma costa minuti o ore di calcolo per singolo fotogramma, su un supercomputer. Dentro i ~16 millisecondi di uno shader nel browser non c'è speranza. Per questo la nostra struttura gassosa è turbolenza procedurale: ne imita l'aspetto, non la fisica. Il lato termico — temperatura, colore, redshift, beaming — è invece quello giusto.",
          "E qui c'è la parte che ci piace di più: il colore non lo scegliamo noi. Ogni punto del disco ha una temperatura, e a quella temperatura corrisponde un vero colore di corpo nero — lo stesso di un ferro arroventato che passa dal rosso all'arancio al bianco-azzurro man mano che scalda. Convertiamo quella temperatura nel suo colore lungo il locus planckiano e lo mostriamo, niente gradiente arbitrario. Il primo a calcolare l'immagine di un disco così, a mano, nel 1979, fu Jean-Pierre Luminet — e somigliava già a Interstellar. (Shakura–Sunyaev 1973; Novikov–Thorne 1973; Luminet 1979.)",
          "Una parola sui bordi, perché raccontano due fisiche opposte. Quello interno è tagliente sul serio: all'ISCO il gas se ne va e la luce semplicemente finisce lì. Quello esterno no — dipende da dove il disco viene alimentato, ed è sfumato. Nella realtà la brillanza scende già da sola come r⁻³; noi aggiungiamo una dissolvenza morbida e larga che si spegne con pendenza nulla, così l'orlo non sembra tagliato col coltello. Inoltre il disco è reso come un mezzo a profondità ottica: opaco dove è brillante (interno), traslucido dove è fioco (esterno), con l'opacità di ogni attraversamento del piano ∝ luminosità/|cosθ| — di taglio (cammino lungo nel gas) appare denso, di faccia sottile, senza spessore geometrico e senza riga nera.",
        ],
        eqs: [
          { label: "Flusso del disco (limite newtoniano)", tex: "F(r) = \\frac{3\\,G M \\dot M}{8\\pi r^{3}}\\left(1 - \\sqrt{r_{\\mathrm{in}}/r}\\,\\right)" },
          { label: "Flusso di Page–Thorne (integrale relativistico esatto)", tex: "F(r) = -\\frac{\\dot M}{4\\pi\\sqrt{g}}\\,\\frac{\\Omega_{,r}}{(E-\\Omega L)^{2}}\\int_{r_{\\mathrm{in}}}^{r}(E-\\Omega L)\\,L_{,r}\\,dr'" },
          { label: "Temperatura efficace", tex: "T_{\\mathrm{eff}}(r) = \\left(F(r)/\\sigma\\right)^{1/4} \\propto r^{-3/4}" },
          { label: "Bordo interno (ISCO)", tex: "r_{\\mathrm{in}} = 6M = 3\\,r_s" },
        ],
      },
      {
        heading: "4. Trasporto radiativo ed effetti relativistici",
        body: [
          "Come cambia la luce lungo il tragitto? C'è una quantità quasi magica che resta costante: l'intensità divisa per la frequenza al cubo, Iᵥ/ν³. È il teorema di Liouville travestito — dice che i fotoni, nel loro spazio delle fasi, non si accalcano né si diradano. Se la conosciamo dove la luce nasce, la conosciamo anche qui all'occhio. Tutto il lavoro si riduce allora a un solo numero: il fattore g, il rapporto tra la frequenza che riceviamo e quella emessa.",
          "Quel g mette insieme tre effetti in un colpo solo: il tempo che scorre più lento vicino alla massa (redshift gravitazionale), la dilatazione del tempo del gas che sfreccia, e il Doppler di chi viene verso di noi o se ne va. Un corpo nero visto con fattore g resta un corpo nero, ma a temperatura g·T — quindi g sposta insieme colore e luminosità. Il risultato è una firma inconfondibile: il lato del disco che ci viene incontro è abbagliante e bluastro, quello che fugge è cupo e rosso. E poiché la luminosità va come g⁴, basta poco perché un lato domini l'altro. (Luminet 1979; Vincent et al. 2011, GYOTO.)",
        ],
        eqs: [
          { label: "Invariante di Liouville", tex: "\\frac{I_\\nu}{\\nu^{3}} = \\text{costante lungo il raggio}" },
          { label: "Velocità orbitale GR e fattore di redshift", tex: "v = \\sqrt{\\frac{M}{r-2M}}, \\qquad g = \\frac{\\sqrt{1 - 3M/r}}{1 - \\beta}, \\quad \\beta = \\mathbf v\\cdot\\hat{\\mathbf n}_{\\mathrm{oss}}" },
          { label: "Beaming bolometrico e colore", tex: "I_{\\mathrm{oss}} = g^{4}\\,I_{\\mathrm{em}}, \\qquad B_\\nu(T)\\big|_{g} = B_\\nu(g\\,T)" },
        ],
      },
      {
        heading: "5. Returning radiation e photon ring",
        body: [
          "Ecco la parte che rende un buco nero così luminoso. Alcuni raggi non vanno dritti e non cadono: sfiorano la sfera fotonica, fanno mezzo giro, un giro, due giri attorno al buco, e poi ripartono. È la returning radiation — la luce del disco che torna a mostrarsi dopo essere passata dietro l'orizzonte. Per coglierla il renderer infittisce i passi proprio dove la traiettoria si avvolge, là dove un passo grossolano perderebbe il giro.",
          "Il risultato è una scala di immagini del disco sempre più sottili, impilate una accanto all'altra, che si stringono verso il bordo dell'ombra. Ogni giro in più rimpicciolisce l'immagine di un fattore fisso — esponenzialmente, con esponente di Lyapunov γ = π per Schwarzschild — finché si fondono nel filo luminoso del photon ring. La cosa di cui andiamo fieri: non lo disegniamo. Emerge da solo dalla vera luce del disco che ritorna, con lo stesso colore, senza nessun anello finto sovrapposto. (Luminet 1979; Gralla, Holz & Wald 2019; Johnson et al. 2020, EHT.)",
        ],
        eqs: [
          { label: "Convergenza dei sub-anelli al valore critico", tex: "b_{n} - b_{c} \\;\\propto\\; e^{-\\gamma n}, \\qquad \\gamma = \\pi \\ (\\text{Schwarzschild})" },
          { label: "Raggio del photon ring (ombra)", tex: "b_c = 3\\sqrt{3}\\,M \\approx 2.6\\,r_s" },
        ],
      },
      {
        heading: "6. Rotazione: Kerr e frame-dragging",
        body: [
          "I buchi neri veri ruotano, e un buco nero che ruota fa qualcosa di stupefacente: trascina lo spazio stesso con sé, come un vortice trascina l'acqua. Abbastanza vicino non puoi stare fermo nemmeno accendendo i motori al massimo — lo spazio ti porta in giro. La metrica corretta è quella di Kerr, e quel trascinamento (frame-dragging) ha una velocità angolare ω = −g_{tφ}/g_{φφ} ben precisa.",
          "E qui il renderer fa sul serio: con lo slider Spin integriamo le geodetiche nulle ESATTE di Kerr, in forma di Kerr–Schild cartesiana. Questa forma non ha la singolarità di coordinate di Boyer–Lindquist ed è asintoticamente piatta, così il momento iniziale del fotone alla camera (lontana) è semplicemente la direzione del raggio — niente tetrade da sbagliare. La tetrade è il sistema di riferimento ortonormale locale dell'osservatore (i suoi quattro «righelli e orologio»): in coordinate scomode va costruita a mano per tradurre ciò che la camera misura in ciò che la metrica chiama momento, ed è un classico punto d'errore. Qui, asintoticamente piatta, quella traduzione è l'identità. Ne emergono da soli l'ombra asimmetrica, il photon ring spostato e schiacciato e il trascinamento dei sistemi inerziali: la stessa fisica del Gargantua di Interstellar (James, von Tunzelmann, Franklin & Thorne 2015), lì però ray-tracciata offline, qui in tempo reale nel browser. Anche il disco ora segue Kerr: bordo interno all'ISCO prograda (Bardeen) e Doppler/redshift esatti dalla metrica di Kerr (g = 1/[uᵗ(1−Ωλ)] con λ momento angolare assiale conservato del fotone); e il profilo radiale del flusso è quello relativistico di disco sottile (Shakura–Sunyaev) con bordo interno all'ISCO di Kerr, così la regione calda si stringe verso l'ISCO più piccolo man mano che il buco accelera. (Bardeen 1972/1973 per ISCO e geodetiche di Kerr; il flusso esatto di Page–Thorne 1974 è mostrato nelle equazioni come riferimento relativistico.)",
        ],
        eqs: [
          { label: "Velocità angolare di frame-dragging (Kerr)", tex: "\\omega(r,\\theta) = -\\,\\frac{g_{t\\varphi}}{g_{\\varphi\\varphi}} \\;\\xrightarrow{\\text{campo lontano}}\\; \\frac{2GJ}{c^{2} r^{3}}" },
          { label: "Metrica di Kerr–Schild (forma usata dal renderer)", tex: "g^{\\mu\\nu} = \\eta^{\\mu\\nu} - f\\,k^{\\mu}k^{\\nu}, \\qquad f = \\frac{2Mr^{3}}{r^{4}+a^{2}z^{2}}" },
          { label: "Geodetiche nulle (Hamiltoniana, integrate in tempo reale)", tex: "\\mathcal{H} = \\tfrac{1}{2}g^{\\mu\\nu}p_\\mu p_\\nu = 0, \\quad \\dot x^{\\mu} = \\frac{\\partial\\mathcal H}{\\partial p_\\mu}, \\;\\; \\dot p_\\mu = -\\frac{\\partial\\mathcal H}{\\partial x^{\\mu}}" },
        ],
      },
      {
        heading: "7. Geometria dello spazio: il paraboloide di Flamm",
        body: [
          "Il telo elastico con la palla da bowling è un'immagine bellissima e quasi sempre sbagliata. La griglia che potete accendere, invece, è quella giusta: il paraboloide di Flamm (1916). Se prendete la fetta equatoriale dello spazio attorno al buco (t, θ = π/2 costanti) e la immergete, senza stiracchiarla, in uno spazio euclideo a tre dimensioni, ottenete esattamente quell'imbuto. Le distanze misurate sulla superficie sono le vere distanze dello spazio curvo di Schwarzschild — non una metafora, ma la sua geometria intrinseca disegnata fedelmente. Quando il buco ruota, l'imbuto si attorciglia: è il frame-dragging che si fa vedere.",
        ],
        eqs: [
          { label: "Paraboloide di Flamm", tex: "z(r) = 2\\sqrt{r_s\\,(r - r_s)}, \\qquad \\left(\\frac{dz}{dr}\\right)^{2} = \\left(1-\\frac{r_s}{r}\\right)^{-1} - 1" },
        ],
      },
      {
        heading: "8. Playground: dinamica dei corpi",
        body: [
          "Il playground baratta un po' di esattezza per il gusto di lanciare le cose e vedere che succede. Invece delle geodetiche complete usa un trucco famoso: il potenziale di Paczyński–Wiita, Φ = −GM/(r − rₛ). Sembra Newton, ma quel −rₛ al denominatore fa la magia — riproduce esattamente l'ISCO a 6M e il tuffo finale, gli effetti di campo forte che a Newton mancano. In cambio possiamo permetterci la vera gravità reciproca tra tutti i corpi (un N-corpi smorzato). Il tasto «Sistema» costruisce d'un colpo un piccolo sistema planetario inclinato, con il buco nero al posto della stella centrale, come Gargantua.",
          "E quando un corpo si avvicina troppo? Viene fatto a spaghetti. La marea — la differenza di gravità tra la faccia vicina e quella lontana del corpo — vince la sua presa e lo stira. La fisica chiave (Rees 1988) è uno spread di energia: metà dei detriti rallenta e ricade, avvolgendosi attorno al buco e alimentando il disco; l'altra metà accelera e viene scagliata via in una lunga coda. La ricaduta segue la legge famosa Ṁ ∝ t⁻⁵ᐟ³. Ancora prima della disgregazione completa la stella perde gas dalla calotta rivolta al buco — un velo che si allarga via via che affonda. (Paczyński–Wiita 1980; Rees 1988.)",
          "Due corpi che si toccano non si attraversano: si fondono, conservando massa e quantità di moto (il raggio si combina per volume). E col tasto «Onde grav.» si accende la reazione di radiazione: i corpi irraggiano onde gravitazionali, perdono energia e spiraleggiano verso il buco — un EMRI in miniatura — con la caduta che accelera vertiginosamente (la «chirp») perché la potenza irraggiata cresce come 1/r⁵, fino al plunge o alla fusione. L'effetto reale è minuscolo, ∝ (v/c)⁵: qui è amplificato per renderlo visibile, esattamente come l'accelerazione del tempo. (Peters 1964.)",
        ],
        eqs: [
          { label: "Potenziale di Paczyński–Wiita", tex: "\\Phi(r) = -\\frac{GM}{r - r_s}" },
          { label: "Raggio mareale e spread di energia", tex: "r_t \\simeq R_\\star\\!\\left(\\frac{M_{\\mathrm{BH}}}{M_\\star}\\right)^{1/3}, \\qquad \\Delta\\varepsilon \\simeq \\frac{G M_{\\mathrm{BH}} R_\\star}{r_t^{2}}" },
          { label: "Tasso di ricaduta (fallback) del TDE", tex: "\\dot M_{\\mathrm{fb}} \\propto t^{-5/3}" },
          { label: "Inspiral per onde gravitazionali (Peters, orbita circolare)", tex: "\\frac{da}{dt} = -\\frac{64}{5}\\,\\frac{G^{3} m_1 m_2 (m_1+m_2)}{c^{5} a^{3}}" },
        ],
      },
      {
        heading: "9. Metodi numerici del renderer",
        body: [
          "Lensing: si integrano le geodetiche nulle ESATTE di Kerr nella forma hamiltoniana di Kerr–Schild — il drift dx/dλ = ∂H/∂p è in forma chiusa, il kick dp/dλ = −½∇ₓHq per differenze finite centrate — con passo adattivo raffinato vicino alla sfera fotonica per la returning radiation. Due integratori selezionati dalla qualità: Eulero simplettico (1° ordine, un solo gradiente per passo) per qualità Media/Bassa, e Runge–Kutta del 4° ordine per qualità Alta. L'RK4 porta l'errore di deflessione a ~10⁻⁷ rad e mantiene l'invariante nullo Hq costante a ~10⁻⁶ (verificato offline contro una soluzione di riferimento), al prezzo di quattro valutazioni del gradiente per passo. Il tone mapping è ACES filmico seguito da correzione gamma.",
          "Playground: la dinamica nel potenziale di Paczyński–Wiita usa sub-passi adattivi con gravità reciproca smorzata (softening ε) e velocità limitate a c. Il passo è però vincolato alla stabilità: non supera mai una frazione del tempo dinamico locale vicino al buco (criterio di tipo CFL, h ≤ min(h_max, C·(r−rₛ))). Se il budget di sub-passi non basta in prossimità dell'orizzonte, la simulazione avanza meno tempo simulato — rallenta dolcemente — invece di allungare il passo e iniettare energia: così il sistema a N-corpi resta stabile anche con molti corpi. L'aggiornamento semi-implicito (simplettico) conserva l'energia, quindi le orbite legate restano legate e le lune orbitano con la velocità circolare della stessa forza addolcita usata dall'integratore (non si sganciano). I detriti mareali vivono in un pool a dimensione fissa (ring buffer). Le geodetiche di tipo-tempo della demo «Orbite» sono integrate nell'azimuth φ con l'equazione orbitale esatta.",
          "Quanto è affidabile l'integrazione? La demo «Orbite» mostra dal vivo il drift dell'invariante di energia C dell'orbita (il primo integrale dell'equazione, legato a E): con il passo simplettico di Yoshida al 6° ordine resta dell'ordine di 10⁻¹³ e oscillante, non cresce — la prova numerica che l'energia non si disperde e le orbite legate restano legate. (Il leapfrog/Yoshida richiede un'hamiltoniana separabile come questa; per il lensing, hamiltoniana non-separabile, usiamo invece RK4.)",
        ],
        eqs: [
          { label: "Geodetica nulla di Kerr — flusso hamiltoniano integrato", tex: "\\dot x^{i} = \\frac{\\partial H}{\\partial p_i}, \\quad \\dot p_i = -\\frac{\\partial H}{\\partial x^{i}}, \\qquad H = \\tfrac{1}{2}\\,g^{\\mu\\nu}p_\\mu p_\\nu = \\tfrac{1}{2}\\,\\mathcal H_q" },
          { label: "Passo Runge–Kutta del 4° ordine (qualità Alta)", tex: "y_{n+1} = y_{n} + \\tfrac{h}{6}\\left(k_1 + 2k_2 + 2k_3 + k_4\\right), \\quad y=(x^{i},p_i)" },
          { label: "Passo a stabilità garantita (vicino all'orizzonte)", tex: "h \\le \\min\\!\\left(h_{\\max},\\; C\\,(r-r_s)\\right)" },
          { label: "Velocità circolare addolcita (lune, softening ε)", tex: "v_{\\mathrm{circ}}^{2} = \\frac{G M_p\\, r^{2}}{(r^{2}+\\varepsilon^{2})^{3/2}}" },
          { label: "Invariante di conservazione monitorato (demo Orbite)", tex: "C = \\left(\\frac{du}{d\\varphi}\\right)^{2} + u^{2} - \\frac{2M}{L^{2}}u - 2M u^{3} = \\frac{E^{2}-1}{L^{2}}" },
        ],
      },
      {
        heading: "10. Robustezza del ray-marching e artefatti risolti",
        body: [
          "Il budget di passi per raggio è finito: per non esaurirlo nel solo tragitto fino al buco — cosa che, zoomando lontano, faceva glitchare disco e ombra — i raggi che partono oltre la sfera d'influenza R_far vengono avanzati analiticamente in linea retta (lo spazio-tempo lì è praticamente piatto) e il march geodetico parte solo dove la curvatura conta. Per questo l'inquadratura regge anche a grande distanza. Vicino alla sfera fotonica il passo è invece raffinato, per risolvere la returning radiation e i sub-anelli.",
          "Composizione di profondità: il buco lensato scrive la profondità (gl_FragDepth) dal punto d'impatto in coordinate mondo, così i corpi 3D, le particelle e i detriti del playground vengono occlusi correttamente da disco e orizzonte invece di disegnarsi sopra. Il tone mapping è ACES filmico con bloom a soglia alta e il fondo cielo ha un floor prossimo allo zero: lo spazio profondo resta nero (paradosso di Olbers), come dev'essere.",
          "Aliasing del disco: la turbolenza non è una texture ripetuta (che lasciava una «quadrettatura» e una linea di giunzione) ma un FBM di rumore a gradiente (Perlin) con reticolo ruotato a ogni ottava e domain warp, così non compaiono né scacchiera né faccette del reticolo. Per togliere lo shimmer prospettico a vista radente, ogni ottava è inoltre band-limitata (FBM filtrato, stile mip): la sua frequenza viene confrontata con l'impronta del pixel sul disco — stimata analiticamente da distanza e angolo di attraversamento, NON da fwidth del punto d'impatto ray-marciato (che variava a blocchi 2×2 e generava una «rete» allineata allo schermo) — e l'ottava sfuma verso la sua media quando il periodo scende sotto un pixel. Il photon ring non è disegnato analiticamente (niente «doppio anello»): emerge dalla luce reale del disco tramite la returning radiation. Infine il post-processing gira in una pipeline a 16-bit (float) con un dithering finale, così i gradienti lisci del disco non mostrano il banding a 8-bit.",
          "Stili di resa opzionali. «Starless» evoca il look fotografico del raytracer di Riccardo Antonelli (rantonels/starless) arricchendo il cielo procedurale in una Via Lattea strutturata con bande di polvere e stelle più dense: poiché è campionato con la direzione del raggio GIÀ lensata, il cielo ricco viene davvero deformato dal buco — la firma di starless — senza spedire una panoramica da molti MB. «EHT» rende a risoluzione bassissima (beam-limited) per imitare le immagini reali dell'Event Horizon Telescope di M87* e Sgr A*.",
        ],
        eqs: [
          { label: "Avanzamento analitico al guscio d'influenza (raggi lontani)", tex: "\\mathbf p \\to \\mathbf p + \\Big(\\!-b - \\sqrt{b^{2} - (|\\mathbf p|^{2} - R_{\\mathrm{far}}^{2})}\\,\\Big)\\,\\hat{\\mathbf d}, \\quad b = \\mathbf p\\cdot\\hat{\\mathbf d}" },
          { label: "FBM con reticolo ruotato (anti-aliasing del disco)", tex: "\\mathrm{turb}(\\mathbf q) = \\sum_{k} a_k\\,\\mathrm{noise}\\!\\left(2^{k} R^{k}\\,\\mathbf q\\right), \\qquad R = \\text{rotazione fissa}" },
        ],
      },
      {
        heading: "11. Limiti: cosa NON è (onestà scientifica)",
        body: [
          "Lo spin è ora la metrica di Kerr esatta (geodetiche nulle ray-tracciate in tempo reale), e il disco la segue per l'ISCO e per il Doppler/redshift; il profilo radiale del flusso è invece quello relativistico di disco sottile (Shakura–Sunyaev) con bordo interno all'ISCO di Kerr — non l'integrale di Page–Thorne calcolato in tempo reale (lo mostriamo nelle equazioni come riferimento). Il disco è otticamente spesso con emissione di corpo nero: la sua struttura gassosa turbolenta è uno stand-in procedurale della turbolenza magnetorotazionale (MRI), non una soluzione GRMHD; non modella autogravità, spessore verticale né polarizzazione. Il photon ring emerge dalla returning radiation ma le immagini di ordine molto alto non sono risolte; i getti relativistici sono un'aggiunta stilizzata (otticamente sottile), non MHD. Le stelle di sfondo sono procedurali (il loro lensing è reale). Nel playground i corpi sono occlusi dal disco/orizzonte ma non lensati, l'integrazione è pseudo-newtoniana e l'illuminazione del disco è una luce centrale (approssimazione).",
          "In sintesi, ciò che NON è possibile in questo mezzo — e perché. (i) Il lensing di Kerr (geodetiche nulle) lo facciamo in tempo reale, ma una soluzione GRMHD del disco in metrica di Kerr — il trasporto radiativo completo del gas magnetizzato — richiede minuti–ore per fotogramma su cluster di calcolo: incompatibile con i ~16 ms a fotogramma di un fragment shader WebGL. (ii) Le immagini del photon ring di ordine molto alto (n ≳ 2) richiedono una precisione numerica e un numero di passi per pixel che il budget real-time non concede. (iii) Il trasporto radiativo completo (scattering multiplo, polarizzazione, opacità dipendente dalla frequenza), lo spessore verticale, l'autogravità e l'idrodinamica del disco e degli stream mareali sono problemi 3D tempo-dipendenti, fuori portata per un singolo passaggio di shading. (iv) Lensare e integrare in GR ogni corpo del playground moltiplicherebbe il costo per il numero di corpi, perdendo l'interattività. Tutto questo si fa — ma offline, con i codici GR citati (GYOTO, RAPTOR, ipole…): è esattamente la ragione per cui esistono.",
        ],
      },
      {
        heading: "12. Differenze con Interstellar (Gargantua / DNGR)",
        body: [
          "Gargantua, il buco nero di Interstellar (2014), fu calcolato dalla Double Negative con un motore dedicato, il DNGR (Double Negative Gravitational Renderer), descritto in un vero articolo scientifico (James, von Tunzelmann, Franklin & Thorne 2015). La fisica di base è LA STESSA che usiamo qui: geodetiche nulle esatte della metrica di Kerr. Quello che cambia è tutto il resto — ed è istruttivo capire perché.",
          "Tempo e risoluzione. Il DNGR girava OFFLINE su una render farm: fino a ~ore per fotogramma a risoluzione IMAX (decine di megapixel), con centinaia di TB di dati per alcune sequenze. Noi calcoliamo lo stesso lensing in ~16 ms per fotogramma nel browser. Per riuscirci tracciamo un singolo raggio per pixel; il DNGR tracciava interi FASCI di raggi (ray bundles) e ne propagava la sezione, così da poter anti-aliasare e filtrare in modo accurato i bordi sottilissimi (il photon ring, gli orli del disco) — un lusso che a 16 ms non ci possiamo permettere, e che noi sostituiamo con supersampling, band-limiting del rumore e dithering.",
          "Il disco. Il loro disco era un modello artistico-volumetrico costruito ad hoc dagli artisti (con texture, spessore, volute), non una simulazione GRMHD; il nostro è una superficie otticamente spessa con emissione di corpo nero reale e flusso relativistico di disco sottile, testurizzata con turbolenza procedurale. Entrambi sono modelli del gas, non soluzioni magnetoidrodinamiche.",
          "Una scelta NARRATIVA famosa: nel film il disco è quasi simmetrico in luminosità. In realtà il beaming relativistico rende un lato accecante e l'altro cupo (asimmetria Doppler) — Christopher Nolan e Kip Thorne scelsero di ATTENUARLA perché un'immagine così sbilanciata avrebbe confuso il pubblico. Noi facciamo l'opposto: mostriamo l'asimmetria Doppler vera (puoi accenderla/spegnerla) perché lo scopo è didattico, non cinematografico. Per lo stesso motivo loro usarono uno spin quasi estremo (a/M ≈ 0.999, per la dilatazione temporale della trama); da noi lo spin è uno slider.",
          "In una frase: stessa metrica, stesse geodetiche; loro offline, fotorealistici, con licenze artistiche al servizio della storia; noi in tempo reale, interattivi, con la fisica reale messa a nudo e ogni approssimazione dichiarata.",
        ],
      },
      {
        heading: "13. Scelte di progetto: perché così",
        body: [
          "Ogni decisione qui nasce da un'unica tensione: massima verità fisica dentro i ~16 ms per fotogramma di un fragment shader nel browser. Ecco le scelte principali e il loro perché.",
          "Calcolare, non disegnare. Il lensing è il «wow» ed è calcolabile esattamente, quindi lo integriamo davvero (geodetiche), raggio per raggio. L'emissione del disco invece NON è calcolabile in tempo reale (servirebbe la GRMHD), quindi usiamo un modello procedurale fisicamente motivato e lo DICHIARIAMO. La regola «fail loud, never fake» attraversa tutto il progetto: niente metriche inventate, niente colori arbitrari, ogni approssimazione scritta nero su bianco.",
          "Forma di Kerr–Schild (non Boyer–Lindquist). Le coordinate di Boyer–Lindquist hanno una singolarità all'orizzonte; Kerr–Schild no, ed è asintoticamente piatta — così il 4-momento iniziale del fotone alla camera lontana è semplicemente la direzione del raggio (E=1), senza tetrade dell'osservatore da sbagliare e senza instabilità all'orizzonte.",
          "Il giusto integratore per ogni problema. Il lensing ha un'hamiltoniana NON separabile → usiamo RK4 (4° ordine, esatto a ~10⁻⁷ rad per un raggio); la demo orbitale ha l'equazione di Binet SEPARABILE → usiamo Yoshida simplettico al 6° ordine (deriva dell'energia ~10⁻¹³); il playground baratta l'esattezza per l'interattività con il potenziale pseudo-newtoniano di Paczyński–Wiita, che riproduce ISCO e plunge ma permette la gravità a N-corpi (lensare e integrare in GR ogni corpo ucciderebbe l'interattività).",
          "Disco a profondità ottica, non a fetta geometrica: elimina il bordo nero e il banding e dà una transizione radiale morbida. Pipeline a 16-bit + dithering: niente terrazzamento a 8-bit sui gradienti lisci. Colore dalla temperatura (corpo nero), non da una palette. Flusso relativistico di disco sottile, non un gradiente arbitrario. Avanzamento analitico fino alla sfera d'influenza e passo adattivo: spendiamo il budget di passi dove conta (vicino al buco), non nel vuoto.",
          "Tre modalità separate (lensing, orbite, playground) perché separano preoccupazioni diverse: GR rigorosa a un corpo contro interattività a molti corpi. Cielo procedurale invece di una panoramica da molti MB: tiene leggero il bundle e il suo lensing è comunque reale. E infine accessibilità: bilingue, gratis, senza pubblicità, usabile da telefono — la fisica vera dovrebbe essere alla portata di tutti.",
        ],
      },
    ],
    openHeading: "Soluzioni open: cosa possiamo (e non possiamo) integrare",
    open: [
      "Esistono ottimi codici di ray-tracing relativistico open source — GYOTO (Observatoire de Paris), RAPTOR, ipole, grtrans, Blacklight — e l'implementazione aperta del metodo di Luminet. Sono però codici offline (C/C++/Python) che calcolano singoli fotogrammi in minuti/ore: non sono eseguibili in tempo reale in un fragment shader WebGL nel browser.",
      "Quello che integriamo davvero sono le loro formulazioni fisico-matematiche: la geodetica di Schwarzschild, il disco di Novikov–Thorne, il fattore g e l'invariante Iᵥ/ν³, il colore di corpo nero. Il nostro shader le reimplementa in GLSL e le cita; non incorpora il codice esterno. Dichiararlo è parte della regola «fail loud, never fake».",
    ],
    faqHeading: "Domande frequenti",
    faq: [
      {
        q: "Le equazioni usate sono reali e corrette?",
        a: "Sì per la geometria del lensing e per le orbite: l'integrazione delle geodetiche di Schwarzschild (nulle e di tipo-tempo) è esatta e riproduce sfera fotonica, anello di Einstein, ombra, ISCO e precessione del periastro. Velocità orbitale GR, redshift, invariante di Liouville e beaming bolometrico g⁴ usano le formule esatte; il colore è il vero corpo nero della temperatura locale; il photon ring emerge dalla returning radiation.",
      },
      {
        q: "Qual è la differenza tra la demo «Orbite» e il «Playground»?",
        a: "La demo «Orbite» integra la geodetica di tipo-tempo esatta di Schwarzschild per un singolo corpo (precessione e ISCO esatti). Il playground usa il potenziale pseudo-newtoniano di Paczyński–Wiita, che riproduce gli effetti forti (ISCO, caduta) ma permette la gravità reciproca a N-corpi — un compromesso esattezza/interattività.",
      },
      {
        q: "Posso integrare GYOTO o un codice GR completo?",
        a: "Non in tempo reale nel browser: sono codici offline. Reimplementiamo le loro formulazioni in GLSL e le citiamo. Per immagini scientifiche di precisione si usano proprio quei codici.",
      },
    ],
    refsHeading: "Bibliografia e fonti",
    refs: [
      { cite: "S. M. Carroll, «Lecture Notes on General Relativity» — geodetiche di Schwarzschild (Caltech).", url: "https://ned.ipac.caltech.edu/level5/March01/Carroll3/Carroll7.html" },
      { cite: "K. Kokkotas, «Particle Trajectories & The Classical Tests», Relatività Generale, Universität Tübingen.", url: "https://www.tat.physik.uni-tuebingen.de/~kokkotas/Teaching/GTR_files/GTR2018_3b.pdf" },
      { cite: "C. Hirata, «Geodesics in the Schwarzschild geometry», ph6820, The Ohio State University.", url: "https://hirata10.github.io/ph6820/lec17_bh_trajectories.pdf" },
      { cite: "J.-P. Luminet (1979), «Image of a spherical black hole with thin accretion disk», Astronomy & Astrophysics 75, 228.", url: "https://ui.adsabs.harvard.edu/abs/1979A%26A....75..228L/abstract" },
      { cite: "S. E. Gralla, D. E. Holz & R. M. Wald (2019), «Black hole shadows, photon rings, and lensing rings», Physical Review D 100, 024018.", url: "https://arxiv.org/abs/1906.00873" },
      { cite: "M. D. Johnson et al. (2020), «Universal interferometric signatures of a black hole's photon ring», Science Advances 6, eaaz1310.", url: "https://www.science.org/doi/10.1126/sciadv.aaz1310" },
      { cite: "N. I. Shakura & R. A. Sunyaev (1973), Astronomy & Astrophysics 24, 337." },
      { cite: "I. D. Novikov & K. S. Thorne (1973), «Astrophysics of Black Holes», in Black Holes (Les Houches)." },
      { cite: "D. N. Page & K. S. Thorne (1974), «Disk-accretion onto a black hole. Time-averaged structure of accretion disk», ApJ 191, 499.", url: "https://ui.adsabs.harvard.edu/abs/1974ApJ...191..499P/abstract" },
      { cite: "B. Paczyński & P. J. Wiita (1980), Astronomy & Astrophysics 88, 23." },
      { cite: "M. J. Rees (1988), «Tidal disruption of stars by black holes…», Nature 333, 523.", url: "https://ui.adsabs.harvard.edu/abs/1988Natur.333..523R/abstract" },
      { cite: "P. C. Peters (1964), «Gravitational radiation and the motion of two point masses», Physical Review 136, B1224.", url: "https://journals.aps.org/pr/abstract/10.1103/PhysRev.136.B1224" },
      { cite: "J. M. Bardeen (1973), «Timelike and null geodesics in the Kerr metric», in Black Holes (Les Houches)." },
      { cite: "H. Yoshida (1990), «Construction of higher order symplectic integrators», Physics Letters A 150, 262 — l'integratore simplettico al 6° ordine della demo Orbite.", url: "https://doi.org/10.1016/0375-9601(90)90092-3" },
      { cite: "M. Tao (2016), «Explicit symplectic approximation of nonseparable Hamiltonians», Physical Review E 94, 043303 — il metodo della modalità Ultra (Yoshida-6 simplettico per il lensing).", url: "https://arxiv.org/abs/1609.02212" },
      { cite: "L. Flamm (1916), «Beiträge zur Einsteinschen Gravitationstheorie», Physikalische Zeitschrift 17, 448 — il paraboloide." },
      { cite: "O. James, E. von Tunzelmann, P. Franklin & K. S. Thorne (2015), «Gravitational lensing by spinning black holes… Interstellar», Classical and Quantum Gravity 32, 065001.", url: "https://iopscience.iop.org/article/10.1088/0264-9381/32/6/065001" },
      { cite: "F. H. Vincent et al. (2011), «GYOTO: a new general relativistic ray-tracing code», Classical and Quantum Gravity 28, 225011.", url: "https://arxiv.org/abs/1109.4769" },
      { cite: "C. W. Misner, K. S. Thorne & J. A. Wheeler, «Gravitation» (1973); J. B. Hartle, «Gravity» (2003)." },
      { cite: "Colore di corpo nero → sRGB: approssimazione del locus planckiano di N. Bartlett (dati di M. Charity)." },
      { cite: "Stack: Three.js, React Three Fiber, @react-three/drei, @react-three/postprocessing, KaTeX. Sviluppo: Fosforonero — Matteo Pizzi (Roma)." },
    ],
    backToLab: "← Torna al Lab",
    openSim: "Apri la simulazione →",
  },
  en: {
    kicker: "Fosforonero Lab",
    title: "Black hole: a mathematical and physical treatment",
    abstractHeading: "Abstract",
    tocHeading: "Modules",
    abstract:
      "We describe a real-time WebGL renderer of a Schwarzschild black hole and its accretion disk. For each pixel we cast a ray from the camera backwards and integrate the photon's exact null geodesic through curved spacetime — the same path a real photon follows, by numerically solving the equations of general relativity (backward tracing gives the same image because light paths in GR are reversible): a true simulation of the lensing, not a graphical effect. This yields gravitational lensing, the photon sphere, the shadow and — through returning radiation — the photon ring. The disk is optically thick with blackbody emission and invariant relativistic radiative transfer (g⁴ beaming, gravitational redshift). A companion demo integrates the exact timelike geodesics (periastron precession, ISCO), while a playground uses the Paczyński–Wiita pseudo-Newtonian potential for N-body dynamics with tidal disruption. The approximations are stated explicitly: spin is now the exact Kerr metric (null geodesics ray-traced in real time), and the disk follows it too (inner edge at the prograde ISCO, exact Kerr Doppler/redshift, and a relativistic thin-disk (Shakura–Sunyaev) radial flux with the Kerr-ISCO inner edge — the exact Page–Thorne integral is shown in the equations as the relativistic reference); the turbulence is procedural (not GRMHD), and the jets are stylized.",
    intro: [
      "Geometrized units G = c = 1; in the renderer we fix the Schwarzschild radius rₛ = 2M = 1, so the ISCO is at r = 6M = 3 and the photon sphere at r = 3M = 1.5.",
    ],
    sections: [
      {
        heading: "1. Schwarzschild metric and null geodesics",
        body: [
          "Start with the stage. Around a non-rotating spherical mass, empty spacetime can take only one shape — the Schwarzschild solution, found in 1916. It is how the mass tells space and time to curve. Two symmetries hand us two gifts: because the geometry changes neither in time nor under rotation about the axis, there are two quantities a photon keeps for its entire journey — an energy E and an angular momentum L. They are our fixed points in a world that bends.",
          "Now add light. A photon is massless and travels on a null geodesic: its spacetime «length» is exactly zero. Confine it to the equatorial plane and the whole problem collapses into something surprisingly familiar — a ball rolling in a valley, with an effective potential. The classic trick is to change variable, u = 1/r: the orbit becomes the Binet equation. Compared with Newton there is just one extra term, that 3M u² — all of general relativity packed into three symbols: negligible far away, the master up close.",
          "That term does something spectacular: at r = 3M light itself can settle into a circular orbit. This is the photon sphere, an orbit so unstable that the faintest nudge throws the photon in or sets it free — and it is the edge of the shadow.",
          "It's worth watching it appear, not just stating it (the equation is below). From the effective potential a photon turns back where its radial velocity vanishes, which ties its impact parameter to the radius of closest approach: 1/b² = (1/r²)(1 − 2M/r). The «critical» photon is the one that skims on the edge, and it sits at the maximum of that curve. Differentiating and setting it to zero — d/dr[1/r² − 2M/r³] = −2/r³ + 6M/r⁴ = 0 — gives r = 3M: the photon sphere falls out of the calculation, we don't put it in by hand. Substituting r = 3M back into the impact-parameter formula gives the shadow's exact threshold: 1/b_c² = (1 − 2/3)/(9M²) = 1/(27M²), i.e. b_c = 3√3·M ≈ 2.6 rₛ.",
          "Translated into what a distant eye sees: every ray with impact parameter b = L/E below this b_c is doomed to fall, while those just above wind around the photon sphere and come back — and it is from that returning light that the thin bright ring is born. The renderer does nothing but integrate this trajectory, ray by ray (symplectic Euler, or 4th-order Runge–Kutta on High quality). (Carroll, Caltech; Kokkotas, Univ. Tübingen; Hirata, Ohio State; MTW.)",
        ],
        eqs: [
          { label: "Schwarzschild line element", tex: "ds^2 = -\\left(1-\\tfrac{2M}{r}\\right)dt^2 + \\left(1-\\tfrac{2M}{r}\\right)^{-1}dr^2 + r^2\\,d\\Omega^2" },
          { label: "Conserved quantities (Killing vectors)", tex: "E = \\left(1-\\tfrac{2M}{r}\\right)\\dot t, \\qquad L = r^2\\dot\\varphi" },
          { label: "Null effective potential", tex: "\\left(\\frac{dr}{d\\lambda}\\right)^{2} = E^{2} - \\frac{L^{2}}{r^{2}}\\left(1-\\frac{2M}{r}\\right)" },
          { label: "Photon orbit equation (Binet)", tex: "\\frac{d^{2}u}{d\\varphi^{2}} + u = 3M\\,u^{2}, \\qquad u = 1/r" },
          { label: "Impact parameter and photon sphere (from the potential's maximum)", tex: "\\frac{1}{b^{2}} = \\frac{1}{r^{2}}\\left(1-\\frac{2M}{r}\\right), \\quad \\frac{d}{dr}\\!\\left(\\frac{1}{b^{2}}\\right)=0 \\;\\Rightarrow\\; r_{\\mathrm{ph}}=3M" },
          { label: "Critical impact parameter (edge of the shadow)", tex: "b_c = \\left.\\frac{r}{\\sqrt{1-2M/r}}\\right|_{r=3M} = 3\\sqrt{3}\\,M \\approx 2.6\\,r_s" },
        ],
      },
      {
        heading: "2. Timelike geodesics: orbits, ISCO, precession",
        body: [
          "Swap the photon for a stone. Now the «length» of the path is not zero but −1 — it is the ticking of its own clock — and the same pattern returns: a ball in an effective potential V_eff. But the valley has a new shape. In Newton there is always a dip where a stable orbit can sit, however tight; in Schwarzschild that dip vanishes if you get too close. The point of no return is r = 6M = 3 rₛ, the ISCO, the innermost stable circular orbit: one step further in and no orbit holds — the stone slides in with no appeal. This has no Newtonian analogue; it is the signature of the strong field.",
          "And the orbits that do not plunge? They do not close. The very 3M u² that ruled the light here slowly rotates the ellipse on every turn: the periastron advances and the orbit traces a rosette. It is, literally, the mathematics of the famous 43 arc-seconds per century «too many» in Mercury's precession — the anomaly that in 1915 gave Einstein his first observational confirmation. In the «Orbits» demo, just push L below the 2√3·M threshold to watch the rosette turn into a plunge.",
          "A geometric note: by spherical symmetry every Schwarzschild orbit lies in a fixed plane. The «Inclination» slider orients that plane in space — the integration stays exact — so the orbit is genuinely seen in 3D relative to the equatorial disk. Truly non-planar orbits, the ones that fill a spherical shell, exist only around a rotating (Kerr) hole and are governed by a fourth conserved quantity, the Carter constant. In plain terms: to integrate an orbit you need as many «conservation laws» as the motion has dimensions. Schwarzschild's spherical symmetry already hands you enough (energy, angular momentum); Kerr, symmetric only about its axis, would lose one — but Carter found in 1968 that a fourth, hidden one survives, and it is what makes the equations solvable again instead of chaotic.",
        ],
        eqs: [
          { label: "Effective potential (timelike)", tex: "\\left(\\frac{dr}{d\\tau}\\right)^{2} = E^{2} - V_{\\mathrm{eff}}^{2}, \\quad V_{\\mathrm{eff}}^{2} = \\left(1-\\frac{2M}{r}\\right)\\left(1+\\frac{L^{2}}{r^{2}}\\right)" },
          { label: "Orbit equation (precession from the 3Mu² term)", tex: "\\frac{d^{2}u}{d\\varphi^{2}} + u = \\frac{M}{L^{2}} + 3M\\,u^{2}" },
          { label: "ISCO and circular angular momentum", tex: "r_{\\mathrm{ISCO}} = 6M = 3\\,r_s, \\qquad L^{2}_{\\mathrm{circ}} = \\frac{M r^{2}}{r-3M}" },
          { label: "Periastron precession (weak field)", tex: "\\Delta\\varphi_{\\mathrm{prec}} \\simeq \\frac{6\\pi M}{p} \\quad(\\text{Mercury}:\\ 43''/\\text{century})" },
        ],
      },
      {
        heading: "3. Relativistic accretion disk",
        body: [
          "The disk is gas spiralling toward the hole, and as it falls friction and turbulence heat it until it glows. The classic model is Shakura & Sunyaev's (1973), later cast in relativistic form by Novikov & Thorne, with one elegant boundary condition: at the ISCO the stress vanishes, because there the gas loses its grip and plunges. From how much energy each ring radiates follows — via Stefan–Boltzmann — its temperature, rising toward the centre as r⁻³ᐟ⁴. The renderer uses this thin-disk profile in analytic form, with the inner edge pinned to the Kerr ISCO; the exact orbit-averaged Page–Thorne integral is the one in the equations below — the relativistic reference the profile descends from.",
          "But what is actually missing? A real disk is not a smooth radiating surface: it is plasma — ionised gas — threaded with magnetic fields, and what drives it toward the hole is a very specific turbulence. This is where the acronym I keep using without unpacking comes in: GRMHD, «general-relativistic magnetohydrodynamics». It means solving together, on the grid of curved spacetime, the equations of the fluid and those of the magnetic field (Maxwell). You need it because in disks it is the magnetorotational instability — the MRI, an instability of magnetised, differentially-rotating plasma, shown to apply to disks by Balbus & Hawley in 1991 — that carries angular momentum outward and lets the gas fall in. Without magnetic fields a disk would not even know how to accrete. A GRMHD simulation computes all of it: the real turbulence, the synchrotron emission of electrons spiralling in the fields, full radiative transfer. It is the state of the art — the codes are called HARM, Athena++, BHAC, KORAL — and it is what made the Event Horizon Telescope images interpretable. But it costs minutes to hours per single frame, on a supercomputer. Inside the ~16 ms of a browser shader there is no hope. That is why our gaseous structure is procedural turbulence: it mimics the look, not the physics. The thermal side — temperature, colour, redshift, beaming — is the real thing.",
          "And here is the part we like best: we do not choose the colour. Every point on the disk has a temperature, and that temperature has a true blackbody colour — the same as a poker glowing red, then orange, then blue-white as it heats. We convert that temperature to its colour along the Planckian locus and show it — no arbitrary gradient. The first to compute the image of such a disk, by hand, in 1979, was Jean-Pierre Luminet — and it already looked like Interstellar. (Shakura–Sunyaev 1973; Novikov–Thorne 1973; Luminet 1979.)",
          "A word on the edges, because they tell two opposite stories. The inner one is genuinely sharp: at the ISCO the gas departs and the light simply ends there. The outer one is not — it depends on where the disk is fed, and it is fuzzy. In reality the brightness already falls on its own as r⁻³; we add a soft, wide taper that dies out with vanishing slope, so the rim is not cut with a knife. The disk is also rendered as an optical-depth medium: opaque where bright (inner), translucent where faint (outer), with each plane crossing's opacity ∝ brightness/|cosθ| — edge-on (a long path through the gas) it reads as dense, face-on as thin, with no geometric slab and no black seam.",
        ],
        eqs: [
          { label: "Disk flux (Newtonian limit)", tex: "F(r) = \\frac{3\\,G M \\dot M}{8\\pi r^{3}}\\left(1 - \\sqrt{r_{\\mathrm{in}}/r}\\,\\right)" },
          { label: "Page–Thorne flux (exact relativistic integral)", tex: "F(r) = -\\frac{\\dot M}{4\\pi\\sqrt{g}}\\,\\frac{\\Omega_{,r}}{(E-\\Omega L)^{2}}\\int_{r_{\\mathrm{in}}}^{r}(E-\\Omega L)\\,L_{,r}\\,dr'" },
          { label: "Effective temperature", tex: "T_{\\mathrm{eff}}(r) = \\left(F(r)/\\sigma\\right)^{1/4} \\propto r^{-3/4}" },
          { label: "Inner edge (ISCO)", tex: "r_{\\mathrm{in}} = 6M = 3\\,r_s" },
        ],
      },
      {
        heading: "4. Radiative transfer and relativistic effects",
        body: [
          "How does the light change along the way? There is an almost magical quantity that stays constant: the intensity divided by the frequency cubed, Iᵥ/ν³. It is Liouville's theorem in disguise — photons, in their phase space, neither crowd together nor thin out. If we know it where the light is born, we know it here at the eye. All the work then boils down to one number: the factor g, the ratio of the frequency we receive to the one emitted.",
          "That g rolls three effects into one: time running slower near the mass (gravitational redshift), the time dilation of the racing gas, and the Doppler of whatever comes toward us or flees. A blackbody seen with factor g stays a blackbody, but at temperature g·T — so g shifts colour and brightness together. The result is an unmistakable signature: the side coming at us is dazzling and bluish, the side fleeing dim and red. And since brightness goes as g⁴, it takes little for one side to dominate the other. (Luminet 1979; Vincent et al. 2011, GYOTO.)",
        ],
        eqs: [
          { label: "Liouville invariant", tex: "\\frac{I_\\nu}{\\nu^{3}} = \\text{constant along the ray}" },
          { label: "GR orbital velocity and redshift factor", tex: "v = \\sqrt{\\frac{M}{r-2M}}, \\qquad g = \\frac{\\sqrt{1 - 3M/r}}{1 - \\beta}, \\quad \\beta = \\mathbf v\\cdot\\hat{\\mathbf n}_{\\mathrm{obs}}" },
          { label: "Bolometric beaming and color", tex: "I_{\\mathrm{obs}} = g^{4}\\,I_{\\mathrm{em}}, \\qquad B_\\nu(T)\\big|_{g} = B_\\nu(g\\,T)" },
        ],
      },
      {
        heading: "5. Returning radiation and the photon ring",
        body: [
          "Here is what makes a black hole so luminous. Some rays go neither straight nor in: they graze the photon sphere, make half a turn, a turn, two turns around the hole, and then leave. This is returning radiation — the disk's own light coming back into view after passing behind the horizon. To catch it the renderer refines its steps exactly where the path winds, where a coarse step would miss the loop.",
          "The result is a ladder of ever-thinner images of the disk, stacked side by side, crowding toward the edge of the shadow. Each extra turn shrinks the image by a fixed factor — exponentially, with Lyapunov exponent γ = π for Schwarzschild — until they merge into the bright thread of the photon ring. The part we are proud of: we do not draw it. It emerges on its own from the real returning disk light, in the same colour, with no fake ring laid on top. (Luminet 1979; Gralla, Holz & Wald 2019; Johnson et al. 2020, EHT.)",
        ],
        eqs: [
          { label: "Sub-rings converge to the critical value", tex: "b_{n} - b_{c} \\;\\propto\\; e^{-\\gamma n}, \\qquad \\gamma = \\pi \\ (\\text{Schwarzschild})" },
          { label: "Photon-ring radius (shadow)", tex: "b_c = 3\\sqrt{3}\\,M \\approx 2.6\\,r_s" },
        ],
      },
      {
        heading: "6. Rotation: Kerr and frame dragging",
        body: [
          "Real black holes spin, and a spinning black hole does something astonishing: it drags space itself around with it, the way a whirlpool drags water. Close enough you cannot stay still even at full thrust — space carries you along. The correct metric is Kerr's, and that dragging (frame-dragging) has a precise angular velocity ω = −g_{tφ}/g_{φφ}.",
          "And here the renderer goes all in: with the Spin slider we integrate the EXACT Kerr null geodesics, in Cartesian Kerr–Schild form. That form has no Boyer–Lindquist coordinate singularity and is asymptotically flat, so the photon's initial momentum at the (distant) camera is simply the ray direction — no observer tetrad to get wrong. A tetrad is the observer's local orthonormal frame (their four «rulers and clock»): in awkward coordinates you must build it by hand to turn what the camera measures into what the metric calls momentum, and it's a classic place to slip. Here, asymptotically flat, that translation is the identity. The asymmetric shadow, the displaced and flattened photon ring and the dragging of inertial frames all emerge on their own: the same physics as Interstellar's Gargantua (James, von Tunzelmann, Franklin & Thorne 2015), there ray-traced offline, here in real time in the browser. The disk now follows Kerr too: the inner edge sits at the prograde ISCO (Bardeen) and the Doppler/redshift come from the exact Kerr metric (g = 1/[uᵗ(1−Ωλ)] with λ the photon's conserved axial angular momentum), and the radial flux is the relativistic thin-disk (Shakura–Sunyaev) profile with that Kerr-ISCO inner edge, so the hot region tightens toward the smaller ISCO as the hole spins up. (Bardeen 1972/1973 for the ISCO and Kerr geodesics; the exact Page–Thorne 1974 flux is shown in the equations as the relativistic reference.)",
        ],
        eqs: [
          { label: "Frame-dragging angular velocity (Kerr)", tex: "\\omega(r,\\theta) = -\\,\\frac{g_{t\\varphi}}{g_{\\varphi\\varphi}} \\;\\xrightarrow{\\text{far field}}\\; \\frac{2GJ}{c^{2} r^{3}}" },
          { label: "Kerr–Schild metric (form used by the renderer)", tex: "g^{\\mu\\nu} = \\eta^{\\mu\\nu} - f\\,k^{\\mu}k^{\\nu}, \\qquad f = \\frac{2Mr^{3}}{r^{4}+a^{2}z^{2}}" },
          { label: "Null geodesics (Hamiltonian, integrated in real time)", tex: "\\mathcal{H} = \\tfrac{1}{2}g^{\\mu\\nu}p_\\mu p_\\nu = 0, \\quad \\dot x^{\\mu} = \\frac{\\partial\\mathcal H}{\\partial p_\\mu}, \\;\\; \\dot p_\\mu = -\\frac{\\partial\\mathcal H}{\\partial x^{\\mu}}" },
        ],
      },
      {
        heading: "7. Spatial geometry: Flamm's paraboloid",
        body: [
          "The rubber sheet with the bowling ball is a beautiful image and almost always wrong. The grid you can switch on, instead, is the right one: Flamm's paraboloid (1916). Take the equatorial slice of the space around the hole (t, θ = π/2 const) and embed it, without stretching, into ordinary 3D Euclidean space, and you get exactly that funnel. Distances measured on the surface are the true distances of Schwarzschild's curved space — not a metaphor but its intrinsic geometry drawn faithfully. When the hole spins, the funnel twists: that is frame-dragging made visible.",
        ],
        eqs: [
          { label: "Flamm's paraboloid", tex: "z(r) = 2\\sqrt{r_s\\,(r - r_s)}, \\qquad \\left(\\frac{dz}{dr}\\right)^{2} = \\left(1-\\frac{r_s}{r}\\right)^{-1} - 1" },
        ],
      },
      {
        heading: "8. Playground: body dynamics",
        body: [
          "The playground trades a little exactness for the fun of throwing things in and watching. Instead of the full geodesics it uses a famous trick: the Paczyński–Wiita potential, Φ = −GM/(r − rₛ). It looks like Newton, but that −rₛ in the denominator works the magic — it reproduces the ISCO at 6M and the final plunge exactly, the strong-field effects Newton lacks. In return we can afford real mutual gravity between all the bodies (a softened N-body). The «System» button builds, in one go, a small inclined planetary system with the black hole standing in for the central star, like Gargantua.",
          "And when a body comes too close? It gets spaghettified. The tide — the difference in gravity between the body's near and far sides — overcomes its self-grip and stretches it. The key physics (Rees 1988) is a spread in energy: half the debris slows and falls back, wrapping around the hole and feeding the disk; the other half speeds up and is flung out in a long tail. The fallback follows the famous Ṁ ∝ t⁻⁵ᐟ³ law. Even before full disruption the star sheds gas from the cap facing the hole — a veil that widens as it sinks. (Paczyński–Wiita 1980; Rees 1988.)",
          "Two bodies that touch do not pass through each other: they merge, conserving mass and momentum (the radius combines by volume). And the «GW» button switches on radiation reaction: bodies emit gravitational waves, lose energy and spiral toward the hole — a miniature EMRI — the fall accelerating headlong (the «chirp») because the radiated power grows as 1/r⁵, down to the plunge or merger. The real effect is minuscule, ∝ (v/c)⁵: here it is amplified to be visible, exactly like the time speed-up. (Peters 1964.)",
        ],
        eqs: [
          { label: "Paczyński–Wiita potential", tex: "\\Phi(r) = -\\frac{GM}{r - r_s}" },
          { label: "Tidal radius and energy spread", tex: "r_t \\simeq R_\\star\\!\\left(\\frac{M_{\\mathrm{BH}}}{M_\\star}\\right)^{1/3}, \\qquad \\Delta\\varepsilon \\simeq \\frac{G M_{\\mathrm{BH}} R_\\star}{r_t^{2}}" },
          { label: "TDE fallback rate", tex: "\\dot M_{\\mathrm{fb}} \\propto t^{-5/3}" },
          { label: "Gravitational-wave inspiral (Peters, circular orbit)", tex: "\\frac{da}{dt} = -\\frac{64}{5}\\,\\frac{G^{3} m_1 m_2 (m_1+m_2)}{c^{5} a^{3}}" },
        ],
      },
      {
        heading: "9. Numerical methods of the renderer",
        body: [
          "Lensing: we integrate the EXACT Kerr null geodesics in Kerr–Schild Hamiltonian form — the drift dx/dλ = ∂H/∂p is closed-form, the kick dp/dλ = −½∇ₓHq is by central finite differences — with an adaptive step refined near the photon sphere for the returning radiation. Two integrators selected by quality: symplectic Euler (1st order, one gradient per step) for Medium/Low, and 4th-order Runge–Kutta for High. RK4 brings the deflection error to ~10⁻⁷ rad and keeps the null invariant Hq constant to ~10⁻⁶ (verified offline against a reference solution), at the cost of four gradient evaluations per step. Tone mapping is ACES filmic followed by gamma correction.",
          "Playground: dynamics in the Paczyński–Wiita potential use adaptive sub-stepping with softened mutual gravity (softening ε) and speeds capped at c. The step, however, is stability-limited: it never exceeds a fraction of the local dynamical time near the hole (a CFL-like criterion, h ≤ min(h_max, C·(r−rₛ))). If the sub-step budget is not enough close to the horizon, the simulation advances less simulated time — it gently slows down — instead of stretching the step and injecting energy, so the N-body system stays stable even with many bodies. The semi-implicit (symplectic) update conserves energy, so bound orbits stay bound and moons orbit with the circular speed of the same softened force the integrator uses (they do not unbind). Tidal debris lives in a fixed-size pool (ring buffer). The «Orbits» demo integrates the exact timelike orbit equation in the azimuth φ.",
          "How trustworthy is the integration? The «Orbits» demo shows, live, the drift of the orbit's energy invariant C (the first integral of the equation, tied to E): with the 6th-order Yoshida symplectic step it stays around 10⁻¹³ and oscillating rather than growing — the numerical proof that energy is not leaking and that bound orbits stay bound. (Leapfrog/Yoshida needs a separable Hamiltonian like this one; for the lensing, whose Hamiltonian is non-separable, we use RK4 instead.)",
        ],
        eqs: [
          { label: "Kerr null geodesic — integrated Hamiltonian flow", tex: "\\dot x^{i} = \\frac{\\partial H}{\\partial p_i}, \\quad \\dot p_i = -\\frac{\\partial H}{\\partial x^{i}}, \\qquad H = \\tfrac{1}{2}\\,g^{\\mu\\nu}p_\\mu p_\\nu = \\tfrac{1}{2}\\,\\mathcal H_q" },
          { label: "4th-order Runge–Kutta step (High quality)", tex: "y_{n+1} = y_{n} + \\tfrac{h}{6}\\left(k_1 + 2k_2 + 2k_3 + k_4\\right), \\quad y=(x^{i},p_i)" },
          { label: "Stability-limited step (near the horizon)", tex: "h \\le \\min\\!\\left(h_{\\max},\\; C\\,(r-r_s)\\right)" },
          { label: "Softened circular speed (moons, softening ε)", tex: "v_{\\mathrm{circ}}^{2} = \\frac{G M_p\\, r^{2}}{(r^{2}+\\varepsilon^{2})^{3/2}}" },
          { label: "Conservation invariant monitored (Orbits demo)", tex: "C = \\left(\\frac{du}{d\\varphi}\\right)^{2} + u^{2} - \\frac{2M}{L^{2}}u - 2M u^{3} = \\frac{E^{2}-1}{L^{2}}" },
        ],
      },
      {
        heading: "10. Ray-marching robustness and artifacts resolved",
        body: [
          "The per-ray step budget is finite: to avoid spending it just reaching the hole — which made the disk and shadow glitch when zooming far out — rays starting beyond the influence sphere R_far are advanced analytically in a straight line (spacetime there is essentially flat) and the geodesic march only begins where curvature matters. That is why the view holds even at large distance. Near the photon sphere, by contrast, the step is refined to resolve returning radiation and the sub-rings.",
          "Depth compositing: the lensed hole writes depth (gl_FragDepth) from the world-space hit point, so the 3D bodies, particles and playground debris are correctly occluded by the disk and horizon instead of drawing on top. Tone mapping is ACES filmic with a high-threshold bloom, and the sky background has a near-zero floor: deep space stays black (Olbers' paradox), as it should.",
          "Disk aliasing: the turbulence is not a tiled texture (which left a grid-like «checkering» and a seam line) but a gradient-noise (Perlin) FBM with a lattice rotated at each octave and a domain warp, so neither a checkerboard nor lattice facets appear. To remove grazing-angle perspective shimmer, each octave is also band-limited (filtered FBM, mip-style): its frequency is compared with the pixel's footprint on the disk — estimated analytically from distance and crossing angle, NOT from fwidth of the ray-marched hit point (which varied in 2×2 blocks and produced a screen-aligned «net») — and the octave fades toward its mean once its period drops below one pixel. The photon ring is not drawn analytically (no «double ring»): it emerges from the real disk light via returning radiation. Finally the post-processing runs in a 16-bit (float) pipeline with a final dither, so the disk's smooth gradients show no 8-bit banding.",
          "Optional rendering styles. «Starless» evokes the photographic look of Riccardo Antonelli's raytracer (rantonels/starless) by enriching the procedural sky into a structured, dust-laned Milky Way with denser stars: because it is sampled with the ALREADY-lensed ray direction, the rich sky is genuinely warped by the hole — the starless signature — without shipping a multi-MB panorama. «EHT» renders at very low (beam-limited) resolution to mimic the real Event Horizon Telescope images of M87* and Sgr A*.",
        ],
        eqs: [
          { label: "Analytic advance to the influence shell (distant rays)", tex: "\\mathbf p \\to \\mathbf p + \\Big(\\!-b - \\sqrt{b^{2} - (|\\mathbf p|^{2} - R_{\\mathrm{far}}^{2})}\\,\\Big)\\,\\hat{\\mathbf d}, \\quad b = \\mathbf p\\cdot\\hat{\\mathbf d}" },
          { label: "Rotated-lattice FBM (disk anti-aliasing)", tex: "\\mathrm{turb}(\\mathbf q) = \\sum_{k} a_k\\,\\mathrm{noise}\\!\\left(2^{k} R^{k}\\,\\mathbf q\\right), \\qquad R = \\text{fixed rotation}" },
        ],
      },
      {
        heading: "11. Limits: what it is NOT (scientific honesty)",
        body: [
          "Spin is now the exact Kerr metric (null geodesics ray-traced in real time), and the disk follows it for the ISCO and the Doppler/redshift; the radial flux profile is instead a relativistic thin-disk (Shakura–Sunyaev) profile with the Kerr-ISCO inner edge — not the Page–Thorne integral evaluated in real time (we show it in the equations as the reference). The disk is optically thick with blackbody emission: its turbulent gaseous structure is a procedural stand-in for magnetorotational (MRI) turbulence, not a GRMHD solution; it does not model self-gravity, vertical thickness or polarization. The photon ring emerges from returning radiation but the very high-order images are not resolved; the relativistic jets are a stylized (optically-thin) addition, not MHD. Background stars are procedural (their lensing is real). In the playground the bodies are occluded by the disk/horizon but not lensed, the integration is pseudo-Newtonian and the disk lighting is a central light (an approximation).",
          "In short, what is NOT possible in this medium — and why. (i) Kerr lensing (null geodesics) we now do in real time, but a GRMHD disk solution in the Kerr metric — full radiative transfer of the magnetized gas — takes minutes-to-hours per frame on compute clusters: incompatible with the ~16 ms per frame of a WebGL fragment shader. (ii) Very high-order photon-ring images (n ≳ 2) demand a numerical precision and a per-pixel step count the real-time budget cannot afford. (iii) Full radiative transfer (multiple scattering, polarization, frequency-dependent opacity), vertical thickness, self-gravity and the hydrodynamics of the disk and tidal streams are time-dependent 3D problems, out of reach for a single shading pass. (iv) Lensing and GR-integrating every playground body would multiply the cost by the number of bodies, killing interactivity. All of this is done — but offline, with the cited GR codes (GYOTO, RAPTOR, ipole…): which is exactly why they exist.",
        ],
      },
      {
        heading: "12. Differences from Interstellar (Gargantua / DNGR)",
        body: [
          "Gargantua, the black hole in Interstellar (2014), was computed by Double Negative with a dedicated engine, DNGR (Double Negative Gravitational Renderer), described in a genuine scientific paper (James, von Tunzelmann, Franklin & Thorne 2015). The underlying physics is THE SAME we use here: exact Kerr null geodesics. Everything else differs — and it is instructive to see why.",
          "Time and resolution. DNGR ran OFFLINE on a render farm: up to ~hours per frame at IMAX resolution (tens of megapixels), with hundreds of TB of data for some sequences. We compute the same lensing in ~16 ms per frame in the browser. To do that we trace a single ray per pixel; DNGR traced whole BUNDLES of rays and propagated their cross-section, so it could accurately anti-alias and filter the razor-thin features (the photon ring, the disk edges) — a luxury we cannot afford at 16 ms, and which we replace with supersampling, noise band-limiting and dithering.",
          "The disk. Theirs was a bespoke artistic-volumetric model built by the artists (with textures, thickness, swirls), not a GRMHD simulation; ours is an optically-thick surface with true blackbody emission and a relativistic thin-disk flux, textured with procedural turbulence. Both are models of the gas, not magnetohydrodynamic solutions.",
          "A famous NARRATIVE choice: in the film the disk is almost symmetric in brightness. In reality relativistic beaming makes one side blinding and the other dim (Doppler asymmetry) — Christopher Nolan and Kip Thorne chose to SUPPRESS it because such a lopsided image would confuse the audience. We do the opposite: we show the real Doppler asymmetry (you can toggle it) because the goal here is educational, not cinematic. For the same reason they used a near-extremal spin (a/M ≈ 0.999, for the plot's time dilation); here spin is a slider.",
          "In one line: same metric, same geodesics; theirs offline, photoreal, with artistic licence in service of the story; ours real-time, interactive, with the real physics laid bare and every approximation disclosed.",
        ],
      },
      {
        heading: "13. Design choices: why this way",
        body: [
          "Every decision here springs from a single tension: maximum physical truth within the ~16 ms per frame of a browser fragment shader. Here are the main choices and their reasons.",
          "Compute, don't draw. The lensing is the «wow» and it is exactly computable, so we genuinely integrate it (geodesics), ray by ray. The disk emission, by contrast, is NOT computable in real time (it would need GRMHD), so we use a physically-motivated procedural model and DECLARE it. The «fail loud, never fake» rule runs through the whole project: no invented metrics, no arbitrary colours, every approximation stated in black and white.",
          "Kerr–Schild form (not Boyer–Lindquist). Boyer–Lindquist coordinates have a horizon singularity; Kerr–Schild does not, and is asymptotically flat — so the photon's initial 4-momentum at the distant camera is simply the ray direction (E=1), with no observer tetrad to get wrong and no horizon instability.",
          "The right integrator for each problem. The lensing has a NON-separable Hamiltonian → we use RK4 (4th order, ~10⁻⁷ rad per ray); the orbit demo has the SEPARABLE Binet equation → we use a 6th-order Yoshida symplectic step (energy drift ~10⁻¹³); the playground trades exactness for interactivity with the Paczyński–Wiita pseudo-Newtonian potential, which reproduces ISCO and plunge but allows N-body gravity (lensing and GR-integrating every body would kill interactivity).",
          "Optical-depth disk, not a geometric slab: it removes the black edge and the banding and gives a smooth radial transition. 16-bit pipeline + dithering: no 8-bit terracing on the smooth gradients. Colour from temperature (blackbody), not from a palette. Relativistic thin-disk flux, not an arbitrary gradient. Analytic fast-forward to the influence sphere plus an adaptive step: we spend the step budget where it matters (near the hole), not in empty space.",
          "Three separate modes (lensing, orbits, playground) because they separate different concerns: rigorous single-body GR vs many-body interactivity. A procedural sky instead of a multi-MB panorama: it keeps the bundle light and its lensing is still real. And finally accessibility: bilingual, free, ad-free, usable from a phone — real physics should be within everyone's reach.",
        ],
      },
    ],
    openHeading: "Open solutions: what we can (and cannot) integrate",
    open: [
      "Excellent open-source relativistic ray-tracing codes exist — GYOTO (Observatoire de Paris), RAPTOR, ipole, grtrans, Blacklight — and an open implementation of Luminet's method. But they are offline codes (C/C++/Python) computing single frames in minutes/hours: they cannot run in real time inside a WebGL fragment shader in the browser.",
      "What we genuinely integrate are their physical–mathematical formulations: the Schwarzschild geodesic, the Novikov–Thorne disk, the g factor and the Iᵥ/ν³ invariant, the blackbody color. Our shader reimplements them in GLSL and cites them; it does not embed the external code. Stating this is part of the \"fail loud, never fake\" rule.",
    ],
    faqHeading: "Frequently asked questions",
    faq: [
      {
        q: "Are the equations used real and correct?",
        a: "Yes for the lensing geometry and the orbits: integrating Schwarzschild geodesics (null and timelike) is exact and reproduces the photon sphere, Einstein ring, shadow, ISCO and periastron precession. GR orbital velocity, redshift, the Liouville invariant and bolometric g⁴ beaming use the exact formulas; the color is the true blackbody color of the local temperature; the photon ring emerges from returning radiation.",
      },
      {
        q: "What is the difference between the «Orbits» demo and the «Playground»?",
        a: "The «Orbits» demo integrates the exact Schwarzschild timelike geodesic for a single body (exact precession and ISCO). The playground uses the Paczyński–Wiita pseudo-Newtonian potential, which reproduces the strong-field effects (ISCO, plunge) but allows mutual N-body gravity — an exactness/interactivity trade-off.",
      },
      {
        q: "Can I integrate GYOTO or a full GR code?",
        a: "Not in real time in the browser: those are offline codes. We reimplement their formulations in GLSL and cite them. Precision scientific images do use exactly those codes.",
      },
    ],
    refsHeading: "References & sources",
    refs: [
      { cite: "S. M. Carroll, “Lecture Notes on General Relativity” — Schwarzschild geodesics (Caltech).", url: "https://ned.ipac.caltech.edu/level5/March01/Carroll3/Carroll7.html" },
      { cite: "K. Kokkotas, “Particle Trajectories & The Classical Tests”, General Relativity, Universität Tübingen.", url: "https://www.tat.physik.uni-tuebingen.de/~kokkotas/Teaching/GTR_files/GTR2018_3b.pdf" },
      { cite: "C. Hirata, “Geodesics in the Schwarzschild geometry”, ph6820, The Ohio State University.", url: "https://hirata10.github.io/ph6820/lec17_bh_trajectories.pdf" },
      { cite: "J.-P. Luminet (1979), “Image of a spherical black hole with thin accretion disk”, Astronomy & Astrophysics 75, 228.", url: "https://ui.adsabs.harvard.edu/abs/1979A%26A....75..228L/abstract" },
      { cite: "S. E. Gralla, D. E. Holz & R. M. Wald (2019), “Black hole shadows, photon rings, and lensing rings”, Physical Review D 100, 024018.", url: "https://arxiv.org/abs/1906.00873" },
      { cite: "M. D. Johnson et al. (2020), “Universal interferometric signatures of a black hole's photon ring”, Science Advances 6, eaaz1310.", url: "https://www.science.org/doi/10.1126/sciadv.aaz1310" },
      { cite: "N. I. Shakura & R. A. Sunyaev (1973), Astronomy & Astrophysics 24, 337." },
      { cite: "I. D. Novikov & K. S. Thorne (1973), “Astrophysics of Black Holes”, in Black Holes (Les Houches)." },
      { cite: "D. N. Page & K. S. Thorne (1974), “Disk-accretion onto a black hole. Time-averaged structure of accretion disk”, ApJ 191, 499.", url: "https://ui.adsabs.harvard.edu/abs/1974ApJ...191..499P/abstract" },
      { cite: "B. Paczyński & P. J. Wiita (1980), Astronomy & Astrophysics 88, 23." },
      { cite: "M. J. Rees (1988), “Tidal disruption of stars by black holes…”, Nature 333, 523.", url: "https://ui.adsabs.harvard.edu/abs/1988Natur.333..523R/abstract" },
      { cite: "P. C. Peters (1964), “Gravitational radiation and the motion of two point masses”, Physical Review 136, B1224.", url: "https://journals.aps.org/pr/abstract/10.1103/PhysRev.136.B1224" },
      { cite: "J. M. Bardeen (1973), “Timelike and null geodesics in the Kerr metric”, in Black Holes (Les Houches)." },
      { cite: "H. Yoshida (1990), “Construction of higher order symplectic integrators”, Physics Letters A 150, 262 — the 6th-order symplectic integrator in the Orbits demo.", url: "https://doi.org/10.1016/0375-9601(90)90092-3" },
      { cite: "M. Tao (2016), “Explicit symplectic approximation of nonseparable Hamiltonians”, Physical Review E 94, 043303 — the method behind the Ultra mode (6th-order symplectic Yoshida for the lensing).", url: "https://arxiv.org/abs/1609.02212" },
      { cite: "L. Flamm (1916), “Beiträge zur Einsteinschen Gravitationstheorie”, Physikalische Zeitschrift 17, 448 — the paraboloid." },
      { cite: "O. James, E. von Tunzelmann, P. Franklin & K. S. Thorne (2015), “Gravitational lensing by spinning black holes… Interstellar”, Classical and Quantum Gravity 32, 065001.", url: "https://iopscience.iop.org/article/10.1088/0264-9381/32/6/065001" },
      { cite: "F. H. Vincent et al. (2011), “GYOTO: a new general relativistic ray-tracing code”, Classical and Quantum Gravity 28, 225011.", url: "https://arxiv.org/abs/1109.4769" },
      { cite: "C. W. Misner, K. S. Thorne & J. A. Wheeler, “Gravitation” (1973); J. B. Hartle, “Gravity” (2003)." },
      { cite: "Blackbody color → sRGB: N. Bartlett's Planckian-locus approximation (data by M. Charity)." },
      { cite: "Stack: Three.js, React Three Fiber, @react-three/drei, @react-three/postprocessing, KaTeX. Development: Fosforonero — Matteo Pizzi (Rome, Italy)." },
    ],
    backToLab: "← Back to Lab",
    openSim: "Open the simulation →",
  },
};

export function BlackHoleAboutView({ locale = "it" }: { locale?: Locale }) {
  const t = COPY[locale];
  const simHref = locale === "it" ? "/lab/buco-nero" : "/en/lab/black-hole";
  const labHref = locale === "it" ? "/lab" : "/en/lab";
  const faqHref = locale === "it" ? "/lab/buco-nero/faq" : "/en/lab/black-hole/faq";
  const faqLabel = locale === "it" ? "Domande frequenti →" : "FAQ →";

  return (
    <div className="bh-about-page">
      <article className="bh-about">
        <header className="bh-about__head">
          <span className="bh-about__kicker">{t.kicker}</span>
          <h1 className="bh-about__title">{t.title}</h1>
          {t.intro.map((p, i) => (
            <p key={i} className="bh-about__intro">{p}</p>
          ))}
          <div className="bh-about__actions">
            <Link href={simHref} className="bh-about__cta">{t.openSim}</Link>
            <Link href={faqHref} className="bh-about__link">{faqLabel}</Link>
            <Link
              href={locale === "it" ? "/en/lab/black-hole/about" : "/lab/buco-nero/about"}
              className="bh-about__link"
              hrefLang={locale === "it" ? "en" : "it"}
            >
              {locale === "it" ? "English" : "Italiano"}
            </Link>
            <Link href={labHref} className="bh-about__link">{t.backToLab}</Link>
          </div>
        </header>

        <section className="bh-about__section">
          <h2>{t.abstractHeading}</h2>
          <p style={{ fontStyle: "italic", color: "#aebbd2" }}>{t.abstract}</p>
        </section>

        <nav className="bh-about__toc" aria-label={t.tocHeading}>
          <h2>{t.tocHeading}</h2>
          <ol>
            {t.sections.map((s, i) => (
              <li key={i}>
                <a href={`#s${i + 1}`}>{s.heading}</a>
              </li>
            ))}
          </ol>
        </nav>

        {t.sections.map((s, i) => (
          <section key={i} id={`s${i + 1}`} className="bh-about__section" style={{ scrollMarginTop: 16 }}>
            <h2>{s.heading}</h2>
            {s.body.map((p, j) => (
              <p key={j}>{p}</p>
            ))}
            {s.eqs && (
              <div className="bh-about__eqs">
                {s.eqs.map((e, k) => (
                  <div key={k} className="bh-about__eq">
                    <span className="bh-about__eq-label">{e.label}</span>
                    <Tex tex={e.tex} />
                  </div>
                ))}
              </div>
            )}
          </section>
        ))}

        <section className="bh-about__section">
          <h2>{t.openHeading}</h2>
          {t.open.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </section>

        <section className="bh-about__section">
          <h2>{t.faqHeading}</h2>
          {t.faq.map((f, i) => (
            <div key={i} className="bh-about__faq">
              <h3>{f.q}</h3>
              <p>{f.a}</p>
            </div>
          ))}
        </section>

        <section className="bh-about__section">
          <h2>{t.refsHeading}</h2>
          <ol className="bh-about__refs">
            {t.refs.map((r, i) => (
              <li key={i}>
                {r.url ? (
                  <a href={r.url} target="_blank" rel="noopener noreferrer">{r.cite}</a>
                ) : (
                  r.cite
                )}
              </li>
            ))}
          </ol>
        </section>

        <div className="bh-kofi">
          <p>
            {locale === "it"
              ? "Questo laboratorio è gratuito, senza pubblicità e costruito con la fisica vera. Se ti è utile o vuoi sostenere nuovi strumenti scientifici interattivi, puoi offrirmi un caffè."
              : "This lab is free, ad-free and built on real physics. If it is useful to you or you want to support more interactive scientific tools, you can buy me a coffee."}
          </p>
          <a href="https://ko-fi.com/fosforonero" target="_blank" rel="noopener noreferrer" className="bh-kofi__btn">
            ☕ {locale === "it" ? "Supporta su Ko-fi" : "Support on Ko-fi"}
          </a>
        </div>

        <footer className="bh-about__foot">
          <Link href={simHref} className="bh-about__cta">{t.openSim}</Link>
          <Link href={faqHref} className="bh-about__link" style={{ marginLeft: 12 }}>{faqLabel}</Link>
        </footer>
      </article>
    </div>
  );
}
