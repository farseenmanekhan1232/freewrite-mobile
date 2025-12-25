import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { 
  getSettings, 
  saveSettings, 
  Settings, 
  defaultSettings,
  Entry,
  getEntries,
  saveEntry as saveEntryToStorage,
  deleteEntry as deleteEntryFromStorage,
  createNewEntry as createNewEntryUtil,
  generatePreviewText,
  getCurrentEntryId,
  setCurrentEntryId,
} from '../utils/storage';
import { welcomeText } from '../utils/prompts';

interface SettingsContextType {
  settings: Settings;
  updateSettings: (partial: Partial<Settings>) => Promise<void>;
  entries: Entry[];
  currentEntry: Entry | null;
  selectEntry: (entry: Entry) => Promise<void>;
  createNewEntry: () => Promise<void>;
  updateCurrentEntryContent: (content: string) => Promise<void>;
  deleteEntry: (entryId: string) => Promise<void>;
  isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [currentEntry, setCurrentEntry] = useState<Entry | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings and entries on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [loadedSettings, loadedEntries, savedEntryId] = await Promise.all([
          getSettings(),
          getEntries(),
          getCurrentEntryId(),
        ]);

        setSettings(loadedSettings);

        if (loadedEntries.length === 0) {
          // First time user - create welcome entry
          const welcomeEntry = createNewEntryUtil();
          welcomeEntry.content = '\n\n' + welcomeText;
          welcomeEntry.previewText = generatePreviewText(welcomeEntry.content);
          await saveEntryToStorage(welcomeEntry);
          setEntries([welcomeEntry]);
          setCurrentEntry(welcomeEntry);
          await setCurrentEntryId(welcomeEntry.id);
        } else {
          // Sort by createdAt descending
          const sorted = loadedEntries.sort((a, b) => b.createdAt - a.createdAt);
          setEntries(sorted);
          
          // Restore current entry or select first
          const entryToSelect = savedEntryId 
            ? sorted.find(e => e.id === savedEntryId) || sorted[0]
            : sorted[0];
          setCurrentEntry(entryToSelect);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const updateSettings = async (partial: Partial<Settings>) => {
    const newSettings = { ...settings, ...partial };
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  const selectEntry = async (entry: Entry) => {
    // Save current entry first
    if (currentEntry && currentEntry.id !== entry.id) {
      const updatedEntry = { ...currentEntry, previewText: generatePreviewText(currentEntry.content) };
      await saveEntryToStorage(updatedEntry);
      setEntries(prev => prev.map(e => e.id === updatedEntry.id ? updatedEntry : e));
    }
    
    setCurrentEntry(entry);
    await setCurrentEntryId(entry.id);
  };

  const createNewEntry = async () => {
    // Save current entry first
    if (currentEntry) {
      const updatedEntry = { ...currentEntry, previewText: generatePreviewText(currentEntry.content) };
      await saveEntryToStorage(updatedEntry);
      setEntries(prev => prev.map(e => e.id === updatedEntry.id ? updatedEntry : e));
    }

    const newEntry = createNewEntryUtil();
    await saveEntryToStorage(newEntry);
    setEntries(prev => [newEntry, ...prev]);
    setCurrentEntry(newEntry);
    await setCurrentEntryId(newEntry.id);
  };

  const updateCurrentEntryContent = useCallback(async (content: string) => {
    if (!currentEntry) return;
    
    const updatedEntry = { 
      ...currentEntry, 
      content,
      previewText: generatePreviewText(content),
    };
    setCurrentEntry(updatedEntry);
    setEntries(prev => prev.map(e => e.id === updatedEntry.id ? updatedEntry : e));
    
    // Debounce save
    await saveEntryToStorage(updatedEntry);
  }, [currentEntry]);

  const deleteEntry = async (entryId: string) => {
    await deleteEntryFromStorage(entryId);
    const newEntries = entries.filter(e => e.id !== entryId);
    setEntries(newEntries);

    // If deleted current entry, select another
    if (currentEntry?.id === entryId) {
      if (newEntries.length > 0) {
        setCurrentEntry(newEntries[0]);
        await setCurrentEntryId(newEntries[0].id);
      } else {
        // Create new entry if none left
        const newEntry = createNewEntryUtil();
        await saveEntryToStorage(newEntry);
        setEntries([newEntry]);
        setCurrentEntry(newEntry);
        await setCurrentEntryId(newEntry.id);
      }
    }
  };

  return (
    <SettingsContext.Provider value={{
      settings,
      updateSettings,
      entries,
      currentEntry,
      selectEntry,
      createNewEntry,
      updateCurrentEntryContent,
      deleteEntry,
      isLoading,
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
