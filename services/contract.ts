// services/contract.ts
"use server"
import { Connection, SystemProgram, Transaction, PublicKey } from '@solana/web3.js'
import { Program, AnchorProvider, BN } from '@coral-xyz/anchor'
import { Trash } from './idl/trash'
import IDL from './idl/trash.json'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { getAssociatedTokenAddress } from '@solana/spl-token'
import { Wallet } from '@coral-xyz/anchor'
import { TokenDescription } from '@/types/token'
import { PROGRAM_ID, RPC_ENDPOINT, SEEDS } from '@/config'

const connection = new Connection(RPC_ENDPOINT)

async function getProgram(wallet?: Wallet) {
  const provider = new AnchorProvider(
    connection,
    wallet || {} as any,
    { commitment: 'confirmed' }
  )
  return new Program<Trash>(IDL as Trash, provider)
}

// PDA 주소 가져오기 함수들
export async function getAdminPDA(): Promise<PublicKey> {
  const [pda] = await PublicKey.findProgramAddressSync(
    [Buffer.from(SEEDS.ADMIN)],
    PROGRAM_ID
  )
  return pda
}

export async function getVaultPDA(): Promise<PublicKey> {
  const [pda] = await PublicKey.findProgramAddressSync(
    [Buffer.from(SEEDS.VAULT)],
    PROGRAM_ID
  )
  return pda
}

export async function getLabelPDA(mint: any): Promise<PublicKey> {
  const [pda] = await PublicKey.findProgramAddressSync(
    [Buffer.from(SEEDS.LABEL), mint.toBuffer()],
    PROGRAM_ID
  )
  return pda
}

export async function getUserStatsPDA(user: any): Promise<PublicKey> {
  const [pda] = await PublicKey.findProgramAddressSync(
    [Buffer.from(SEEDS.USER_STATS), user.toBuffer()],
    PROGRAM_ID
  )
  return pda
}

export async function getRecycleDataPDA(user: any, mint: any): Promise<PublicKey> {
  const [pda] = await PublicKey.findProgramAddressSync(
    [Buffer.from(SEEDS.RECYCLE_DATA), user.toBuffer(), mint.toBuffer()],
    PROGRAM_ID
  )
  return pda
}

// 컨트랙트 데이터 조회 함수들
export async function fetchUserStats(userAddress: string) {
  try {
    const userPubkey = new PublicKey(userAddress)
    const userStatsPDA = await getUserStatsPDA(userPubkey)
    
    const program = await getProgram()
    const userStats = await program.account.userStats.fetch(userStatsPDA)
    
    return {
      recycleCount: userStats.recycleCount.toString(),
      totalSolReceived: userStats.totalSolReceived.toString(),
      totalPointsEarned: userStats.totalPointsEarned.toString(),
      lastUpdated: userStats.lastUpdated.toString()
    }
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return {
      recycleCount: '0',
      totalSolReceived: '0',
      totalPointsEarned: '0',
      lastUpdated: '0'
    }
  }
}

export async function fetchTokenLabel(mintAddress: string) {
  try {
    const mintPubkey = new PublicKey(mintAddress)
    const labelPDA = await getLabelPDA(mintPubkey)
    
    const program = await getProgram()
    const label = await program.account.label.fetch(labelPDA)
    
    return {
      mint: label.mint.toString(),
      name: label.name,
      multiplier: label.multiplier.toString()
    }
  } catch (error) {
    console.error('Error fetching token label:', error)
    return null
  }
}

export async function fetchVaultInfo() {
  try {
    const vaultPDA = await getVaultPDA()
    
    const program = await getProgram()
    const vault = await program.account.vault.fetch(vaultPDA)
    
    return {
      totalSolDeposited: vault.totalSolDeposited.toString(),
      totalSolWithdrawn: vault.totalSolWithdrawn.toString()
    }
  } catch (error) {
    console.error('Error fetching vault info:', error)
    return {
      totalSolDeposited: '0',
      totalSolWithdrawn: '0'
    }
  }
}

// 최근 리사이클 데이터 조회
export async function fetchRecentRecycles(limit: number = 10) {
  try {
    const program = await getProgram()
    
    const recycleAccounts = await program.account.recycleData.all()
    const sortedRecycles = recycleAccounts
      .sort((a, b) => b.account.timestamp.sub(a.account.timestamp).toNumber())
      .slice(0, limit)
      .map(account => ({
        user: account.account.user.toString(),
        tokenMint: account.account.tokenMint.toString(),
        tokenAmount: account.account.tokenAmount.toString(),
        solReceived: account.account.solReceived.toString(),
        pointsEarned: account.account.pointsEarned.toString(),
        timestamp: account.account.timestamp.toString()
      }))
    
    return sortedRecycles
  } catch (error) {
    console.error('Error fetching recent recycles:', error)
    return [{
      user: '',
      tokenMint: '',
      tokenAmount: '0',
      solReceived: '0',
      pointsEarned: '0',
      timestamp: '0'
    }]
  }
}

// 토큰 리사이클 트랜잭션 생성 함수
export async function createRecycleTokenTransaction(
  userPublicKeyStr: string,
  tokens: { mint: string, amount: string }[]
) {
  try {
    const userPublicKey = new PublicKey(userPublicKeyStr)
    const program = await getProgram()
    
    const tx = new Transaction()
    
    for (const { mint, amount } of tokens) {
      const timestamp = new BN(Date.now())
      const mintPubkey = new PublicKey(mint)
      
      // PDA 계정들 생성
      const [vaultPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from(SEEDS.VAULT)],
        PROGRAM_ID
      )

      const [userStatsPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from(SEEDS.USER_STATS), userPublicKey.toBuffer()],
        PROGRAM_ID
      )

      const [recycleDataPDA] = PublicKey.findProgramAddressSync(
        [
          Buffer.from(SEEDS.RECYCLE_DATA),
          userPublicKey.toBuffer(),
          Buffer.from(timestamp.toArray('le', 8))
        ],
        PROGRAM_ID
      )

      // 사용자의 토큰 계정 주소
      const userATA = await getAssociatedTokenAddress(
        mintPubkey,
        userPublicKey
      )

      // Vault의 토큰 계정 주소
      const [treasuryTokenAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from("TREASURY"), mintPubkey.toBuffer()],
        PROGRAM_ID
      )

      // 기본 accounts 객체 설정
      const accounts: any = {
        user: userPublicKey,
        userStats: userStatsPDA,
        mint: mintPubkey,
        userTokenAccount: userATA,
        vault: vaultPDA,
        vaultTokenAccount: treasuryTokenAccount,
        recycleData: recycleDataPDA,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId
      }

      const [labelPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from(SEEDS.LABEL), mintPubkey.toBuffer()],
        PROGRAM_ID
      )

      try {
        const labelInfo = await program.account.label.fetch(labelPDA)
        if (labelInfo && labelInfo.name !== '') {
          accounts.label = labelPDA
        }
      } catch (e) {
        accounts.label = new PublicKey(PROGRAM_ID)
      }

      // Create instruction with BigInt
      const instruction = await program.methods
        .recycleToken(
          new BN(amount.toString()),
          timestamp
        )
        .accounts(accounts)
        .instruction()
      
      tx.add(instruction)
    }
    
    // Get the latest blockhash
    const latestBlockhash = await connection.getLatestBlockhash()
    tx.recentBlockhash = latestBlockhash.blockhash
    tx.feePayer = userPublicKey

    // 트랜잭션을 직렬화하여 반환
    return {
      success: true,
      serializedTransaction: tx.serialize({ requireAllSignatures: false }).toString('base64')
    }
  } catch (error) {
    console.error('Error in createRecycleTokenTransaction:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }
  }
}

// 사용자 토큰 계정 조회
export async function getUserTokenAccounts(userAddress: string) {
  try {
    const userPubkey = new PublicKey(userAddress)
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      userPubkey,
      { programId: TOKEN_PROGRAM_ID }
    )

    // 모든 라벨 정보 가져오기
    const labelSystem = await getAllLabels()

    const tokenDetails = tokenAccounts.value.map((tokenAccount) => {
      const mintAddress = tokenAccount.account.data.parsed.info.mint
      const balance = tokenAccount.account.data.parsed.info.tokenAmount.uiAmount
      const label = labelSystem.getTokenLabel(mintAddress)

      return {
        mint: mintAddress,
        balance,
        description: label.description,
        multiplier: label.multiplier
      }
    })

    return tokenDetails
  } catch (error) {
    console.error('Error fetching user token accounts:', error)
    return []
  }
}

// 특정 사용자의 리사이클 히스토리 조회
export async function getUserRecycleHistory(userAddress: string) {
  try {
    const program = await getProgram()
    const userPubkey = new PublicKey(userAddress)
    
    const recycleAccounts = await program.account.recycleData.all([
      {
        memcmp: {
          offset: 8, // discriminator 이후
          bytes: userPubkey.toBase58()
        }
      }
    ])

    return recycleAccounts.map(account => ({
      user: account.account.user.toString(),
      tokenMint: account.account.tokenMint.toString(),
      tokenAmount: account.account.tokenAmount.toString(),
      solReceived: account.account.solReceived.toString(),
      pointsEarned: account.account.pointsEarned.toString(),
      timestamp: account.account.timestamp.toString()
    }))
  } catch (error) {
    console.error('Error fetching user recycle history:', error)
    return []
  }
} 

function getAddressType(address: string, numTypes: number = 4): number {
  let sum = 0;
  for (const char of address) {
    sum += char.charCodeAt(0);
  }
  
  const typeIndex = sum % numTypes;
  return typeIndex + 1;
}

function getTokenDescription(typeIndex: number): TokenDescription {
  switch (typeIndex) {
    case 1:
      return TokenDescription.RUG
    case 2:
      return TokenDescription.TRASH
    case 3:
      return TokenDescription.POOP
    case 4:
      return TokenDescription.GARBAGE
    default:
      return TokenDescription.TRASH
  }
}

export async function getAllLabels() {
  try {
    const program = await getProgram()
    const allLabels = await program.account.label.all()
    
    // 라벨 정보를 mint 주소를 키로 하는 맵으로 변환
    const labelMap = new Map(
      allLabels.map(label => [
        label.account.mint.toString(),
        {
          name: label.account.name,
          multiplier: label.account.multiplier.toString()
        }
      ])
    )

    return {
      getTokenLabel: (mintAddress: string) => {
        // 라벨이 있는 경우
        const label = labelMap.get(mintAddress)
        if (label) {
          return {
            description: label.name,
            multiplier: label.multiplier
          }
        }

        // 라벨이 없는 경우 주소 기반으로 타입 결정
        const typeIndex = getAddressType(mintAddress)
        return {
          description: getTokenDescription(typeIndex),
          multiplier: '1'
        }
      }
    }
  } catch (error) {
    console.error('Error fetching all labels:', error)
    return {
      getTokenLabel: (mintAddress: string) => ({
        description: getTokenDescription(getAddressType(mintAddress)),
        multiplier: '1'
      })
    }
  }
} 