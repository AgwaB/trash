import { web3 } from "@coral-xyz/anchor";
import { ProgramSetup } from '../config/program';
import { PDA } from '../config/pda';
import { Instructions } from '../config/instructions';
import { RPC_URL_MAINNET } from "../config";
import sendTransactions from "../config/sendTransaction";

async function initialize() {
  console.log('Initializing program...');
  
  const setup = new ProgramSetup(RPC_URL_MAINNET, 'mainnet-keypair.json');
  const program = setup.program;
  const provider = setup.getProvider();
  const connection = setup.getConnection();
  
  const instructions = new Instructions(program);
  const txInstructions: web3.TransactionInstruction[] = [];
  const pda = new PDA(program, provider.wallet.publicKey)

  const signer = provider.wallet.publicKey;
  const adminPDA = await pda.getAdminPDA();
  const vaultPDA = await pda.getVaultPDA();

  txInstructions.push(
    await instructions.createInitializeInstruction(
      signer,
      adminPDA,
      vaultPDA
    )
  )
  
  try {
    await sendTransactions(provider, connection, txInstructions);
  } catch (error) {
    console.error('Error:', error);
  }
}

export default initialize;