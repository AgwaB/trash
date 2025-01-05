// services/contract.ts
"use server"
import { Connection, SystemProgram, PublicKey, TransactionMessage, VersionedTransaction, AddressLookupTableAccount, TransactionInstruction, ComputeBudgetProgram } from '@solana/web3.js'
import { Program, AnchorProvider, BN } from '@coral-xyz/anchor'
import { Trash } from './idl/trash'
import IDL from './idl/trash.json'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { Wallet } from '@coral-xyz/anchor'
import { PROGRAM_ID, RPC_ENDPOINT, SEEDS } from '@/config'
import { RecycleErrorCode, RecycleError } from '@/types/error'

const connection = new Connection(RPC_ENDPOINT)

async function getProgram(wallet?: Wallet) {
  const provider = new AnchorProvider(
    connection,
    wallet || {} as any,
    { commitment: 'confirmed' }
  )
  return new Program<Trash>(IDL as Trash, provider)
}

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

export async function fetchRecentRecycles(limit: number = 10) {
  try {
    const program = await getProgram()
    
    const recycleAccounts = await program.account.recycleProposal.all()
    const sortedRecycles = recycleAccounts
      .sort((a, b) => b.account.executedAt.sub(a.account.executedAt).toNumber())
      .slice(0, limit)
      .map(account => ({
        user: account.account.user.toString(),
        tokenMint: account.account.tokenMint.toString(),
        tokenAmount: account.account.tokenAmount.toString(),
        solReceived: account.account.solReceived.toString(),
        pointsEarned: account.account.pointsEarned.toString(),
        timestamp: account.account.executedAt.toString()
      }))
    
    return sortedRecycles
  } catch (error) {
    console.error('Error fetching recent recycles:', error)
    return []
  }
}

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
  timestamp: BN,
  recycleList: RecycleTokenInput[],
  program: Program<Trash>
) {
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

  const [userWsolAccountPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("USER_WSOL"), userPubkey.toBuffer()],
    PROGRAM_ID
  );

  const recycleProposals = await Promise.all(
    recycleList.map(async ({ mint }) => {
      const mintPubkey = new PublicKey(mint);
      const [recycleProposalPDA] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("RECYCLE_PROPOSAL"),
          userPubkey.toBuffer(),
          mintPubkey.toBuffer(),
          timestamp.toArrayLike(Buffer, 'le', 8)
        ],
        PROGRAM_ID
      );

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
        recycleProposalPDA,
        labelAccount,
      };
    })
  );

  let initIx = null;
  try {
    await program.account.userStats.fetch(userStatsPDA);
  } catch (e) {
    initIx = await initializeUserStats(userPubkey, program);
  }
  console.log(`userStatsPDA: ${userStatsPDA.toString()}`)
  console.log(`vaultPDA: ${vaultPDA.toString()}`)
  console.log(`programWsolAccount: ${programWsolAccount.toString()}`)
  console.log(`programAuthority: ${programAuthority.toString()}`)
  console.log(`userWsolAccountPDA: ${userWsolAccountPDA.toString()}`)

  return {
    userStatsPDA,
    vaultPDA,
    programWsolAccount,
    programAuthority,
    recycleProposals,
    userWsolAccountPDA,
    initIx
  };
}

async function getJupiterInstructions(
  recycleList: RecycleTokenInput[], 
  userAddress: string,
  userWsolAccountPDA: PublicKey
) {
  const NATIVE_MINT = "So11111111111111111111111111111111111111112";

  const jupiterResults = await Promise.all(recycleList.map(async ({ mint, amount }) => {
    try {
      const quoteResponse = await (
        await fetch(
          `https://quote-api.jup.ag/v6/quote?` + new URLSearchParams({
            inputMint: mint,
            outputMint: NATIVE_MINT,
            amount: amount,
            dynamicSlippage: "true",
            onlyDirectRoutes: "false",
            swapMode: "ExactIn",
            swapType: "aggregator",
            asLegacyTransaction: "false",
            maxAccounts: "64",
          })
        )
      ).json();

      if (quoteResponse.error) {
        throw new RecycleError(
          RecycleErrorCode.INVALID_QUOTE,
          `Failed to get quote for token ${mint}: ${quoteResponse.error}`
        );
      }

      quoteResponse.swapType = "aggregator"

      const swapResult = await (
        await fetch('https://quote-api.jup.ag/v6/swap-instructions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            quoteResponse,
            userPublicKey: userAddress,
            wrapUnwrapSOL: true,
            dynamicComputeUnitLimit: true,
            // computeUnitPriceMicroLamports: 50000000,
            // allowOptimizedWrappedSolTokenAccount: true,
            asLegacyTransaction: false,
            correctLastValidBlockHeight: true,
            prioritizationFeeLamports: {
              autoMultiplier: 2
            },
            dynamicSlippage: { maxBps: 500 }
          })
        })
      ).json();

      if (swapResult.error) {
        if (swapResult.errorCode === 'NOT_SUPPORTED') {
          throw new RecycleError(
            RecycleErrorCode.NOT_SUPPORTED,
            'This token cannot be recycled using simple AMMs'
          );
        }
        throw new RecycleError(
          RecycleErrorCode.INVALID_SWAP,
          `Failed to get swap instructions: ${swapResult.error}`
        );
      }

      if (swapResult.simulationError) {
        throw new RecycleError(
          RecycleErrorCode.INVALID_SWAP,
          `Failed to simulate swap in jupiter: ${swapResult.simulationError.error}`
        );
      }

      if (!swapResult.setupInstructions || !swapResult.swapInstruction || !swapResult.addressLookupTableAddresses) {
        throw new RecycleError(
          RecycleErrorCode.INVALID_SWAP,
          `Invalid swap instruction for token ${mint}`
        );
      }

      return { mint, swapResult };
    } catch (error: unknown) {
      if (error instanceof RecycleError) {
        throw error;
      }
      
      if (error instanceof Error) {
        throw new RecycleError(
          RecycleErrorCode.UNKNOWN,
          error.message
        );
      }
      
      throw new RecycleError(
        RecycleErrorCode.UNKNOWN,
        'Unknown error occurred'
      );
    }
  }));

  return jupiterResults;
}

export async function createRecycleTokenTransaction(
  userAddress: string,
  recycleList: RecycleTokenInput[]
): Promise<{ 
  success: boolean; 
  serializedTransaction?: string; 
  error?: string;
  code?: RecycleErrorCode; 
}> {
  try {
    const userPubkey = new PublicKey(userAddress);
    const connection = new Connection(RPC_ENDPOINT);
    const program = await getProgram();
    const timestamp = new BN(Math.floor(Date.now() / 1000));

    const accounts = await prepareRecycleAccounts(
      userPubkey,
      timestamp,
      recycleList,
      program
    );

    let instructions = accounts.initIx ? [accounts.initIx] : [];
    let jupiterResults = [];
    let allLookupTableAddresses = new Set<string>();

    const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({ 
      units: 1_400_000
    });
    instructions.push(modifyComputeUnits);

    for (let i = 0; i < recycleList.length; i++) {
      const { mint, amount } = recycleList[i];
      const {
        mintPubkey,
        recycleProposalPDA,
        labelAccount
      } = accounts.recycleProposals[i];

      // Create Proposal Instruction
      const createProposalIx = await program.methods
        .createRecycleProposal(
          new BN(amount),
          timestamp
        )
        .accounts({
          user: userPubkey,
          tokenMint: mintPubkey,
          recycleProposal: recycleProposalPDA,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        } as any)
        .instruction();

      instructions.push(createProposalIx);

      const jupiterResult = await getJupiterInstructions(
        [{ mint, amount }], 
        userAddress,
        accounts.userWsolAccountPDA
      );
      jupiterResults.push(jupiterResult[0]);

      jupiterResult[0].swapResult.addressLookupTableAddresses.forEach((address: string) => {
        allLookupTableAddresses.add(address);
      });

      const { swapInstruction, setupInstructions } = jupiterResult[0].swapResult;

      setupInstructions.forEach((setupInstruction: any) => {
        const setupIx = new TransactionInstruction({
          programId: new PublicKey(setupInstruction.programId),
          keys: setupInstruction.accounts.map((key: any) => ({
            pubkey: new PublicKey(key.pubkey),
            isSigner: key.isSigner,
            isWritable: key.isWritable,
          })),
          data: Buffer.from(setupInstruction.data, "base64"),
        });
        instructions.push(setupIx);
      })
      
      

      const swapIx = new TransactionInstruction({
        programId: new PublicKey(swapInstruction.programId),
        keys: swapInstruction.accounts.map((key: any) => ({
          pubkey: new PublicKey(key.pubkey),
          isSigner: key.isSigner,
          isWritable: key.isWritable,
        })),
        data: Buffer.from(swapInstruction.data, "base64"),
      });

      instructions.push(swapIx);

      const executeProposalIx = await program.methods
        .executeRecycleProposal(timestamp)
        .accounts({
          user: userPubkey,
          userStats: accounts.userStatsPDA,
          tokenMint: mintPubkey,
          recycleProposal: recycleProposalPDA,
          vault: accounts.vaultPDA,
          label: labelAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        } as any)
        .instruction();

      instructions.push(executeProposalIx);
    }

    const addressLookupTableAccounts = await Promise.all(
      Array.from(allLookupTableAddresses).map(async (address: string) => {
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

  } catch (error: unknown) {
    console.error("Error in createRecycleTokenTransaction:", error);
    
    if (error instanceof RecycleError) {
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: false,
      error: 'Unknown error occurred'
    };
  }
}

export async function getUserRecycleHistory(userAddress: string) {
  try {
    const program = await getProgram()
    const userPubkey = new PublicKey(userAddress)
    
    const recycleAccounts = await program.account.recycleProposal.all([
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
      timestamp: account.account.executedAt.toString()
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
    
    console.log(`labelAccounts: ${JSON.stringify(labelAccounts)}`)
    return Object.fromEntries(
      labelAccounts.map(account => {
        const label = account.account
        return [
          label.mint.toString(),
          {
            description: label.name,
            multiplier: label.multiplier.toString()
          }
        ]
      })
    )
  } catch (error) {
    console.error('Error fetching labels:', error)
    return {}
  }
}