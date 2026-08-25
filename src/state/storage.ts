import AsyncStorage from '@react-native-async-storage/async-storage';

// Thin typed wrapper around AsyncStorage. All persistence is local/on-device.
export const KEYS = {
  ageAccepted: 'kanpai.ageAccepted.v1',
  roster: 'kanpai.roster.v1',
  customPenalties: 'kanpai.customPenalties.v1',
  adsRemoved: 'kanpai.adsRemoved.v1',
} as const;

export async function loadJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw == null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export async function saveJSON<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // best-effort; on-device convenience state only
  }
}
