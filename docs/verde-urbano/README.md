# Verde Urbano — Design & UX (v2, flusso unico)

App-concept civica per rigenerare il verde di Roma. Demo interattiva installabile
(PWA), bilingue IT/EN, full-screen. Questo documento descrive l'impostazione **v2**,
che elimina i ruoli e adotta un **flusso unico** con **donazione libera a fondo comune**.

- **Codice app:** [`components/lab/verde-urbano-app.tsx`](../../components/lab/verde-urbano-app.tsx) (state machine + schermate), `verde-urbano-view.tsx` (shell/PWA), `verde-urbano.css`.
- **Route (nascosta, noindex):** `/lab/verde-urbano` · `/en/lab/verde-urbano`.
- **Live:** https://www.fosforonero.com/lab/verde-urbano

---

## 1. Filosofia

Ridurre al minimo la complessità e la frizione. L'utente **non deve chiedersi**
_"sono un donatore?"_ o _"sono un segnalatore?"_: entra e basta, e può fare
qualsiasi cosa in qualsiasi momento.

Principi:
- **Un solo flusso, nessun ruolo.** Nessuna schermata di scelta iniziale.
- **Tutto dal menu.** Ogni funzione è raggiungibile dalla navigazione (tab bar + FAB).
- **Donazione libera → fondo comune.** Non si "compra un albero": si dona quello che
  si può; il fondo è gestito dall'associazione.
- **Allocazione automatica e trasparente.** Il donatore non sceglie quale albero
  finanziare; il sistema segue criteri semplici e pubblici.
- **Naturale:** entro → esploro la mappa → segnalo se vedo un'area → dono se voglio.

### Cosa è cambiato rispetto alla v1
| v1 (prima) | v2 (adesso) |
|---|---|
| Onboarding con scelta ruolo (Donatore / Informatore) | **Rimosso** — si entra direttamente in Home |
| Donazione = wizard 4 step (area → specie → livello → riepilogo) | **"Dona quello che puoi"** — importo libero (1/2/5/10/20/50 € o custom) → conferma |
| Il donatore sceglie albero e area | **Fondo comune**: allocazione automatica per priorità |
| Tab "Diario" (albero personale) | Sostituito da **"Info"** (come funziona / trasparenza) |
| Profilo con "I miei alberi" + doppio badge ruolo | **"Le mie donazioni"** + tag unico "Cittadino attivo" |

---

## 2. Sitemap (mappa delle schermate)

```
Verde Urbano
│
├── Home ............... panoramica: obiettivo città, fondo comune, azioni, aree, "come funziona"
├── Mappa .............. mappa partecipata dei bisogni (pin per priorità)
│     └── (sheet area) . dettaglio necessità → "Dona al fondo" / "Segnala qui"
├── [＋]  (azioni) ...... FAB centrale → { Dona quello che puoi · Segnala un'area }
│     ├── Dona ......... importo libero → conferma → grazie
│     └── Segnala ...... posiziona pin → tipo → dettagli/foto → inviata
├── Info ............... come funziona, criteri di allocazione, trasparenza, fondo
└── Profilo ........... utente, statistiche, Le mie donazioni, Le mie segnalazioni
```

**Bottom navigation (5 slot):** `Home · Mappa · ＋ · Info · Profilo`
Le due **azioni** (Dona, Segnala) non sono tab: vivono nel **FAB ＋**, così sono
raggiungibili da qualsiasi schermata. Donazione e Segnalazione sono _flussi_
(nascondono la tab bar e mostrano un tasto Indietro).

---

## 3. UX flow

```
            ┌─────────────────────────────────────────────┐
            │                  Ingresso                    │
            │        (nessun ruolo, nessun onboarding)     │
            └───────────────────────┬─────────────────────┘
                                    ▼
                                 [ HOME ]
        ┌───────────────┬───────────┼───────────────┬───────────────┐
        ▼               ▼           ▼               ▼               ▼
     [ MAPPA ]      [ ＋ DONA ]  [ ＋ SEGNALA ]   [ INFO ]      [ PROFILO ]
        │               │           │
   tap pin              │           │
        ▼               ▼           ▼
   (sheet area)   importo libero  posiziona pin
   ├ Dona ───────►  → conferma      → tipo problema
   └ Segnala ────►  → GRAZIE        → foto/nota
                    (fondo comune)   → INVIATA
                         │               │
                         └──► Info ◄──────┘  (capire come vengono usati i fondi)
```

Ogni nodo è reversibile: `Indietro`/tab per uscire da un flusso; il FAB è sempre a
portata di pollice.

---

## 4. Wireframe (per schermata)

Notazione: `[ ]` bottone, `( )` chip, `▓` progress, `≡` lista.

### Home
```
┌──────────────────────────────┐
│ Ciao 👋                  (MR) │
│ La tua Roma più verde         │
│ ┌──────────────────────────┐ │
│ │ ALBERI PIANTATI A ROMA   │ │  ← obiettivo collettivo
│ │ 1.240   /5.000  ▓▓░░░░░░ │ │
│ └──────────────────────────┘ │
│ ┌──────────────────────────┐ │
│ │ 🌱 Fondo comune          │ │  ← nuovo: fondo + alberi finanziati
│ │ €12.480 raccolti · 166.. │ │
│ └──────────────────────────┘ │
│ [ Dona quello che puoi ][Segnala] │
│ Aree che aspettano      Mappa→ │
│ (Alta) Viale Pinciano  8 richiesti → │   ← informativo → Mappa
│ ┌ Come funziona ─────────┐   │
│ │ Doni · segnali · piant.│→  │   ← teaser → Info
│ └────────────────────────┘   │
├──────────────────────────────┤
│ Home  Mappa  [＋]  Info  Prof │
└──────────────────────────────┘
```

### Mappa → sheet area
```
┌──────────────────────────────┐
│ Mappa partecipata             │
│ (Tutte le aree)(Priorità alta)│
│ ┌── mappa illustrata ───────┐ │
│ │   ⑪   ⑧      ⑥            │ │  ← pin = alberi richiesti, colore = priorità
│ │      ◎(sei qui)   ⑤       │ │
│ └───────────────────────────┘ │
│ ● Alta ● Media ● Bassa        │
└───────────────┬──────────────┘
                ▼ tap pin
   ┌────────────────────────────┐
   │ (Priorità alta)  Piazza     │
   │ Largo Valtournanche         │
   │ Montesacro · 11 richiesti   │
   │ "Il fondo comune viene usato│
   │  qui in base alla priorità" │
   │ [ Dona al fondo comune ]    │
   │ [ Segnala un problema qui ] │
   └────────────────────────────┘
```

### Dona (importo libero) → Grazie
```
┌──────────────────────────────┐      ┌──────────────────────────────┐
│ ‹ Dona quello che puoi        │      │            🌱                 │
│ Scegli un importo: va nel     │      │        Grazie!                │
│ fondo comune…                 │      │   Il tuo contributo conta.    │
│ [ €1 ][ €2 ][ €5 ]            │  →   │  €10 entrano nel fondo comune │
│ [ €10][ €20][ €50 ]          │      │  …in modo trasparente.        │
│ € [ altro importo________ ]   │      │ [ Come vengono usati i fondi ]│
│ ┌ 🌱 Fondo comune ─ come fnz→┐│      │ [ Torna alla home ]           │
│ [ Dona €10 ]                  │      └──────────────────────────────┘
│ Donazione simulata — demo.    │
└──────────────────────────────┘
```

### Segnala (flusso 3 step)
```
‹ SEGNALA ▓▓▓░░  →  1) Dov'è?  (tap mappa / usa posizione)
                    2) Di che si tratta? (abbattuti / strada / spazio)
                    3) Dettagli: [foto] + nota  →  [ Invia ]  →  ✔ Inviata!
```

### Info (come funziona / trasparenza)
```
┌──────────────────────────────┐
│ Come funziona                 │
│ Un unico flusso, senza ruoli. │
│ [€12.480 raccolti][166 alberi]│
│ 1 · Doni quello che puoi      │
│ 2 · I cittadini segnalano     │
│ 3 · L'associazione pianta     │
│ ┌ Come vengono assegnati i fondi ┐
│ │ ① aree con maggiore necessità │
│ │ ② ordine cronologico segnalaz.│
│ │ ③ priorità amministratori     │
│ │ "automatica e trasparente"    │
│ └───────────────────────────────┘
│ ┌ Trasparenza · ogni euro tracciato ┐
│ [ Dona quello che puoi ]      │
└──────────────────────────────┘
```

### Profilo
```
(MR) Marco Rossi · (Cittadino attivo)
[ €35 donato ][ 2 segnalazioni ][ 3 donazioni ]
Le mie donazioni:  €25 · 2 sett. fa   /  €10 · 1 mese fa   (al fondo comune)
Le mie segnalazioni:  Piazzale Ostiense (In valutazione) / Via dei Gracchi (Pianificato)
```

---

## 5. Descrizione funzionale

### Donazione a fondo comune
- L'utente sceglie un **importo libero** (preset 1/2/5/10/20/50 € oppure valore custom).
- Alla conferma l'importo **confluisce nel fondo comune** (nessuna scelta di albero/area).
- La demo aggiorna in sessione: `fondo raccolto`, `alberi finanziati` (= fondo ÷ costo
  medio albero, mostrato in modo trasparente), e la lista **Le mie donazioni**.
- È una **donazione simulata** (demo, nessun pagamento reale) — dichiarato in schermata.

### Allocazione delle risorse (automatica e trasparente)
Il fondo viene impiegato dall'associazione/ente gestore secondo criteri semplici e
pubblici, **senza** che il donatore scelga:
1. **Priorità delle aree** con maggiore necessità (dalla mappa partecipata).
2. **Ordine cronologico** delle segnalazioni.
3. **Priorità** eventualmente definite dagli amministratori.

### Mappa & segnalazioni
- La **mappa partecipata** mostra i bisogni segnalati (pin: numero = alberi richiesti,
  colore = priorità alta/media/bassa). È **informativa**: alimenta i criteri di
  allocazione, non è un catalogo d'acquisto.
- La **segnalazione** (posiziona pin → tipo → foto/nota → invia) arricchisce la mappa.

### Trasparenza
Ogni euro è tracciato; l'associazione pubblica rendiconti e aggiornamenti sulle
piantumazioni finanziate. La schermata **Info** rende esplicito il modello.

---

## 6. User journey

**A — "Passavo di qui e voglio contribuire"**
Apre l'app → Home → tocca **Dona quello che puoi** → sceglie €5 → Conferma → *Grazie*.
Nessuna domanda su ruoli, aree o specie. < 15 secondi.

**B — "Ho visto un'aiuola morta"**
Apre l'app → **＋ → Segnala un'area** → posiziona il pin → "Spazio pubblico da
rinverdire" → foto + nota → *Segnalazione inviata*. La vede comparire sulla mappa.

**C — "Voglio capire dove finiscono i soldi"**
Home → card **Come funziona** (o tab **Info**) → legge i 3 passi, i **criteri di
allocazione** e la sezione **Trasparenza** → si convince → **Dona quello che puoi**.

**D — "Esploro e poi decido"**
**Mappa** → tocca un pin (priorità alta) → legge la necessità → dallo sheet
**Dona al fondo comune** _oppure_ **Segnala un problema qui**.

Tutte e quattro condividono lo **stesso ingresso** e lo **stesso menu**: nessun
percorso separato per "tipo di utente".

---

## 7. Note d'implementazione
- Schermate: `home · map · donate · report · info · profile` (state machine in un solo
  componente client). Nessuno stato `role`/`onboarding`.
- Donazione: stato `dStep (1|2)`, `dAmount|dCustom`, `fundRaised`, `myDonations`.
- Numeri localizzati con `toLocaleString` (it-IT / en-US) → deterministico, SSR-safe.
- Demo/concept: dati fittizi, `noindex`, non in `sitemap`/menu `/lab` — link diretto.
