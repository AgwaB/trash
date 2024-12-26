import { web3 } from "@coral-xyz/anchor";
import { ComputeBudgetProgram, PublicKey, TransactionMessage, VersionedTransaction } from "@solana/web3.js";
import { ProgramSetup } from '../config/program';
import { Instructions } from '../config/instructions';
import { PDA } from '../config/pda';
import { getAdressLookupTableAccounts } from '../utils/helper';
import { RPC_URL_MAINNET, RPC_URL_QUICK_NODE } from "../config";
import sendTransactions from "../config/sendTransaction";
import sendVersionedTransactions from "../config/sendVersionedTransaction";
import { getAssociatedTokenAddress } from "@solana/spl-token";

async function recycleTokenV2(
  tokenMint: PublicKey,
  tokenAmount: number,
  timestamp: number
) {
  console.log('Recycle token v2...');
  console.log('Token mint:', tokenMint.toBase58());
  console.log('Token amount:', tokenAmount);
  console.log('Timestamp:', timestamp);
  
  const setup = new ProgramSetup(RPC_URL_MAINNET, 'mainnet-keypair.json');
  const program = setup.program;
  const provider = setup.getProvider();
  const connection = setup.getConnection();

  const instruction = new Instructions(program);
  const txInstructions: web3.TransactionInstruction[] = [];
  const pda = new PDA(program, provider.wallet.publicKey)

  // For Fetching User Stats
  const user = provider.wallet.publicKey;
  const userStatsPDA = await pda.getUserStatsPDA(user);
  
  // For Create Recycle Proposal
  const recycleProposalPDA = await pda.getRecycleProposalPDA(user, tokenMint, timestamp);
  
  // For Execute Recycle Proposal
  const vaultPDA = await pda.getVaultPDA(); 
  const labelPDA = await pda.getLabelPDA(tokenMint, false);

  try {
    await program.account.userStats.fetch(userStatsPDA);
    console.log("UserStats already initialized")
  } catch (error) {
    txInstructions.push(
      await instruction.createInitUserStatsInstruction(
        user,
        userStatsPDA
      )
    )
  }

  console.log("Adding Create Proposal instruction");
  txInstructions.push(
    await instruction.createCreateRecycleProposalInstruction(
      user,
      tokenMint,
      recycleProposalPDA,
      {tokenAmount, timestamp}
    )
  )

  const jupiterSwap = await instruction.createJupiterSwapInstruction(
    user,
    tokenMint,
    {tokenAmount}
  )
  
  console.log("Jupiter instructions count:", jupiterSwap.ixs.length);
  txInstructions.push(
    ...jupiterSwap.ixs
  )

  console.log("Adding Execute Proposal instruction");
  txInstructions.push(
    await instruction.createExecuteRecycleProposalInstruction(
      user,
      userStatsPDA,
      tokenMint,
      recycleProposalPDA,
      vaultPDA,
      labelPDA,
      {timestamp}
    )
  )

  // try {
  //   await sendTransactions(provider, connection, txInstructions);
  // } catch (error) {
  //   console.error('Error:', error);
  // }

  try {
    await sendVersionedTransactions(setup, jupiterSwap.addressLookupTableAddresses, txInstructions);
  } catch (error) {
    console.error('Error:', error);
  }
}

export default recycleTokenV2;