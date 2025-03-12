import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Function to copy directory recursively
async function copyDir(src, dest) {
  const entries = await fs.promises.readdir(src, { withFileTypes: true });
  await fs.promises.mkdir(dest, { recursive: true });

  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await fs.promises.copyFile(srcPath, destPath);
    }
  }
}

// Copy the CSV and images to the dist folder
async function main() {
  try {
    // Ensure dist directory exists
    await fs.promises.mkdir('dist', { recursive: true });
    
    // Copy CSV file
    await fs.promises.copyFile(
      path.join(__dirname, 'public', 'complete_data.csv'), 
      path.join(__dirname, 'dist', 'complete_data.csv')
    );
    
    // Copy indicios folder with all images
    await copyDir(
      path.join(__dirname, 'public', 'indicios'),
      path.join(__dirname, 'dist', 'indicios')
    );
    
    // Copy placeholder image if exists
    try {
      await fs.promises.copyFile(
        path.join(__dirname, 'public', 'placeholder-image.jpg'),
        path.join(__dirname, 'dist', 'placeholder-image.jpg')
      );
    } catch (err) {
      console.log('No placeholder image found, skipping...');
    }

    console.log('Static assets copied successfully!');
  } catch (err) {
    console.error('Error during pre-rendering:', err);
    process.exit(1);
  }
}

main();
