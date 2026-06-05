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
    abstract:
      "Questa pagina racconta, con tutta la matematica in chiaro, come abbiamo costruito un buco nero di Schwarzschild che vive davvero dentro il browser, in tempo reale. L'idea di fondo è semplice e radicale: non disegniamo un buco nero, lo calcoliamo. Per ogni singolo pixel dello schermo lanciamo un raggio di luce all'indietro e lo lasciamo cadere nello spazio-tempo curvo, lungo la stessa geodetica nulla che seguirebbe un fotone vero. Da questo unico gesto nascono da sole tutte le cose che vedete: la luce piegata, la sfera fotonica, l'ombra e — grazie alla luce che torna dopo aver girato attorno al buco — il sottile photon ring. Il disco di accrescimento non ha un colore inventato: brilla del vero colore di corpo nero della sua temperatura, spostato dal redshift e dal beaming relativistico. Accanto ci sono due esperimenti: una demo che integra le orbite esatte di una particella (precessione, ISCO) e un playground in cui lanciare pianeti, stelle e comete e guardarle disgregarsi. Tutto ciò che è approssimato è dichiarato apertamente — spin alla Lense–Thirring (non Kerr), turbolenza del disco procedurale (non GRMHD), getti stilizzati. Niente trucchi nascosti.",
    intro: [
      "Lavoriamo in unità geometrizzate, G = c = 1 — il modo dei fisici di dire «misuriamo tutto con lo stesso righello». Fissiamo il raggio di Schwarzschild rₛ = 2M = 1, che diventa la nostra unità naturale di lunghezza. Con questa scelta l'ultima orbita circolare stabile (ISCO) cade a r = 3 e la sfera fotonica a r = 1.5. Tenete a mente questi due numeri: sono i due cerchi invisibili attorno a cui ruota tutta la storia.",
    ],
    sections: [
      {
        heading: "1. Metrica di Schwarzschild e geodetiche nulle",
        body: [
          "Cominciamo dal teatro. Attorno a una massa sferica che non ruota lo spazio-tempo vuoto può avere una sola forma — la soluzione di Schwarzschild, trovata nel 1916. È il modo in cui la massa dice allo spazio e al tempo come incurvarsi. Due simmetrie ci regalano due regali: poiché la geometria non cambia né nel tempo né ruotando attorno all'asse, ci sono due quantità che un fotone conserva lungo tutto il viaggio — un'energia E e un momento angolare L. Sono i nostri punti fermi in un mondo che si piega.",
          "Ora mettiamoci la luce. Un fotone non ha massa e viaggia su una geodetica nulla: la sua «lunghezza» spazio-temporale è esattamente zero. Confiniamolo nel piano equatoriale e l'intero problema collassa in qualcosa di sorprendentemente familiare — una pallina che rotola in una valle, con un potenziale efficace. Il trucco classico è cambiare variabile, u = 1/r: l'orbita diventa l'equazione di Binet. Rispetto a Newton c'è un solo termine in più, quel 3M u², ed è tutta la relatività generale racchiusa in tre simboli: trascurabile lontano, padrone vicino.",
          "Quel termine fa una cosa spettacolare: a r = 3M la luce può addirittura mettersi in orbita circolare. È la sfera fotonica, un'orbita così instabile che il minimo soffio butta il fotone dentro o lo libera — ed è il bordo dell'ombra. Tradotto in ciò che vede l'occhio lontano: ogni raggio con parametro d'impatto b = L/E sotto il valore critico b_c = 3√3·M ≈ 2.6 rₛ è condannato a cadere, quelli appena sopra si avvolgono e tornano. Il renderer non fa che integrare questa traiettoria, raggio per raggio, con velocity-Verlet. (Carroll, Caltech; Kokkotas, Univ. Tübingen; Hirata, Ohio State; MTW.)",
        ],
        eqs: [
          { label: "Elemento di linea di Schwarzschild", tex: "ds^2 = -\\left(1-\\tfrac{2M}{r}\\right)dt^2 + \\left(1-\\tfrac{2M}{r}\\right)^{-1}dr^2 + r^2\\,d\\Omega^2" },
          { label: "Quantità conservate (vettori di Killing)", tex: "E = \\left(1-\\tfrac{2M}{r}\\right)\\dot t, \\qquad L = r^2\\dot\\varphi" },
          { label: "Potenziale efficace nullo", tex: "\\left(\\frac{dr}{d\\lambda}\\right)^{2} = E^{2} - \\frac{L^{2}}{r^{2}}\\left(1-\\frac{2M}{r}\\right)" },
          { label: "Equazione orbitale dei fotoni (Binet)", tex: "\\frac{d^{2}u}{d\\varphi^{2}} + u = 3M\\,u^{2}, \\qquad u = 1/r" },
          { label: "Sfera fotonica e parametro d'impatto critico", tex: "r_{\\mathrm{ph}} = 3M, \\qquad b_c = 3\\sqrt{3}\\,M" },
        ],
      },
      {
        heading: "2. Geodetiche di tipo-tempo: orbite, ISCO, precessione",
        body: [
          "Sostituiamo il fotone con un sasso. Ora la «lunghezza» della traiettoria non è zero ma −1 — è il battito del suo orologio proprio — e ricompare lo stesso schema: una pallina in un potenziale efficace V_eff. Ma la valle ha una forma nuova. In Newton c'è sempre una conca dove sistemare un'orbita stabile, per quanto stretta; in Schwarzschild quella conca scompare se ci si avvicina troppo. Il punto di non ritorno è r = 6M = 3 rₛ, l'ISCO, l'ultima orbita circolare stabile: un passo più dentro e nessuna orbita regge più, il sasso scivola dentro senza appello. Questo non ha analogo newtoniano — è la firma del campo forte.",
          "E le orbite che non precipitano? Non si chiudono. Lo stesso 3M u² che governava la luce qui fa ruotare lentamente l'ellisse a ogni giro: il periastro avanza e l'orbita disegna una rosetta. È, alla lettera, la matematica dei famosi 43 secondi d'arco per secolo «di troppo» nella precessione di Mercurio — l'anomalia che nel 1915 diede a Einstein la prima conferma osservativa. Nella demo «Orbite» basta spingere L sotto la soglia 2√3·M per vedere la rosetta trasformarsi in tuffo.",
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
          "Il disco è gas che spiraleggia verso il buco, e mentre cade attrito e turbolenza lo scaldano finché non splende. Il modello classico è quello di Shakura e Sunyaev (1973), qui nella veste relativistica di Novikov e Thorne, con una condizione al contorno elegante: all'ISCO lo sforzo si annulla, perché lì il gas perde la presa e precipita. Da quanta energia ogni anello irraggia segue — via Stefan–Boltzmann — la sua temperatura, che cresce verso il centro come r⁻³ᐟ⁴.",
          "E qui c'è la parte che ci piace di più: il colore non lo scegliamo noi. Ogni punto del disco ha una temperatura, e a quella temperatura corrisponde un vero colore di corpo nero — lo stesso di un ferro arroventato che passa dal rosso all'arancio al bianco-azzurro man mano che scalda. Convertiamo quella temperatura nel suo colore lungo il locus planckiano e lo mostriamo, niente gradiente arbitrario. Il primo a calcolare l'immagine di un disco così, a mano, nel 1979, fu Jean-Pierre Luminet — e somigliava già a Interstellar. (Shakura–Sunyaev 1973; Novikov–Thorne 1973; Luminet 1979.)",
          "Una parola sui bordi, perché raccontano due fisiche opposte. Quello interno è tagliente sul serio: all'ISCO il gas se ne va e la luce semplicemente finisce lì. Quello esterno no — dipende da dove il disco viene alimentato, ed è sfumato. Nella realtà la brillanza scende già da sola come r⁻³; noi aggiungiamo una dissolvenza morbida e larga che si spegne con pendenza nulla, così l'orlo non sembra tagliato col coltello.",
        ],
        eqs: [
          { label: "Flusso del disco (Novikov–Thorne / Shakura–Sunyaev)", tex: "F(r) = \\frac{3\\,G M \\dot M}{8\\pi r^{3}}\\left(1 - \\sqrt{r_{\\mathrm{in}}/r}\\,\\right)" },
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
          "I buchi neri veri ruotano, e un buco nero che ruota fa qualcosa di stupefacente: trascina lo spazio stesso con sé, come un vortice trascina l'acqua. Abbastanza vicino non puoi stare fermo nemmeno accendendo i motori al massimo — lo spazio ti porta in giro. La metrica esatta è quella di Kerr e quel trascinamento (frame-dragging) ha una velocità angolare ω = −g_{tφ}/g_{φφ} ben precisa. Onestà piena: noi non integriamo Kerr.",
          "Lo slider Spin aggiunge il vortice in approssimazione di campo lontano — il «gravitomagnetismo» di Lense–Thirring, l'analogo gravitazionale del campo di un dipolo magnetico — che torce le orbite e la griglia nel verso giusto, ma non è la metrica di Kerr completa. Il Gargantua di Interstellar quella la usa per davvero, ray-tracciata però offline, fotogramma per fotogramma (James, von Tunzelmann, Franklin & Thorne 2015). I codici GR pubblici integrano Kerr, ma non a 60 fotogrammi al secondo dentro un browser. (Bardeen 1973 per le geodetiche di Kerr.)",
        ],
        eqs: [
          { label: "Velocità angolare di frame-dragging (Kerr)", tex: "\\omega(r,\\theta) = -\\,\\frac{g_{t\\varphi}}{g_{\\varphi\\varphi}} \\;\\xrightarrow{\\text{campo lontano}}\\; \\frac{2GJ}{c^{2} r^{3}}" },
          { label: "Approssimazione Lense–Thirring usata", tex: "\\mathbf a_{\\mathrm{drag}} \\propto \\mathbf v\\times\\mathbf B_g, \\qquad \\mathbf B_g = \\frac{3(\\mathbf J\\cdot\\hat{\\mathbf r})\\hat{\\mathbf r} - \\mathbf J}{r^{3}}" },
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
        ],
        eqs: [
          { label: "Potenziale di Paczyński–Wiita", tex: "\\Phi(r) = -\\frac{GM}{r - r_s}" },
          { label: "Raggio mareale e spread di energia", tex: "r_t \\simeq R_\\star\\!\\left(\\frac{M_{\\mathrm{BH}}}{M_\\star}\\right)^{1/3}, \\qquad \\Delta\\varepsilon \\simeq \\frac{G M_{\\mathrm{BH}} R_\\star}{r_t^{2}}" },
          { label: "Tasso di ricaduta (fallback) del TDE", tex: "\\dot M_{\\mathrm{fb}} \\propto t^{-5/3}" },
        ],
      },
      {
        heading: "9. Metodi numerici del renderer",
        body: [
          "Lensing: la geodetica nulla è integrata in forma vettoriale con un'accelerazione che curva il raggio, dove h² = |r × v|² è il momento angolare conservato del fotone; l'integratore è velocity-Verlet con passo adattivo, raffinato vicino alla sfera fotonica per la returning radiation. Il tone mapping è ACES filmico seguito da correzione gamma.",
          "Playground: la dinamica nel potenziale di Paczyński–Wiita usa sub-passi adattivi con gravità reciproca smorzata (softening ε) e velocità limitate a c. Il passo è però vincolato alla stabilità: non supera mai una frazione del tempo dinamico locale vicino al buco (criterio di tipo CFL, h ≤ min(h_max, C·(r−rₛ))). Se il budget di sub-passi non basta in prossimità dell'orizzonte, la simulazione avanza meno tempo simulato — rallenta dolcemente — invece di allungare il passo e iniettare energia: così il sistema a N-corpi resta stabile anche con molti corpi. L'aggiornamento semi-implicito (simplettico) conserva l'energia, quindi le orbite legate restano legate e le lune orbitano con la velocità circolare della stessa forza addolcita usata dall'integratore (non si sganciano). I detriti mareali vivono in un pool a dimensione fissa (ring buffer). Le geodetiche di tipo-tempo della demo «Orbite» sono integrate nell'azimuth φ con l'equazione orbitale esatta.",
        ],
        eqs: [
          { label: "Accelerazione geodetica integrata (rₛ = 1, M = ½)", tex: "\\mathbf a = -\\tfrac{3}{2}\\,h^{2}\\,\\frac{\\mathbf r}{|\\mathbf r|^{5}}, \\qquad h^{2} = |\\mathbf r\\times\\mathbf v|^{2}" },
          { label: "Passo velocity-Verlet", tex: "\\mathbf r_{n+1} = \\mathbf r_{n} + \\mathbf v_{n}\\,\\delta + \\tfrac{1}{2}\\mathbf a_{n}\\,\\delta^{2}" },
          { label: "Passo a stabilità garantita (vicino all'orizzonte)", tex: "h \\le \\min\\!\\left(h_{\\max},\\; C\\,(r-r_s)\\right)" },
          { label: "Velocità circolare addolcita (lune, softening ε)", tex: "v_{\\mathrm{circ}}^{2} = \\frac{G M_p\\, r^{2}}{(r^{2}+\\varepsilon^{2})^{3/2}}" },
        ],
      },
      {
        heading: "10. Robustezza del ray-marching e artefatti risolti",
        body: [
          "Il budget di passi per raggio è finito: per non esaurirlo nel solo tragitto fino al buco — cosa che, zoomando lontano, faceva glitchare disco e ombra — i raggi che partono oltre la sfera d'influenza R_far vengono avanzati analiticamente in linea retta (lo spazio-tempo lì è praticamente piatto) e il march geodetico parte solo dove la curvatura conta. Per questo l'inquadratura regge anche a grande distanza. Vicino alla sfera fotonica il passo è invece raffinato, per risolvere la returning radiation e i sub-anelli.",
          "Composizione di profondità: il buco lensato scrive la profondità (gl_FragDepth) dal punto d'impatto in coordinate mondo, così i corpi 3D, le particelle e i detriti del playground vengono occlusi correttamente da disco e orizzonte invece di disegnarsi sopra. Il tone mapping è ACES filmico con bloom a soglia alta e il fondo cielo ha un floor prossimo allo zero: lo spazio profondo resta nero (paradosso di Olbers), come dev'essere.",
          "Aliasing del disco: la turbolenza non è una texture ripetuta (che lasciava una «quadrettatura» e una linea di giunzione) ma un FBM di rumore a gradiente (Perlin) con reticolo ruotato a ogni ottava e domain warp, così non compaiono né scacchiera né faccette del reticolo. Per togliere lo shimmer prospettico a vista radente, ogni ottava è inoltre band-limitata (FBM filtrato, stile mip): la sua frequenza viene confrontata con l'impronta del pixel sul disco — stimata dalle derivate in screen-space — e l'ottava sfuma verso la sua media quando il periodo scende sotto un pixel. Il photon ring non è disegnato analiticamente (niente «doppio anello»): emerge dalla luce reale del disco tramite la returning radiation.",
        ],
        eqs: [
          { label: "Avanzamento analitico al guscio d'influenza (raggi lontani)", tex: "\\mathbf p \\to \\mathbf p + \\Big(\\!-b - \\sqrt{b^{2} - (|\\mathbf p|^{2} - R_{\\mathrm{far}}^{2})}\\,\\Big)\\,\\hat{\\mathbf d}, \\quad b = \\mathbf p\\cdot\\hat{\\mathbf d}" },
          { label: "FBM con reticolo ruotato (anti-aliasing del disco)", tex: "\\mathrm{turb}(\\mathbf q) = \\sum_{k} a_k\\,\\mathrm{noise}\\!\\left(2^{k} R^{k}\\,\\mathbf q\\right), \\qquad R = \\text{rotazione fissa}" },
        ],
      },
      {
        heading: "11. Limiti: cosa NON è (onestà scientifica)",
        body: [
          "La base è Schwarzschild (non rotante); lo spin è approssimato (Lense–Thirring), non Kerr. Il disco è otticamente spesso con emissione di corpo nero: la sua struttura gassosa turbolenta è uno stand-in procedurale della turbolenza magnetorotazionale (MRI), non una soluzione GRMHD; non modella autogravità, spessore verticale né polarizzazione. Il photon ring emerge dalla returning radiation ma le immagini di ordine molto alto non sono risolte; i getti relativistici sono un'aggiunta stilizzata (otticamente sottile), non MHD. Le stelle di sfondo sono procedurali (il loro lensing è reale). Nel playground i corpi sono occlusi dal disco/orizzonte ma non lensati, l'integrazione è pseudo-newtoniana e l'illuminazione del disco è una luce centrale (approssimazione).",
          "In sintesi, ciò che NON è possibile in questo mezzo — e perché. (i) Il ray-tracing completo della metrica di Kerr e una soluzione GRMHD del disco richiedono minuti–ore per fotogramma su cluster di calcolo: incompatibili con i ~16 ms a fotogramma di un fragment shader WebGL in tempo reale. (ii) Le immagini del photon ring di ordine molto alto (n ≳ 2) richiedono una precisione numerica e un numero di passi per pixel che il budget real-time non concede. (iii) Il trasporto radiativo completo (scattering multiplo, polarizzazione, opacità dipendente dalla frequenza), lo spessore verticale, l'autogravità e l'idrodinamica del disco e degli stream mareali sono problemi 3D tempo-dipendenti, fuori portata per un singolo passaggio di shading. (iv) Lensare e integrare in GR ogni corpo del playground moltiplicherebbe il costo per il numero di corpi, perdendo l'interattività. Tutto questo si fa — ma offline, con i codici GR citati (GYOTO, RAPTOR, ipole…): è esattamente la ragione per cui esistono.",
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
      { cite: "B. Paczyński & P. J. Wiita (1980), Astronomy & Astrophysics 88, 23." },
      { cite: "M. J. Rees (1988), «Tidal disruption of stars by black holes…», Nature 333, 523.", url: "https://ui.adsabs.harvard.edu/abs/1988Natur.333..523R/abstract" },
      { cite: "J. M. Bardeen (1973), «Timelike and null geodesics in the Kerr metric», in Black Holes (Les Houches)." },
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
    abstract:
      "We describe a real-time WebGL renderer of a Schwarzschild black hole and its accretion disk. For each pixel the photon's null geodesic is integrated through curved spacetime, yielding gravitational lensing, the photon sphere, the shadow and — through returning radiation — the photon ring. The disk is optically thick with blackbody emission and invariant relativistic radiative transfer (g⁴ beaming, gravitational redshift). A companion demo integrates the exact timelike geodesics (periastron precession, ISCO), while a playground uses the Paczyński–Wiita pseudo-Newtonian potential for N-body dynamics with tidal disruption. The approximations are stated explicitly: spin in the Lense–Thirring approximation (not Kerr), procedural disk turbulence (not GRMHD), stylized jets.",
    intro: [
      "Geometrized units G = c = 1; in the renderer we fix the Schwarzschild radius rₛ = 2M = 1, so the ISCO is at r = 6M = 3 and the photon sphere at r = 3M = 1.5.",
    ],
    sections: [
      {
        heading: "1. Schwarzschild metric and null geodesics",
        body: [
          "Start with the stage. Around a non-rotating spherical mass, empty spacetime can take only one shape — the Schwarzschild solution, found in 1916. It is how the mass tells space and time to curve. Two symmetries hand us two gifts: because the geometry changes neither in time nor under rotation about the axis, there are two quantities a photon keeps for its entire journey — an energy E and an angular momentum L. They are our fixed points in a world that bends.",
          "Now add light. A photon is massless and travels on a null geodesic: its spacetime «length» is exactly zero. Confine it to the equatorial plane and the whole problem collapses into something surprisingly familiar — a ball rolling in a valley, with an effective potential. The classic trick is to change variable, u = 1/r: the orbit becomes the Binet equation. Compared with Newton there is just one extra term, that 3M u² — all of general relativity packed into three symbols: negligible far away, the master up close.",
          "That term does something spectacular: at r = 3M light itself can settle into a circular orbit. This is the photon sphere, an orbit so unstable that the faintest nudge throws the photon in or sets it free — and it is the edge of the shadow. Translated into what a distant eye sees: every ray with impact parameter b = L/E below the critical value b_c = 3√3·M ≈ 2.6 rₛ is doomed to fall, while those just above wind around and come back. The renderer does nothing but integrate this trajectory, ray by ray, with velocity-Verlet. (Carroll, Caltech; Kokkotas, Univ. Tübingen; Hirata, Ohio State; MTW.)",
        ],
        eqs: [
          { label: "Schwarzschild line element", tex: "ds^2 = -\\left(1-\\tfrac{2M}{r}\\right)dt^2 + \\left(1-\\tfrac{2M}{r}\\right)^{-1}dr^2 + r^2\\,d\\Omega^2" },
          { label: "Conserved quantities (Killing vectors)", tex: "E = \\left(1-\\tfrac{2M}{r}\\right)\\dot t, \\qquad L = r^2\\dot\\varphi" },
          { label: "Null effective potential", tex: "\\left(\\frac{dr}{d\\lambda}\\right)^{2} = E^{2} - \\frac{L^{2}}{r^{2}}\\left(1-\\frac{2M}{r}\\right)" },
          { label: "Photon orbit equation (Binet)", tex: "\\frac{d^{2}u}{d\\varphi^{2}} + u = 3M\\,u^{2}, \\qquad u = 1/r" },
          { label: "Photon sphere and critical impact parameter", tex: "r_{\\mathrm{ph}} = 3M, \\qquad b_c = 3\\sqrt{3}\\,M" },
        ],
      },
      {
        heading: "2. Timelike geodesics: orbits, ISCO, precession",
        body: [
          "Swap the photon for a stone. Now the «length» of the path is not zero but −1 — it is the ticking of its own clock — and the same pattern returns: a ball in an effective potential V_eff. But the valley has a new shape. In Newton there is always a dip where a stable orbit can sit, however tight; in Schwarzschild that dip vanishes if you get too close. The point of no return is r = 6M = 3 rₛ, the ISCO, the innermost stable circular orbit: one step further in and no orbit holds — the stone slides in with no appeal. This has no Newtonian analogue; it is the signature of the strong field.",
          "And the orbits that do not plunge? They do not close. The very 3M u² that ruled the light here slowly rotates the ellipse on every turn: the periastron advances and the orbit traces a rosette. It is, literally, the mathematics of the famous 43 arc-seconds per century «too many» in Mercury's precession — the anomaly that in 1915 gave Einstein his first observational confirmation. In the «Orbits» demo, just push L below the 2√3·M threshold to watch the rosette turn into a plunge.",
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
          "The thin, optically-thick disk follows the Shakura–Sunyaev model in its relativistic Novikov–Thorne version, with a zero-stress boundary condition at the ISCO. The emitted flux and the effective (Stefan–Boltzmann) temperature set a local blackbody emission.",
          "The color is therefore the true blackbody color of the local temperature (Planckian locus → sRGB), not an arbitrary gradient. The first computed image of such a disk is Luminet's (1979). (Shakura–Sunyaev 1973; Novikov–Thorne 1973; Luminet 1979.)",
          "On the edges: the inner one (at the ISCO) is genuinely sharp — the zero-stress boundary makes the flux vanish at the inner radius. The outer one, instead, is a numerical truncation at a finite radius: we render it feathered (the brightness already falls ∝ r⁻³ and we add a gradual taper reaching zero slope at the edge), because a real disk's outer boundary — set by its feeding region — is fuzzy, not a razor edge.",
        ],
        eqs: [
          { label: "Disk flux (Novikov–Thorne / Shakura–Sunyaev)", tex: "F(r) = \\frac{3\\,G M \\dot M}{8\\pi r^{3}}\\left(1 - \\sqrt{r_{\\mathrm{in}}/r}\\,\\right)" },
          { label: "Effective temperature", tex: "T_{\\mathrm{eff}}(r) = \\left(F(r)/\\sigma\\right)^{1/4} \\propto r^{-3/4}" },
          { label: "Inner edge (ISCO)", tex: "r_{\\mathrm{in}} = 6M = 3\\,r_s" },
        ],
      },
      {
        heading: "4. Radiative transfer and relativistic effects",
        body: [
          "Along a ray the quantity Iᵥ/ν³ is invariant (Liouville's theorem for photons). With the redshift factor g = νₒᵦₛ/νₑₘ, for an emitter on a circular orbit g combines gravitational and time dilation with the longitudinal Doppler.",
          "A blackbody seen with factor g remains a blackbody at temperature g·T (Doppler invariance of the Planck spectrum), with bolometric intensity ∝ g⁴. The same g drives brightness and color: the approaching side is brighter and bluer, the receding side darker and redder. (Luminet 1979; Vincent et al. 2011, GYOTO.)",
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
          "Rays grazing the photon sphere wind around the black hole before escaping or hitting the disk: this is returning radiation. The renderer refines the integration step just outside the photon sphere, capturing the higher-order images of the disk — disk light that completed extra half-orbits.",
          "These images pile up into ever-thinner sub-rings converging to the critical impact parameter b_c, with an exponentially decaying spacing (Lyapunov exponent γ = π for Schwarzschild). The limit is the photon ring: in our implementation it emerges from the real disk light (same color), not drawn analytically. (Luminet 1979; Gralla, Holz & Wald 2019; Johnson et al. 2020, EHT.)",
        ],
        eqs: [
          { label: "Sub-rings converge to the critical value", tex: "b_{n} - b_{c} \\;\\propto\\; e^{-\\gamma n}, \\qquad \\gamma = \\pi \\ (\\text{Schwarzschild})" },
          { label: "Photon-ring radius (shadow)", tex: "b_c = 3\\sqrt{3}\\,M \\approx 2.6\\,r_s" },
        ],
      },
      {
        heading: "6. Rotation: Kerr and frame dragging",
        body: [
          "Real black holes spin, and a spinning black hole does something astonishing: it drags space itself around with it, the way a whirlpool drags water. Close enough you cannot stay still even at full thrust — space carries you along. The exact metric is Kerr's, and that dragging (frame-dragging) has a precise angular velocity ω = −g_{tφ}/g_{φφ}. Full honesty: we do not integrate Kerr.",
          "The Spin slider adds the whirl in a far-field approximation — Lense–Thirring «gravitomagnetism», the gravitational analogue of a magnetic dipole field — which twists the orbits and the grid the right way, but is not the full Kerr metric. Interstellar's Gargantua does use the real thing, ray-traced offline, frame by frame (James, von Tunzelmann, Franklin & Thorne 2015). Public GR codes integrate Kerr, but not at 60 frames per second inside a browser. (Bardeen 1973 for Kerr geodesics.)",
        ],
        eqs: [
          { label: "Frame-dragging angular velocity (Kerr)", tex: "\\omega(r,\\theta) = -\\,\\frac{g_{t\\varphi}}{g_{\\varphi\\varphi}} \\;\\xrightarrow{\\text{far field}}\\; \\frac{2GJ}{c^{2} r^{3}}" },
          { label: "Lense–Thirring approximation used", tex: "\\mathbf a_{\\mathrm{drag}} \\propto \\mathbf v\\times\\mathbf B_g, \\qquad \\mathbf B_g = \\frac{3(\\mathbf J\\cdot\\hat{\\mathbf r})\\hat{\\mathbf r} - \\mathbf J}{r^{3}}" },
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
        ],
        eqs: [
          { label: "Paczyński–Wiita potential", tex: "\\Phi(r) = -\\frac{GM}{r - r_s}" },
          { label: "Tidal radius and energy spread", tex: "r_t \\simeq R_\\star\\!\\left(\\frac{M_{\\mathrm{BH}}}{M_\\star}\\right)^{1/3}, \\qquad \\Delta\\varepsilon \\simeq \\frac{G M_{\\mathrm{BH}} R_\\star}{r_t^{2}}" },
          { label: "TDE fallback rate", tex: "\\dot M_{\\mathrm{fb}} \\propto t^{-5/3}" },
        ],
      },
      {
        heading: "9. Numerical methods of the renderer",
        body: [
          "Lensing: the null geodesic is integrated in vector form with an acceleration that bends the ray, where h² = |r × v|² is the photon's conserved angular momentum; the integrator is velocity-Verlet with an adaptive step, refined near the photon sphere for the returning radiation. Tone mapping is ACES filmic followed by gamma correction.",
          "Playground: dynamics in the Paczyński–Wiita potential use adaptive sub-stepping with softened mutual gravity (softening ε) and speeds capped at c. The step, however, is stability-limited: it never exceeds a fraction of the local dynamical time near the hole (a CFL-like criterion, h ≤ min(h_max, C·(r−rₛ))). If the sub-step budget is not enough close to the horizon, the simulation advances less simulated time — it gently slows down — instead of stretching the step and injecting energy, so the N-body system stays stable even with many bodies. The semi-implicit (symplectic) update conserves energy, so bound orbits stay bound and moons orbit with the circular speed of the same softened force the integrator uses (they do not unbind). Tidal debris lives in a fixed-size pool (ring buffer). The «Orbits» demo integrates the exact timelike orbit equation in the azimuth φ.",
        ],
        eqs: [
          { label: "Integrated geodesic acceleration (rₛ = 1, M = ½)", tex: "\\mathbf a = -\\tfrac{3}{2}\\,h^{2}\\,\\frac{\\mathbf r}{|\\mathbf r|^{5}}, \\qquad h^{2} = |\\mathbf r\\times\\mathbf v|^{2}" },
          { label: "Velocity-Verlet step", tex: "\\mathbf r_{n+1} = \\mathbf r_{n} + \\mathbf v_{n}\\,\\delta + \\tfrac{1}{2}\\mathbf a_{n}\\,\\delta^{2}" },
          { label: "Stability-limited step (near the horizon)", tex: "h \\le \\min\\!\\left(h_{\\max},\\; C\\,(r-r_s)\\right)" },
          { label: "Softened circular speed (moons, softening ε)", tex: "v_{\\mathrm{circ}}^{2} = \\frac{G M_p\\, r^{2}}{(r^{2}+\\varepsilon^{2})^{3/2}}" },
        ],
      },
      {
        heading: "10. Ray-marching robustness and artifacts resolved",
        body: [
          "The per-ray step budget is finite: to avoid spending it just reaching the hole — which made the disk and shadow glitch when zooming far out — rays starting beyond the influence sphere R_far are advanced analytically in a straight line (spacetime there is essentially flat) and the geodesic march only begins where curvature matters. That is why the view holds even at large distance. Near the photon sphere, by contrast, the step is refined to resolve returning radiation and the sub-rings.",
          "Depth compositing: the lensed hole writes depth (gl_FragDepth) from the world-space hit point, so the 3D bodies, particles and playground debris are correctly occluded by the disk and horizon instead of drawing on top. Tone mapping is ACES filmic with a high-threshold bloom, and the sky background has a near-zero floor: deep space stays black (Olbers' paradox), as it should.",
          "Disk aliasing: the turbulence is not a tiled texture (which left a grid-like «checkering» and a seam line) but a gradient-noise (Perlin) FBM with a lattice rotated at each octave and a domain warp, so neither a checkerboard nor lattice facets appear. To remove grazing-angle perspective shimmer, each octave is also band-limited (filtered FBM, mip-style): its frequency is compared with the pixel's footprint on the disk — estimated from screen-space derivatives — and the octave fades toward its mean once its period drops below one pixel. The photon ring is not drawn analytically (no «double ring»): it emerges from the real disk light via returning radiation.",
        ],
        eqs: [
          { label: "Analytic advance to the influence shell (distant rays)", tex: "\\mathbf p \\to \\mathbf p + \\Big(\\!-b - \\sqrt{b^{2} - (|\\mathbf p|^{2} - R_{\\mathrm{far}}^{2})}\\,\\Big)\\,\\hat{\\mathbf d}, \\quad b = \\mathbf p\\cdot\\hat{\\mathbf d}" },
          { label: "Rotated-lattice FBM (disk anti-aliasing)", tex: "\\mathrm{turb}(\\mathbf q) = \\sum_{k} a_k\\,\\mathrm{noise}\\!\\left(2^{k} R^{k}\\,\\mathbf q\\right), \\qquad R = \\text{fixed rotation}" },
        ],
      },
      {
        heading: "11. Limits: what it is NOT (scientific honesty)",
        body: [
          "The baseline is Schwarzschild (non-rotating); spin is approximate (Lense–Thirring), not Kerr. The disk is optically thick with blackbody emission: its turbulent gaseous structure is a procedural stand-in for magnetorotational (MRI) turbulence, not a GRMHD solution; it does not model self-gravity, vertical thickness or polarization. The photon ring emerges from returning radiation but the very high-order images are not resolved; the relativistic jets are a stylized (optically-thin) addition, not MHD. Background stars are procedural (their lensing is real). In the playground the bodies are occluded by the disk/horizon but not lensed, the integration is pseudo-Newtonian and the disk lighting is a central light (an approximation).",
          "In short, what is NOT possible in this medium — and why. (i) Full Kerr-metric ray-tracing and a GRMHD disk solution take minutes-to-hours per frame on compute clusters: incompatible with the ~16 ms per frame of a real-time WebGL fragment shader. (ii) Very high-order photon-ring images (n ≳ 2) demand a numerical precision and a per-pixel step count the real-time budget cannot afford. (iii) Full radiative transfer (multiple scattering, polarization, frequency-dependent opacity), vertical thickness, self-gravity and the hydrodynamics of the disk and tidal streams are time-dependent 3D problems, out of reach for a single shading pass. (iv) Lensing and GR-integrating every playground body would multiply the cost by the number of bodies, killing interactivity. All of this is done — but offline, with the cited GR codes (GYOTO, RAPTOR, ipole…): which is exactly why they exist.",
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
      { cite: "B. Paczyński & P. J. Wiita (1980), Astronomy & Astrophysics 88, 23." },
      { cite: "M. J. Rees (1988), “Tidal disruption of stars by black holes…”, Nature 333, 523.", url: "https://ui.adsabs.harvard.edu/abs/1988Natur.333..523R/abstract" },
      { cite: "J. M. Bardeen (1973), “Timelike and null geodesics in the Kerr metric”, in Black Holes (Les Houches)." },
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
            <Link href={labHref} className="bh-about__link">{t.backToLab}</Link>
          </div>
        </header>

        <section className="bh-about__section">
          <h2>{t.abstractHeading}</h2>
          <p style={{ fontStyle: "italic", color: "#aebbd2" }}>{t.abstract}</p>
        </section>

        {t.sections.map((s, i) => (
          <section key={i} className="bh-about__section">
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

        <footer className="bh-about__foot">
          <Link href={simHref} className="bh-about__cta">{t.openSim}</Link>
        </footer>
      </article>
    </div>
  );
}
