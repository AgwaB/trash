import { AnchorProvider, web3 } from "@coral-xyz/anchor";
import { ComputeBudgetProgram } from "@solana/web3.js";

async function sendTransactions(
  provider: AnchorProvider,
  connection: web3.Connection,
  txInstructions: web3.TransactionInstruction[])
{
  const tx = new web3.Transaction();
  tx.add(...txInstructions);

  const latestBlockhash = await connection.getLatestBlockhash();
  tx.recentBlockhash = latestBlockhash.blockhash;
  tx.feePayer = provider.wallet.publicKey;

  const signedTx = await provider.wallet.signTransaction(tx);

  const signature = await connection.sendRawTransaction(
    signedTx.serialize()
  );

  await connection.confirmTransaction({
    signature,
    ...latestBlockhash
  }, 'confirmed');
  
  console.log('Transaction Signature:', signature);
}

export default sendTransactions;