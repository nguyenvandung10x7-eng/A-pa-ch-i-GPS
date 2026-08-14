import type { ReactNode } from 'react';
import { PRODUCT_VISUAL_IDENTITIES } from '../data/productVisualIdentity';
import type { ProductSurface } from '../data/productSurfaces';

type ProductSurfaceFrameProps = {
  surface: ProductSurface;
  children: ReactNode;
};

export const ProductSurfaceFrame = ({ surface, children }: ProductSurfaceFrameProps) => {
  const identity = PRODUCT_VISUAL_IDENTITIES[surface];
  const surfaceClass = identity.emphasis === 'quiet'
    ? 'bg-[rgba(248,244,235,0.48)] ring-[rgba(91,67,38,0.08)]'
    : 'bg-[linear-gradient(180deg,rgba(195,112,57,0.12),rgba(248,244,235,0.58))] ring-[rgba(176,96,48,0.16)]';

  return (
    <section
      data-product-surface={surface}
      data-product-tone={identity.tone}
      className={`rounded-[2rem] p-2 ring-1 sm:p-3 ${surfaceClass}`}
    >
      {children}
    </section>
  );
};
