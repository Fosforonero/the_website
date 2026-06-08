# Guida alla scrittura degli articoli del blog Fosforonero

Schema operativo per scrivere (e revisionare) gli articoli del blog. Nasce
dall'analisi dell'articolo Anthropic «Lessons from building Claude Code: how we
use skills», preso come modello di *come* scrivere, non *cosa* scrivere, unito
alle regole di stile de-AI e alla regola di progetto «fail loud, never fake».

Usala come checklist prima di pubblicare qualsiasi articolo.

---

## 1. Struttura (cosa prendere dal modo di scrivere di Anthropic)

- **Tesi in apertura.** La prima frase è il punto. Niente preamboli del tipo «In
  questo articolo vedremo». Dici subito cosa porta a casa il lettore.
  Esempio già fatto: «Un orbitale non è un'orbita.»
- **Una cornice memorabile.** Un'immagine o frase-gancio che resta (render farm
  contro 16 millisecondi; «non lo disegno, lo calcolo»). Una per articolo, non dieci.
- **Gotchas / lezioni imparate.** La parte di valore vero: cosa è andato storto,
  cosa ti ha sorpreso, la war-story (il budget di compilazione shader su mobile,
  il bordo nero del disco). È ciò che distingue un articolo tuo da una pagina di
  enciclopedia.
- **Una opinione netta.** Prendi posizione una volta («WebGPU su SplitVote non
  serve, ed è giusto dirlo»). Il giudizio dimostra competenza più
  dell'enciclopedismo.
- **Skimmable.** Heading che raccontano la storia da soli, paragrafi corti,
  grassetti sui concetti chiave, equazioni isolate. Si deve capire il filo
  scorrendo solo i titoli.
- **TL;DR finale.** Chiusura «In sintesi: cosa porto a casa» con 3-5 bullet.
  Già applicata all'articolo Kerr.

**Regola d'oro**: è un layer additivo, non una riscrittura. Non svuotare il
contenuto tecnico per renderlo «snello»; aggiungi struttura sopra a ciò che c'è.

---

## 2. Stile (de-AI, non deve sembrare scritto dall'IA)

- **Zero em-dash (—).** È il tic numero uno dell'IA. Usa virgole, parentesi, due
  punti o spezza la frase. Gli en-dash nei nomi propri (Kerr–Schild,
  Shakura–Sunyaev, Page–Thorne) restano: quelli sono corretti.
- **Niente parentetiche a panino** del tipo «X, e, grazie a Y, Z». Riscrivile.
- **Voce in prima persona, concreta.** «Io faccio», «ho scelto», «mi serviva».
  Non il passivo impersonale da paper.
- **Evita i riempitivi da IA**: «è importante notare che», «in conclusione», «nel
  mondo di oggi», le liste di tre aggettivi perfettamente bilanciate, le frasi che
  riassumono la frase precedente.
- **Varietà di ritmo.** Frasi corte e secche alternate a una lunga. L'IA tende a
  una lunghezza media uniforme.

---

## 3. Regola di progetto (non negoziabile)

- **Fail loud, never fake.** Ogni approssimazione dichiarata, ogni numero reale,
  ogni fonte citata. Niente metriche, screenshot o claim inventati. Se manca un
  dato, lo dici. L'onestà sui limiti è la tua firma, ed è anche un vantaggio di
  scrittura.

---

## 4. Checklist prima di pubblicare

1. La prima frase è già la tesi?
2. C'è una cornice memorabile (una sola)?
3. C'è almeno una lezione/gotcha che solo chi l'ha costruito poteva scrivere?
4. C'è un TL;DR finale «In sintesi»?
5. Si capisce il filo leggendo solo gli heading?
6. `grep "—"` sull'`.mdx` torna **zero**? (en-dash dei nomi propri a parte)
7. Ogni approssimazione è dichiarata, ogni fonte linkata?
8. Bilingue IT + EN allineati, hreflang a posto?
9. KaTeX: `tex="..."` con backslash **singoli** nell'MDX (doppi solo nei `.tsx`)?

---

## 5. Nota tecnica KaTeX (errore già visto)

Nei file `.mdx` gli attributi `tex="..."` dei componenti `<Math>` / `<Mi>`
vogliono **backslash singoli** (`\frac`, non `\\frac`). I backslash doppi
servono solo negli array `eqs` dei file `.tsx` (perché lì sono stringhe
JavaScript). Confondere i due fa renderizzare le formule come testo grezzo.
