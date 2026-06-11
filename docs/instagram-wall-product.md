# Instagram Wall — design di prodotto

> Stato: bozza · 2026-06-11 · Autore: Matteo (Fosforonero)
> Branch di lavoro: `feat/instagram-wall`

Un widget "muro Instagram" *bello e interattivo*, vendibile come prodotto su più
canali (WordPress, Next.js/React, embed universale), costruito sopra un unico
backend che parla con le API ufficiali di Meta.

---

## 1. Problema e tesi

I plugin "feed Instagram" esistenti (Smash Balloon, EmbedSocial, Elfsight…) sono
funzionalmente ok ma **esteticamente mediocri**: griglie piatte, branding del
fornitore, poco controllo sul design. Il differenziatore di Fosforonero è il
**wall curato** ([`components/client/instagram-gallery.tsx`](../components/client/instagram-gallery.tsx)):
hero tile, griglia editoriale, lightbox, reveal cinematografico. Quella è la
parte difficile da copiare; il resto è plumbing noto.

**Tesi:** lo stesso wall, alimentato da un backend Meta-compliant, distribuito su
WordPress (43% del web) e su React/Next, è un prodotto SaaS reale.

## 2. Vincolo non negoziabile: niente scraping

L'Instagram **Basic Display API** è stata chiusa da Meta il **4 dic 2024**.
Lo scraping di profili pubblici (a) è tecnicamente bloccato dal login wall, (b)
viola i ToS di Meta (cause in corso, es. Bright Data), (c) è invendibile senza
esporre i clienti a responsabilità legale.

→ L'unica base lecita è **"Instagram API with Instagram Login"** (Graph API):
il cliente **autorizza una volta** via OAuth, noi leggiamo i suoi media con un
token. Niente "incolla un handle e scarico le foto".

## 3. Forma del prodotto: backend ospitato + client sottili

La complessità sta nel backend; i client sono "renderizza questo JSON".

```
                ┌─────────────────────────────────────────┐
                │  BACKEND OSPITATO (build una volta sola)  │
                │  • OAuth "Connetti Instagram"             │
                │  • storage + refresh token long-lived     │
                │  • fetch Graph API + normalizzazione      │
                │  • download/ottimizzazione immagini (CDN) │
                │  • cache + endpoint JSON per tenant       │
                └───────────────┬───────────────────────────┘
                                │  GET /feed/<tenant>  → JSON
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
   Plugin WordPress      Componente React/Next     Embed <script>/iframe
   (mercato di massa)    (npm install)             (Squarespace, Webflow, HTML)
```

Tre canali di distribuzione, **un solo backend Meta da mantenere**.

### Perché gli URL CDN scadono → si scaricano le immagini
I `media_url` della Graph API sono link temporanei (scadono in ore). Il backend
scarica i media su storage proprio (o `/public` in single-tenant) e serve URL
permanenti. Lo stesso principio vale già in Fase 1.

## 4. Vincoli Meta da mettere a budget

- **Account**: il cliente deve avere un IG **Business o Creator** (entrambi ok).
- **Token**: long-lived = 60 giorni, va **rinnovato** (cron). Da gestire per tenant.
- **App Review + Business Verification**: obbligatori per leggere account *di
  terzi* con `instagram_business_basic`. In Development mode si testa solo su
  account aggiunti come ruoli/tester. → gate prima della vendita pubblica.
- **Rate limit**: per-utente; la cache è obbligatoria, non opzionale.

## 5. Fasi

| Fase | Cosa | Esito | Stato |
|------|------|-------|-------|
| **1** | Il wall di Fosforonero via Graph API, single-tenant, token proprio, sync script statico | wall live su fosforonero.com = demo del prodotto | in corso |
| **2** | Multi-tenant: OAuth "Connetti IG", storage/refresh token, endpoint feed per tenant, cache | backend SaaS | da progettare |
| **3** | Client: plugin WordPress + componente React/Next + embed `<script>` | distribuzione | da progettare |
| **4** | Go-to-market: App Review Meta, Business Verification, pricing, billing | vendibile a terzi | da progettare |

La Fase 1 **è** la fondazione: stesso codice di fetch/normalizzazione/render,
solo con un tenant. Non è lavoro buttato.

## 6. Pricing (ipotesi iniziali, da validare)

- Free: 1 account, ~12 post, "powered by Fosforonero".
- Pro (~5–9 €/mese): più account, post illimitati, no branding, layout extra.
- Agency: white-label, multi-sito.
  Riferimento di mercato: Smash Balloon ~49 $/anno, EmbedSocial ~29 $/mese.

## 7. Rischi e domande aperte

- **App Review Meta**: tempi e requisiti possono essere onerosi (privacy policy,
  screencast del flusso, use-case). Da prototipare presto.
- **Manutenzione token**: il refresh a 60gg per molti tenant è un punto di
  fallimento silenzioso → serve monitoring + notifica al cliente.
- **Hosting backend**: Vercel functions + storage (R2/S3) o servizio dedicato?
- **Reels/video**: la Graph API espone `thumbnail_url` per i video — il wall li
  gestisce come immagini con chip "video". Riproduzione inline = scope futuro.
- **WordPress**: distribuzione su wp.org (review) vs vendita diretta?

## 9. Backlog feature (raccolto in sessione, 2026-06-11)

Idee emerse mentre il wall prendeva forma. Triage: **[wall]** = riguarda il
componente di rendering (vendibile come layout/UX); **[backend]** = richiede il
servizio + permessi Meta; **[AI]** = richiede un LLM (Claude API).

### Layout & UX del wall
- **[wall] Layout "base"**: griglia uniforme 1:1 con hero — FATTO, è il preset di
  default. Salvato come configurazione base.
- **[wall] Layout "dinamico"**: usa la **forma esatta** delle foto (aspect ratio
  reale), giustificato a righe (Flickr/Google Photos) o masonry (Pinterest).
- **[wall] Hover-magnify**: al passaggio del mouse l'immagine si ingrandisce un
  po' e **ridimensiona le vicine** (effetto dock). Da progettare.
- **[wall] Lightbox** (già esistente): al click l'immagine si apre in
  sovrimpressione su sfondo scuro (termine: *lightbox* + *backdrop/scrim*).
- **[wall] Caroselli swipabili**: i post multi-immagine vanno sfogliati
  (swipe/frecce) sia nella tile sia nel lightbox.
- **[wall] Icona di condivisione** per ogni immagine (share nativo / copia link).
- **[wall] UX caption**: oggi va "sotto col mouse". Valutare se rendere
  swipabile l'intera immagine (gesto naturale Instagram) e tenere la caption
  sempre sotto.
- **[wall] Video** (quando riattivati): anteprima breve all'hover, play al click,
  controlli (pausa, ecc.). Esclusi di default in Fase 1.
- **[wall] Nav/scroll-fade pulito**: sostituire il "trucchetto del gradiente" che
  maschera il contenuto sotto la nav flottante con una soluzione professionale
  (nav frosted con backdrop-filter + scroll-padding-top), valida per tutto il sito.

### Feature di prodotto (plugin)
- **[backend][AI] Ottimizzatore SEO/GEO Instagram**: legge caption + hashtag +
  (vision sull'immagine) e suggerisce caption/hashtag/alt ottimizzati secondo le
  best practice correnti. **Limite Meta**: l'API NON permette di modificare la
  caption di un post **già pubblicato** (solo l'app lo consente a mano); si può
  applicare a **nuovi** post in fase di publish. Quindi: analizza + suggerisce
  sempre; auto-applica solo su nuovi contenuti.
- **[backend] Gestione commenti**: leggere, **rispondere**, nascondere/eliminare i
  commenti sui propri media (scope `instagram_business_manage_comments`, incluso
  nel caso d'uso già attivato). Moderazione fattibile via API.
- **[backend] Publish/scheduling** di nuovi post (scope content publish) — già
  parte del caso d'uso, da valutare se in scope prodotto.

## 8. Principi (ereditati dal progetto)

- **Fail loud, never fake**: se manca token/dato reale, errore esplicito, mai mock.
- Niente librerie nuove senza decisione esplicita.
- Conformità ToS Meta: solo API ufficiali, mai scraping.
