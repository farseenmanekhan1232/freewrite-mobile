export const placeholderOptions = [
  '\n\nBegin writing',
  '\n\nPick a thought and go',
  '\n\nStart typing',
  "\n\nWhat's on your mind",
  '\n\nJust start',
  '\n\nType your first thought',
  '\n\nStart with one sentence',
  '\n\nJust say it',
];

export const getRandomPlaceholder = () => {
  return placeholderOptions[Math.floor(Math.random() * placeholderOptions.length)];
};
