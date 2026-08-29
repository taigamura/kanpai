import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { KEYS, loadJSON, saveJSON } from './storage';
import { DEFAULT_PENALTIES } from '@/data/penalties';
import { submitTopic } from '@/services/topics';

// Single app-wide store: age gate, shared player roster, custom 罰ゲーム, ads entitlement.
// Deliberately tiny — everything is on-device convenience state.

// A durable named player and how many times they've lost. Opt-in: when the group registers
// players, the lose screen switches from an anonymous「負けた人！」to a tap-to-record tally,
// and 匿名アンケート seeds its roster from these names.
export type Player = { name: string; losses: number };

type AppStateShape = {
  ready: boolean;
  ageAccepted: boolean;
  acceptAge: () => void;

  roster: string[];
  setRoster: (names: string[]) => void;

  players: Player[];
  addPlayer: (name: string) => void;
  removePlayer: (name: string) => void;
  adjustLoss: (name: string, delta: number) => void; // +1 on select, -1 on deselect; clamped at 0
  resetLosses: () => void;

  penalties: string[]; // user-added only (no built-in defaults in v1), deduped
  customPenalties: string[];
  addCustomPenalty: (text: string) => void;
  removeCustomPenalty: (text: string) => void;

  customTopics: string[]; // user-added 山手線 お題 (also shared when sync is on)
  addCustomTopic: (text: string) => void;
  removeCustomTopic: (text: string) => void;

  adsRemoved: boolean;
  setAdsRemoved: (v: boolean) => void;
};

const Ctx = createContext<AppStateShape | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [ageAccepted, setAgeAccepted] = useState(false);
  const [roster, setRosterState] = useState<string[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [customPenalties, setCustomPenalties] = useState<string[]>([]);
  const [customTopics, setCustomTopics] = useState<string[]>([]);
  const [adsRemoved, setAdsRemovedState] = useState(false);

  useEffect(() => {
    (async () => {
      const [age, r, pl, cp, ct, ads] = await Promise.all([
        loadJSON<boolean>(KEYS.ageAccepted, false),
        loadJSON<string[]>(KEYS.roster, []),
        loadJSON<Player[]>(KEYS.players, []),
        loadJSON<string[]>(KEYS.customPenalties, []),
        loadJSON<string[]>(KEYS.customTopics, []),
        loadJSON<boolean>(KEYS.adsRemoved, false),
      ]);
      setAgeAccepted(age);
      setRosterState(r);
      setPlayers(pl);
      setCustomPenalties(cp);
      setCustomTopics(ct);
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

  const addPlayer = useCallback((name: string) => {
    const t = name.trim();
    if (!t) return;
    setPlayers((prev) => {
      if (prev.some((p) => p.name === t)) return prev;
      const next = [...prev, { name: t, losses: 0 }];
      void saveJSON(KEYS.players, next);
      return next;
    });
  }, []);

  const removePlayer = useCallback((name: string) => {
    setPlayers((prev) => {
      const next = prev.filter((p) => p.name !== name);
      void saveJSON(KEYS.players, next);
      return next;
    });
  }, []);

  const adjustLoss = useCallback((name: string, delta: number) => {
    setPlayers((prev) => {
      const next = prev.map((p) =>
        p.name === name ? { ...p, losses: Math.max(0, p.losses + delta) } : p,
      );
      void saveJSON(KEYS.players, next);
      return next;
    });
  }, []);

  const resetLosses = useCallback(() => {
    setPlayers((prev) => {
      const next = prev.map((p) => ({ ...p, losses: 0 }));
      void saveJSON(KEYS.players, next);
      return next;
    });
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

  const addCustomTopic = useCallback((text: string) => {
    const t = text.trim();
    if (!t) return;
    setCustomTopics((prev) => {
      if (prev.includes(t)) return prev;
      const next = [...prev, t];
      void saveJSON(KEYS.customTopics, next);
      return next;
    });
    // Share it too (no-op unless a backend is configured). Best-effort, never blocks the UI.
    void submitTopic(t);
  }, []);

  const removeCustomTopic = useCallback((text: string) => {
    setCustomTopics((prev) => {
      const next = prev.filter((p) => p !== text);
      void saveJSON(KEYS.customTopics, next);
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
        players,
        addPlayer,
        removePlayer,
        adjustLoss,
        resetLosses,
        penalties,
        customPenalties,
        addCustomPenalty,
        removeCustomPenalty,
        customTopics,
        addCustomTopic,
        removeCustomTopic,
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
