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

  const Dot = () => (
    <Text style={[styles.dot, { color: theme.textSecondary }]}>•</Text>
  );

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      <TouchableOpacity onPress={handleFontSizePress} style={styles.button}>
        <Text style={[styles.buttonText, { color: theme.textSecondary }]}>
          {settings.fontSize}px
        </Text>
      </TouchableOpacity>

      <Dot />

      {fonts.map((font, index) => (
        <React.Fragment key={font.name}>
          <TouchableOpacity 
            onPress={() => updateSettings({ fontFamily: font.family })}
            style={styles.button}
          >
            <Text 
              style={[
                styles.buttonText, 
                { 
                  color: settings.fontFamily === font.family 
                    ? theme.textHover 
                    : theme.textSecondary 
                }
              ]}
            >
              {font.name}
            </Text>
          </TouchableOpacity>
          <Dot />
        </React.Fragment>
      ))}

      <TouchableOpacity onPress={handleRandomFont} style={styles.button}>
        <Text style={[styles.buttonText, { color: theme.textSecondary }]}>
          Random
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  button: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  buttonText: {
    fontSize: 13,
  },
  dot: {
    fontSize: 13,
    paddingHorizontal: 4,
  },
});
