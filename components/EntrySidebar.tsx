import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  FlatList,
  Modal,
  Pressable,
  Alert,
  Share,
} from 'react-native';
import { X, Download, Trash2, ExternalLink } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { useSettings } from '../contexts/SettingsContext';
import { Entry, openEntriesFolder } from '../utils/storage';

interface EntrySidebarProps {
  visible: boolean;
  onClose: () => void;
}

export const EntrySidebar: React.FC<EntrySidebarProps> = ({ visible, onClose }) => {
  const insets = useSafeAreaInsets();
  const { theme, colorScheme } = useTheme();
  const { entries, currentEntry, selectEntry, deleteEntry, entriesPath } = useSettings();

  const handleOpenFolder = async () => {
    try {
      await openEntriesFolder();
    } catch (error) {
      console.log('Could not open folder:', error);
    }
  };

  const handleEntryPress = (entry: Entry) => {
    selectEntry(entry);
    onClose();
  };

  const handleDeletePress = (entry: Entry) => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteEntry(entry.id),
        },
      ]
    );
  };

  const handleExportPress = async (entry: Entry) => {
    try {
      await Share.share({
        message: entry.content,
        title: `Entry - ${entry.date}`,
      });
    } catch (error) {
      console.error('Error sharing entry:', error);
    }
  };

  const renderEntry = ({ item: entry }: { item: Entry }) => {
    const isSelected = currentEntry?.id === entry.id;

    return (
      <TouchableOpacity
        style={[
          styles.entryItem,
          isSelected && { backgroundColor: theme.entrySelected },
        ]}
        onPress={() => handleEntryPress(entry)}
        onLongPress={() => handleDeletePress(entry)}
      >
        <View style={styles.entryContent}>
          <View style={styles.entryTextContainer}>
            <Text 
              style={[styles.entryPreview, { color: theme.text }]}
              numberOfLines={1}
            >
              {entry.previewText || 'Empty entry'}
            </Text>
            <Text style={[styles.entryDate, { color: theme.textSecondary }]}>
              {entry.date}
            </Text>
          </View>
          
          <View style={styles.entryActions}>
            <TouchableOpacity 
              onPress={() => handleExportPress(entry)}
              style={styles.actionButton}
            >
              <Download size={16} color={theme.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => handleDeletePress(entry)}
              style={styles.actionButton}
            >
              <Trash2 size={16} color="#FF6B6B" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable 
          style={[
            styles.sidebar, 
            { 
              backgroundColor: theme.background,
              paddingBottom: insets.bottom,
            }
          ]}
          onPress={e => e.stopPropagation()}
        >
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <TouchableOpacity 
              style={styles.headerTitleContainer} 
              onPress={handleOpenFolder}
              activeOpacity={0.7}
            >
              <View style={styles.headerTitleRow}>
                <Text style={[styles.headerTitle, { color: theme.text }]}>History</Text>
                <ExternalLink size={14} color={theme.textSecondary} style={styles.folderIcon} />
              </View>
              <Text style={[styles.headerPath, { color: theme.textSecondary }]} numberOfLines={1}>
                {entriesPath}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={entries}
            renderItem={renderEntry}
            keyExtractor={item => item.id}
            ItemSeparatorComponent={() => (
              <View style={[styles.separator, { backgroundColor: theme.border }]} />
            )}
            contentContainerStyle={[
              styles.listContent,
              { paddingBottom: Math.max(insets.bottom, 8) }
            ]}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-end',
  },
  sidebar: {
    height: '70%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  folderIcon: {
    marginLeft: 6,
  },
  headerPath: {
    fontSize: 10,
    marginTop: 2,
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 18,
  },
  listContent: {
    padding: 8,
  },
  entryItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  entryContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  entryTextContainer: {
    flex: 1,
    marginRight: 8,
  },
  entryPreview: {
    fontSize: 14,
    marginBottom: 2,
  },
  entryDate: {
    fontSize: 12,
  },
  entryActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 6,
  },
  actionIcon: {
    fontSize: 14,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 12,
  },
});
