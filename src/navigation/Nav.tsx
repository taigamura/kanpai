import React, { createContext, useContext, useState, useCallback } from 'react';
import type { GameId } from '@/data/games';
import { isStudioEnv } from '@/theme/studio';

// Minimal on-device navigator (no react-navigation dependency for v1).
export type Route =
  | { name: 'home' }
  | { name: 'settings' }
  | { name: 'players' }
  | { name: 'roster'; next: GameId }
  | { name: 'game'; id: GameId };

type NavShape = {
  route: Route;
  go: (r: Route) => void;
  home: () => void;
};

const Ctx = createContext<NavShape | null>(null);

// UI Studio only: persist the current route so an Apply→reload lands back on the same screen
// you were tuning. No effect on native / production (isStudioEnv() is false there).
const ROUTE_KEY = 'kanpai:studio-route';

function loadStudioRoute(): Route {
  if (!isStudioEnv()) return { name: 'home' };
  try {
    const raw = (globalThis as unknown as { localStorage?: Storage }).localStorage?.getItem(
      ROUTE_KEY,
    );
    if (raw) return JSON.parse(raw) as Route;
  } catch {
    /* ignore */
  }
  return { name: 'home' };
}

function saveStudioRoute(r: Route): void {
  if (!isStudioEnv()) return;
  try {
    (globalThis as unknown as { localStorage?: Storage }).localStorage?.setItem(
      ROUTE_KEY,
      JSON.stringify(r),
    );
  } catch {
    /* ignore */
  }
}

export function NavProvider({ children }: { children: React.ReactNode }) {
  const [route, setRoute] = useState<Route>(loadStudioRoute);
  const go = useCallback((r: Route) => {
    saveStudioRoute(r);
    setRoute(r);
  }, []);
  const home = useCallback(() => {
    const r: Route = { name: 'home' };
    saveStudioRoute(r);
    setRoute(r);
  }, []);
  return <Ctx.Provider value={{ route, go, home }}>{children}</Ctx.Provider>;
}

export function useNav(): NavShape {
  const v = useContext(Ctx);
  if (!v) throw new Error('useNav must be used within NavProvider');
  return v;
}
