export interface ImageAsset {
  readonly key: string;
  /** Relative to Vite BASE_URL; never relative to the current route. */
  readonly path: string;
}

export type AssetManifest = readonly ImageAsset[];
export const FOUNDATION_ASSETS: AssetManifest = Object.freeze([]);

/** Future artwork: assets/phieng-loi-v2/. PL-00 ships no artwork. */
export function assetUrl(path: string): string {
  if (!path || path.startsWith('/') || path.includes('\\') || path.includes(':')
    || path.split('/').some((part) => !part || part === '.' || part === '..')) {
    throw new Error('Asset path must be relative to BASE_URL');
  }
  return import.meta.env.BASE_URL + path;
}

export function validateManifest(manifest: AssetManifest): void {
  const keys = new Set<string>();
  for (const asset of manifest) {
    if (!/^pl:v2:[a-z0-9-]+:[a-z0-9-]+$/.test(asset.key) || keys.has(asset.key)) {
      throw new Error('Invalid or duplicate foundation asset key: ' + asset.key);
    }
    assetUrl(asset.path);
    keys.add(asset.key);
  }
}
