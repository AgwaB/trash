"use server"
import { Connection, PublicKey, SystemProgram } from '@solana/web3.js'
import { Program, AnchorProvider, BN } from '@coral-xyz/anchor'
import { Trash } from './idl/trash'
import IDL from './idl/trash.json'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { getAssociatedTokenAddress } from '@solana/spl-token'
import { Wallet } from '@coral-xyz/anchor'

const PROGRAM_ID = new PublicKey('969z78CgL3ssgVBA9KSq6uQhojiMit6dewMwRoH7FPz4')
const RPC_ENDPOINT = 'https://api.devnet.solana.com' // process.env.NEXT_PUBLIC_RPC_ENDPOINT! // TODO: 환경변수 설정

const ADMIN_SEED = 'ADMIN'
const VAULT_SEED = 'VAULT'
const LABEL_SEED = 'LABEL'
const USER_STATS_SEED = 'USER_STATS'
const RECYCLE_DATA_SEED = 'RECYCLE_DATA'

const connection = new Connection(RPC_ENDPOINT)

function getProgram(wallet?: Wallet) {
  const provider = new AnchorProvider(
    connection,
    wallet || {} as any, // wallet이 없으면 read-only
    { commitment: 'confirmed' }
  )
  return new Program<Trash>(IDL as Trash, provider)
}

// PDA 주소 가져오기 함수들
export async function getAdminPDA(): Promise<PublicKey> {
  const [pda] = await PublicKey.findProgramAddressSync(
    [Buffer.from(ADMIN_SEED)],
    PROGRAM_ID
  )
  return pda
}

export async function getVaultPDA(): Promise<PublicKey> {
  const [pda] = await PublicKey.findProgramAddressSync(
    [Buffer.from(VAULT_SEED)],
    PROGRAM_ID
  )
  return pda
}

export async function getLabelPDA(mint: PublicKey): Promise<PublicKey> {
  const [pda] = await PublicKey.findProgramAddressSync(
    [Buffer.from(LABEL_SEED), mint.toBuffer()],
    PROGRAM_ID
  )
  return pda
}

export async function getUserStatsPDA(user: PublicKey): Promise<PublicKey> {
  const [pda] = await PublicKey.findProgramAddressSync(
    [Buffer.from(USER_STATS_SEED), user.toBuffer()],
    PROGRAM_ID
  )
  return pda
}

export async function getRecycleDataPDA(user: PublicKey, mint: PublicKey): Promise<PublicKey> {
  const [pda] = await PublicKey.findProgramAddressSync(
    [Buffer.from(RECYCLE_DATA_SEED), user.toBuffer(), mint.toBuffer()],
    PROGRAM_ID
  )
  return pda
}

// 컨트랙트 데이터 조회 함수들
export async function fetchUserStats(userAddress: string) {
  try {
    const userPubkey = new PublicKey(userAddress)
    const userStatsPDA = await getUserStatsPDA(userPubkey)
    
    const program = getProgram()
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
    
    const program = getProgram()
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
    
    const program = getProgram()
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
    const program = getProgram()
    
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

// 토큰 리사이클 함수
export async function recycleToken(
  wallet: Wallet,
  mintAddress: string, 
  amount: number
) {
  try {
    const mintPubkey = new PublicKey(mintAddress)
    const program = getProgram(wallet)
    
    // PDA 계정들 생성
    const [labelPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from(LABEL_SEED), mintPubkey.toBuffer()],
      PROGRAM_ID
    )

    const [vaultPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from(VAULT_SEED)],
      PROGRAM_ID
    )

    const [userStatsPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from(USER_STATS_SEED), wallet.publicKey.toBuffer()],
      PROGRAM_ID
    )

    // 사용자의 토큰 계정 주소
    const userATA = await getAssociatedTokenAddress(
      mintPubkey,
      wallet.publicKey
    )

    // Vault의 토큰 계정 주소
    const [treasuryTokenAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("TREASURY"), mintPubkey.toBuffer()],
      PROGRAM_ID
    )

    let userStatsInfo
    try {
      userStatsInfo = await program.account.userStats.fetch(userStatsPDA)
    } catch {
      userStatsInfo = {
        recycleCount: new BN(0)
      }
    }

    const [recycleDataPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from(RECYCLE_DATA_SEED),
        wallet.publicKey.toBuffer(),
        userStatsInfo.recycleCount.toArrayLike(Buffer, 'le', 8)
      ],
      PROGRAM_ID
    )

    const tx = await program.methods
      .recycleToken(new BN(amount))
      .accounts({
        user: wallet.publicKey,
        userStats: userStatsPDA,
        mint: mintPubkey,
        userTokenAccount: userATA,
        vault: vaultPDA,
        vaultTokenAccount: treasuryTokenAccount,
        label: labelPDA,
        recycleData: recycleDataPDA,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      } as any)
      .rpc()

    return {
      success: true,
      signature: tx
    }
  } catch (error) {
    console.error('Error in recycleToken:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }
  }
}

// 사용자의 토큰 계정 조회
export async function getUserTokenAccounts(userAddress: string) {
  try {
    const userPubkey = new PublicKey(userAddress)
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      userPubkey,
      { programId: TOKEN_PROGRAM_ID }
    )

    const tokenDetails = await Promise.all(
      tokenAccounts.value.map(async (tokenAccount) => {
        const mintAddress = tokenAccount.account.data.parsed.info.mint
        const balance = tokenAccount.account.data.parsed.info.tokenAmount.uiAmount
        const label = await fetchTokenLabel(mintAddress)

        return {
          mint: mintAddress,
          balance,
          label
        }
      })
    )

    return tokenDetails
  } catch (error) {
    console.error('Error fetching user token accounts:', error)
    return []  // 빈 배열 반환
  }
}

// 특정 사용자의 리사이클 히스토리 조회
export async function getUserRecycleHistory(userAddress: string) {
  try {
    const program = getProgram()
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