import React, { createContext, useContext, useState, useCallback } from 'react';
import type { GameId } from '@/data/games';

// Minimal on-device navigator (no react-navigation dependency for v1).
export type Route =
  | { name: 'home' }
  | { name: 'settings' }
  | { name: 'roster'; next: GameId }
  | { name: 'game'; id: GameId };

type NavShape = {
  route: Route;
  go: (r: Route) => void;
  home: () => void;
};

const Ctx = createContext<NavShape | null>(null);

export function NavProvider({ children }: { children: React.ReactNode }) {
  const [route, setRoute] = useState<Route>({ name: 'home' });
  const go = useCallback((r: Route) => setRoute(r), []);
  const home = useCallback(() => setRoute({ name: 'home' }), []);
  return <Ctx.Provider value={{ route, go, home }}>{children}</Ctx.Provider>;
}

export function useNav(): NavShape {
  const v = useContext(Ctx);
  if (!v) throw new Error('useNav must be used within NavProvider');
  return v;
}
