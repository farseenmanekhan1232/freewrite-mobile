export const placeholderOptions = [
  'Begin writing',
  'Pick a thought and go',
  'Start typing',
  "What's on your mind",
  'Just start',
  'Type your first thought',
  'Start with one sentence',
  'Just say it',
];

export const getRandomPlaceholder = () => {
  return placeholderOptions[Math.floor(Math.random() * placeholderOptions.length)];
};
