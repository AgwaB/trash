// services/contract.ts
"use server"
import { Connection, SystemProgram, Transaction, PublicKey, TransactionMessage, VersionedTransaction, AddressLookupTableAccount, TransactionInstruction } from '@solana/web3.js'
import { Program, AnchorProvider, BN } from '@coral-xyz/anchor'
import { Trash } from './idl/trash'
import IDL from './idl/trash.json'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { getAssociatedTokenAddress } from '@solana/spl-token'
import { Wallet } from '@coral-xyz/anchor'
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

export async function getLabelPDA(mint: PublicKey): Promise<PublicKey> {
  const [pda] = await PublicKey.findProgramAddressSync(
    [Buffer.from(SEEDS.LABEL), mint.toBuffer()],
    PROGRAM_ID
  )
  return pda
}

export async function getUserStatsPDA(user: PublicKey): Promise<PublicKey> {
  const [pda] = await PublicKey.findProgramAddressSync(
    [Buffer.from(SEEDS.USER_STATS), user.toBuffer()],
    PROGRAM_ID
  )
  return pda
}

export async function getRecycleDataPDA(user: PublicKey, mint: PublicKey): Promise<PublicKey> {
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
        solReceived: account.account.solReceived.toString(),
        pointsEarned: account.account.pointsEarned.toString(),
        timestamp: account.account.timestamp.toString()
      }))
    
    return sortedRecycles
  } catch (error) {
    console.error('Error fetching recent recycles:', error)
    return []
  }
}

// userStats 초기화 함수 추가
async function initializeUserStats(userPubkey: PublicKey, program: Program<Trash>) {
  const [userStatsPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from(SEEDS.USER_STATS), userPubkey.toBuffer()],
    PROGRAM_ID
  );

  try {
    const initIx = await program.methods
      .initUserStats()
      .accounts({
        user: userPubkey,
        userStats: userStatsPDA,
        systemProgram: SystemProgram.programId,
      } as any)
      .instruction();
    
    return initIx;
  } catch (e) {
    console.error("Error creating initUserStats instruction:", e);
    return null;
  }
}

interface RecycleTokenInput {
  mint: string;
  amount: string;
}

async function prepareRecycleAccounts(
  userPubkey: PublicKey,
  recycleList: RecycleTokenInput[],
  program: Program<Trash>
) {
  // 1. 모든 필요한 PDA 계정들 한번에 생성
  const [userStatsPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from(SEEDS.USER_STATS), userPubkey.toBuffer()],
    PROGRAM_ID
  );

  const [vaultPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from(SEEDS.VAULT)],
    PROGRAM_ID
  );

  const [programWsolAccount] = PublicKey.findProgramAddressSync(
    [Buffer.from("WSOL")],
    PROGRAM_ID
  );

  const [programAuthority] = PublicKey.findProgramAddressSync(
    [Buffer.from("AUTHORITY")],
    PROGRAM_ID
  );

  // 2. userStats 초기화 확인
  let initIx = null;
  try {
    await program.account.userStats.fetch(userStatsPDA);
  } catch (e) {
    initIx = await initializeUserStats(userPubkey, program);
  }

  // 3. 각 토큰별 라벨 정보 준비
  const tokenAccounts = await Promise.all(recycleList.map(async ({ mint }) => {
    const mintPubkey = new PublicKey(mint);
    const [labelPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from(SEEDS.LABEL), mintPubkey.toBuffer()],
      PROGRAM_ID
    );

    let labelAccount;
    try {
      const labelInfo = await program.account.label.fetch(labelPDA);
      labelAccount = labelInfo && labelInfo.name !== '' ? labelPDA : PROGRAM_ID;
    } catch (e) {
      labelAccount = PROGRAM_ID;
    }

    return { 
      mintPubkey, 
      labelAccount,
    };
  }));

  return { 
    userStatsPDA, 
    vaultPDA,
    programWsolAccount,
    programAuthority,
    initIx, 
    tokenAccounts 
  };
}

async function getJupiterInstructions(recycleList: RecycleTokenInput[], userAddress: string) {
  const NATIVE_MINT = "So11111111111111111111111111111111111111112";
  const [programWsolAccount] = PublicKey.findProgramAddressSync(
    [Buffer.from("WSOL")],
    PROGRAM_ID
  );

  // 모든 토큰에 대해 병렬로 Jupiter API 호출
  const jupiterResults = await Promise.all(recycleList.map(async ({ mint, amount }) => {
    // Quote 가져오기
    const quoteResponse = await (
      await fetch(
        `https://quote-api.jup.ag/v6/quote?` + new URLSearchParams({
          inputMint: mint,
          outputMint: NATIVE_MINT,
          amount: amount,
          dynamicSlippage: "true",
          onlyDirectRoutes: "true",
          swapMode: "ExactIn",
          asLegacyTransaction: "false",
          maxAccounts: "8",
        })
      )
    ).json();

    if (!quoteResponse || quoteResponse.error) {
      throw new Error(`Failed to get quote for token ${mint}: ${quoteResponse?.error || 'Unknown error'}`);
    }

    // Swap Instructions 가져오기
    const swapResult = await (
      await fetch('https://quote-api.jup.ag/v6/swap-instructions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quoteResponse,
          userPublicKey: userAddress,
          destinationTokenAccount: programWsolAccount.toString(),
          useSharedAccounts: true,
          wrapUnwrapSOL: true,
          dynamicComputeUnitLimit: true,
          prioritizationFeeLamports: {
            priorityLevelWithMaxLamports: {
              maxLamports: 500000,
              global: false,
              priorityLevel: "veryHigh"
            }
          },
          dynamicSlippage: { maxBps: 1000 }
        })
      })
    ).json();

    if (!swapResult.swapInstruction || !swapResult.addressLookupTableAddresses) {
      throw new Error(`Invalid swap instruction for token ${mint}`);
    }

    return { mint, swapResult };
  }));

  return jupiterResults;
}

export async function createRecycleTokenTransaction(
  userAddress: string,
  recycleList: RecycleTokenInput[]
): Promise<{ success: boolean; serializedTransaction?: string; error?: string }> {
  try {
    const userPubkey = new PublicKey(userAddress);
    const connection = new Connection(RPC_ENDPOINT);
    const program = await getProgram();
    const timestamp = new BN(Math.floor(Date.now() / 1000));

    // 1. 모든 계정 정보 미리 준비
    const { 
      userStatsPDA, 
      vaultPDA,
      programWsolAccount,
      programAuthority,
      initIx, 
      tokenAccounts 
    } = await prepareRecycleAccounts(
      userPubkey,
      recycleList,
      program
    );

    const recycleDataPDA = PublicKey.findProgramAddressSync(
      [
        Buffer.from(SEEDS.RECYCLE_DATA),
        userPubkey.toBuffer(),
        timestamp.toArrayLike(Buffer, 'le', 8)
      ],
      PROGRAM_ID
    )[0];

    // 2. Jupiter API 호출
    const jupiterResults = await getJupiterInstructions(recycleList, userAddress);

    // 3. Instructions 생성
    let instructions = initIx ? [initIx] : [];

    for (let i = 0; i < recycleList.length; i++) {
      const { mintPubkey, labelAccount } = tokenAccounts[i];
      const { swapResult } = jupiterResults[i];
      const { swapInstruction } = swapResult;

      const swapIx = new TransactionInstruction({
        programId: new PublicKey(swapInstruction.programId),
        keys: swapInstruction.accounts.map((key: any) => ({
          pubkey: new PublicKey(key.pubkey),
          isSigner: key.isSigner,
          isWritable: key.isWritable,
        })),
        data: Buffer.from(swapInstruction.data, "base64"),
      });

      const recycleTokenIx = await program.methods
        .recycleToken(timestamp, swapIx.data)
        .accounts({
          programAuthority,
          programWsolAccount,
          user: userPubkey,
          userStats: userStatsPDA,
          tokenMint: mintPubkey,
          solMint: new PublicKey("So11111111111111111111111111111111111111112"),
          vault: vaultPDA,
          label: labelAccount,
          recycleData: recycleDataPDA,
          jupiterProgram: new PublicKey("JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4"),
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId
        } as any)
        .remainingAccounts(swapInstruction.accounts.map((account: any) => ({
          pubkey: new PublicKey(account.pubkey),
          isSigner: account.isSigner,
          isWritable: account.isWritable
        })))
        .instruction();

      instructions.push(recycleTokenIx);
    }

    // 4. 트랜잭션 구성
    const lastJupiterResult = jupiterResults[jupiterResults.length - 1];
    const addressLookupTableAccounts = await Promise.all(
      lastJupiterResult.swapResult.addressLookupTableAddresses.map(async (address: string) => {
        const accountInfo = await connection.getAccountInfo(new PublicKey(address));
        if (!accountInfo) return null;
        return new AddressLookupTableAccount({
          key: new PublicKey(address),
          state: AddressLookupTableAccount.deserialize(accountInfo.data),
        });
      })
    ).then(accounts => accounts.filter((account): account is AddressLookupTableAccount => account !== null));

    const { blockhash } = await connection.getLatestBlockhash();

    const messageV0 = new TransactionMessage({
      payerKey: userPubkey,
      recentBlockhash: blockhash,
      instructions,
    }).compileToV0Message(addressLookupTableAccounts);

    const transaction = new VersionedTransaction(messageV0);

    return {
      success: true,
      serializedTransaction: Buffer.from(transaction.serialize()).toString('base64')
    };

  } catch (error: any) {
    console.error("Error in createRecycleTokenTransaction:", error);
    return {
      success: false,
      error: error.message || 'Unknown error'
    };
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

    const labelSystem = await getAllLabels()

    const tokenDetails = tokenAccounts.value.map((tokenAccount) => {
      const mintAddress = tokenAccount.account.data.parsed.info.mint
      const balance = tokenAccount.account.data.parsed.info.tokenAmount.uiAmount
      const label = labelSystem[mintAddress]

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
      solReceived: account.account.solReceived.toString(),
      pointsEarned: account.account.pointsEarned.toString(),
      timestamp: account.account.timestamp.toString()
    }))
  } catch (error) {
    console.error('Error fetching user recycle history:', error)
    return []
  }
} 

export async function getAllLabels() {
  try {
    const program = await getProgram()
    const labelAccounts = await program.account.label.all()
    
    return Object.fromEntries(
      labelAccounts.map(account => {
        const label = account.account
        return [
          label.mint.toString(),
          {
            description: label.name,
            multiplier: label.multiplier
          }
        ]
      })
    )
  } catch (error) {
    console.error('Error fetching labels:', error)
    return {}
  }
}