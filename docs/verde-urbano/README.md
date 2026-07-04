# Verde Urbano — Design & UX (v3, doppia funzione: luogo + contributo)

App-concept civica per rigenerare il verde di Roma. Demo interattiva installabile
(PWA), bilingue IT/EN, full-screen. Questo documento descrive l'impostazione
**v3**: chi aiuta a piantare un albero indica **sempre anche il luogo** (uno già
segnalato, o uno nuovo), e sceglie **cosa dare** — un albero specifico con il suo
prezzo, oppure — come ultima opzione — un importo libero ("Dona quello che puoi").

- **Codice app:** [`components/lab/verde-urbano-app.tsx`](../../components/lab/verde-urbano-app.tsx) (state machine + schermate), `verde-urbano-view.tsx` (shell/PWA), `verde-urbano.css`.
- **Route (nascosta, noindex):** `/lab/verde-urbano` · `/en/lab/verde-urbano`.
- **Live:** https://www.fosforonero.com/lab/verde-urbano

---

## 1. Filosofia

Resta valido tutto il principio v2 (nessun ruolo, un solo flusso, minima
frizione): l'utente non si chiede "sono un donatore o un segnalatore?", entra e
basta, e può fare qualsiasi cosa in qualsiasi momento.

La v3 introduce una precisazione richiesta dal team: **donare (un albero
specifico o un importo libero) e segnalare un luogo sono due facce della stessa
azione**. Chi "aiuta a piantare un albero" fa sempre una **doppia funzione**:

1. **Cosa dare** — un albero specifico (con prezzo) o un importo libero.
2. **Dove** — un punto già segnalato da altri (o da sé), oppure un punto nuovo
   inserito lì per lì.

"Dona quello che puoi" **non sparisce**: resta disponibile, ma come **ultima
voce** della lista degli alberi, per chi vuole contribuire con una piccola cifra
senza legarsi a una specie precisa. È possibile donare **anche pochi euro** (chip
da €1, €2, €5… o importo libero).

### Cosa cambia rispetto alla v2
| v2 (Home = "Dona quello che puoi") | v3 (Home = "Aiuta a piantare un albero") |
|---|---|
| Un solo step: importo libero → fondo comune | **Step 1:** luogo (esistente o nuovo) → **Step 2:** albero con prezzo, o come ultima voce l'importo libero → **Step 3:** riepilogo/importo → conferma |
| Nessuna scelta di specie né di luogo | Si sceglie sempre **dove** e **cosa** — anche per l'importo libero |
| "Segnala un'area" e "Dona" erano percorsi separati e indipendenti | **Aiutare a piantare include già la segnalazione del luogo**; "Segnala un'area" resta comunque disponibile come azione a sé, per chi vuole solo segnalare senza contribuire economicamente |
| Profilo: "Le mie donazioni" (solo importo) | Profilo: "I miei contributi" — mostra anche l'albero e/o il luogo quando presenti |

### Cosa NON cambia (resta dalla v2/PS del team)
- I punti sulla mappa rappresentano **luoghi dove un albero c'era ed ora manca**
  (aiuola abbandonata, ceppo) — **non** nuove aree da rimboschire. Questo è
  esplicitato sia nel flusso "Aiuta a piantare" (nota sotto la mini-mappa di
  inserimento nuovo luogo) sia nella schermata **Segnala un'area** sia in **Info**.
- Il rimboscamento di aree mai state alberate è un tema aperto, legato
  all'approvazione del Comune: **fuori scope** per questa demo (v. nota in Info).

---

## 2. Sitemap

```
Verde Urbano
│
├── Home ............... obiettivo città, fondo comune, azioni, aree, "come funziona"
├── Mappa .............. mappa partecipata dei bisogni (pin per priorità)
│     └── (sheet area) . dettaglio necessità → "Aiuta a piantare qui" (salta al passo 2, luogo preselezionato) / "Segnala qui"
├── [＋] (azioni) ....... FAB centrale → { Aiuta a piantare un albero · Segnala un'area }
│     ├── Aiuta ......... 1) Dove (esistente/nuovo) → 2) Cosa (albero con prezzo, o importo libero) → 3) riepilogo/importo → conferma → grazie
│     └── Segnala ....... posiziona pin → tipo → dettagli/foto → inviata (azione indipendente, senza contributo)
├── Info ............... come funziona, da dove vengono i punti, trasparenza, fondo
└── Profilo ........... utente, statistiche, I miei contributi, Le mie segnalazioni
```

**Bottom navigation (5 slot):** `Home · Mappa · ＋ · Info · Profilo` (invariata dalla v2).

---

## 3. UX flow — "Aiuta a piantare un albero"

```
Home / FAB / sheet mappa
        │
        ▼
┌───────────────────────────────────────────────────────────┐
│ PASSO 1 DI 3 — Dove pianti?                                 │
│  • lista aree già segnalate (da altri o da te)              │
│  • [+ Aggiungi un nuovo luogo] → tocca la mappa → conferma   │
│    (nota: solo punti dove un albero c'era ed ora manca)      │
└───────────────────────────┬───────────────────────────────┘
                            ▼
┌───────────────────────────────────────────────────────────┐
│ PASSO 2 DI 3 — Cosa doni?                                    │
│  • Acero campestre  €45      • Tiglio  €70                  │
│  • Leccio  €90                • Pino domestico  €120         │
│  • Roverella  €150                                           │
│  • ── Dona quello che puoi ──  (ultima voce, importo libero) │
└───────────┬───────────────────────────────┬─────────────────┘
      [ramo albero]                   [ramo importo libero]
            ▼                                   ▼
┌─────────────────────────┐        ┌───────────────────────────┐
│ PASSO 3 — Riepilogo       │        │ PASSO 3 — Dona quello che  │
│ Luogo · Albero · CO₂      │        │ puoi                       │
│ Totale €90                │        │ €1 €2 €5 €10 €20 €50 / altro│
│ [ Conferma €90 ]          │        │ [ Dona €X ]                │
└───────────┬───────────────┘        └────────────┬────────────┘
            ▼                                     ▼
      Grazie! Il tuo albero arriva.        Grazie! Il tuo contributo conta.
      (copy specifica per l'albero)        (copy per il fondo comune)
```

Da qualsiasi punto: `Indietro` torna al passo precedente; dal passo 1, se si sta
aggiungendo un nuovo luogo, `Annulla` chiude solo il pannello di inserimento
(non esce dal flusso). Scegliendo "Aiuta a piantare qui" dallo sheet di
un'area sulla mappa, il **passo 1 viene saltato** (luogo già impostato).

**Punto chiave:** anche scegliendo "Dona quello che puoi" (importo libero), il
passo 1 (luogo) resta obbligatorio — è così che si realizza la "doppia
funzione" richiesta: *dare* + *segnalare/occupare un luogo* sono un'unica azione.

---

## 4. Wireframe (per schermata)

### Home
```
┌──────────────────────────────┐
│ Ciao 👋                  (MR) │
│ La tua Roma più verde         │
│ [ obiettivo città ▓▓░░░░ ]    │
│ [ 🌱 Fondo comune €12.480 ]   │
│ [Aiuta a piantare un albero]  │
│ [Segnala un'area]             │
│ Aree che aspettano     Mappa→ │
│ ┌ Come funziona ─────────┐   │
│ │ ... → Info              │   │
│ └────────────────────────┘   │
├──────────────────────────────┤
│ Home  Mappa  [＋]  Info  Prof │
└──────────────────────────────┘
```

### Aiuta a piantare — Passo 1 (Dove)
```
‹ PASSO 1 DI 3 ▓░░
Dove pianti?
Scegli un punto già segnalato, oppure aggiungine uno nuovo.
• Viale del Pinciano · 8 alberi richiesti          →
• Largo Valtournanche · 11 alberi richiesti        →
• ... (altre aree)
┌ + Aggiungi un nuovo luogo ┐   (tratteggiato)
└───────────────────────────┘
      ↓ tap
┌── mini-mappa: tocca per posizionare ──┐
│  nota: punti dove un albero c'era     │
│  ed ora manca, non nuove aree         │
│  [Annulla]        [Usa questo punto]  │
└────────────────────────────────────────┘
```

### Aiuta a piantare — Passo 2 (Cosa)
```
‹ PASSO 2 DI 3 ▓▓░
Cosa doni?
Scegli un albero, oppure — come ultima opzione — un importo libero.
🌳 Acero campestre   Acer campestre   Fino a 6–8 m · 18 kg CO₂/anno   €45  →
🌳 Tiglio            ...                                              €70  →
🌳 Leccio                                                              €90  →
🌳 Pino domestico                                                     €120 →
🌳 Roverella                                                          €150 →
┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈
🌱 Dona quello che puoi · Scegli tu l'importo                          →
```

### Aiuta a piantare — Passo 3a (ramo albero)
```
Riepilogo
Luogo         Viale del Pinciano
Albero        Leccio · Quercus ilex
CO₂ assorbita 31 kg / anno
──────────────────────────
Totale                €90
[ Conferma €90 ]
Interventi eseguiti da operatori incaricati dall'amministrazione.
```

### Aiuta a piantare — Passo 3b (ramo importo libero)
```
Dona quello che puoi
Luogo: Viale del Pinciano
[€1][€2][€5]
[€10][€20][€50]
€[ altro importo ______ ]
┌ 🌱 Fondo comune — come funziona → ┐
[ Dona €10 ]
Contributo simulato — questa è una demo.
```

### Segnala un'area (invariata, azione indipendente)
```
‹ SEGNALA ▓▓▓░░  →  1) Dov'è? (tap mappa) — nota: punto dove un albero manca
                    2) Di che si tratta? (abbattuti / strada / spazio)
                    3) Dettagli: [foto] + nota  →  [ Invia ]  →  ✔ Inviata!
```

---

## 5. Descrizione funzionale

### Doppia funzione: dare + indicare il luogo
"Aiuta a piantare un albero" combina sempre due scelte:
1. **Cosa dare** — un albero specifico (prezzo fisso, es. Leccio €90) oppure,
   come ultima voce della lista, un **importo libero** ("Dona quello che
   puoi": preset €1/2/5/10/20/50 o valore custom — permette anche **piccole
   cifre**).
2. **Dove** — un punto già segnalato (da altri utenti o da sé stessi in
   precedenza), oppure un **nuovo punto** inserito al momento toccando la
   mini-mappa.

Il nuovo punto inserito diventa da subito visibile come pin sulla **Mappa
partecipata** e nella lista "Aree che aspettano" in Home (demo in sessione).

### Segnalare senza donare
**Segnala un'area** resta un'azione indipendente e invariata: chi vuole solo
segnalare un bisogno (senza contribuire economicamente in quel momento) lo può
fare dal FAB, esattamente come in v2. I punti così segnalati confluiscono nella
mappa e diventano scelte disponibili nel passo "Dove" del flusso di aiuto.

### Trasparenza sui luoghi (nota del team, importante)
I punti segnalati/mostrati rappresentano **luoghi dove un albero esisteva ed
ora manca** (piccola aiuola abbandonata, ceppo residuo) — **non** nuove aree
mai state alberate. Questo è reso esplicito:
- nella nota sotto la mini-mappa di inserimento nuovo luogo (flusso Aiuta);
- nella nota sotto la mappa di segnalazione (flusso Segnala);
- nella schermata **Info**, sezione "Da dove vengono i punti sulla mappa".

Il **rimboscamento** di aree mai state alberate è un tema volutamente fuori
scope per questa demo: richiederebbe un iter di approvazione con il Comune,
diverso e più lungo. La demo lo segnala esplicitamente per non creare
aspettative sbagliate nell'utente finale.

### Trasparenza sui fondi
Ogni euro (sia da un albero specifico sia da un contributo libero) confluisce
nello stesso **fondo comune** mostrato in Home e in Info, con il derivato
"alberi finanziati" (fondo ÷ costo medio). L'associazione pianta e rendiconta.

---

## 6. User journey

**A — "Ho visto un'aiuola morta e voglio aiutare subito"**
Home → **Aiuta a piantare un albero** → Passo 1: **+ Aggiungi un nuovo luogo**
→ tocca la mappa → *Usa questo punto* → Passo 2: sceglie **Leccio €90** →
Passo 3: riepilogo → *Conferma €90* → *Grazie! Il tuo albero arriva.*

**B — "Voglio dare una piccola cifra, non mi interessa quale albero"**
Home → **Aiuta a piantare un albero** → Passo 1: sceglie un'area già segnalata
(es. Largo Valtournanche) → Passo 2: scorre la lista e in fondo tocca **Dona
quello che puoi** → Passo 3: **€2** → *Dona €2* → *Grazie! Il tuo contributo
conta.*

**C — "Ho visto un ceppo ma non voglio donare ora"**
Home → **＋ → Segnala un'area** → posiziona il pin → tipo → foto/nota → *Inviata*.
Il punto compare sulla mappa ed entra tra le scelte disponibili per chi vorrà
aiutare in futuro (anche per sé stesso, più avanti).

**D — "Parto dalla mappa"**
**Mappa** → tocca un pin → sheet con la necessità → **Aiuta a piantare qui**
(salta il passo 1, luogo già impostato) → Passo 2 → Passo 3 → Grazie.

**E — "Voglio capire il modello prima di impegnarmi"**
Home → card **Come funziona** (o tab **Info**) → legge i 3 passi, "da dove
vengono i punti" (con la nota sul rimboscamento) e **Trasparenza** → torna e fa
**Aiuta a piantare un albero**.

---

## 7. Note d'implementazione
- Stato flusso "Aiuta": `dStep (1|2|3|4)`, `dArea`, `dAddingNew`/`dPendingPin`
  (inserimento nuovo luogo), `dChoice ('tree'|'fund')`, `dTreeId`,
  `dAmount`/`dCustom` (ramo importo libero), `dConfirmed` (importo confermato
  per la schermata di grazie).
- Nuovi luoghi: `customAreas: Area[]`, generati con coordinate deterministiche
  (nessun `Math.random()`/`Date.now()` in fase di render — solo in risposta a
  un click, quindi SSR-safe) e uniti a `AREAS` per pin/liste.
- Profilo: `myContributions: MyContribution[]` con `kind: 'tree'|'fund'`,
  mostra sempre il luogo e, se presente, l'albero.
- Numeri localizzati con `toLocaleString` (it-IT / en-US).
- Demo/concept: dati fittizi, `noindex`, non in `sitemap`/menu `/lab` — link
  diretto condiviso privatamente.
