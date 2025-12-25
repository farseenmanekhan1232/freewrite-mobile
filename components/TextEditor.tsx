import React, { useState, useCallback, useEffect, useRef } from 'react';
import { 
  TextInput, 
  StyleSheet, 
  View, 
  Text, 
  NativeSyntheticEvent, 
  TextInputChangeEventData,
  Platform,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useSettings } from '../contexts/SettingsContext';
import { getRandomPlaceholder } from '../constants/placeholders';

interface TextEditorProps {
  bottomPadding?: number;
}

export const TextEditor: React.FC<TextEditorProps> = ({ bottomPadding = 68 }) => {
  const { theme } = useTheme();
  const { settings, currentEntry, updateCurrentEntryContent } = useSettings();
  const [placeholder, setPlaceholder] = useState(getRandomPlaceholder());
  const [localText, setLocalText] = useState(currentEntry?.content || '\n\n');
  const previousTextRef = useRef(localText);
  const inputRef = useRef<TextInput>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync with current entry when it changes
  useEffect(() => {
    if (currentEntry) {
      setLocalText(currentEntry.content);
      previousTextRef.current = currentEntry.content;
      setPlaceholder(getRandomPlaceholder());
    }
  }, [currentEntry?.id]);

  const handleTextChange = useCallback((text: string) => {
    // Ensure text always starts with \n\n
    let newText = text;
    if (!text.startsWith('\n\n')) {
      newText = '\n\n' + text.replace(/^\n+/, '');
    }

    // Handle backspace disable
    if (settings.backspaceDisabled && newText.length < previousTextRef.current.length) {
      // Text was deleted, restore previous text
      setLocalText(previousTextRef.current);
      return;
    }

    previousTextRef.current = newText;
    setLocalText(newText);

    // Debounce save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      updateCurrentEntryContent(newText);
    }, 500);
  }, [settings.backspaceDisabled, updateCurrentEntryContent]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        // Save immediately on unmount
        if (localText !== currentEntry?.content) {
          updateCurrentEntryContent(localText);
        }
      }
    };
  }, [localText, currentEntry?.content, updateCurrentEntryContent]);

  const isEmpty = localText.trim().length === 0;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.editorWrapper}>
        <TextInput
          ref={inputRef}
          style={[
            styles.textInput,
            {
              fontFamily: settings.fontFamily,
              fontSize: settings.fontSize,
              color: theme.text,
              lineHeight: settings.fontSize * 1.5,
              paddingBottom: bottomPadding,
            },
          ]}
          value={localText}
          onChangeText={handleTextChange}
          multiline
          textAlignVertical="top"
          scrollEnabled
          autoCapitalize="none"
          autoCorrect={false}
          spellCheck={false}
          placeholder=""
          placeholderTextColor={theme.placeholder}
        />
        
        {isEmpty && (
          <Text
            style={[
              styles.placeholder,
              {
                fontFamily: settings.fontFamily,
                fontSize: settings.fontSize,
                color: theme.placeholder,
                lineHeight: settings.fontSize * 1.5,
              },
            ]}
            pointerEvents="none"
          >
            {placeholder}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    maxWidth: 650,
    alignSelf: 'center',
  },
  editorWrapper: {
    flex: 1,
    position: 'relative',
  },
  textInput: {
    flex: 1,
    padding: 16,
    textAlignVertical: 'top',
  },
  placeholder: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
  },
});
