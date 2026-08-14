import type { ReactNode } from 'react';
import { PRODUCT_VISUAL_IDENTITIES } from '../data/productVisualIdentity';
import type { ProductSurface } from '../data/productSurfaces';
import { ChallengeSurfaceChrome } from './ChallengeSurfaceChrome';

type ProductSurfaceFrameProps = {
  surface: ProductSurface;
  children: ReactNode;
};

export const ProductSurfaceFrame = ({ surface, children }: ProductSurfaceFrameProps) => {
  const identity = PRODUCT_VISUAL_IDENTITIES[surface];
  const isChallenge = identity.emphasis === 'energetic';
  const surfaceClass = isChallenge
    ? 'bg-[linear-gradient(180deg,rgba(195,112,57,0.18),rgba(245,223,184,0.28)_18%,rgba(248,244,235,0.62)_46%,rgba(248,244,235,0.72))] ring-[rgba(176,96,48,0.2)] shadow-[0_18px_50px_rgba(92,48,22,0.09)]'
    : 'bg-[rgba(248,244,235,0.48)] ring-[rgba(91,67,38,0.08)]';
  const contentClass = isChallenge ? 'relative z-10 pt-12 sm:pt-14' : '';

  return (
    <section
      data-product-surface={surface}
      data-product-tone={identity.tone}
      className={`relative rounded-[2rem] p-2 ring-1 sm:p-3 ${surfaceClass}`}
    >
      {isChallenge ? <ChallengeSurfaceChrome /> : null}
      <div className={contentClass}>{children}</div>
    </section>
  );
};
