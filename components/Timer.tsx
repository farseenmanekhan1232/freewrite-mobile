import React, { useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet,
  GestureResponderEvent,
} from 'react-native';
import { Minus, Plus } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useTimer } from '../hooks/useTimer';

interface TimerProps {
  onTimerRunningChange?: (isRunning: boolean) => void;
}

export const Timer: React.FC<TimerProps> = ({ onTimerRunningChange }) => {
  const { theme, colorScheme } = useTheme();
  const { formattedTime, isRunning, toggleTimer, resetTimer, adjustTime } = useTimer();
  const lastTapRef = useRef<number>(0);

  // Notify parent when running state changes
  React.useEffect(() => {
    onTimerRunningChange?.(isRunning);
  }, [isRunning, onTimerRunningChange]);

  const handlePress = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      // Double tap - reset
      resetTimer();
      lastTapRef.current = 0;
    } else {
      // Single tap - toggle
      lastTapRef.current = now;
      setTimeout(() => {
        if (lastTapRef.current !== 0 && Date.now() - lastTapRef.current >= DOUBLE_TAP_DELAY) {
          toggleTimer();
        }
      }, DOUBLE_TAP_DELAY);
    }
  };

  const handleLongPress = () => {
    // Show time adjustment options or increment
    adjustTime('up');
  };

  const textColor = isRunning 
    ? theme.textSecondary
    : theme.textSecondary;

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        onPress={handlePress}
        onLongPress={() => adjustTime('up')}
        delayLongPress={500}
        style={styles.touchable}
      >
        <Text style={[styles.timerText, { color: textColor }]}>
          {formattedTime}
        </Text>
      </TouchableOpacity>
      
      {/* Time adjustment buttons - hidden when timer is running */}
      {!isRunning && (
        <View style={styles.adjustButtons}>
          <TouchableOpacity 
            onPress={() => adjustTime('down')}
            style={styles.adjustButton}
          >
            <Minus size={14} color={theme.textSecondary} strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => adjustTime('up')}
            style={styles.adjustButton}
          >
            <Plus size={14} color={theme.textSecondary} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  touchable: {
    padding: 4,
  },
  timerText: {
    fontSize: 13,
    fontFamily: 'System',
  },
  adjustButtons: {
    flexDirection: 'row',
    gap: 2,
  },
  adjustButton: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  adjustButtonText: {
    fontSize: 16,
    fontWeight: '300',
  },
});
