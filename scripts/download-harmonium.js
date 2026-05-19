import fs from 'fs';
import path from 'path';
import https from 'https';

const files = [
  "C2.wav", "C3.wav", "C4.wav", "C5.wav",
  "Ds2.wav", "Ds3.wav", "Ds4.wav", "Ds5.wav",
  "Fs2.wav", "Fs3.wav", "Fs4.wav", "Fs5.wav",
  "A2.wav", "A3.wav", "A4.wav", "A5.wav"
];

const baseUrl = "https://raw.githubusercontent.com/nbrosowsky/tonejs-instruments/master/samples/harmonium/";
const destDir = path.join(process.cwd(), 'public', 'harmonium');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

async function downloadFile(filename) {
  return new Promise((resolve, reject) => {
    const dest = path.join(destDir, filename);
    const file = fs.createWriteStream(dest);
    
    https.get(baseUrl + filename, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to get '${filename}' (${response.statusCode})`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function downloadAll() {
  console.log(`Downloading ${files.length} harmonium samples locally to /public/harmonium/...`);
  for (const file of files) {
    try {
      await downloadFile(file);
      console.log(`✅ Downloaded ${file}`);
    } catch (err) {
      console.error(`❌ Error downloading ${file}:`, err.message);
    }
  }
  console.log("All done!");
}

downloadAll();
