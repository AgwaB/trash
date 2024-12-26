import { web3 } from "@coral-xyz/anchor";
import { ProgramSetup } from '../config/program';
import { Instructions } from '../config/instructions';
import { PDA } from '../config/pda';
import { PublicKey } from "@solana/web3.js";
import { RPC_URL_MAINNET } from "../config";
import sendTransactions from "../config/sendTransaction";

async function updateAdmin(newAuthority: PublicKey) {
  console.log('Update admin...');

  const setup = new ProgramSetup(RPC_URL_MAINNET, 'mainnet-keypair.json');
  const program = setup.program;
  const provider = setup.getProvider();
  const connection = setup.getConnection();
  
  const instructions = new Instructions(program);
  const txInstructions: web3.TransactionInstruction[] = [];
  const pda = new PDA(program, provider.wallet.publicKey)

  const authority = provider.wallet.publicKey;
  const adminPDA = await pda.getAdminPDA();

  txInstructions.push(
    await instructions.createUpdateAdminInstruction(
      authority,
      adminPDA,
      {newAuthority}
    )
  )
  
  try {
    await sendTransactions(provider, connection, txInstructions);
  } catch (error) {
    console.error('Error:', error);
  }
}

export default updateAdmin;