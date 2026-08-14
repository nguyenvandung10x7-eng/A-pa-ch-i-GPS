import type { ProductSurface } from './productSurfaces';

export type ProductVisualIdentity = {
  surface: ProductSurface;
  tone: 'editorial' | 'playful';
  emphasis: 'quiet' | 'energetic';
};

export const PRODUCT_VISUAL_IDENTITIES: Record<ProductSurface, ProductVisualIdentity> = {
  book: { surface: 'book', tone: 'editorial', emphasis: 'quiet' },
  challenge: { surface: 'challenge', tone: 'playful', emphasis: 'energetic' },
};
