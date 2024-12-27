// 토큰 ID와 로컬 이미지 경로 매핑
export const TOKEN_IMAGE_MAPPING: Record<string, string> = {
  "EKEWAk7hfnwfR8DBb1cTayPPambqyC7pwNiYkaYQKQHp": "/tokens/EKEWAk7hfnwfR8DBb1cTayPPambqyC7pwNiYkaYQKQHp.png", // Roaring Kitty
  "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB": "/tokens/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB.svg", // USDC
}

// 이미지 fallback 함수
export function getTokenFallbackImage(tokenId: string): string | undefined {
  return TOKEN_IMAGE_MAPPING[tokenId]
} 