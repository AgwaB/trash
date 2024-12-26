import { web3 } from "@coral-xyz/anchor";
import { getAdressLookupTableAccounts } from "../utils/helper";
import { ComputeBudgetProgram, VersionedTransaction } from "@solana/web3.js";
import { ProgramSetup } from "./program";

async function sendVersionedTransactions(
  setup: ProgramSetup,
  addressLookupTable: string[],
  txInstructions: web3.TransactionInstruction[]
) {
  const provider = setup.getProvider();
  const connection = setup.getConnection();
  const payer = setup.getPayer();

  const latestBlockhash = await connection.getLatestBlockhash();
  const addressLookupTableAccounts = await getAdressLookupTableAccounts(
    connection,
    addressLookupTable
  )

  // // Fee 우선순위 및 Compute unit 한도를 높이는 instruction
  // const priorityFeeIx = ComputeBudgetProgram.setComputeUnitPrice({
  //   microLamports: 20_000  // 20,000 microlamports
  // });
  // const computeUnitIx = ComputeBudgetProgram.setComputeUnitLimit({
  //     units: 1_400_000
  // });
  // txInstructions.unshift(priorityFeeIx, computeUnitIx);

  const messageV0 = new web3.TransactionMessage({
    payerKey: payer.publicKey,
    recentBlockhash: latestBlockhash.blockhash,
    instructions: txInstructions,
  }).compileToV0Message(addressLookupTableAccounts);

  const transaction = new VersionedTransaction(messageV0);

  const signature = await provider.sendAndConfirm(transaction, [payer], {
    skipPreflight: true,
    maxRetries: 3,
    commitment: 'processed'
  })

  console.log('Transaction Signature:', signature);
}

export default sendVersionedTransactions;