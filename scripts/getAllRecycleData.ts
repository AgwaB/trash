import { getProgramInstance } from './utils';
import * as fs from 'fs';
import * as path from 'path';

async function getAllRecycleProposals() {
  const { program } = getProgramInstance();

  try {
    const allProposals = await program.account.recycleProposal.all();
    
    const formattedProposals = allProposals
      .map(item => ({
        accountId: item.publicKey.toString(),
        user: item.account.user.toString(),
        tokenMint: item.account.tokenMint.toString(),
        tokenAmount: item.account.tokenAmount.toString(),
        initialSol: (Number(item.account.initialSol) / 1e9).toFixed(9),
        createdAt: new Date(Number(item.account.createdAt) * 1000).toISOString(),
        isExecuted: item.account.isExecuted,
        solReceived: (Number(item.account.solReceived) / 1e9).toFixed(9),
        pointsEarned: (Number(item.account.pointsEarned) / 1e9).toFixed(9),
        executedAt: item.account.executedAt.toString() === "0" 
          ? null 
          : new Date(Number(item.account.executedAt) * 1000).toISOString()
      }))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return formattedProposals;
  } catch (e) {
    console.error("Error fetching recycle proposals:", e);
    return null;
  }
}

async function main() {
  const result = await getAllRecycleProposals();
  
  if (result) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const dataDir = path.join(__dirname, 'data');
    
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir);
    }
    
    const filePath = path.join(dataDir, `recycle-data-${timestamp}.json`);
    fs.writeFileSync(filePath, JSON.stringify(result, null, 2));
    
    console.log(`Data saved to: ${filePath}`);
    console.log(`Total proposals: ${result.length}`);
  }
}

if (require.main === module) {
  main().catch(console.error);
} 