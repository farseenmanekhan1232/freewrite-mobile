import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as Crypto from 'expo-crypto';

export interface Entry {
  id: string;
  date: string; // Display date "MMM d"
  filename: string;
  previewText: string;
  content: string;
  createdAt: number; // timestamp for sorting
  lastModified: number; // timestamp for last modification
}

export interface Settings {
  fontSize: number;
  fontFamily: string | undefined;
  colorScheme: 'light' | 'dark';
  backspaceDisabled: boolean;
}

const STORAGE_KEYS = {
  ENTRIES_INDEX: '@freewrite/entries_index', // Metadata only
  SETTINGS: '@freewrite/settings',
  CURRENT_ENTRY_ID: '@freewrite/currentEntryId',
  MIGRATED: '@freewrite/migrated_v2', // Migration flag
};

// Freewrite folder path (matches macOS app structure)
const FREEWRITE_FOLDER = 'Freewrite';

export const defaultSettings: Settings = {
  fontSize: 18,
  fontFamily: 'Lato-Regular',
  colorScheme: 'light',
  backspaceDisabled: false,
};

// ============ Directory Helpers ============

export const getEntriesDirectory = (): string => {
  return `${FileSystem.documentDirectory}${FREEWRITE_FOLDER}/`;
};

export const ensureEntriesDirectory = async (): Promise<void> => {
  const dirPath = getEntriesDirectory();
  const dirInfo = await FileSystem.getInfoAsync(dirPath);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(dirPath, { intermediates: true });
    console.log('Created Freewrite directory:', dirPath);
  }
};

export const openEntriesFolder = async (): Promise<void> => {
  const dirPath = getEntriesDirectory();
  const isAvailable = await Sharing.isAvailableAsync();
  if (isAvailable) {
    // On iOS/Android, we share the folder path
    // Note: expo-sharing works best with files, so we'll share info about the folder
    await Sharing.shareAsync(dirPath, {
      dialogTitle: 'Freewrite Entries Folder',
    }).catch(() => {
      // Sharing folder might fail on some platforms, that's ok
      console.log('Folder sharing not supported, showing path only');
    });
  }
};

// ============ File Operations ============

const getEntryFilePath = (filename: string): string => {
  return `${getEntriesDirectory()}${filename}`;
};

export const saveEntryToFile = async (entry: Entry): Promise<void> => {
  try {
    await ensureEntriesDirectory();
    const filePath = getEntryFilePath(entry.filename);
    await FileSystem.writeAsStringAsync(filePath, entry.content, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    console.log('Saved entry to file:', entry.filename);
  } catch (error) {
    console.error('Error saving entry to file:', error);
    throw error;
  }
};

export const loadEntryContent = async (filename: string): Promise<string> => {
  try {
    const filePath = getEntryFilePath(filename);
    const fileInfo = await FileSystem.getInfoAsync(filePath);
    if (fileInfo.exists) {
      return await FileSystem.readAsStringAsync(filePath, {
        encoding: FileSystem.EncodingType.UTF8,
      });
    }
    return '';
  } catch (error) {
    console.error('Error loading entry content:', error);
    return '';
  }
};

export const deleteEntryFile = async (filename: string): Promise<void> => {
  try {
    const filePath = getEntryFilePath(filename);
    const fileInfo = await FileSystem.getInfoAsync(filePath);
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(filePath);
      console.log('Deleted entry file:', filename);
    }
  } catch (error) {
    console.error('Error deleting entry file:', error);
  }
};

// ============ Index Operations (Metadata in AsyncStorage) ============

interface EntryIndex {
  id: string;
  date: string;
  filename: string;
  previewText: string;
  createdAt: number;
  lastModified: number;
}

export const getEntriesIndex = async (): Promise<EntryIndex[]> => {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEYS.ENTRIES_INDEX);
    return json ? JSON.parse(json) : [];
  } catch (error) {
    console.error('Error loading entries index:', error);
    return [];
  }
};

export const saveEntriesIndex = async (entries: EntryIndex[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.ENTRIES_INDEX, JSON.stringify(entries));
  } catch (error) {
    console.error('Error saving entries index:', error);
  }
};

// ============ Combined Entry Operations ============

export const getEntries = async (): Promise<Entry[]> => {
  const index = await getEntriesIndex();
  // Return entries without content (lazy load)
  return index.map(e => ({
    ...e,
    content: '', // Content loaded on demand
  }));
};

export const loadFullEntry = async (entry: Entry): Promise<Entry> => {
  const content = await loadEntryContent(entry.filename);
  return { ...entry, content };
};

export const saveEntry = async (entry: Entry): Promise<void> => {
  const now = Date.now();
  const updatedEntry = { ...entry, lastModified: now };
  
  // Save content to file
  await saveEntryToFile(updatedEntry);
  
  // Update index
  const index = await getEntriesIndex();
  const entryIndex: EntryIndex = {
    id: updatedEntry.id,
    date: updatedEntry.date,
    filename: updatedEntry.filename,
    previewText: updatedEntry.previewText,
    createdAt: updatedEntry.createdAt,
    lastModified: updatedEntry.lastModified,
  };
  
  const existingIdx = index.findIndex(e => e.id === entry.id);
  if (existingIdx >= 0) {
    index[existingIdx] = entryIndex;
  } else {
    index.unshift(entryIndex);
  }
  await saveEntriesIndex(index);
};

export const deleteEntry = async (entryId: string): Promise<void> => {
  const index = await getEntriesIndex();
  const entry = index.find(e => e.id === entryId);
  
  if (entry) {
    // Delete file
    await deleteEntryFile(entry.filename);
    
    // Update index
    const filtered = index.filter(e => e.id !== entryId);
    await saveEntriesIndex(filtered);
  }
};

// ============ Migration ============

export const migrateFromAsyncStorage = async (): Promise<boolean> => {
  try {
    // Check if already migrated
    const migrated = await AsyncStorage.getItem(STORAGE_KEYS.MIGRATED);
    if (migrated === 'true') {
      return false;
    }

    // Check for old entries
    const oldEntriesJson = await AsyncStorage.getItem('@freewrite/entries');
    if (!oldEntriesJson) {
      await AsyncStorage.setItem(STORAGE_KEYS.MIGRATED, 'true');
      return false;
    }

    const oldEntries = JSON.parse(oldEntriesJson) as Entry[];
    if (oldEntries.length === 0) {
      await AsyncStorage.setItem(STORAGE_KEYS.MIGRATED, 'true');
      return false;
    }

    console.log(`Migrating ${oldEntries.length} entries to file system...`);
    await ensureEntriesDirectory();

    // Migrate each entry
    for (const entry of oldEntries) {
      const migratedEntry: Entry = {
        ...entry,
        lastModified: entry.createdAt, // Use createdAt as initial lastModified
      };
      await saveEntry(migratedEntry);
    }

    // Mark as migrated
    await AsyncStorage.setItem(STORAGE_KEYS.MIGRATED, 'true');
    
    // Optionally remove old entries (keep for safety)
    // await AsyncStorage.removeItem('@freewrite/entries');
    
    console.log('Migration complete!');
    return true;
  } catch (error) {
    console.error('Migration error:', error);
    return false;
  }
};

// ============ Settings ============

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

// ============ Current Entry ID ============

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

// ============ Helpers ============

export const formatDisplayDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatFilenameDate = (date: Date): string => {
  // Format: yyyy-MM-dd-HH-mm-ss (matches macOS Swift app)
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}-${pad(date.getHours())}-${pad(date.getMinutes())}-${pad(date.getSeconds())}`;
};

export const generatePreviewText = (content: string): string => {
  const preview = content
    .replace(/\n/g, ' ')
    .trim();
  return preview.length > 30 ? preview.substring(0, 30) + '...' : preview;
};

export const createNewEntry = (): Entry => {
  const now = new Date();
  const id = Crypto.randomUUID();
  
  return {
    id,
    date: formatDisplayDate(now),
    filename: `[${id}]-[${formatFilenameDate(now)}].md`,
    previewText: '',
    content: '',
    createdAt: now.getTime(),
    lastModified: now.getTime(),
  };
};
