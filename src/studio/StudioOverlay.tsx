// UI Studio mount point. Renders nothing in the RN tree; on web + __DEV__ it injects the DOM
// overlay (sliders + arrow/comment layer). On native / production it is a no-op and the DOM
// module is never imported, so it adds nothing to the app bundle.
import { useEffect } from 'react';
import { isStudioEnv } from '@/theme/studio';

export function StudioOverlay() {
  useEffect(() => {
    if (!isStudioEnv()) return;
    let cleanup: (() => void) | undefined;
    // dynamic import keeps the DOM module out of the native bundle
    import('./studioDom')
      .then((m) => {
        cleanup = m.mountStudio();
      })
      .catch(() => {
        /* studio is best-effort */
      });
    return () => cleanup?.();
  }, []);
  return null;
}
