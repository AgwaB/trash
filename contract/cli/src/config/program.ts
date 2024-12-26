import * as fs from 'fs';
import { AnchorProvider, Program, setProvider, Wallet } from '@coral-xyz/anchor';
import { Connection, Keypair } from '@solana/web3.js';

import IDL from '../../../target/idl/trash.json';
import { Trash } from "../../../target/types/trash"; // 프로그램 타입 import

export class ProgramSetup {
  private connection: Connection;
  private wallet: Wallet;
  private provider: AnchorProvider;
  public program: Program<Trash>;

  constructor(rpcUrl: string, keypairPath: string) {
    const rawKeypair = JSON.parse(fs.readFileSync(keypairPath, 'utf-8'));
    const keypair = Keypair.fromSecretKey(new Uint8Array(rawKeypair));
    
    this.connection = new Connection(
      rpcUrl,
      {
        commitment: 'confirmed',
        confirmTransactionInitialTimeout: 60000
      }
    );
    this.wallet = new Wallet(keypair);
    this.provider = new AnchorProvider(
      this.connection,
      this.wallet,
      { commitment: 'confirmed', preflightCommitment: 'processed' }
    );
    setProvider(this.provider);
    
    this.program = new Program<Trash>(IDL as Trash, this.provider);
  }

  getProvider() {
    return this.provider;
  }

  getConnection() {
    return this.connection;
  }

  getPayer() {
    return this.wallet.payer;
  }
}