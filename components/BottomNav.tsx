import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  Platform,
} from 'react-native';
import { 
  MessageSquare, 
  Delete, 
  Plus, 
  Sun, 
  Moon, 
  History,
  ChevronUp,
  ChevronDown,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import { useTheme } from '../contexts/ThemeContext';
import { useSettings } from '../contexts/SettingsContext';
import { FontSelector } from './FontSelector';
import { Timer } from './Timer';
import { ChatMenu } from './ChatMenu';
import { EntrySidebar } from './EntrySidebar';

export const BottomNav: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { theme, colorScheme, toggleColorScheme } = useTheme();
  const { settings, updateSettings, createNewEntry, registerOnTypingStart } = useSettings();
  
  const [showChatMenu, setShowChatMenu] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [timerRunning, setTimerRunning] = useState(false);
  const [expanded, setExpanded] = useState(false);
  
  // Ref to start timer from TextEditor typing
  const startTimerRef = useRef<(() => void) | null>(null);
  
  // Register typing callback to auto-start timer
  useEffect(() => {
    registerOnTypingStart(() => {
      startTimerRef.current?.();
    });
    return () => {
      registerOnTypingStart(null);
    };
  }, [registerOnTypingStart]);


  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  const iconSize = 22;

  // Primary Action Button wrapper
  const ActionButton = ({ onPress, children, active = false }: { onPress: () => void, children: React.ReactNode, active?: boolean }) => (
    <TouchableOpacity 
      onPress={onPress}
      style={[styles.button, active && { backgroundColor: theme.entrySelected }]}
    >
      {children}
    </TouchableOpacity>
  );

  return (
    <Animated.View 
      layout={LinearTransition.duration(200)}
      style={[
        styles.container, 
        { 
          backgroundColor: theme.background,
          borderColor: theme.border,
          paddingBottom: Math.max(insets.bottom, 4),
        },
        expanded && styles.containerExpanded
      ]}
    >
      {/* Expanded Content (Settings) */}
      
      {expanded && !timerRunning && (
        <Animated.View 
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          style={[styles.expandedContent, { borderBottomColor: theme.border }]}
        >
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.fontSelectorContainer}
          >
            <FontSelector />
          </ScrollView>

          <View style={styles.secondaryActions}>
            <TouchableOpacity 
              onPress={toggleColorScheme}
              style={[styles.secondaryButton]}
            >
              {colorScheme === 'light' ? (
                <Moon size={20} color={theme.textSecondary} />
              ) : (
                <Sun size={20} color={theme.textSecondary} />
              )}
              <Text style={[styles.secondaryButtonText, { color: theme.textSecondary }]}>
                {colorScheme === 'light' ? 'Dark Mode' : 'Light Mode'}
              </Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity 
              onPress={() => updateSettings({ backspaceDisabled: !settings.backspaceDisabled })}
              style={styles.secondaryButton}
            >
              <Delete 
                size={20} 
                color={settings.backspaceDisabled ? theme.textHover : theme.textSecondary} 
              />
              <Text style={[
                styles.secondaryButtonText, 
                { color: settings.backspaceDisabled ? theme.textHover : theme.textSecondary }
              ]}>
                {settings.backspaceDisabled ? 'Backspace Off' : 'Backspace On'}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {/* Main Bar (Primary Actions) */}
      <View style={[styles.mainBar, timerRunning && styles.mainBarFocused]}>
        <View style={[styles.timerWrapper, timerRunning && styles.timerWrapperFocused]}>
          <Timer onTimerRunningChange={setTimerRunning} startTimerRef={startTimerRef} />
          <Text style={[styles.tapHintText, { color: theme.textSecondary }]}>
            {timerRunning ? 'tap to stop' : 'tap to start'}
          </Text>
        </View>

        {!timerRunning && (
          <View style={styles.primaryActions}>
            <ActionButton onPress={() => setShowChatMenu(true)}>
              <MessageSquare size={iconSize} color={theme.textSecondary} strokeWidth={1.5} />
            </ActionButton>

            <ActionButton onPress={createNewEntry}>
               <Plus size={iconSize} color={theme.textSecondary} strokeWidth={1.5} />
            </ActionButton>

            <ActionButton onPress={() => setShowSidebar(true)}>
              <History size={iconSize} color={theme.textSecondary} strokeWidth={1.5} />
            </ActionButton>

            <ActionButton onPress={toggleExpanded} active={expanded}>
              {expanded ? (
                <ChevronDown size={iconSize} color={theme.textSecondary} strokeWidth={1.5} />
              ) : (
                <ChevronUp size={iconSize} color={theme.textSecondary} strokeWidth={1.5} />
              )}
            </ActionButton>
          </View>
        )}
      </View>

      {/* Modals */}
      <ChatMenu visible={showChatMenu} onClose={() => setShowChatMenu(false)} />
      <EntrySidebar visible={showSidebar} onClose={() => setShowSidebar(false)} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopWidth: StyleSheet.hairlineWidth,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  containerExpanded: {
    // Additional padding handled dynamically via inline style
  },
  mainBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 52,
  },
  mainBarFocused: {
    justifyContent: 'flex-start',
  },
  timerWrapper: {
    flex: 1,
  },
  timerWrapperFocused: {
    flex: 0,
    alignItems: 'flex-start',
  },
  tapHintText: {
    fontSize: 11,
    opacity: 0.6,
    marginTop: 2,
  },
  primaryActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  button: {
    padding: 8,
    borderRadius: 8,
  },
  expandedContent: {
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  fontSelectorContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(128,128,128, 0.2)',
  },
});
