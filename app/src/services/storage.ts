import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  MODE: 'vr.mode',
  TRAINER_ID: 'vr.trainer_id',
  SELECTED_MEMBER_ID: 'vr.selected_member_id',
} as const;

export async function getMode(): Promise<'general' | 'trainer'> {
  const v = await AsyncStorage.getItem(KEYS.MODE);
  return v === 'trainer' ? 'trainer' : 'general';
}

export async function setMode(mode: 'general' | 'trainer'): Promise<void> {
  await AsyncStorage.setItem(KEYS.MODE, mode);
}

export async function getTrainerId(): Promise<string | null> {
  return AsyncStorage.getItem(KEYS.TRAINER_ID);
}

export async function setTrainerId(id: string): Promise<void> {
  await AsyncStorage.setItem(KEYS.TRAINER_ID, id);
}

export async function getSelectedMemberId(): Promise<string | null> {
  return AsyncStorage.getItem(KEYS.SELECTED_MEMBER_ID);
}

export async function setSelectedMemberId(id: string | null): Promise<void> {
  if (id === null) {
    await AsyncStorage.removeItem(KEYS.SELECTED_MEMBER_ID);
  } else {
    await AsyncStorage.setItem(KEYS.SELECTED_MEMBER_ID, id);
  }
}
