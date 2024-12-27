import { PublicKey } from '@solana/web3.js';
import { getProgramInstance } from './utils';
import * as fs from 'fs';
import * as path from 'path';

async function getUserRecycleData(userPubkey: PublicKey) {
  const { program } = getProgramInstance();

  try {
    const [userStatsPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("USER_STATS"), userPubkey.toBuffer()],
      program.programId
    );

    const userStats = await program.account.userStats.fetch(userStatsPDA);

    const allProposals = await program.account.recycleProposal.all([
      {
        memcmp: {
          offset: 8,
          bytes: userPubkey.toBase58()
        }
      }
    ]);

    const formattedData = {
      userStats: {
        recycleCount: userStats.recycleCount.toString(),
        totalSolReceived: (Number(userStats.totalSolReceived) / 1e9).toFixed(9),
        totalPointsEarned: (Number(userStats.totalPointsEarned) / 1e9).toFixed(9),
        lastUpdated: new Date(Number(userStats.lastUpdated) * 1000).toISOString()
      },
      proposals: allProposals
        .map(item => ({
          accountId: item.publicKey.toString(),
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
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    };

    return formattedData;
  } catch (e) {
    console.error("Error fetching user recycle data:", e);
    return null;
  }
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length !== 1) {
    console.log("Usage: npm run get-user-recycle <user-public-key>");
    process.exit(1);
  }

  const userPubkey = new PublicKey(args[0]);
  const result = await getUserRecycleData(userPubkey);
  
  if (result) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const dataDir = path.join(__dirname, 'data');
    
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir);
    }
    
    const filePath = path.join(dataDir, `user-${args[0]}-${timestamp}.json`);
    fs.writeFileSync(filePath, JSON.stringify(result, null, 2));
    
    console.log(`Data saved to: ${filePath}`);
    console.log(`Total proposals: ${result.proposals.length}`);
    console.log(`User stats: ${JSON.stringify(result.userStats, null, 2)}`);
  }
}

if (require.main === module) {
  main().catch(console.error);
} 