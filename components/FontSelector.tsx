import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useSettings } from '../contexts/SettingsContext';
import { fontSizes } from '../constants/theme';

export const FontSelector: React.FC = () => {
  const { theme } = useTheme();
  const { settings, updateSettings } = useSettings();

  const fonts = [
    { name: 'Lato', family: 'Lato-Regular' },
    { name: 'Arial', family: 'Arial' },
    { name: 'System', family: 'System' },
    { name: 'Serif', family: 'serif' },
  ];

  const handleFontSizePress = () => {
    const currentIndex = fontSizes.indexOf(settings.fontSize as typeof fontSizes[number]);
    const nextIndex = (currentIndex + 1) % fontSizes.length;
    updateSettings({ fontSize: fontSizes[nextIndex] });
  };

  const handleRandomFont = () => {
    const randomFonts = ['Lato-Regular', 'Arial', 'System', 'serif', 'monospace', 'Courier'];
    const randomFont = randomFonts[Math.floor(Math.random() * randomFonts.length)];
    updateSettings({ fontFamily: randomFont });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        onPress={handleFontSizePress} 
        style={[styles.pill, { borderColor: theme.border, backgroundColor: theme.background }]}
      >
        <Text style={[styles.buttonText, { color: theme.text }]}>
          {settings.fontSize}px
        </Text>
      </TouchableOpacity>

      <View style={styles.separator} />

      {fonts.map((font) => (
        <TouchableOpacity 
          key={font.name}
          onPress={() => updateSettings({ fontFamily: font.family })}
          style={[
            styles.pill, 
            settings.fontFamily === font.family && { backgroundColor: theme.entrySelected }
          ]}
        >
          <Text 
            style={[
              styles.buttonText, 
              { 
                color: settings.fontFamily === font.family 
                  ? theme.text 
                  : theme.textSecondary 
              }
            ]}
          >
            {font.name}
          </Text>
        </TouchableOpacity>
      ))}

      <View style={styles.separator} />

      <TouchableOpacity 
        onPress={handleRandomFont} 
        style={[styles.pill, { borderColor: theme.border }]}
      >
        <Text style={[styles.buttonText, { color: theme.textSecondary }]}>
          Random
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'transparent',
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '500',
  },
  separator: {
    width: 1,
    height: 16,
    backgroundColor: 'rgba(128,128,128, 0.2)',
    marginHorizontal: 4,
  },
});
