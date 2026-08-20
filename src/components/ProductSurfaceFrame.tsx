import type { ReactNode } from 'react';
import { PRODUCT_VISUAL_IDENTITIES } from '../data/productVisualIdentity';
import type { ProductSurface } from '../data/productSurfaces';

type ProductSurfaceFrameProps = {
  surface: ProductSurface;
  children: ReactNode;
};

export const ProductSurfaceFrame = ({ surface, children }: ProductSurfaceFrameProps) => {
  const identity = PRODUCT_VISUAL_IDENTITIES[surface];
  const isChallenge = identity.emphasis === 'energetic';

  return (
    <section
      data-product-surface={surface}
      data-product-tone={identity.tone}
      className={isChallenge ? 'field-utility-frame' : 'book-utility-frame'}
    >
      {children}
    </section>
  );
};
