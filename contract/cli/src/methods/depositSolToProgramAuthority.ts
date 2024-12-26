import { web3 } from "@coral-xyz/anchor";
import { ProgramSetup } from '../config/program';
import { PDA } from '../config/pda';
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { RPC_URL_MAINNET } from "../config";
import sendTransactions from "../config/sendTransaction";

async function depositSolToProgramAuthority() {
  const setup = new ProgramSetup(RPC_URL_MAINNET, 'mainnet-keypair.json');
  const program = setup.program;
  const provider = setup.getProvider();
  const connection = setup.getConnection();
  
  const txInstructions: web3.TransactionInstruction[] = [];
  const pda = new PDA(program, provider.wallet.publicKey)
  
  const programAuthorityPDA = await pda.getProgramAuthorityPDA();

  txInstructions.push(
    web3.SystemProgram.transfer({
      fromPubkey: provider.wallet.publicKey,
      toPubkey: programAuthorityPDA,
      lamports: LAMPORTS_PER_SOL * 0.1 // 0.1 SOL
    })
  );
  
  try {
    await sendTransactions(provider, connection, txInstructions);
  } catch (error) {
    console.error('Error:', error);
  }
}

export default depositSolToProgramAuthority;