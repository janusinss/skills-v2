import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';

const repoRoot = process.cwd();
const targetBase = path.join(repoRoot, '.agents/skills');

const skillsToImport = [
  'agent-self-evaluation',
  'agentic-engineering',
  'continuous-agent-loop',
  'agent-security-hardening',
  'ai-regression-testing',
];

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Node-Skill-Importer' }, rejectUnauthorized: false }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(fetchJson(res.headers.location));
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} from ${url}`));
      }
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

function fetchRaw(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Node-Skill-Importer' }, rejectUnauthorized: false }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(fetchRaw(res.headers.location));
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} from ${url}`));
      }
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function downloadDir(apiDirUrl, localDir) {
  fs.mkdirSync(localDir, { recursive: true });
  const items = await fetchJson(apiDirUrl);
  for (const item of items) {
    const itemLocal = path.join(localDir, item.name);
    if (item.type === 'file') {
      const content = await fetchRaw(item.download_url);
      fs.writeFileSync(itemLocal, content, 'utf8');
      console.log(`  Downloaded: ${path.relative(repoRoot, itemLocal)}`);
    } else if (item.type === 'dir') {
      await downloadDir(item.url, itemLocal);
    }
  }
}

async function run() {
  console.log(`Importing ${skillsToImport.length} meta-agentic skills from affaan-m/ECC...`);
  for (const skill of skillsToImport) {
    console.log(`\nImporting skill: ${skill}...`);
    const apiUrl = `https://api.github.com/repos/affaan-m/ECC/contents/skills/${skill}`;
    const localDir = path.join(targetBase, skill);
    await downloadDir(apiUrl, localDir);
  }
  console.log(`\nSuccessfully imported all skills.`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
