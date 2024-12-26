import { TokenDescription } from '@/types/token'

function getAddressType(address: string, numTypes: number = 4): number {
  let sum = 0;
  for (const char of address) {
    sum += char.charCodeAt(0);
  }
  return (sum % numTypes) + 1;
}

export function getTokenDescription(address: string): TokenDescription {
  const typeIndex = getAddressType(address);
  switch (typeIndex) {
    case 1: return TokenDescription.RUG
    case 2: return TokenDescription.TRASH
    case 3: return TokenDescription.POOP
    case 4: return TokenDescription.GARBAGE
    default: return TokenDescription.TRASH
  }
}