import { useState, useEffect, useRef, useCallback } from 'react';
import { defaultTimerSeconds, timerMinSeconds, timerMaxSeconds, timerStepSeconds } from '../constants/theme';

interface UseTimerReturn {
  timeRemaining: number;
  isRunning: boolean;
  formattedTime: string;
  toggleTimer: () => void;
  resetTimer: () => void;
  adjustTime: (direction: 'up' | 'down') => void;
  setTime: (seconds: number) => void;
}

export const useTimer = (): UseTimerReturn => {
  const [timeRemaining, setTimeRemaining] = useState(defaultTimerSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Format time as mm:ss
  const formattedTime = `${Math.floor(timeRemaining / 60)}:${String(timeRemaining % 60).padStart(2, '0')}`;

  // Effect to handle the countdown
  useEffect(() => {
    if (isRunning && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeRemaining]);

  const toggleTimer = useCallback(() => {
    if (timeRemaining === 0) {
      setTimeRemaining(defaultTimerSeconds);
    }
    setIsRunning(prev => !prev);
  }, [timeRemaining]);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setTimeRemaining(defaultTimerSeconds);
  }, []);

  const adjustTime = useCallback((direction: 'up' | 'down') => {
    setTimeRemaining(prev => {
      const currentMinutes = Math.floor(prev / 60);
      const newMinutes = direction === 'up' 
        ? currentMinutes + 5 
        : currentMinutes - 5;
      const roundedMinutes = Math.round(newMinutes / 5) * 5;
      const newTime = roundedMinutes * 60;
      return Math.min(Math.max(newTime, timerMinSeconds), timerMaxSeconds);
    });
  }, []);

  const setTime = useCallback((seconds: number) => {
    setTimeRemaining(Math.min(Math.max(seconds, timerMinSeconds), timerMaxSeconds));
  }, []);

  return {
    timeRemaining,
    isRunning,
    formattedTime,
    toggleTimer,
    resetTimer,
    adjustTime,
    setTime,
  };
};
