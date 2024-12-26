import { PublicKey, SystemProgram } from '@solana/web3.js';
import { getProgramInstance } from './utils';
import * as anchor from '@coral-xyz/anchor';

export async function updateLabel(
  mintAddress: PublicKey,
  newName: string,
  newMultiplier: number
) {
  const { program, provider } = getProgramInstance();
  
  try {
    const [adminPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("ADMIN")],
      program.programId
    );

    const [labelPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("LABEL"), mintAddress.toBuffer()],
      program.programId
    );

    const tx = await program.methods
      .updateLabel(newName, new anchor.BN(newMultiplier))
      .accounts({
        authority: provider.wallet.publicKey,
        mint: mintAddress,
        admin: adminPDA,
        label: labelPDA,
        systemProgram: SystemProgram.programId,
      } as any)
      .rpc();

    return {
      success: true,
      signature: tx,
    };

  } catch (error) {
    console.error("Error in updateLabel:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

// CLI 실행을 위한 메인 함수
async function main() {
  const args = process.argv.slice(2);
  if (args.length !== 3) {
    console.log("Usage: npm run update-label <mint-address> <name> <multiplier>");
    process.exit(1);
  }

  const [mintAddress, name, multiplier] = args;
  const result = await updateLabel(
    new PublicKey(mintAddress),
    name,
    parseInt(multiplier)
  );

  console.log(result);
}

if (require.main === module) {
  main().catch(console.error);
}