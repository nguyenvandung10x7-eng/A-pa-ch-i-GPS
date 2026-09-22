import { useEffect, useRef, useState } from 'react';
import { mountPhaser } from './mountPhaser';
import type { FoundationHandle, FoundationStatus, MountOptions } from './contracts';
import './phaser-host.css';

interface PhaserHostProps {
  options?: Omit<MountOptions, 'onStatus'>;
  onHandle?: (handle: FoundationHandle | null) => void;
  onStatus?: (status: FoundationStatus) => void;
}

export function PhaserHost({ options, onHandle, onStatus }: PhaserHostProps) {
  const parent = useRef<HTMLDivElement>(null);
  const callbacks = useRef({ onHandle, onStatus });
  callbacks.current = { onHandle, onStatus };
  const [status, setStatus] = useState<FoundationStatus | null>(null);

  useEffect(() => {
    if (!parent.current) return;
    const handle = mountPhaser(parent.current, {
      ...options,
      onStatus: (next) => {
        setStatus(next);
        callbacks.current.onStatus?.(next);
      },
    });
    callbacks.current.onHandle?.(handle);
    return () => {
      callbacks.current.onHandle?.(null);
      void handle.dispose();
    };
    // Options describe one mount. The dev harness changes its key to remount.
    // Callback identity and ordinary React renders do not recreate the engine.
  }, []);

  return (
    <section className="pl-v2-host" data-testid="phaser-host" aria-label="Phiêng Lơi">
      <div className="pl-v2-canvas-parent" ref={parent} data-testid="canvas-parent" />
      {status?.state === 'error' && <p className="pl-v2-message" role="alert">{status.message}</p>}
      {!status && <p className="pl-v2-message" role="status">Đang khởi tạo…</p>}
    </section>
  );
}
