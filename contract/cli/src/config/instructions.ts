import { Program, web3 } from "@coral-xyz/anchor";
import { BN } from "bn.js";
import { Trash } from "../../../target/types/trash";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { getQuote, getSwapIx, instructionDataToTransactionInstruction } from "../utils/helper";

export class Instructions {
  constructor(private program: Program<Trash>) {}

  async createInitializeInstruction(
    signer: web3.PublicKey,
    adminPDA: web3.PublicKey,
    vaultPDA: web3.PublicKey
  ): Promise<web3.TransactionInstruction> {
    const accounts = {
      signer: signer,
      admin: adminPDA,
      vault: vaultPDA,
      systemProgram: SystemProgram.programId,
    };
    return this.program.methods
      .initialize()
      .accounts(accounts)
      .instruction();
  }

  async createUpdateAdminInstruction(
    authority: web3.PublicKey,
    adminPDA: web3.PublicKey,
    parameters: {
      newAuthority: web3.PublicKey,
    }
  ): Promise<web3.TransactionInstruction> {
    const accounts = {
      authority,
      admin: adminPDA,
      systemProgram: SystemProgram.programId,
    };
    return this.program.methods
      .updateAdmin(
        parameters.newAuthority
      )
      .accounts(accounts)
      .instruction();
  }

  async createUpdateLabelInstruction(
    authority: web3.PublicKey,
    mint: web3.PublicKey,
    adminPDA: web3.PublicKey,
    labelPDA: web3.PublicKey,
    parameters: {
      name: string,
      multiplier: number,
    }
  ): Promise<web3.TransactionInstruction> {
    const accounts = {
      authority,
      mint,
      admin: adminPDA,
      label: labelPDA,
      systemProgram: SystemProgram.programId,
    };
    return this.program.methods
      .updateLabel(
        parameters.name,
        new BN(parameters.multiplier)
      )
      .accounts(accounts)
      .instruction();
  }

  async createInitUserStatsInstruction(
    user: web3.PublicKey,
    userStatsPDA: web3.PublicKey
  ): Promise<web3.TransactionInstruction> {
    const accounts = {
      user,
      userStats: userStatsPDA,
      systemProgram: SystemProgram.programId,
    };
    return this.program.methods
      .initUserStats()
      .accounts(accounts)
      .instruction();
  }

  async createWithdrawSolFromVaultInstruction(
    authority: web3.PublicKey,
    receiver: web3.PublicKey,
    adminPDA: web3.PublicKey,
    vaultPDA: web3.PublicKey,
    parameters: {
      amount: number
    }
  ): Promise<web3.TransactionInstruction> {
    const accounts = {
      authority,
      receiver,
      admin: adminPDA,
      vault: vaultPDA,
      systemProgram: SystemProgram.programId,
    };
    return this.program.methods
      .withdrawSolFromVault(
        new BN(parameters.amount)
      )
      .accounts(accounts)
      .instruction();
  }

  async createCreateRecycleProposalInstruction(
    user: web3.PublicKey,
    tokenMint: web3.PublicKey,
    recycleProposalPDA: web3.PublicKey,
    parameters: {
      tokenAmount: number,
      timestamp: number
    }
  ): Promise<web3.TransactionInstruction> {
    const accounts = {
      user,
      tokenMint,
      recycleProposal: recycleProposalPDA,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: web3.SystemProgram.programId,
    };
    return this.program.methods
      .createRecycleProposal(
        new BN(parameters.tokenAmount),
        new BN(parameters.timestamp)
      )
      .accounts(accounts)
      .instruction();
  }

  async createExecuteRecycleProposalInstruction(
    user: web3.PublicKey,
    userStatsPDA: web3.PublicKey,
    tokenMint: web3.PublicKey,
    recycleProposalPDA: web3.PublicKey,
    vaultPDA: web3.PublicKey,
    labelPDA: web3.PublicKey,
    parameters: {
      timestamp: number
    }
  ): Promise<web3.TransactionInstruction> {
    const accounts = {
      user,
      userStats: userStatsPDA,
      tokenMint,
      recycleProposal: recycleProposalPDA,
      vault: vaultPDA,
      label: labelPDA,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: web3.SystemProgram.programId,
    };
    return this.program.methods
      .executeRecycleProposal(
        new BN(parameters.timestamp)
      )
      .accounts(accounts)
      .instruction();
  }

  async createJupiterSwapInstruction(
    user: web3.PublicKey,
    inputMint: web3.PublicKey,
    parameters: {
      tokenAmount: number
    }
  ): Promise<{
    ixs: web3.TransactionInstruction[],
    addressLookupTableAddresses: string[]
  }> {
    const outputMint = new PublicKey("So11111111111111111111111111111111111111112")
    const quote = await getQuote(user, inputMint, outputMint, parameters.tokenAmount);
    const result = await getSwapIx(user, quote);
    console.log(quote, "quote")
    console.log(result, "result")

    const {
      computeBudgetInstructions, // The necessary instructions to setup the compute budget.
      setupInstructions, // The necessary instructions to setup the swap.
      swapInstruction, // The actual swap instruction.
      // cleanupInstruction, // Unwrap the SOL if `wrapAndUnwrapSol = true`.
      addressLookupTableAddresses, // The lookup table addresses that you can use if you are using versioned transaction.
    } = result;

    // console.log(computeBudgetInstructions, "computeBudgetInstructions");

    const ixs: web3.TransactionInstruction[] = [
      ...computeBudgetInstructions.map(instructionDataToTransactionInstruction),
      ...setupInstructions.map(instructionDataToTransactionInstruction),
      instructionDataToTransactionInstruction(swapInstruction),
      // instructionDataToTransactionInstruction(cleanupInstruction),
    ].filter(ix => ix !== null);

    if (!ixs.length) {
      throw new Error("Invalid Jupiter instruction");
    }

    return {
      ixs: ixs,
      addressLookupTableAddresses: addressLookupTableAddresses
    };
  }
}