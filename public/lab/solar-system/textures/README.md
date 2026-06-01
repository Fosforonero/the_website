# Solar System Textures

Equirectangular WebP textures at 2048×1024 for the Fosforonero Solar System lab.
All files are converted from original source images using `scripts/solar-system/fetch-textures.ts`.

Re-run the script to refresh: `npx tsx scripts/solar-system/fetch-textures.ts`

## Texture Manifest

| Body | File | Source | Credit | License | Retrieved | Status |
|------|------|--------|--------|---------|-----------|--------|
| Earth | earth-2k.webp | [NASA Visible Earth — Blue Marble Next Generation (Aug 2004)](https://eoimages.gsfc.nasa.gov/images/imagerecords/74000/74117/world.200408.3x5400x2700.jpg) | NASA Visible Earth / Blue Marble Next Generation | Public domain (NASA) — educational use | 2026-06-01 | integrated |
| Mars | mars-2k.webp | [NASA / USGS Viking Orbiter mosaic (via threex.planets)](https://raw.githubusercontent.com/jeromeetienne/threex.planets/master/images/marsmap1k.jpg) | NASA / USGS Viking Orbiter — Mars surface mosaic | Public domain (NASA) — original data from Viking Orbiter | 2026-06-01 | integrated |
| Moon | moon-2k.webp | [NASA GSFC SVS — LRO LROC WAC mosaic](https://svs.gsfc.nasa.gov/vis/a000000/a004700/a004720/lroc_color_2k.jpg) | NASA GSFC SVS / LRO LROC WAC mosaic | Public domain (NASA) — educational use | 2026-06-01 | integrated |
| Mercury | mercury-2k.webp | [NASA GSFC SVS — MESSENGER MDIS mosaic (via threex.planets)](https://raw.githubusercontent.com/jeromeetienne/threex.planets/master/images/mercurymap.jpg) | NASA GSFC SVS / MESSENGER MDIS mosaic | Public domain (NASA) — original data from MESSENGER mission | 2026-06-01 | integrated |

## Notes on Sources

- **Earth**: Downloaded directly from NASA Visible Earth (eoimages.gsfc.nasa.gov). Original is 5400×2700, downsampled to 2048×1024 WebP.
- **Mars**: Primary NASA eoimages URLs (record 36299) returned 404 as of 2026-06-01. Used threex.planets mirror of the NASA/USGS Viking Orbiter mosaic.
- **Moon**: Downloaded directly from NASA GSFC Scientific Visualization Studio (SVS) page 4720 — LROC color mosaic. Original is 2K, resized to 2048×1024 WebP.
- **Mercury**: Primary SVS URL (page 4869) returned 404 as of 2026-06-01. Used threex.planets mirror of the NASA/USGS MESSENGER mosaic.

## Planned (Sprint 05 T2+)

Once Task 2 (render integration) is verified, `confidence` will be upgraded from `"procedural"` to `"real-map"` in `lib/solar-system/assets.ts`.

Higher-resolution sources for future upgrade:
- Earth 4K: `https://eoimages.gsfc.nasa.gov/images/imagerecords/74000/74117/world.200408.3x5400x2700.jpg` (already downloaded at native res)
- Mars 4K: USGS Astropedia — `Mars_Viking_MDIM21_ClrMosaic_global_232m` (requires GeoTIFF processing)
- Moon 4K: USGS Astropedia — `Lunar_LRO_LROC-WAC_Mosaic_global_100m_June2013` (requires GeoTIFF processing)
- Mercury 4K: USGS Astropedia — `Mercury_Messenger_MDIS_Basemap_BDR_Mosaic_Global_166m` (requires GeoTIFF processing)
