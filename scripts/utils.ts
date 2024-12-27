import { Connection, Keypair } from '@solana/web3.js';
import { Program, AnchorProvider, Wallet, Idl } from '@coral-xyz/anchor';
import { Trash } from './trash';
import IdlJson from './trash.json';
import bs58 from 'bs58';
import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

if (!process.env.RPC_URL || !process.env.ADMIN_PRIVATE_KEY || !process.env.PROGRAM_ID) {
  throw new Error('Please set RPC_URL, ADMIN_PRIVATE_KEY and PROGRAM_ID in .env file');
}

export const getProgramInstance = () => {
  const connection = new Connection(process.env.RPC_URL!, {
    commitment: "confirmed",
    confirmTransactionInitialTimeout: 60000
  });

  const secretKey = bs58.decode(process.env.ADMIN_PRIVATE_KEY as string);
  const wallet = new Wallet(Keypair.fromSecretKey(secretKey));

  const provider = new AnchorProvider(
    connection,
    wallet,
    AnchorProvider.defaultOptions()
  );

  const idl = {
    ...IdlJson,
    address: process.env.PROGRAM_ID
  };

  const program = new Program<Trash>(idl as Trash, provider);

  return { program, provider };
};

export const lamportsToSol = (lamports: number): string => {
  return (lamports / 1e9).toFixed(9);
};

export const solToLamports = (sol: number): number => {
  return Math.floor(sol * 1e9);
};

export const formatDate = (timestamp: number): string => {
  return new Date(timestamp * 1000).toISOString();
};

export const saveDataToFile = (
  data: any, 
  filename: string, 
  subdirectory: string = 'data'
) => {
  const timestamp = new Date().toISOString().split('T')[0];
  const outputDir = path.join(__dirname, subdirectory);
  const outputPath = path.join(outputDir, `${filename}_${timestamp}.json`);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
  return outputPath;
}; 