import { web3 } from "@coral-xyz/anchor";
import { ProgramSetup } from '../config/program';
import { Instructions } from '../config/instructions';
import { PDA } from '../config/pda';
import { PublicKey } from "@solana/web3.js";
import { RPC_URL_MAINNET } from "../config";
import sendTransactions from "../config/sendTransaction";

async function updateLabel(
  mint: PublicKey,
  name: string,
  multiplier: number
) {
  console.log('Update label...');
  
  const setup = new ProgramSetup(RPC_URL_MAINNET, 'mainnet-keypair.json');
  const program = setup.program;
  const provider = setup.getProvider();
  const connection = setup.getConnection();
  
  const instructions = new Instructions(program);
  const txInstructions: web3.TransactionInstruction[] = [];
  const pda = new PDA(program, provider.wallet.publicKey)

  const authority = provider.wallet.publicKey;
  const adminPDA = await pda.getAdminPDA();
  const labelPDA = await pda.getLabelPDA(mint, true);

  txInstructions.push(
    await instructions.createUpdateLabelInstruction(
      authority,
      mint,
      adminPDA,
      labelPDA,
      {
        name: name,
        multiplier: multiplier
      }
    )
  )
  
  try {
    await sendTransactions(provider, connection, txInstructions);
  } catch (error) {
    console.error('Error:', error);
  }
}

export default updateLabel;