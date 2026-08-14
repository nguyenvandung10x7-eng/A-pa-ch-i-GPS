import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { PRODUCT_VISUAL_IDENTITIES } from '../data/productVisualIdentity';
import { resolveProductSurface } from '../data/productSurfaces';

type ProductSurfaceFrameProps = {
  children: ReactNode;
};

export const ProductSurfaceFrame = ({ children }: ProductSurfaceFrameProps) => {
  const location = useLocation();
  const surface = resolveProductSurface(location.pathname);

  if (!surface) return <>{children}</>;

  const identity = PRODUCT_VISUAL_IDENTITIES[surface];
  const surfaceClass = identity.emphasis === 'quiet'
    ? 'bg-[linear-gradient(180deg,rgba(244,240,230,0.72),rgba(238,232,218,0.32))] ring-[rgba(91,67,38,0.08)]'
    : 'bg-[linear-gradient(180deg,rgba(255,242,229,0.76),rgba(249,222,199,0.34))] ring-[rgba(176,96,48,0.12)]';

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
