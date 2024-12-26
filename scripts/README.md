# Trash Program Scripts

Solana Trash Program을 위한 CLI 스크립트 모음입니다.

## 설치

```bash
pnpm install
```

## 환경설정

.env 파일을 생성하고 다음 변수를 설정합니다.

- RPC_URL: Solana RPC URL
- ADMIN_PRIVATE_KEY: Admin wallet private key (base58 encoded)
- PROGRAM_ID: Trash Program ID

## 사용법

### 1. 라벨 업데이트

```bash
pnpm run update-label <mint-address> <name> <multiplier>

# 예시
npm run update-label 9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin "Shiny Trash" 2
```

### 2. 모든 리사이클 데이터 조회

```bash
pnpm run get-all-recycle
```

실행 결과는 `scripts/data` 디렉토리에 타임스탬프가 포함된 JSON 파일로 저장됩니다.
예: `recycle-data-2024-03-20T10-30-45-000Z.json`

### 3. 유저별 리사이클 데이터 조회

```bash
pnpm run get-user-recycle <user-address>
```