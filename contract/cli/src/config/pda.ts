import { Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { ADMIN_SEED, AUTHORITY_SEED, LABEL_SEED, RECYCLE_PROPOSAL_SEED, USER_STATS_SEED, USER_WSOL_SEED, VAULT_SEED, WSOL_SEED } from "../constants";
import { BN } from 'bn.js';

import { Trash } from "../../../target/types/trash";

export class PDA {
  constructor(
    private program: Program<Trash>,
    private signer: PublicKey
  ) {}

  async getAdminPDA() {
    return PublicKey.findProgramAddressSync(
      [Buffer.from(ADMIN_SEED)],
      this.program.programId
    )[0];
  }

  async getProgramAuthorityPDA() {
    return PublicKey.findProgramAddressSync(
      [Buffer.from(AUTHORITY_SEED)],
      this.program.programId
    )[0];
  }

  async getProgramWsolAccountPDA() {
    return PublicKey.findProgramAddressSync(
      [Buffer.from(WSOL_SEED)],
      this.program.programId
    )[0];
  }

  async getUserWsolAccountPDA(user: PublicKey) {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from(USER_WSOL_SEED),
        user.toBuffer()
      ],
      this.program.programId
    )[0];
  }

  async getUserStatsPDA(user: PublicKey) {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from(USER_STATS_SEED),
        user.toBuffer()
      ],
      this.program.programId
    )[0];
  }

  async getVaultPDA() {
    return PublicKey.findProgramAddressSync(
      [Buffer.from(VAULT_SEED)],
      this.program.programId
    )[0];
  }
  
  async getLabelPDA(tokenMint: PublicKey, isInit: boolean) {
    const labelPDA = PublicKey.findProgramAddressSync(
      [
        Buffer.from(LABEL_SEED),
        tokenMint.toBuffer()
      ],
      this.program.programId
    )[0];

    if (isInit) return labelPDA;

    try {
      await this.program.account.label.fetch(labelPDA)
      return labelPDA;
    } catch (error) {
      return new PublicKey(this.program.programId);
    }
  }

  async getRecycleProposalPDA(user: PublicKey, tokenMint: PublicKey, timestamp: number) {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from(RECYCLE_PROPOSAL_SEED),
        user.toBuffer(),
        tokenMint.toBuffer(),
        Buffer.from(new BN(timestamp).toArray('le', 8))
      ],
      this.program.programId
    )[0];
  }
}