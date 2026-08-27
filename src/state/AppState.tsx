import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { KEYS, loadJSON, saveJSON } from './storage';
import { DEFAULT_PENALTIES } from '@/data/penalties';

// Single app-wide store: age gate, shared player roster, custom 罰ゲーム, ads entitlement.
// Deliberately tiny — everything is on-device convenience state.

type AppStateShape = {
  ready: boolean;
  ageAccepted: boolean;
  acceptAge: () => void;

  roster: string[];
  setRoster: (names: string[]) => void;

  penalties: string[]; // user-added only (no built-in defaults in v1), deduped
  customPenalties: string[];
  addCustomPenalty: (text: string) => void;
  removeCustomPenalty: (text: string) => void;

  adsRemoved: boolean;
  setAdsRemoved: (v: boolean) => void;
};

const Ctx = createContext<AppStateShape | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [ageAccepted, setAgeAccepted] = useState(false);
  const [roster, setRosterState] = useState<string[]>([]);
  const [customPenalties, setCustomPenalties] = useState<string[]>([]);
  const [adsRemoved, setAdsRemovedState] = useState(false);

  useEffect(() => {
    (async () => {
      const [age, r, cp, ads] = await Promise.all([
        loadJSON<boolean>(KEYS.ageAccepted, false),
        loadJSON<string[]>(KEYS.roster, []),
        loadJSON<string[]>(KEYS.customPenalties, []),
        loadJSON<boolean>(KEYS.adsRemoved, false),
      ]);
      setAgeAccepted(age);
      setRosterState(r);
      setCustomPenalties(cp);
      setAdsRemovedState(ads);
      setReady(true);
    })();
  }, []);

  const acceptAge = useCallback(() => {
    setAgeAccepted(true);
    void saveJSON(KEYS.ageAccepted, true);
  }, []);

  const setRoster = useCallback((names: string[]) => {
    setRosterState(names);
    void saveJSON(KEYS.roster, names);
  }, []);

  const addCustomPenalty = useCallback((text: string) => {
    const t = text.trim();
    if (!t) return;
    setCustomPenalties((prev) => {
      if (prev.includes(t)) return prev;
      const next = [...prev, t];
      void saveJSON(KEYS.customPenalties, next);
      return next;
    });
  }, []);

  const removeCustomPenalty = useCallback((text: string) => {
    setCustomPenalties((prev) => {
      const next = prev.filter((p) => p !== text);
      void saveJSON(KEYS.customPenalties, next);
      return next;
    });
  }, []);

  const setAdsRemoved = useCallback((v: boolean) => {
    setAdsRemovedState(v);
    void saveJSON(KEYS.adsRemoved, v);
  }, []);

  const penalties = Array.from(new Set([...DEFAULT_PENALTIES, ...customPenalties]));

  return (
    <Ctx.Provider
      value={{
        ready,
        ageAccepted,
        acceptAge,
        roster,
        setRoster,
        penalties,
        customPenalties,
        addCustomPenalty,
        removeCustomPenalty,
        adsRemoved,
        setAdsRemoved,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAppState(): AppStateShape {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAppState must be used within AppStateProvider');
  return v;
}
