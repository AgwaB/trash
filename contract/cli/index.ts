import * as dotenv from 'dotenv';
import initialize from './src/methods/initialize';
import depositSolToProgramAuthority from './src/methods/depositSolToProgramAuthority';
import updateAdmin from './src/methods/updateAdmin';
import updateLabel from './src/methods/updateLabel';
import initUserStats from './src/methods/initUserStats';
import withdrawSolFromVault from './src/methods/withdrawSolFromVault';
import withdrawSolFromProgramAuthority from './src/methods/withdrawSolFromProgramAuthority';
import transfer from './src/methods/depositSolToProgramAuthority';
import recycleTokenV2 from './src/methods/recycleV2';
import { PublicKey } from '@solana/web3.js';

dotenv.config();

function main() {
    try {
        // // Initialize the program
        // initialize();

        // // Update the admin
        // const newAuthority = new PublicKey("7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr");
        // updateAdmin(newAuthority);
        
        // // Update the label
        // const mint = new PublicKey("5FuRRJKNYgskihwURkHPfnsQYa6RXFCk9AeoNqTbmoon");
        // const name = "Shiny";
        // const multiplier = 1500; // 1.5x
        // updateLabel(mint, name, multiplier);
        
        // // Init user stats
        // initUserStats();

        // // Withdraw SOL from the vault
        // withdrawSolFromVault();

        // // Withdraw SOL from the program authority
        // withdrawSolFromProgramAuthority();

        // Recycle token V2

        // const tokenMint = new PublicKey("7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr");
        // const tokenAmount = 1000;

        const tokenMint = new PublicKey("5FuRRJKNYgskihwURkHPfnsQYa6RXFCk9AeoNqTbmoon");
        const tokenAmount = 1000000000;

        const timestamp = Math.floor(Date.now() / 1000);
        // const timestamp = 1734973271;
        recycleTokenV2(tokenMint, tokenAmount, timestamp);
    } catch (error) {
        console.error('Error occurred:', error);
    }
}

main();