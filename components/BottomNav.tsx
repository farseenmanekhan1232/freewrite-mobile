import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  Animated,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useSettings } from '../contexts/SettingsContext';
import { FontSelector } from './FontSelector';
import { Timer } from './Timer';
import { ChatMenu } from './ChatMenu';
import { EntrySidebar } from './EntrySidebar';

export const BottomNav: React.FC = () => {
  const { theme, colorScheme, toggleColorScheme } = useTheme();
  const { settings, updateSettings, createNewEntry } = useSettings();
  
  const [showChatMenu, setShowChatMenu] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [timerRunning, setTimerRunning] = useState(false);
  const [opacity] = useState(new Animated.Value(1));

  // Fade out nav when timer is running
  useEffect(() => {
    Animated.timing(opacity, {
      toValue: timerRunning ? 0.3 : 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [timerRunning, opacity]);

  const Dot = () => (
    <Text style={[styles.dot, { color: theme.textSecondary }]}>•</Text>
  );

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          backgroundColor: theme.background,
          opacity,
        }
      ]}
    >
      {/* Left section - Font controls */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.leftSection}
        contentContainerStyle={styles.leftContent}
      >
        <FontSelector />
      </ScrollView>

      {/* Right section - Utilities */}
      <View style={styles.rightSection}>
        <Timer onTimerRunningChange={setTimerRunning} />

        <Dot />

        <TouchableOpacity 
          onPress={() => setShowChatMenu(true)}
          style={styles.button}
        >
          <Text style={[styles.buttonText, { color: theme.textSecondary }]}>Chat</Text>
        </TouchableOpacity>

        <Dot />

        <TouchableOpacity 
          onPress={() => updateSettings({ backspaceDisabled: !settings.backspaceDisabled })}
          style={styles.button}
        >
          <Text style={[styles.buttonText, { color: theme.textSecondary }]}>
            {settings.backspaceDisabled ? '⌫ Off' : '⌫ On'}
          </Text>
        </TouchableOpacity>

        <Dot />

        <TouchableOpacity 
          onPress={createNewEntry}
          style={styles.button}
        >
          <Text style={[styles.buttonText, { color: theme.textSecondary }]}>New</Text>
        </TouchableOpacity>

        <Dot />

        <TouchableOpacity 
          onPress={toggleColorScheme}
          style={styles.button}
        >
          <Text style={[styles.iconButton, { color: theme.textSecondary }]}>
            {colorScheme === 'light' ? '🌙' : '☀️'}
          </Text>
        </TouchableOpacity>

        <Dot />

        <TouchableOpacity 
          onPress={() => setShowSidebar(true)}
          style={styles.button}
        >
          <Text style={[styles.iconButton, { color: theme.textSecondary }]}>🕐</Text>
        </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 24, // Safe area padding
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(128, 128, 128, 0.2)',
  },
  leftSection: {
    flex: 1,
  },
  leftContent: {
    alignItems: 'center',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  button: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  buttonText: {
    fontSize: 13,
  },
  iconButton: {
    fontSize: 16,
  },
  dot: {
    fontSize: 13,
    paddingHorizontal: 4,
  },
});
