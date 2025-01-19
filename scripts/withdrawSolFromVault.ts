import { PublicKey, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getProgramInstance } from './utils';
import * as anchor from '@coral-xyz/anchor';

export async function withdrawSolFromVault(
  receiver: PublicKey,
  amount: number
) {
  const lamports = Math.round(amount * LAMPORTS_PER_SOL);
  const { program, provider } = getProgramInstance();
  
  try {
    const [adminPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("ADMIN")],
      program.programId
    );

    const [vaultPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("VAULT")],
      program.programId
    );

    const tx = await program.methods
      .withdrawSolFromVault(new anchor.BN(lamports))
      .accounts({
        authority: provider.wallet.publicKey,
        receiver,
        admin: adminPDA,
        vault: vaultPDA,
        systemProgram: SystemProgram.programId,
      } as any)
      .rpc();

    return {
      success: true,
      signature: tx,
    };

  } catch (error) {
    console.error("Error in withdrawSolFromVault:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length !== 2) {
    console.log("Usage: npm run withdraw-sol-from-vault <receiver-address> <amount>");
    process.exit(1);
  }

  const [receiver, amount] = args;
  const result = await withdrawSolFromVault(
    new PublicKey(receiver),
    parseFloat(amount)
  );

  console.log(result);
}

if (require.main === module) {
  main().catch(console.error);
}