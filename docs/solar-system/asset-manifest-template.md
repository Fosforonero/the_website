# Asset Manifest Template

Use this template before adding any texture or 3D model to the repository.

```ts
export type SolarSystemAsset = {
  bodyId: string;
  displayName: string;
  assetType: "diffuse-texture" | "normal-map" | "height-map" | "mesh" | "sprite" | "procedural-material";
  localPath?: string;
  sourceUrl: string;
  sourceName: string;
  credit: string;
  retrievedAt: string;
  licenseNote: string;
  processing: {
    originalFormat?: string;
    outputFormat?: "webp" | "jpg" | "png" | "glb" | "gltf";
    resizedTo?: string;
    convertedBy?: string;
    notes?: string;
  };
  scientificUse: "scientific-map" | "visualization-only" | "artist-enhanced" | "procedural";
};
```

## Example

```ts
{
  bodyId: "mars",
  displayName: "Mars",
  assetType: "diffuse-texture",
  localPath: "/lab/solar-system/textures/mars-2k.webp",
  sourceUrl: "https://astrogeology.usgs.gov/search/map/mars-viking-global-products",
  sourceName: "USGS Astrogeology Mars Viking Global Products",
  credit: "USGS Astrogeology / NASA mission data",
  retrievedAt: "2026-05-29",
  licenseNote: "Verify product metadata; USGS-authored products are generally public domain unless third-party credit is specified.",
  processing: {
    originalFormat: "GeoTIFF or source mosaic",
    outputFormat: "webp",
    resizedTo: "2048x1024",
    convertedBy: "sharp",
    notes: "Converted to equirectangular web texture for visualization."
  },
  scientificUse: "visualization-only"
}
```

