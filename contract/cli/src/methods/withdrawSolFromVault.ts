import { web3 } from "@coral-xyz/anchor";
import { ProgramSetup } from '../config/program';
import { PDA } from '../config/pda';
import { Instructions } from '../config/instructions';
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { RPC_URL_MAINNET } from "../config";
import sendTransactions from "../config/sendTransaction";

async function withdrawSolFromVault() {
  console.log('Withdraw sol from vault...');

  const setup = new ProgramSetup(RPC_URL_MAINNET, 'mainnet-keypair.json');
  const program = setup.program;
  const provider = setup.getProvider();
  const connection = setup.getConnection();
  
  const instruction = new Instructions(program);
  const txInstructions: web3.TransactionInstruction[] = [];
  const pda = new PDA(program, provider.wallet.publicKey)

  const authority = provider.wallet.publicKey;
  const adminPDA = await pda.getAdminPDA();
  const vaultPDA = await pda.getVaultPDA();

  txInstructions.push(
    await instruction.createWithdrawSolFromVaultInstruction(
      authority,
      provider.wallet.publicKey,
      adminPDA,
      vaultPDA,
      { amount: LAMPORTS_PER_SOL * 0.000000002 } // 0.1 SOL
    )
  )
  
  try {
    await sendTransactions(provider, connection, txInstructions);
  } catch (error) {
    console.error('Error:', error);
  }
}

export default withdrawSolFromVault;