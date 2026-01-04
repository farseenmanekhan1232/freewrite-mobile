import React, { useState, useCallback, useEffect, useRef } from 'react';
import { 
  TextInput, 
  StyleSheet, 
  View, 
  Text,
  NativeSyntheticEvent,
  TextInputSelectionChangeEventData,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useTheme } from '../contexts/ThemeContext';
import { useSettings } from '../contexts/SettingsContext';
import { getRandomPlaceholder } from '../constants/placeholders';

// Height of BottomNav
const BOTTOM_NAV_HEIGHT = 56;

export const TextEditor: React.FC = () => {
  const { theme } = useTheme();
  const { settings, currentEntry, updateCurrentEntryContent, notifyTypingStart } = useSettings();
  const [placeholder, setPlaceholder] = useState(getRandomPlaceholder());
  const [localText, setLocalText] = useState(currentEntry?.content || '');
  const previousTextRef = useRef(localText);
  const inputRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<any>(null);
  const wasEmptyRef = useRef(true);

  // Calculate line height for cursor positioning
  const lineHeight = settings.fontSize * 1.5;

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
    // Handle backspace disable
    if (settings.backspaceDisabled && text.length < previousTextRef.current.length) {
      // Text was deleted, restore previous text
      setLocalText(previousTextRef.current);
      return;
    }

    previousTextRef.current = text;
    setLocalText(text);

    // Notify typing start if transitioning from empty to non-empty
    const isNowEmpty = text.trim().length === 0;
    if (wasEmptyRef.current && !isNowEmpty) {
      notifyTypingStart();
    }
    wasEmptyRef.current = isNowEmpty;

    // Update context with debounced save - don't trigger on every keystroke
    updateCurrentEntryContent(text);
  }, [settings.backspaceDisabled, updateCurrentEntryContent, notifyTypingStart]);

  // Handle selection change to scroll to cursor
  const handleSelectionChange = useCallback((
    event: NativeSyntheticEvent<TextInputSelectionChangeEventData>
  ) => {
    const { selection } = event.nativeEvent;
    const cursorPosition = selection.end;
    
    // Count lines before cursor to estimate Y position
    const textBeforeCursor = localText.substring(0, cursorPosition);
    const linesBeforeCursor = textBeforeCursor.split('\n').length;
    
    // Calculate approximate Y position (16 is paddingTop)
    const cursorY = 16 + (linesBeforeCursor * lineHeight);
    
    // Scroll to make cursor visible with some padding
    scrollViewRef.current?.scrollTo({
      y: Math.max(0, cursorY - 100),
      animated: true,
    });
  }, [localText, lineHeight]);

  const isEmpty = localText.trim().length === 0;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAwareScrollView 
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        bottomOffset={BOTTOM_NAV_HEIGHT}
      >
        <View style={styles.editorWrapper}>
          <TextInput
            ref={inputRef}
            style={[
              styles.textInput,
              {
                fontFamily: settings.fontFamily,
                fontSize: settings.fontSize,
                color: theme.text,
                lineHeight: lineHeight,
              },
            ]}
            value={localText}
            onChangeText={handleTextChange}
            onSelectionChange={handleSelectionChange}
            multiline
            textAlignVertical="top"
            scrollEnabled={false}
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
                  lineHeight: lineHeight,
                },
              ]}
              pointerEvents="none"
            >
              {placeholder}
            </Text>
          )}
        </View>
      </KeyboardAwareScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  editorWrapper: {
    flex: 1,
    position: 'relative',
    minHeight: '100%',
  },
  textInput: {
    flex: 1,
    paddingTop: 16,
    paddingHorizontal: 16,
    textAlignVertical: 'top',
  },
  placeholder: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
  },
});
