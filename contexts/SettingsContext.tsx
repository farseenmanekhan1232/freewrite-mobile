import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
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
  loadFullEntry,
  getEntriesDirectory,
  migrateFromAsyncStorage,
} from '../utils/storage';
import { welcomeText } from '../utils/prompts';

interface SettingsContextType {
  settings: Settings;
  updateSettings: (partial: Partial<Settings>) => Promise<void>;
  entries: Entry[];
  currentEntry: Entry | null;
  selectEntry: (entry: Entry) => Promise<void>;
  createNewEntry: () => Promise<void>;
  updateCurrentEntryContent: (content: string) => void;
  deleteEntry: (entryId: string) => Promise<void>;
  isLoading: boolean;
  entriesPath: string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [currentEntry, setCurrentEntry] = useState<Entry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Refs for preventing stale closures and race conditions
  const currentEntryRef = useRef<Entry | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingSaveRef = useRef<{ entryId: string; content: string } | null>(null);

  // Keep ref in sync with state
  useEffect(() => {
    currentEntryRef.current = currentEntry;
  }, [currentEntry]);

  // Flush any pending save immediately
  const flushPendingSave = useCallback(async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    
    if (pendingSaveRef.current) {
      const { entryId, content } = pendingSaveRef.current;
      pendingSaveRef.current = null;
      
      // Find the entry to save
      const entryToSave = entries.find(e => e.id === entryId);
      if (entryToSave && content.trim().length > 0) {
        const updatedEntry = { 
          ...entryToSave, 
          content,
          previewText: generatePreviewText(content),
        };
        await saveEntryToStorage(updatedEntry);
        setEntries(prev => prev.map(e => e.id === updatedEntry.id ? updatedEntry : e));
      }
    }
  }, [entries]);

  // Load settings and entries on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Run migration first
        await migrateFromAsyncStorage();
        
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
          
          // Load full content for the selected entry
          const fullEntry = await loadFullEntry(entryToSelect);
          setCurrentEntry(fullEntry);
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
    // Flush pending save for current entry first
    await flushPendingSave();
    
    // Load full content for the new entry
    const fullEntry = await loadFullEntry(entry);
    setCurrentEntry(fullEntry);
    await setCurrentEntryId(entry.id);
  };

  const createNewEntry = async () => {
    // Flush pending save first
    await flushPendingSave();

    const newEntry = createNewEntryUtil();
    
    // Only save if there's content (avoid empty entry pollution)
    // For now, create with minimal content but don't persist until user types
    setEntries(prev => [newEntry, ...prev]);
    setCurrentEntry(newEntry);
    await setCurrentEntryId(newEntry.id);
    
    // Save skeleton entry to storage
    await saveEntryToStorage(newEntry);
  };

  const updateCurrentEntryContent = useCallback((content: string) => {
    const entry = currentEntryRef.current;
    if (!entry) return;
    
    // Update state immediately for responsive UI
    const updatedEntry = { 
      ...entry, 
      content,
      previewText: generatePreviewText(content),
    };
    setCurrentEntry(updatedEntry);
    setEntries(prev => prev.map(e => e.id === updatedEntry.id ? updatedEntry : e));
    
    // Store pending save info
    pendingSaveRef.current = { entryId: entry.id, content };
    
    // Debounce actual save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(async () => {
      if (pendingSaveRef.current && pendingSaveRef.current.entryId === entry.id) {
        const { content: saveContent } = pendingSaveRef.current;
        pendingSaveRef.current = null;
        
        // Only save if there's actual content
        if (saveContent.trim().length > 0) {
          const entryToSave = { 
            ...entry, 
            content: saveContent,
            previewText: generatePreviewText(saveContent),
          };
          await saveEntryToStorage(entryToSave);
        }
      }
    }, 500);
  }, []);

  const deleteEntryHandler = async (entryId: string) => {
    // Clear any pending save for this entry
    if (pendingSaveRef.current?.entryId === entryId) {
      pendingSaveRef.current = null;
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
    }
    
    await deleteEntryFromStorage(entryId);
    const newEntries = entries.filter(e => e.id !== entryId);
    setEntries(newEntries);

    // If deleted current entry, select another
    if (currentEntry?.id === entryId) {
      if (newEntries.length > 0) {
        const fullEntry = await loadFullEntry(newEntries[0]);
        setCurrentEntry(fullEntry);
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
      deleteEntry: deleteEntryHandler,
      isLoading,
      entriesPath: getEntriesDirectory(),
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

