// Randomized slogan arrays and utilities

const YIKES_WORDS = [
  'Yikes',
  'Like',
  'Sike', 
  'Psych',
  'Strike',
  'Spike',
  'Hike',
  'Mike',
  'Pike'
] as const;

const DESCRIBE_WORDS = [
  'Describe',
  'Subscribe',
  'Ignite',
  'Highlight',
  'Inscribe',
  'Prescribe',
  'Transcribe',
  'Excite',
  'Invite',
  'Delight'
] as const;

const LEADING_WORDS = [
  'Leading',
  'Modern',
  'Superior',
  'Foremost',
  'Premier',
  'Ultimate',
  'Elite',
  'Prime',
  'Top-Tier',
  'Dominant',
  'Supreme',
  'Advanced'
] as const;

// Get random word from array
const getRandomWord = <T extends readonly string[]>(array: T): T[number] => {
  return array[Math.floor(Math.random() * array.length)];
};

// Get random number with 1% chance for #2, 99% chance for #1
const getRandomNumber = (): string => {
  return Math.random() < 0.01 ? '#2' : '#1';
};

// Generate complete randomized tagline
export const generateRandomTagline = (): string => {
  const yikes = getRandomWord(YIKES_WORDS);
  const describe = getRandomWord(DESCRIBE_WORDS);
  return `${yikes} and ${describe}`;
};

// Generate complete randomized hero text
export const generateRandomHeroText = (): {
  number: string;
  leading: string;
} => {
  return {
    number: getRandomNumber(),
    leading: getRandomWord(LEADING_WORDS)
  };
};