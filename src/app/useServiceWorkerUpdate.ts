import { useEffect, useState } from 'react';

export function useServiceWorkerUpdate(): {
  updateAvailable: boolean;
  applyUpdate: () => void;
  supported: boolean;
} {
  const supported = typeof navigator !== 'undefined' && 'serviceWorker' in navigator;
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (!supported || import.meta.env.DEV) return;
    let cancelled = false;

    navigator.serviceWorker.ready
      .then((registration) => {
        if (cancelled) return;
        if (registration.waiting) setWaiting(registration.waiting);
        registration.addEventListener('updatefound', () => {
          const installing = registration.installing;
          if (!installing) return;
          installing.addEventListener('statechange', () => {
            if (installing.state === 'installed' && navigator.serviceWorker.controller) {
              setWaiting(registration.waiting ?? installing);
            }
          });
        });
      })
      .catch(() => undefined);

    const onControllerChange = () => window.location.reload();
    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);
    return () => {
      cancelled = true;
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
    };
  }, [supported]);

  return {
    supported,
    updateAvailable: waiting !== null,
    applyUpdate: () => {
      waiting?.postMessage({ type: 'SKIP_WAITING' });
      setWaiting(null);
    },
  };
}
