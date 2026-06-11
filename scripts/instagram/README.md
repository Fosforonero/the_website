# Instagram wall — sync (Fase 1)

Sincronizza i post di [@fosforonero](https://www.instagram.com/fosforonero/)
nel wall del sito, via Instagram Graph API. Single-tenant (account proprio).
Visione di prodotto completa: [`docs/instagram-wall-product.md`](../../docs/instagram-wall-product.md).

## Cosa fa

1. Fetch degli ultimi N post via Graph API (`graph.instagram.com`).
2. Scarica ogni immagine in `public/instagram/<id>.webp` (gli URL CDN di Meta
   scadono in poche ore → vanno persistiti localmente).
3. Estrae il colore dominante per l'halo all'hover.
4. Riscrive `content/instagram/posts.json` nella forma che `lib/instagram.ts`
   già si aspetta. Il componente `<InstagramGallery>` non va toccato.

## Credenziali (`.env.local`, gitignorato — mai nel repo, mai in chat)

| Variabile | Cosa | Segreto? |
|-----------|------|----------|
| `INSTAGRAM_USER_ID` | ID dell'**account** Instagram (NON l'App ID) | no |
| `INSTAGRAM_ACCESS_TOKEN` | token long-lived | **sì** |
| `META_APP_ID` | App ID (per il refresh token) — opzionale | no |
| `META_APP_SECRET` | App Secret (per il refresh token) — opzionale | **sì** |

`INSTAGRAM_USER_ID` e `INSTAGRAM_ACCESS_TOKEN` si ottengono da: dashboard Meta →
app *Fosforonero Photowall* → prodotto **Instagram** → *Configurazione dell'API
con login di Instagram* → **Genera token di accesso → Aggiungi account*.

## Uso

```bash
pnpm ig:sync                 # sincronizza gli ultimi 24 post
pnpm ig:sync -- --limit=12   # solo gli ultimi 12
pnpm ig:sync -- --refresh    # rinnova e stampa il token long-lived (cron ~60gg)
```

Poi `pnpm dev` e apri `/instagram`.
