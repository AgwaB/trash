import { getProgramInstance, saveDataToFile } from './utils';
import * as fs from 'fs';
import * as path from 'path';

async function getAllLabels() {
  const { program } = getProgramInstance();

  try {
    const allLabels = await program.account.label.all();
    
    const formattedLabels = allLabels.map(item => ({
      address: item.publicKey.toString(),
      mint: item.account.mint.toString(),
      name: item.account.name,
      multiplier: item.account.multiplier.toString(),
      multiplierInSol: (Number(item.account.multiplier) / 1e9).toFixed(9)
    }));

    return formattedLabels;

  } catch (e) {
    console.error("Error fetching labels:", e);
    return null;
  }
}

async function saveLabelsAsCSV() {
  const labels = await getAllLabels();
  if (!labels) return;

  const csvHeader = 'Address,Mint,Name,Multiplier,MultiplierInSol\n';
  const csvRows = labels.map(label => 
    `${label.address},${label.mint},${label.name},${label.multiplier},${label.multiplierInSol}`
  ).join('\n');

  const timestamp = new Date().toISOString().split('T')[0];
  const outputDir = path.join(__dirname, 'data');
  const outputPath = path.join(outputDir, `labels_${timestamp}.csv`);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  fs.writeFileSync(outputPath, csvHeader + csvRows);
  
  console.log(`Labels saved as CSV to: ${outputPath}`);
  console.log(`Total labels found: ${labels.length}`);
}

async function main() {
  const args = process.argv.slice(2);
  const format = args[0] || 'json'; // 기본값은 json

  const labels = await getAllLabels();
  
  if (labels) {
    if (format === 'csv') {
      await saveLabelsAsCSV();
    } else {
      const filePath = saveDataToFile(labels, 'labels');
      console.log(`Labels saved to: ${filePath}`);
      console.log(`Total labels found: ${labels.length}`);
    }
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { getAllLabels };
