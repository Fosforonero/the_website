import Link from "next/link";
import { site } from "@/lib/site";

export type SolarManualViewProps = {
  locale: "it" | "en";
};

const T = {
  it: {
    navBack: "← Sistema Solare",
    navAbout: "About",
    heroTitle: "Manuale · Sistema Solare 3D",
    heroSubtitle:
      "Guida completa all'osservatorio 3D WebGL del sistema solare: navigazione, controlli del tempo, scale, ispettore corpi celesti e firmamento.",
    tocTitle: "Indice",
    toc: [
      { id: "overview", label: "Panoramica" },
      { id: "navigation", label: "Navigazione nella scena" },
      { id: "time-controls", label: "Controlli del tempo" },
      { id: "scale-modes", label: "Modalità di scala" },
      { id: "body-categories", label: "Categorie di corpi celesti" },
      { id: "inspector", label: "Campi dell'ispettore" },
      { id: "visual-confidence", label: "Etichette di confidenza visiva" },
      { id: "firmament", label: "Strato firmamento" },
      { id: "catalog-layers", label: "Livelli catalogo" },
      { id: "reference-frame", label: "Sistema di riferimento" },
      { id: "axial-tilt", label: "Inclinazione assiale e rotazione" },
      { id: "lighting", label: "Illuminazione" },
      { id: "sandbox-roadmap", label: "Roadmap: modalità sandbox" },
      { id: "mobile-performance", label: "Mobile e performance" },
      { id: "faq", label: "FAQ" },
    ],
    sections: {
      overview: {
        title: "Panoramica",
        content: `Il Sistema Solare 3D di Fosforonero Lab è un osservatorio interattivo nel browser costruito con WebGL (Three.js). Permette di esplorare i corpi del sistema solare in tempo simulato, con dati astronomici reali dove disponibili.

A — Fisica rispettata:
— Elementi orbitali (a, e, i, Ω, ω, M₀) da NASA/JPL Horizons, valori reali.
— Propagazione kepleriana corretta: equazione di Keplero risolta numericamente, rotazione perifocale completa.
— Rapporti di distanza in scala "Compressa": 1 AU = 1 unità, fisicamente corretti.
— Rapporti di raggi in scala "Relativo": proporzionali al Sole, fisicamente corretti.
— Illuminazione 1/r² in modalità fisica: nessun boost, Nettuno scuro come nella realtà.
— Obliquità assiale: valori IAU 2015 reali (Terra 23,44°, Venere 177,36°, Urano 97,77°).
— Fase di rotazione siderale: calcolata dal periodo siderale reale a partire da J2000.0.
— Proporzioni degli anelli: i rapporti anello/pianeta sono fisicamente corretti.
— Catalogo stellare Hipparcos (44 stelle nominate, posizioni RA/Dec J2000 reali).

B — Fisica approssimata/educativa (dichiarata nell'UI):
— Scala raggi "Visibile" (default): logaritmica categoriale, non proporzionale. Dichiarata.
— Distanze lune: boost ×200 per leggibilità. Dichiarato.
— Illuminazione educativa (default): 1/r² + boost ambientale dichiarato.
— Lato notte/giorno: shading Three.js su sfere senza texture; nessuna eclissi.
— Direzione del polo: approssimazione eclittica, non RA/Dec IAU WGCCRE per-corpo. Prevista Sprint 04.
— Anelli: colore fisso (non ricevono la luce solare della PointLight).

C — Non ancora implementato:
— Gravità newtoniana / N-body: le orbite sono elementi kepleriani statici.
— Temperatura: nessun dato, nessun calcolo.
— Eclissi, ombre, transiti.
— Correzioni relativistiche (inclusa precessione del perielio di Mercurio).
— massKg mostrato nell'ispettore ma non usato nella simulazione.
— Texture superficiali reali (roadmap).`,
      },
      navigation: {
        title: "Navigazione nella scena",
        content: `La scena 3D si controlla con mouse o trackpad:

Ruota la vista: tieni premuto il pulsante sinistro del mouse e trascina in qualsiasi direzione. La camera orbita attorno al punto di interesse corrente.

Zoom: usa la rotella del mouse o il gesto di pinch-to-zoom sul trackpad. Lo zoom avvicina o allontana la camera dal punto di interesse.

Pan (trasla lateralmente): tieni premuto il pulsante destro del mouse (o il tasto centrale) e trascina. La camera si sposta lateralmente senza cambiare orientamento.

Seleziona un corpo: fai clic su qualsiasi corpo celeste visibile nella scena 3D per selezionarlo. Il corpo selezionato appare evidenziato e i suoi dati vengono caricati nell'ispettore laterale. Puoi anche selezionare un corpo dal pannello del browser dei corpi celesti.

Recentra sulla selezione: dopo aver selezionato un corpo, la camera può essere riorientata verso di esso usando il pulsante "Centra" nell'ispettore (funzione in attivazione nella Sprint 01).`,
      },
      timeControls: {
        title: "Controlli del tempo",
        content: `La barra degli strumenti nella parte inferiore (o superiore, a seconda del layout) contiene i controlli temporali:

Pulsante Adesso: reimposta immediatamente la simulazione alla data e ora correnti del browser.

Selettore di data: un input di tipo data/ora che permette di impostare qualsiasi data tra il 1800 e il 2200 circa. Le posizioni orbitali vengono ricalcolate in tempo reale.

Play / Pausa: avvia o mette in pausa l'animazione del tempo simulato. Quando è in play, le posizioni dei corpi si aggiornano ogni 100 ms.

Selettore di velocità:
— Tempo reale → 1 secondo simulato = 1 secondo reale
— 1 giorno/sec → 1 giorno simulato per secondo reale
— 1 mese/sec → 30 giorni simulati per secondo reale
— 1 anno/sec → 365 giorni simulati per secondo reale

Nota: a velocità elevate (1 anno/sec), le traiettorie orbitali di corpi veloci come Mercurio possono apparire discontinue tra un aggiornamento e l'altro. Questo è normale: la posizione è comunque calcolata correttamente per ogni frame.`,
      },
      scaleModes: {
        title: "Modalità di scala",
        content: `Il sistema solare reale è quasi interamente vuoto. Per visualizzarlo in modo utile, offriamo diverse modalità di scala:

Scala distanza:
— Compressa (default): 1 AU = 1 unità di rendering. I pianeti interni sono vicini e distinguibili. Nettuno è visibile ma lontano. Questa è la modalità più intuitiva per un'esplorazione generale.
— Logaritmica: la distanza viene trasformata con log10. Utile per visualizzare contemporaneamente pianeti interni ed esterni, TNO e oggetti distanti. Le distanze non sono lineari, ma la struttura globale del sistema diventa immediatamente leggibile.
— Sistema interno: espande la zona entro 2 AU per mostrare Mercurio, Venere, Terra e Marte con più dettaglio e spazio tra di loro.

Scala raggi:
— Visibile (default): impone una dimensione minima visibile a tutti i corpi. I pianeti piccoli e le lune sono più grandi di quanto sarebbero realisticamente a queste distanze. Garantisce che ogni corpo sia cliccabile.
— Relativo: i raggi sono proporzionali al Sole. La Terra appare come un punto minuscolo. Fisicamente più corretto, ma molti corpi diventano invisibili a occhio nudo.

Nota sui rapporti fisici: in modalità "Compressa" i rapporti tra distanze orbitali sono fisicamente corretti. In modalità "Relativo" i rapporti tra raggi sono fisicamente corretti. Non esiste però una modalità dove raggi e distanze sono contemporaneamente in scala reale: a proporzioni fisiche reali i pianeti sarebbero invisibili rispetto alle distanze.`,
      },
      referenceFrame: {
        title: "Sistema di riferimento",
        content: `Sistema di riferimento: tutte le posizioni sono calcolate nel frame Eclittica Eliocentrica J2000.0 (HEC-J2000).

Origine: baricentro del Sistema Solare (approssimato al Sole in questo laboratorio).
Piano xy: piano dell'eclittica medio a J2000.0.
Asse x: equinozio di primavera medio a J2000.0.
Unità: chilometri.

Questo sistema NON coincide con le coordinate equatoriali ICRF/J2000 (usate da SIMBAD, Gaia, ecc.). La conversione richiede una rotazione di ~23.44° attorno all'asse x (obliquità dell'eclittica, IAU 2006).

Cosa è approssimato: l'origine è al Sole, non al vero baricentro; le posizioni vengono da elementi kepleriani, non da integrazione numerica; l'azimut del polo planetario è approssimato (RA/Dec IAU WGCCRE previsto per Sprint 04).`,
      },
      axialTilt: {
        title: "Inclinazione assiale e rotazione",
        content: `Inclinazione assiale: i pianeti principali mostrano la reale obliquità rispetto all'eclittica (dati IAU 2015). L'asse di rotazione è visibile opzionalmente tramite il toggle "Assi" nella barra degli strumenti.

Rotazione retrograda: Venere (177°), Urano (98°) e Plutone (122°) ruotano in senso retrogrado. Urano ha il polo quasi nel piano orbitale.

Anelli: Saturno mostra gli anelli nel piano equatoriale (74 500–140 220 km). Urano mostra anelli più tenui (38 000–51 149 km), quasi perpendicolari al piano orbitale per via dell'inclinazione di 98°.

Nota tecnica: l'azimut del polo è approssimato — la precisa direzione RA/Dec IAU WGCCRE non è ancora implementata. La fase di rotazione segue il periodo siderale reale da J2000.0, senza precessione o nutazione.`,
      },
      lighting: {
        title: "Illuminazione",
        content: `Illuminazione educativa (predefinita): luce solare con legge inversa del quadrato (1/r²) più un piccolo boost ambientale dichiarato che mantiene visibili i pianeti esterni. Non è fisicamente precisa per i pianeti lontani.

Illuminazione fisica (1/r²): nessun boost. Nettuno a ~30 UA riceve circa 1/900 dell'irradianza terrestre — scuro come nella realtà. Selezionabile dal menu "Illuminazione" nella barra degli strumenti.

La modalità attiva è sempre indicata nell'ispettore sotto "Scale attive".`,
      },
      bodyCategories: {
        title: "Categorie di corpi celesti",
        content: `I corpi nel browser laterale sono organizzati per categoria:

Stella: il Sole. Unica stella del sistema solare. Raggio: 696.340 km. Massa: 1,989 × 10³⁰ kg.

Pianeti (8): Mercurio, Venere, Terra, Marte, Giove, Saturno, Urano, Nettuno. Classificazione IAU 2006.

Pianeti nani: Plutone, Cerere, Eris, Makemake, Haumea. Classificazione IAU 2006.

Lune: la Luna (Terra), Titano, Europa, Ganimede, Callisto, Io, Tritone, e altre lune principali dei pianeti giganti. Sprint 01 include un sottoinsieme curato.

Asteroidi: corpi minori della fascia principale. Sprint 01 include un sottoinsieme rappresentativo (Vesta, Pallade, ecc.).

Comete: corpi con orbite molto eccentriche. Sprint 01 include alcune comete notevoli (es. 1P/Halley).

Oggetti Transnettuniani (TNO): corpi oltre l'orbita di Nettuno, inclusa la fascia di Kuiper. Sprint 01 include i TNO più noti.

Tutti i corpi presenti nell'MVP sono dati statici curati manualmente. Un catalogo completo di corpi minori (JPL Small Body Database) è pianificato per sprint successivi.`,
      },
      inspector: {
        title: "Campi dell'ispettore",
        content: `Quando selezioni un corpo celeste, l'ispettore laterale mostra:

Nome: nome ufficiale IAU, mostrato in italiano e inglese (bilingue).

Categoria: la categoria del corpo (stella, pianeta, pianeta nano, luna, asteroide, cometa, TNO).

Corpo genitore: il corpo attorno a cui orbita (es. "Terra" per la Luna, "Sole" per i pianeti).

Raggio: raggio medio in km. Per corpi non sferici (come asteroidi) è il raggio equivalente.

Massa: massa in kg, in notazione scientifica (es. 5,972 × 10²⁴ kg per la Terra). Dato di riferimento: la massa non è usata nei calcoli di simulazione (le orbite sono kepleriane, non N-body).

Epoca: data ISO 8601 a cui si riferisce la posizione calcolata. Corrisponde alla data attualmente impostata nei controlli del tempo.

Fonte: il dataset utilizzato per gli elementi orbitali (es. "NASA/JPL public orbital elements", "Hipparcos catalog").

Confidenza asset: indica il livello di fedeltà della rappresentazione visiva del corpo (vedi sezione successiva).`,
      },
      visualConfidence: {
        title: "Etichette di confidenza visiva",
        content: `Ogni corpo ha un'etichetta di confidenza che descrive quanto è fedele la sua rappresentazione visiva:

Procedurale: il corpo è renderizzato con un colore approssimativo e una forma sferica generica. Non c'è una mappa superficiale reale. Questo è il livello attuale per la maggior parte dei corpi nell'MVP Sprint 01. Il colore è scelto in base alla categoria e ai dati disponibili, ma non è fotograficamente accurato.

Simbolico: il corpo è rappresentato solo da un indicatore puntiforme o da un marker, senza geometria 3D. Usato per corpi molto piccoli o distanti dove la geometria non ha senso alla scala corrente.

Mesh reale (roadmap): una mesh 3D modellata su dati topografici reali (USGS, NASA DEM). Pianificata per Sprint 02+ per Terre, Luna, Marte e altri corpi ben documentati.

Mappa reale (roadmap): texture fotografica da dati NASA/USGS/JAXA applicata alla mesh. Pianificata per Sprint 02+ insieme alle mesh reali.`,
      },
      catalogLayers: {
        title: "Livelli catalogo",
        content: `Il laboratorio carica corpi dal JPL Small-Body Database (SBDB) per cinque categorie: NEO (Asteroidi Near-Earth), Fascia principale, Comete, TNO (Trans-Nettuniani) e Centauri. I toggle nella barra degli strumenti (solo desktop) attivano ogni livello on-demand.

Rendering: i corpi del catalogo sono visualizzati come punti (Three.js Points), mai come mesh React individuali. Questo permette di mostrare decine di migliaia di oggetti senza impatto sulle prestazioni.

Posizioni catalogo: calcolate da elementi orbitali kepleriani SBDB nel frame HEC-J2000. Non sono vettori live JPL Horizons. La data dello snapshot è visibile nell'ispettore. I dati hanno qualità "catalog-keplerian" — adeguata per visualizzazione educativa, non per navigazione di precisione.

Ricerca: la barra di ricerca interroga JPL SBDB in tempo reale (300ms debounce). I risultati mostrano il nome del corpo, la classe orbitale e i tag NEO/PHA se applicabili. Selezionando un risultato, viene richiesta la posizione di precisione a JPL Horizons per quella data e visualizzata come marcatore teal (qualità sub-km).

Limite dataset: il snapshot NEO è limitato a 10.000 corpi (su ~42.000 noti). Il catalogo completo è in roadmap (Sprint 04+).`,
      },
      firmament: {
        title: "Strato firmamento",
        content: `Il firmamento è lo sfondo stellare della scena 3D. È costruito da dati astronomici reali:

Stelle: 44 stelle nominate dal catalogo Hipparcos dell'ESA (High Precision Parallax Collecting Satellite). Ogni stella ha posizione reale (ascensione retta e declinazione J2000), magnitudine reale, e colore calcolato dalla temperatura spettrale. Le stelle vengono proiettate sulla sfera celeste a distanza fissa dalla camera.

Costellazioni: linee di costellazione tratte dai metadati di Stellarium Sky Cultures. Subset curato di stelle luminose e costellazioni riconoscibili (non la copertura completa delle 88 IAU). Possono essere attivate o disattivate con il toggle "Costellazioni" nel pannello di controllo.

Oggetti del cielo profondo: un sottoinsieme di oggetti Messier e NGC tratti da OpenNGC:
— M31 (Galassia di Andromeda), M33 (Triangolo), M42 (Nebulosa di Orione), M45 (Pleiadi), M44 (Presepe), M13 (Ammasso globulare di Ercole), M81 (Galassia di Bode), M57 (Nebulosa Anello). Visualizzati come icone o marker con nome. Possono essere attivati o disattivati separatamente dalle costellazioni.

In arrivo: il catalogo completo Gaia (oltre 1 miliardo di stelle) è pianificato per un sprint futuro, con rendering ottimizzato tramite instanced geometry e LOD.`,
      },
      sandboxRoadmap: {
        title: "Roadmap: modalità sandbox",
        content: `La modalità sandbox è una funzionalità pianificata per un sprint futuro. Non è disponibile nell'MVP Sprint 01.

In modalità sandbox, l'utente potrà:
— Aggiungere corpi celesti personalizzati (nome, massa, raggio, posizione, velocità iniziale).
— Scegliere se usare fisica N-body semplificata (integrazione Verlet) o elementi orbitali kepleriani.
— Osservare come i nuovi corpi interagiscono gravitazionalmente con il sistema esistente.
— Esportare la configurazione come JSON per condividerla o riaprirla in seguito.

La modalità attuale mostra esclusivamente i dati reali del sistema solare. Non è possibile aggiungere o modificare corpi.`,
      },
      mobilePerformance: {
        title: "Mobile e performance",
        content: `Ottimizzazione attuale:

Desktop: l'esperienza principale. Il canvas WebGL e tutti i pannelli sono progettati per schermi da 1280px in su. Testato su Chrome, Firefox e Safari.

Mobile: il canvas si renderizza correttamente anche su dispositivi mobili. I controlli (pannelli laterali, toolbar) potrebbero risultare sovrapposti o ridotti su schermi piccoli. I gesti touch per la navigazione (ruota, zoom, pan) sono parzialmente supportati in Sprint 01. Sprint futuri aggiungeranno pannelli collassabili e gesture ottimizzate per touch.

Performance: il caricamento del modulo WebGL avviene tramite dynamic import (lazy loading), quindi non impatta il caricamento iniziale della pagina. Sprint 01 non carica texture pesanti. Il numero di corpi attivi è gestibile (~28 corpi). Il rendering è ottimizzato con requestAnimationFrame e aggiornamenti posizionali ogni 100ms.

Per problemi di performance su hardware vecchio: prova a disattivare il firmamento stellare dal pannello impostazioni (riduce il numero di vertex da renderizzare).`,
      },
      faq: {
        title: "FAQ",
        items: [
          {
            q: "Le posizioni dei pianeti sono accurate?",
            a: "Sono approssimate. Le posizioni sono calcolate da elementi orbitali di riferimento pubblici (basati su dati NASA/JPL) usando formule kepleriane semplificate. L'errore tipico è di pochi milioni di km su scale di anni. La precisione JPL Horizons (sub-kilometrica) è pianificata per un sprint futuro con integrazione live alle API di Horizons.",
          },
          {
            q: "Perché il sistema solare sembra così piccolo?",
            a: "Con la scala 'Compressa' (default), 1 AU corrisponde a 1 unità di rendering: i pianeti interni sono vicini ma Nettuno è già distante. Prova la modalità 'Sistema interno' per espandere la zona entro 2 AU e vedere Mercurio, Venere, Terra e Marte con più dettaglio.",
          },
          {
            q: "Posso aggiungere un pianeta personalizzato?",
            a: "Non nell'MVP. La modalità sandbox, che permetterà di aggiungere corpi con massa e velocità iniziale personalizzate, è in roadmap per un futuro sprint.",
          },
          {
            q: "Perché i pianeti sono solo sfere colorate?",
            a: "Le texture superficiali reali richiedono elaborazione di dati NASA/USGS (mappe altimetriche, immagini multispettrali). Questo lavoro è pianificato per Sprint 02. Nell'MVP, la rappresentazione è procedurale: colore approssimativo + forma sferica.",
          },
          {
            q: "Che catalogo stellare viene usato?",
            a: "Il catalogo Hipparcos dell'ESA (High Precision Parallax Collecting Satellite). 44 stelle nominate con posizioni RA/Dec J2000 reali e magnitudini reali. Il catalogo completo Gaia è pianificato per Sprint 02.",
          },
          {
            q: "Quanti corpi sono inclusi?",
            a: "Sprint 01 include circa 28 corpi curati: il Sole, 8 pianeti, 5 pianeti nani principali, le lune principali, alcuni asteroidi rappresentativi, e alcune comete notevoli. Un catalogo completo di corpi minori (JPL Small Body Database, >1 milione di oggetti) è pianificato per sprint successivi.",
          },
          {
            q: "Da dove vengono i dati orbitali?",
            a: "Elementi orbitali di riferimento pubblici basati su dati NASA/JPL (Jet Propulsion Laboratory). Non si tratta di un feed live: i dati sono caricati staticamente nell'applicazione. L'integrazione live con JPL Horizons è in roadmap.",
          },
        ],
      },
    },
  },
  en: {
    navBack: "← Solar System",
    navAbout: "About",
    heroTitle: "Manual · Solar System 3D",
    heroSubtitle:
      "Complete guide to the 3D WebGL solar system observatory: scene navigation, time controls, scale modes, body inspector, and the firmament layer.",
    tocTitle: "Table of Contents",
    toc: [
      { id: "overview", label: "Overview" },
      { id: "navigation", label: "Scene navigation" },
      { id: "time-controls", label: "Time controls" },
      { id: "scale-modes", label: "Scale modes" },
      { id: "body-categories", label: "Body categories" },
      { id: "inspector", label: "Inspector fields" },
      { id: "visual-confidence", label: "Visual confidence labels" },
      { id: "firmament", label: "Firmament layer" },
      { id: "catalog-layers", label: "Catalog layers" },
      { id: "reference-frame", label: "Reference frame" },
      { id: "axial-tilt", label: "Axial tilt and rotation" },
      { id: "lighting", label: "Lighting" },
      { id: "sandbox-roadmap", label: "Roadmap: sandbox mode" },
      { id: "mobile-performance", label: "Mobile & performance" },
      { id: "faq", label: "FAQ" },
    ],
    sections: {
      overview: {
        title: "Overview",
        content: `The Fosforonero Lab Solar System 3D is an interactive in-browser observatory built with WebGL (Three.js). It lets you explore solar system bodies in simulated time, using real astronomical data where available.

A — Physics genuinely respected:
— Orbital elements (a, e, i, Ω, ω, M₀) from NASA/JPL Horizons — real values.
— Correct Keplerian propagation: Kepler's equation solved numerically, full perifocal rotation.
— Distance ratios in "Compressed" scale: 1 AU = 1 unit, physically correct.
— Radius ratios in "Relative" scale: proportional to the Sun, physically correct.
— 1/r² lighting in physical mode: no boost; Neptune is as dark as in reality.
— Axial obliquity: real IAU 2015 values (Earth 23.44°, Venus 177.36°, Uranus 97.77°).
— Sidereal rotation phase: computed from the real sidereal period from J2000.0.
— Ring proportions: ring/planet ratios are physically correct.
— Hipparcos star catalog (44 named stars, real J2000 RA/Dec positions).

B — Approximated or educational (disclosed in the UI):
— "Visible" radius scale (default): logarithmic category-based, not proportional. Disclosed.
— Moon distances: ~200× boost for legibility. Disclosed.
— Educational lighting (default): 1/r² + declared ambient boost.
— Day/night side: Three.js shading on untextured spheres; no eclipse shadow casting.
— Pole direction: ecliptic approximation, not per-body IAU WGCCRE RA/Dec. Planned Sprint 04.
— Rings: fixed colour (do not receive sunlight from the PointLight).

C — Not yet implemented:
— Newtonian gravity / N-body: orbits are static Keplerian elements.
— Temperature: no data, no calculations.
— Eclipses, shadows, transits.
— Relativistic corrections (including Mercury perihelion precession).
— massKg shown in the inspector but not used in the simulation.
— Real surface textures (roadmap).`,
      },
      navigation: {
        title: "Scene navigation",
        content: `The 3D scene is controlled with mouse or trackpad:

Rotate view: hold the left mouse button and drag in any direction. The camera orbits around the current point of interest.

Zoom: use the mouse wheel or a trackpad pinch-to-zoom gesture. Zooming moves the camera closer to or farther from the point of interest.

Pan (lateral translation): hold the right mouse button (or middle button) and drag. The camera moves laterally without changing orientation.

Select a body: click on any visible celestial body in the 3D scene to select it. The selected body is highlighted and its data is loaded into the side inspector panel. You can also select a body from the body browser panel.

Re-center on selection: after selecting a body, the camera can be re-oriented toward it using the "Center" button in the inspector (activating in Sprint 01).`,
      },
      timeControls: {
        title: "Time controls",
        content: `The toolbar at the bottom (or top, depending on layout) contains the time controls:

Now button: immediately resets the simulation to the browser's current date and time.

Date picker: a date/time input that lets you set any date between approximately 1800 and 2200. Orbital positions are recalculated in real time.

Play / Pause: starts or pauses the simulated time animation. When playing, body positions update every 100 ms.

Speed selector:
— Real time → 1 simulated second = 1 real second
— 1 day/sec → 1 simulated day per real second
— 1 month/sec → 30 simulated days per real second
— 1 year/sec → 365 simulated days per real second

Note: at high speeds (1 year/sec), the orbital trajectories of fast bodies such as Mercury may appear discontinuous between updates. This is normal: the position is still correctly computed for each frame.`,
      },
      scaleModes: {
        title: "Scale modes",
        content: `The real solar system is almost entirely empty space. To visualize it usefully, several scale modes are available:

Distance scale:
— Compressed (default): 1 AU = 1 render unit. Inner planets are close together and distinguishable. Neptune is visible but distant. This is the most intuitive mode for general exploration.
— Logarithmic: distance is transformed with log10. Useful for showing inner and outer planets, TNOs, and distant objects simultaneously. Distances are not linear, but the overall system structure becomes immediately readable.
— Inner system: expands the zone within 2 AU to show Mercury, Venus, Earth, and Mars with more detail and space between them.

Radius scale:
— Visible (default): enforces a minimum visible size for all bodies. Small planets and moons are larger than they would realistically be at these distances. Ensures every body is clickable.
— Relative: radii are proportional to the Sun. Earth appears as a tiny dot. Physically more accurate, but many bodies become invisible to the naked eye.

A note on physical ratios: in "Compressed" mode, orbital distance ratios are physically correct. In "Relative" mode, radius ratios are physically correct. However, there is no mode where both radii and distances are simultaneously to physical scale — at true proportions, planets would be invisible against the vast distances between them.`,
      },
      referenceFrame: {
        title: "Reference frame",
        content: `Reference frame: all positions are computed in the Heliocentric Ecliptic J2000.0 frame (HEC-J2000).

Origin: Solar System Barycentre (approximated to the Sun in this lab).
xy-plane: mean ecliptic plane at J2000.0.
x-axis: mean vernal equinox at J2000.0.
Units: kilometres.

This is NOT the same as equatorial ICRF/J2000 (used by SIMBAD, Gaia, etc.). The conversion requires a ~23.44° rotation around x (obliquity of the ecliptic, IAU 2006).

What is approximated: origin is at the Sun, not the true barycentre; positions come from Keplerian elements, not numerical integration; planetary pole azimuth is approximated (IAU WGCCRE RA/Dec planned for Sprint 04).`,
      },
      axialTilt: {
        title: "Axial tilt and rotation",
        content: `Axial tilt: major planets show their real obliquity to the ecliptic (IAU 2015 data). The rotation axis is optionally visible via the "Axes" toggle in the toolbar.

Retrograde rotation: Venus (177°), Uranus (98°) and Pluto (122°) rotate retrograde. Uranus has its pole nearly in the orbital plane.

Rings: Saturn shows rings in its equatorial plane (74,500–140,220 km). Uranus shows fainter rings (38,000–51,149 km), nearly perpendicular to the orbital plane due to its 98° tilt.

Technical note: pole azimuth is approximated — the precise IAU WGCCRE RA/Dec direction is not yet implemented. Rotation phase follows the real sidereal period from J2000.0, without precession or nutation.`,
      },
      lighting: {
        title: "Lighting",
        content: `Educational lighting (default): solar light with inverse-square law (1/r²) plus a small declared ambient boost that keeps outer planets visible. Not physically accurate for distant planets.

Physical lighting (1/r²): no boost. Neptune at ~30 AU receives ~1/900 of Earth's irradiance — as dark as reality. Selectable from the "Lighting" menu in the toolbar.

The active mode is always shown in the inspector under "Active scales".`,
      },
      bodyCategories: {
        title: "Body categories",
        content: `Bodies in the side browser are organized by category:

Star: the Sun. The only star in the solar system. Radius: 696,340 km. Mass: 1.989 × 10³⁰ kg.

Planets (8): Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune. IAU 2006 classification.

Dwarf planets: Pluto, Ceres, Eris, Makemake, Haumea. IAU 2006 classification.

Moons: the Moon (Earth), Titan, Europa, Ganymede, Callisto, Io, Triton, and other major moons of the giant planets. Sprint 01 includes a curated subset.

Asteroids: minor bodies of the main belt. Sprint 01 includes a representative subset (Vesta, Pallas, etc.).

Comets: bodies with highly eccentric orbits. Sprint 01 includes some notable comets (e.g. 1P/Halley).

Trans-Neptunian Objects (TNOs): bodies beyond Neptune's orbit, including the Kuiper Belt. Sprint 01 includes the most notable TNOs.

All bodies in the MVP are manually curated static data. A full minor-body catalog (JPL Small Body Database) is planned for future sprints.`,
      },
      inspector: {
        title: "Inspector fields",
        content: `When you select a celestial body, the side inspector shows:

Name: official IAU name, shown in both Italian and English (bilingual).

Category: the body's category (star, planet, dwarf planet, moon, asteroid, comet, TNO).

Parent body: the body it orbits (e.g. "Earth" for the Moon, "Sun" for planets).

Radius: mean radius in km. For non-spherical bodies (like asteroids), this is the equivalent radius.

Mass: mass in kg, in scientific notation (e.g. 5.972 × 10²⁴ kg for Earth). Reference data only: mass is not used in simulation calculations (orbits are Keplerian, not N-body).

Epoch: ISO 8601 date to which the computed position refers. This matches the date currently set in the time controls.

Source: the dataset used for orbital elements (e.g. "NASA/JPL public orbital elements", "Hipparcos catalog").

Asset confidence: indicates the fidelity level of the body's visual representation (see next section).`,
      },
      visualConfidence: {
        title: "Visual confidence labels",
        content: `Each body has a confidence label describing how faithful its visual representation is:

Procedural: the body is rendered with an approximate color and a generic spherical shape. There is no real surface map. This is the current level for most bodies in the MVP Sprint 01. The color is chosen based on the category and available data, but is not photographically accurate.

Symbolic: the body is represented only by a point indicator or marker, without 3D geometry. Used for very small or distant bodies where geometry makes no sense at the current scale.

Real mesh (roadmap): a 3D mesh modeled on real topographic data (USGS, NASA DEM). Planned for Sprint 02+ for Earth, Moon, Mars, and other well-documented bodies.

Real map (roadmap): photographic texture from NASA/USGS/JAXA data applied to the mesh. Planned for Sprint 02+ alongside real meshes.`,
      },
      catalogLayers: {
        title: "Catalog layers",
        content: `The lab loads bodies from the JPL Small-Body Database (SBDB) for five categories: NEOs (Near-Earth Objects), Main Belt asteroids, Comets, TNOs (Trans-Neptunian Objects), and Centaurs. Toolbar toggles (desktop only) enable each layer on demand.

Rendering: catalog bodies are rendered as Three.js Points, never as individual React meshes. This allows tens of thousands of objects to be displayed without performance issues.

Catalog positions: computed from SBDB Keplerian orbital elements in the HEC-J2000 frame. Not live JPL Horizons vectors. The snapshot date is visible in the inspector. Data quality is "catalog-keplerian" — suitable for educational visualization, not precision navigation.

Search: the search bar queries JPL SBDB in real time (300ms debounce). Results show body name, orbit class, and NEO/PHA tags where applicable. Selecting a result fetches a precision position from JPL Horizons for that date and displays it as a teal marker (sub-km accuracy).

Dataset limit: the NEO snapshot is capped at 10,000 bodies (out of ~42,000 known). The full catalog is on the roadmap (Sprint 04+).`,
      },
      firmament: {
        title: "Firmament layer",
        content: `The firmament is the stellar background of the 3D scene. It is built from real astronomical data:

Stars: 44 named stars from the ESA Hipparcos catalog (High Precision Parallax Collecting Satellite). Each star has a real position (right ascension and declination J2000), real magnitude, and color computed from spectral temperature. Stars are projected onto the celestial sphere at a fixed distance from the camera.

Constellations: constellation lines drawn from Stellarium Sky Cultures metadata. Curated subset of bright stars and recognizable constellations (not full IAU 88 coverage). Can be toggled on or off with the "Constellations" toggle in the control panel.

Deep-sky objects: a subset of Messier and NGC objects from OpenNGC:
— M31 (Andromeda Galaxy), M33 (Triangulum), M42 (Orion Nebula), M45 (Pleiades), M44 (Beehive Cluster), M13 (Hercules Globular Cluster), M81 (Bode's Galaxy), M57 (Ring Nebula). Displayed as icons or markers with names. Can be toggled separately from constellations.

Coming soon: the full Gaia catalog (over 1 billion stars) is planned for a future sprint, with optimized rendering using instanced geometry and LOD.`,
      },
      sandboxRoadmap: {
        title: "Roadmap: sandbox mode",
        content: `Sandbox mode is a planned feature for a future sprint. It is not available in the MVP Sprint 01.

In sandbox mode, the user will be able to:
— Add custom celestial bodies (name, mass, radius, position, initial velocity).
— Choose between simplified N-body physics (Verlet integration) or Keplerian orbital elements.
— Observe how new bodies interact gravitationally with the existing system.
— Export the configuration as JSON to share or reopen later.

The current mode shows only real solar system data. It is not possible to add or modify bodies.`,
      },
      mobilePerformance: {
        title: "Mobile & performance",
        content: `Current optimization status:

Desktop: the primary experience. The WebGL canvas and all panels are designed for screens 1280px and wider. Tested on Chrome, Firefox, and Safari.

Mobile: the canvas renders correctly on mobile devices. Controls (side panels, toolbar) may overlap or feel cramped on small screens. Touch gestures for navigation (rotate, zoom, pan) are partially supported in Sprint 01. Future sprints will add collapsible panels and optimized touch gestures.

Performance: the WebGL module loads via dynamic import (lazy loading), so it does not impact the initial page load. Sprint 01 does not load heavy textures. The number of active bodies is manageable (~28 bodies). Rendering is optimized with requestAnimationFrame and positional updates every 100ms.

If you experience performance issues on older hardware: try disabling the star firmament from the settings panel (this reduces the number of vertices to render).`,
      },
      faq: {
        title: "FAQ",
        items: [
          {
            q: "Are the planet positions accurate?",
            a: "They are approximate. Positions are computed from public reference orbital elements (based on NASA/JPL data) using simplified Keplerian formulas. Typical error is a few million km over a timescale of years. JPL Horizons precision (sub-kilometer) is planned for a future sprint with live Horizons API integration.",
          },
          {
            q: "Why does the solar system look so small?",
            a: "In the 'Compressed' scale (default), 1 AU = 1 render unit: inner planets are close but Neptune is already distant. Try the 'Inner system' scale mode to expand the zone within 2 AU and see Mercury, Venus, Earth, and Mars with more detail.",
          },
          {
            q: "Can I add a custom planet?",
            a: "Not in the MVP. Sandbox mode, which will let you add bodies with custom mass and initial velocity, is on the roadmap for a future sprint.",
          },
          {
            q: "Why are the planets just colored spheres?",
            a: "Real surface textures require processing NASA/USGS data (altimetric maps, multispectral imagery). This work is planned for Sprint 02. In the MVP, representation is procedural: approximate color + spherical shape.",
          },
          {
            q: "Which star catalog is used?",
            a: "The ESA Hipparcos catalog (High Precision Parallax Collecting Satellite). 44 named stars with real J2000 RA/Dec positions and real magnitudes. The full Gaia catalog is planned for Sprint 02.",
          },
          {
            q: "How many bodies are included?",
            a: "Sprint 01 includes approximately 28 curated bodies: the Sun, 8 planets, 5 main dwarf planets, major moons, some representative asteroids, and a few notable comets. A full minor-body catalog (JPL Small Body Database, >1 million objects) is planned for future sprints.",
          },
          {
            q: "Where does the orbital data come from?",
            a: "Public reference orbital elements based on NASA/JPL (Jet Propulsion Laboratory) data. This is not a live feed: the data is loaded statically in the application. Live integration with JPL Horizons is on the roadmap.",
          },
        ],
      },
    },
  },
};

export function SolarSystemManualView({ locale }: SolarManualViewProps) {
  const t = T[locale];
  const appUrl = locale === "it" ? "/lab/sistema-solare" : "/en/lab/solar-system";
  const aboutUrl =
    locale === "it"
      ? "/lab/sistema-solare/about"
      : "/en/lab/solar-system/about";
  const s = t.sections;

  return (
    <div className="sm-manual">
      {/* ── Top nav ── */}
      <nav className="sm-manual-nav">
        <Link href={appUrl} className="sm-manual-nav-back">
          {t.navBack}
        </Link>
        <Link href={aboutUrl} className="sm-manual-nav-about">
          {t.navAbout}
        </Link>
      </nav>

      {/* ── Hero ── */}
      <header className="sm-manual-hero">
        <h1 className="sm-manual-hero-title">{t.heroTitle}</h1>
        <p className="sm-manual-hero-sub">{t.heroSubtitle}</p>
      </header>

      {/* ── Table of contents ── */}
      <nav className="sm-manual-toc" aria-label={t.tocTitle}>
        <p className="sm-manual-toc-heading">{t.tocTitle}</p>
        <ol className="sm-manual-toc-list">
          {t.toc.map((item, i) => (
            <li key={item.id} className="sm-manual-toc-item">
              <a href={`#${item.id}`} className="sm-manual-toc-link">
                <span className="sm-manual-toc-num">{i + 1}.</span>
                {item.label}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <main className="sm-manual-content">
        {/* ── 1. Overview ── */}
        <section id="overview" className="sm-manual-section">
          <h2 className="sm-manual-section-title">
            <span className="sm-manual-section-num">1.</span>
            {s.overview.title}
          </h2>
          <div className="sm-manual-prose">
            {s.overview.content.split("\n\n").map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </section>

        {/* ── 2. Navigation ── */}
        <section id="navigation" className="sm-manual-section">
          <h2 className="sm-manual-section-title">
            <span className="sm-manual-section-num">2.</span>
            {s.navigation.title}
          </h2>
          <div className="sm-manual-prose">
            {s.navigation.content.split("\n\n").map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </section>

        {/* ── 3. Time controls ── */}
        <section id="time-controls" className="sm-manual-section">
          <h2 className="sm-manual-section-title">
            <span className="sm-manual-section-num">3.</span>
            {s.timeControls.title}
          </h2>
          <div className="sm-manual-prose">
            {s.timeControls.content.split("\n\n").map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </section>

        {/* ── 4. Scale modes ── */}
        <section id="scale-modes" className="sm-manual-section">
          <h2 className="sm-manual-section-title">
            <span className="sm-manual-section-num">4.</span>
            {s.scaleModes.title}
          </h2>
          <div className="sm-manual-prose">
            {s.scaleModes.content.split("\n\n").map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </section>

        {/* ── 5. Reference frame ── */}
        <section id="reference-frame" className="sm-manual-section">
          <h2 className="sm-manual-section-title">
            <span className="sm-manual-section-num">5.</span>
            {s.referenceFrame.title}
          </h2>
          <div className="sm-manual-prose">
            {s.referenceFrame.content.split("\n\n").map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </section>

        {/* ── 6. Axial tilt and rotation ── */}
        <section id="axial-tilt" className="sm-manual-section">
          <h2 className="sm-manual-section-title">
            <span className="sm-manual-section-num">6.</span>
            {s.axialTilt.title}
          </h2>
          <div className="sm-manual-prose">
            {s.axialTilt.content.split("\n\n").map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </section>

        {/* ── 7. Lighting ── */}
        <section id="lighting" className="sm-manual-section">
          <h2 className="sm-manual-section-title">
            <span className="sm-manual-section-num">7.</span>
            {s.lighting.title}
          </h2>
          <div className="sm-manual-prose">
            {s.lighting.content.split("\n\n").map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </section>

        {/* ── 8. Body categories ── */}
        <section id="body-categories" className="sm-manual-section">
          <h2 className="sm-manual-section-title">
            <span className="sm-manual-section-num">8.</span>
            {s.bodyCategories.title}
          </h2>
          <div className="sm-manual-prose">
            {s.bodyCategories.content.split("\n\n").map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </section>

        {/* ── 9. Inspector ── */}
        <section id="inspector" className="sm-manual-section">
          <h2 className="sm-manual-section-title">
            <span className="sm-manual-section-num">9.</span>
            {s.inspector.title}
          </h2>
          <div className="sm-manual-prose">
            {s.inspector.content.split("\n\n").map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </section>

        {/* ── 10. Visual confidence ── */}
        <section id="visual-confidence" className="sm-manual-section">
          <h2 className="sm-manual-section-title">
            <span className="sm-manual-section-num">10.</span>
            {s.visualConfidence.title}
          </h2>
          <div className="sm-manual-prose">
            {s.visualConfidence.content.split("\n\n").map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </section>

        {/* ── 11. Firmament ── */}
        <section id="firmament" className="sm-manual-section">
          <h2 className="sm-manual-section-title">
            <span className="sm-manual-section-num">11.</span>
            {s.firmament.title}
          </h2>
          <div className="sm-manual-prose">
            {s.firmament.content.split("\n\n").map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </section>

        {/* ── 12. Catalog layers ── */}
        <section id="catalog-layers" className="sm-manual-section">
          <h2 className="sm-manual-section-title">
            <span className="sm-manual-section-num">12.</span>
            {s.catalogLayers.title}
          </h2>
          <div className="sm-manual-prose">
            {s.catalogLayers.content.split("\n\n").map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </section>

        {/* ── 13. Sandbox roadmap ── */}
        <section id="sandbox-roadmap" className="sm-manual-section">
          <h2 className="sm-manual-section-title">
            <span className="sm-manual-section-num">13.</span>
            {s.sandboxRoadmap.title}
          </h2>
          <div className="sm-manual-prose">
            {s.sandboxRoadmap.content.split("\n\n").map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </section>

        {/* ── 14. Mobile & performance ── */}
        <section id="mobile-performance" className="sm-manual-section">
          <h2 className="sm-manual-section-title">
            <span className="sm-manual-section-num">14.</span>
            {s.mobilePerformance.title}
          </h2>
          <div className="sm-manual-prose">
            {s.mobilePerformance.content.split("\n\n").map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </section>

        {/* ── 15. FAQ ── */}
        <section id="faq" className="sm-manual-section">
          <h2 className="sm-manual-section-title">
            <span className="sm-manual-section-num">15.</span>
            {s.faq.title}
          </h2>
          <dl className="sm-manual-faq">
            {s.faq.items.map((item, i) => (
              <div key={i} className="sm-manual-faq-item">
                <dt className="sm-manual-faq-q">{item.q}</dt>
                <dd className="sm-manual-faq-a">{item.a}</dd>
              </div>
            ))}
          </dl>
        </section>
      </main>

      {/* ── Ko-fi CTA ── */}
      <aside className="sm-manual-kofi">
        <p className="sm-manual-kofi-text">
          {locale === "it"
            ? "Questo lab è gratuito e open. Se ti è utile, offrimi un caffè su Ko-fi."
            : "This lab is free and open. If you find it useful, buy me a coffee on Ko-fi."}
        </p>
        <a
          href="https://ko-fi.com/fosforonero"
          target="_blank"
          rel="noopener noreferrer"
          className="sm-manual-kofi-btn"
        >
          Ko-fi
        </a>
      </aside>

      <style>{`
        .sm-manual {
          min-height: 100dvh;
          background: #080818;
          color: #c8c8d8;
          font-family: var(--font-mono, ui-monospace, monospace);
          padding: 0 0 80px;
        }

        .sm-manual-nav {
          display: flex;
          align-items: center;
          gap: 24px;
          padding: 20px 32px;
          border-bottom: 1px solid #1e1e36;
        }

        .sm-manual-nav-back,
        .sm-manual-nav-about {
          color: #7c7caa;
          text-decoration: none;
          font-size: 13px;
          letter-spacing: 0.04em;
          transition: color 0.15s;
        }

        .sm-manual-nav-back:hover,
        .sm-manual-nav-about:hover {
          color: #a8d8f8;
        }

        .sm-manual-hero {
          padding: 56px 32px 40px;
          border-bottom: 1px solid #1e1e36;
          max-width: 760px;
        }

        .sm-manual-hero-title {
          font-size: clamp(22px, 4vw, 36px);
          font-weight: 700;
          color: #e8e8f8;
          margin: 0 0 16px;
          letter-spacing: -0.02em;
        }

        .sm-manual-hero-sub {
          font-size: 15px;
          line-height: 1.7;
          color: #8888aa;
          margin: 0;
          max-width: 640px;
        }

        .sm-manual-toc {
          padding: 32px;
          border-bottom: 1px solid #1e1e36;
          max-width: 560px;
        }

        .sm-manual-toc-heading {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: #5a5a7a;
          margin: 0 0 16px;
        }

        .sm-manual-toc-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: grid;
          gap: 8px;
        }

        .sm-manual-toc-item {
          display: flex;
        }

        .sm-manual-toc-link {
          color: #8888cc;
          text-decoration: none;
          font-size: 13px;
          display: flex;
          gap: 10px;
          transition: color 0.15s;
        }

        .sm-manual-toc-link:hover {
          color: #a8d8f8;
        }

        .sm-manual-toc-num {
          color: #4a4a6a;
          min-width: 22px;
        }

        .sm-manual-content {
          padding: 0 32px;
          max-width: 760px;
        }

        .sm-manual-section {
          padding: 48px 0 0;
          border-top: 1px solid #1a1a30;
          margin-top: 0;
        }

        .sm-manual-section:first-child {
          border-top: none;
        }

        .sm-manual-section-title {
          font-size: 18px;
          font-weight: 600;
          color: #d0d0e8;
          margin: 0 0 24px;
          display: flex;
          gap: 12px;
          align-items: baseline;
        }

        .sm-manual-section-num {
          color: #4a4a6a;
          font-weight: 400;
          font-size: 14px;
        }

        .sm-manual-prose p {
          font-size: 14px;
          line-height: 1.8;
          color: #9898b8;
          margin: 0 0 16px;
        }

        .sm-manual-prose p:last-child {
          margin-bottom: 0;
        }

        .sm-manual-faq {
          display: grid;
          gap: 0;
        }

        .sm-manual-faq-item {
          padding: 20px 0;
          border-bottom: 1px solid #1a1a30;
        }

        .sm-manual-faq-item:last-child {
          border-bottom: none;
        }

        .sm-manual-faq-q {
          font-size: 14px;
          font-weight: 600;
          color: #c8c8e8;
          margin: 0 0 8px;
        }

        .sm-manual-faq-a {
          font-size: 13px;
          line-height: 1.7;
          color: #7878a0;
          margin: 0;
        }

        .sm-manual-kofi {
          margin: 60px 32px 0;
          padding: 24px;
          border: 1px solid #1e1e36;
          border-radius: 8px;
          max-width: 480px;
          display: flex;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
        }

        .sm-manual-kofi-text {
          font-size: 13px;
          color: #6868aa;
          margin: 0;
          flex: 1;
          min-width: 200px;
        }

        .sm-manual-kofi-btn {
          background: #ff5e5b;
          color: #fff;
          padding: 8px 20px;
          border-radius: 6px;
          text-decoration: none;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.04em;
          white-space: nowrap;
          transition: opacity 0.15s;
        }

        .sm-manual-kofi-btn:hover {
          opacity: 0.88;
        }

        @media (max-width: 600px) {
          .sm-manual-nav,
          .sm-manual-hero,
          .sm-manual-toc,
          .sm-manual-content,
          .sm-manual-kofi {
            padding-left: 16px;
            padding-right: 16px;
          }
        }
      `}</style>
    </div>
  );
}
