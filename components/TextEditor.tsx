import React, { useState, useCallback, useEffect, useRef } from 'react';
import { 
  TextInput, 
  StyleSheet, 
  View, 
  Text, 
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useSettings } from '../contexts/SettingsContext';
import { getRandomPlaceholder } from '../constants/placeholders';

interface TextEditorProps {
  bottomPadding?: number;
}

export const TextEditor: React.FC<TextEditorProps> = ({ bottomPadding = 56 }) => {
  const { theme } = useTheme();
  const { settings, currentEntry, updateCurrentEntryContent, notifyTypingStart } = useSettings();
  const [placeholder, setPlaceholder] = useState(getRandomPlaceholder());
  const [localText, setLocalText] = useState(currentEntry?.content || '\n\n');
  const previousTextRef = useRef(localText);
  const inputRef = useRef<TextInput>(null);
  const wasEmptyRef = useRef(true);

  // Sync with current entry when it changes
  useEffect(() => {
    if (currentEntry) {
      setLocalText(currentEntry.content);
      previousTextRef.current = currentEntry.content;
      wasEmptyRef.current = currentEntry.content.trim().length === 0;
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

    // Notify typing start if transitioning from empty to non-empty
    const isNowEmpty = newText.trim().length === 0;
    if (wasEmptyRef.current && !isNowEmpty) {
      notifyTypingStart();
    }
    wasEmptyRef.current = isNowEmpty;

    // Update context immediately - context handles debouncing
    updateCurrentEntryContent(newText);
  }, [settings.backspaceDisabled, updateCurrentEntryContent, notifyTypingStart]);

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
