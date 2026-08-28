import AsyncStorage from '@react-native-async-storage/async-storage';

// Thin typed wrapper around AsyncStorage. All persistence is local/on-device.
export const KEYS = {
  ageAccepted: 'kanpai.ageAccepted.v1',
  roster: 'kanpai.roster.v1',
  customPenalties: 'kanpai.customPenalties.v1',
  adsRemoved: 'kanpai.adsRemoved.v1',
  customTopics: 'kanpai.customTopics.v1', // user-added 山手線 お題 (also shared when sync is on)
  installId: 'kanpai.installId.v1', // anonymous per-install id for shared topics + votes
  topicVotes: 'kanpai.topicVotes.v1', // お題 this install has upvoted (dedupes votes)
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
