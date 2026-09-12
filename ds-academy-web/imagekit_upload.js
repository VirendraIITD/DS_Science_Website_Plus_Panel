// DS Science Academy - bulk photo uploader to ImageKit.
// Reads the private key from imagekit_upload_secret.txt (gitignored,
// never committed) so the key never lives in source code or CSV output.
//
// Usage: node imagekit_upload.js <local-folder> [imagekit-destination-folder]
//
// Uploads every image in <local-folder> to ImageKit, writes an
// imagekit_urls.csv (filename,photoUrl) inside that same folder,
// ready to paste into the Toppers/Results bulk-import CSV.

const fs = require('fs');
const path = require('path');

const IK_ID = 'd2apex81m';
const SECRET_FILE = path.join(__dirname, 'imagekit_upload_secret.txt');

function loadPrivateKey() {
  if (!fs.existsSync(SECRET_FILE)) {
    console.error(`Missing ${SECRET_FILE} - put the ImageKit private key in there, nothing else.`);
    process.exit(1);
  }
  return fs.readFileSync(SECRET_FILE, 'utf8').trim();
}

async function uploadFile(privateKey, filePath, ikFolder) {
  const fileName = path.basename(filePath);
  const buffer = fs.readFileSync(filePath);
  const auth = Buffer.from(`${privateKey}:`).toString('base64');

  const form = new FormData();
  form.append('file', new Blob([buffer]), fileName);
  form.append('fileName', fileName);
  // Keep the exact filename in the URL instead of ImageKit's default
  // random-suffix behaviour, so the CSV output is predictable and a
  // re-run with the same files overwrites rather than duplicating.
  form.append('useUniqueFileName', 'false');
  if (ikFolder) form.append('folder', `/${ikFolder}`);

  const res = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
    method: 'POST',
    headers: { Authorization: `Basic ${auth}` },
    body: form,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || `Upload failed for ${fileName}`);
  return { url: json.url, fileId: json.fileId };
}

async function main() {
  const folder = process.argv[2];
  const ikFolder = process.argv[3] || '';

  if (!folder) {
    console.error('Usage: node imagekit_upload.js <local-folder> [imagekit-destination-folder]');
    process.exit(1);
  }
  if (!fs.existsSync(folder)) {
    console.error(`Folder not found: ${folder}`);
    process.exit(1);
  }

  const privateKey = loadPrivateKey();
  const files = fs
    .readdirSync(folder)
    .filter((f) => /\.(jpe?g|png|webp|avif|gif)$/i.test(f))
    // readdirSync's order isn't guaranteed to match filesystem/Explorer
    // order — sort naturally (numeric-aware) so "1_...", "2_...", "10_..."
    // come out in that order instead of "1_", "10_", "2_" string order.
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

  if (files.length === 0) {
    console.error('No image files found in that folder.');
    process.exit(1);
  }

  console.log(`Uploading ${files.length} image(s) to ImageKit (${IK_ID})${ikFolder ? ` -> /${ikFolder}/` : ''}...`);

  const results = [];
  for (const f of files) {
    const full = path.join(folder, f);
    try {
      const { url } = await uploadFile(privateKey, full, ikFolder);
      console.log(`  OK   ${f} -> ${url}`);
      results.push({ filename: f, photoUrl: url });
    } catch (err) {
      console.error(`  FAIL ${f}: ${err.message}`);
    }
  }

  const csvPath = path.join(folder, 'imagekit_urls.csv');
  const csv = ['filename,photoUrl', ...results.map((r) => `${r.filename},${r.photoUrl}`)].join('\n');
  fs.writeFileSync(csvPath, csv);

  console.log('');
  console.log(`Done - ${results.length}/${files.length} uploaded.`);
  console.log(`CSV written to: ${csvPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
