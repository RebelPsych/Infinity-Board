// Background autocorrect engine with high-frequency typos and contractions
export const AUTOCORRECT_MAP: Record<string, string> = {
  // Common letter swaps and typos
  teh: 'the',
  thsi: 'this',
  taht: 'that',
  waht: 'what',
  whta: 'what',
  wich: 'which',
  whcih: 'which',
  wiht: 'with',
  wtih: 'with',
  adn: 'and',
  nad: 'and',
  recieve: 'receive',
  recieved: 'received',
  recieving: 'receiving',
  seperate: 'separate',
  seperated: 'separated',
  definately: 'definitely',
  untill: 'until',
  becuase: 'because',
  becasue: 'because',
  beacuse: 'because',
  wierd: 'weird',
  beleive: 'believe',
  beleived: 'believed',
  occured: 'occurred',
  occuring: 'occurring',
  acommodate: 'accommodate',
  accommodate: 'accommodate',
  acheive: 'achieve',
  acheived: 'achieved',
  tomorow: 'tomorrow',
  tommorrow: 'tomorrow',
  alot: 'a lot',
  goverment: 'government',
  embarass: 'embarrass',
  embarassed: 'embarrassed',
  neccessary: 'necessary',
  necesary: 'necessary',
  realy: 'really',
  truely: 'truly',
  freind: 'friend',
  freinds: 'friends',
  peice: 'piece',
  peices: 'pieces',
  peolpe: 'people',
  poeple: 'people',
  thier: 'their',
  therefor: 'therefore',
  accross: 'across',
  alright: 'all right',
  comming: 'coming',
  completly: 'completely',
  enviroment: 'environment',
  existance: 'existence',
  foward: 'forward',
  fourty: 'forty',
  furthur: 'further',
  happend: 'happened',
  interupt: 'interrupt',
  knowlege: 'knowledge',
  lenght: 'length',
  libary: 'library',
  noticable: 'noticeable',
  persue: 'pursue',
  posession: 'possession',
  publically: 'publicly',
  remeber: 'remember',
  resistence: 'resistance',
  sence: 'sense',
  succesful: 'successful',
  suprise: 'surprise',
  suprised: 'surprised',
  tendancy: 'tendency',
  tounge: 'tongue',
  unfortunatly: 'unfortunately',
  writting: 'writing',
  youre: "you're",
  dont: "don't",
  cant: "can't",
  wont: "won't",
  didnt: "didn't",
  isnt: "isn't",
  arent: "aren't",
  wasnt: "wasn't",
  werent: "weren't",
  hasnt: "hasn't",
  havent: "haven't",
  hadnt: "hadn't",
  wouldnt: "wouldn't",
  couldnt: "couldn't",
  shouldnt: "shouldn't",
  im: "I'm",
  ive: "I've",
  ill: "I'll",
  id: "I'd",
  i: 'I',
  theyre: "they're",
  theyve: "they've",
  theyd: "they'd",
  weve: "we've",
  youve: "you've",
  youd: "you'd",
  thats: "that's",
  whats: "what's",
  hows: "how's",
  wheres: "where's",
  theres: "there's",
  heres: "here's",
  lets: "let's",
  itll: "it'll",
  whoever: 'whoever',
};

// Autocorrects word while respecting original capitalization style (lowercase, Capitalized, ALLCAPS)
export function autocorrectWord(word: string): string {
  if (!word || word.length === 0) return word;

  const lower = word.toLowerCase();
  const replacement = AUTOCORRECT_MAP[lower];

  if (!replacement) return word;

  // Case 1: ALL CAPS
  if (word === word.toUpperCase() && word.length > 1) {
    return replacement.toUpperCase();
  }

  // Case 2: Capitalized (Title case)
  if (word[0] === word[0].toUpperCase()) {
    return replacement.charAt(0).toUpperCase() + replacement.slice(1);
  }

  // Case 3: lowercase
  return replacement;
}

// Scans text before cursor and corrects the last completed word before delimiter
export function autocorrectLastWord(
  text: string,
  cursorPos: number
): { newText: string; newCursor: number; didCorrect: boolean } {
  if (cursorPos <= 0) return { newText: text, newCursor: cursorPos, didCorrect: false };

  const textBefore = text.slice(0, cursorPos);
  const textAfter = text.slice(cursorPos);

  // Match the word preceding any trailing whitespace/punctuation before cursor
  // e.g. "hello teh " -> word is "teh", suffix is " "
  const match = textBefore.match(/([a-zA-Z']+)([^a-zA-Z']*)$/);
  if (!match) return { newText: text, newCursor: cursorPos, didCorrect: false };

  const rawWord = match[1];
  const suffix = match[2];
  const corrected = autocorrectWord(rawWord);

  if (corrected === rawWord) {
    return { newText: text, newCursor: cursorPos, didCorrect: false };
  }

  const wordStart = textBefore.length - match[0].length;
  const replacedBefore = textBefore.slice(0, wordStart) + corrected + suffix;
  const newText = replacedBefore + textAfter;
  const newCursor = replacedBefore.length;

  return { newText, newCursor, didCorrect: true };
}
