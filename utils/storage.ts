import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

export interface Entry {
  id: string;
  date: string; // Display date "MMM d"
  filename: string;
  previewText: string;
  content: string;
  createdAt: number; // timestamp for sorting
}

export interface Settings {
  fontSize: number;
  fontFamily: string | undefined;
  colorScheme: 'light' | 'dark';
  backspaceDisabled: boolean;
}

const STORAGE_KEYS = {
  ENTRIES: '@freewrite/entries',
  SETTINGS: '@freewrite/settings',
  CURRENT_ENTRY_ID: '@freewrite/currentEntryId',
};

export const defaultSettings: Settings = {
  fontSize: 18,
  fontFamily: 'Lato-Regular',
  colorScheme: 'light',
  backspaceDisabled: false,
};

// Entries
export const getEntries = async (): Promise<Entry[]> => {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEYS.ENTRIES);
    return json ? JSON.parse(json) : [];
  } catch (error) {
    console.error('Error loading entries:', error);
    return [];
  }
};

export const saveEntries = async (entries: Entry[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(entries));
  } catch (error) {
    console.error('Error saving entries:', error);
  }
};

export const saveEntry = async (entry: Entry): Promise<void> => {
  const entries = await getEntries();
  const index = entries.findIndex(e => e.id === entry.id);
  if (index >= 0) {
    entries[index] = entry;
  } else {
    entries.unshift(entry);
  }
  await saveEntries(entries);
};

export const deleteEntry = async (entryId: string): Promise<void> => {
  const entries = await getEntries();
  const filtered = entries.filter(e => e.id !== entryId);
  await saveEntries(filtered);
};

// Settings
export const getSettings = async (): Promise<Settings> => {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
    return json ? { ...defaultSettings, ...JSON.parse(json) } : defaultSettings;
  } catch (error) {
    console.error('Error loading settings:', error);
    return defaultSettings;
  }
};

export const saveSettings = async (settings: Settings): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
};

// Current entry ID
export const getCurrentEntryId = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_ENTRY_ID);
  } catch (error) {
    console.error('Error loading current entry ID:', error);
    return null;
  }
};

export const setCurrentEntryId = async (id: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_ENTRY_ID, id);
  } catch (error) {
    console.error('Error saving current entry ID:', error);
  }
};

// Helper to format date like "MMM d"
export const formatDisplayDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Helper to generate preview text
export const generatePreviewText = (content: string): string => {
  const preview = content
    .replace(/\n/g, ' ')
    .trim();
  return preview.length > 30 ? preview.substring(0, 30) + '...' : preview;
};

// Helper to create a new entry
export const createNewEntry = (): Entry => {
  const now = new Date();
  const id = Crypto.randomUUID();
  
  return {
    id,
    date: formatDisplayDate(now),
    filename: `[${id}]-[${now.toISOString().replace(/[:.]/g, '-')}].md`,
    previewText: '',
    content: '\n\n',
    createdAt: now.getTime(),
  };
};
