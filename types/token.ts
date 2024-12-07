export enum TokenDescription {
  RUG = "Rug",
  TRASH = "Trash",
  POOP = "Poop",
  GARBAGE = "Garbage",
  UTILITY_TRASH = "Utility Trash",
  SHINY_TRASH = "Shiny Trash"
}

export interface Token {
  id: string;
  name: string;
  description: TokenDescription;
  image: string;
}

export interface TokenData {
  name: string;
  description: TokenDescription;
  image: string;
}

export interface TokenListState {
  status: 'idle' | 'loading' | 'success' | 'error';
  tokens: Token[];
  error?: string;
}