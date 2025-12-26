import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { 
  MessageSquare, 
  Delete, 
  Plus, 
  Sun, 
  Moon, 
  History,
  MoreHorizontal,
  ChevronDown,
} from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useSettings } from '../contexts/SettingsContext';
import { FontSelector } from './FontSelector';
import { Timer } from './Timer';
import { ChatMenu } from './ChatMenu';
import { EntrySidebar } from './EntrySidebar';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const BottomNav: React.FC = () => {
  const { theme, colorScheme, toggleColorScheme } = useTheme();
  const { settings, updateSettings, createNewEntry } = useSettings();
  
  const [showChatMenu, setShowChatMenu] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [timerRunning, setTimerRunning] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [opacity] = useState(new Animated.Value(1));

  // Fade out nav when timer is running
  useEffect(() => {
    Animated.timing(opacity, {
      toValue: timerRunning ? 0.3 : 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [timerRunning, opacity]);

  const toggleExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
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
      style={[
        styles.container, 
        { 
          backgroundColor: theme.background,
          borderColor: theme.border,
          opacity,
        },
        expanded && styles.containerExpanded
      ]}
    >
      {/* Expanded Content (Settings) - Rendered first to animate height upwards logic if needed, 
          but simpler to just stick it above or inside. 
          Actually for a bottom bar, usually main row is at bottom, expanded content slides up.
          Let's put Expanded Content first in DOM if using flex-col-reverse, or just use View ordering.
      */}
      
      {expanded && (
        <View style={[styles.expandedContent, { borderBottomColor: theme.border }]}>
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
        </View>
      )}

      {/* Main Bar (Primary Actions) */}
      <View style={styles.mainBar}>
        <View style={styles.timerWrapper}>
          <Timer onTimerRunningChange={setTimerRunning} />
        </View>

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
              <MoreHorizontal size={iconSize} color={theme.textSecondary} strokeWidth={1.5} />
            )}
          </ActionButton>
        </View>
      </View>

      {/* Modals */}
      <ChatMenu visible={showChatMenu} onClose={() => setShowChatMenu(false)} />
      <EntrySidebar visible={showSidebar} onClose={() => setShowSidebar(false)} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingBottom: 20, // Safe area
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  containerExpanded: {
    paddingBottom: 24,
  },
  mainBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 60,
  },
  timerWrapper: {
    flex: 1,
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
