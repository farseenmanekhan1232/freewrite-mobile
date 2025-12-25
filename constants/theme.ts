// Theme colors for light and dark modes
export const colors = {
  light: {
    background: '#FFFFFF',
    text: 'rgb(51, 51, 51)',
    textSecondary: '#808080',
    textHover: '#000000',
    border: '#E5E5E5',
    entrySelected: 'rgba(128, 128, 128, 0.1)',
    entryHover: 'rgba(128, 128, 128, 0.05)',
    placeholder: 'rgba(128, 128, 128, 0.5)',
  },
  dark: {
    background: '#000000',
    text: 'rgb(230, 230, 230)',
    textSecondary: 'rgba(128, 128, 128, 0.8)',
    textHover: '#FFFFFF',
    border: '#333333',
    entrySelected: 'rgba(128, 128, 128, 0.1)',
    entryHover: 'rgba(128, 128, 128, 0.05)',
    placeholder: 'rgba(128, 128, 128, 0.6)',
  },
};

export const fonts = {
  lato: 'Lato-Regular',
  arial: 'Arial',
  system: 'System',
  serif: 'Times New Roman',
};

export const fontSizes = [16, 18, 20, 22, 24, 26] as const;
export type FontSize = typeof fontSizes[number];

export const defaultTimerSeconds = 900; // 15 minutes
export const timerMinSeconds = 0;
export const timerMaxSeconds = 2700; // 45 minutes
export const timerStepSeconds = 300; // 5 minutes
