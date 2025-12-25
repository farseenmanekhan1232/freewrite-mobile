import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  StyleSheet,
  Linking,
  Pressable,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '../contexts/ThemeContext';
import { useSettings } from '../contexts/SettingsContext';
import { aiChatPrompt, claudePrompt } from '../utils/prompts';

interface ChatMenuProps {
  visible: boolean;
  onClose: () => void;
}

export const ChatMenu: React.FC<ChatMenuProps> = ({ visible, onClose }) => {
  const { theme, colorScheme } = useTheme();
  const { currentEntry } = useSettings();
  const [didCopy, setDidCopy] = useState(false);

  const trimmedText = (currentEntry?.content || '').trim();
  const charCount = trimmedText.length;
  const isWelcomeText = trimmedText.startsWith('Hi. Welcome to Freewrite');
  
  // Check URL length
  const gptFullText = aiChatPrompt + '\n\n' + trimmedText;
  const claudeFullText = claudePrompt + '\n\n' + trimmedText;
  const isUrlTooLong = encodeURIComponent(gptFullText).length > 6000 || 
                       encodeURIComponent(claudeFullText).length > 6000;

  const handleCopyPrompt = async () => {
    await Clipboard.setStringAsync(gptFullText);
    setDidCopy(true);
    setTimeout(() => setDidCopy(false), 2000);
  };

  const handleOpenChatGPT = async () => {
    const encoded = encodeURIComponent(gptFullText);
    const url = `https://chat.openai.com/?prompt=${encoded}`;
    await Linking.openURL(url);
    onClose();
  };

  const handleOpenClaude = async () => {
    const encoded = encodeURIComponent(claudeFullText);
    const url = `https://claude.ai/new?q=${encoded}`;
    await Linking.openURL(url);
    onClose();
  };

  const renderContent = () => {
    if (isWelcomeText) {
      return (
        <Text style={[styles.message, { color: theme.text }]}>
          Yo. Sorry, you can't chat with the guide lol. Please write your own entry.
        </Text>
      );
    }

    if (charCount < 350) {
      return (
        <Text style={[styles.message, { color: theme.text }]}>
          Please free write for at minimum 5 minutes first. Then click this. Trust.
        </Text>
      );
    }

    if (isUrlTooLong) {
      return (
        <View>
          <Text style={[styles.message, { color: theme.text }]}>
            Hey, your entry is quite long. You'll need to manually copy the prompt and paste it into the AI of your choice.
          </Text>
          <TouchableOpacity 
            style={[styles.menuItem, styles.menuItemBorder]} 
            onPress={handleCopyPrompt}
          >
            <Text style={[styles.menuItemText, { color: theme.text }]}>
              {didCopy ? 'Copied!' : 'Copy Prompt'}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View>
        <TouchableOpacity 
          style={[styles.menuItem, styles.menuItemBorder]} 
          onPress={handleOpenChatGPT}
        >
          <Text style={[styles.menuItemText, { color: theme.text }]}>ChatGPT</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.menuItem, styles.menuItemBorder]} 
          onPress={handleOpenClaude}
        >
          <Text style={[styles.menuItemText, { color: theme.text }]}>Claude</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={handleCopyPrompt}
        >
          <Text style={[styles.menuItemText, { color: theme.text }]}>
            {didCopy ? 'Copied!' : 'Copy Prompt'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable 
          style={[
            styles.menu, 
            { 
              backgroundColor: colorScheme === 'light' ? '#FFFFFF' : '#333333',
              borderColor: theme.border,
            }
          ]}
          onPress={e => e.stopPropagation()}
        >
          {renderContent()}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menu: {
    minWidth: 200,
    maxWidth: 280,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  message: {
    fontSize: 14,
    padding: 16,
    lineHeight: 20,
  },
  menuItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuItemBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(128, 128, 128, 0.3)',
  },
  menuItemText: {
    fontSize: 14,
  },
});
