import { web3 } from "@coral-xyz/anchor";
import { ProgramSetup } from '../config/program';
import { Instructions } from '../config/instructions';
import { PDA } from '../config/pda';
import { RPC_URL_MAINNET } from "../config";
import sendTransactions from "../config/sendTransaction";

async function initUserStats() {
  console.log('Init user stats...');
  
  const setup = new ProgramSetup(RPC_URL_MAINNET, 'mainnet-keypair.json');
  const program = setup.program;
  const provider = setup.getProvider();
  const connection = setup.getConnection();
  
  const instructions = new Instructions(program);
  const txInstructions: web3.TransactionInstruction[] = [];
  const pda = new PDA(program, provider.wallet.publicKey)

  const user = provider.wallet.publicKey;
  const userStatsPDA = await pda.getUserStatsPDA(user)

  try {
    await program.account.userStats.fetch(userStatsPDA)
    console.log("User stats already initialized")
  } catch (error) {
    txInstructions.push(
      await instructions.createInitUserStatsInstruction(
        user,
        userStatsPDA
      )
    )
  }
  
  try {
    await sendTransactions(provider, connection, txInstructions);
  } catch (error) {
    console.error('Error:', error);
  }
}

export default initUserStats;