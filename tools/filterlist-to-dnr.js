// Usage: node filterlist-to-dnr.js [url1] [url2] ...
const fs = require('fs');
const https = require('https');

function download(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

// Simple parser: Ignore cosmetic rules (##, #@#) and exceptions (@@).
function parseFilterList(text) {
  const lines = text.split(/\r?\n/);
  return lines
    .map(line => line.trim())
    .filter(line =>
      line &&
      !line.startsWith('!') &&
      !line.startsWith('[') &&
      !line.startsWith('@@') &&
      !line.startsWith('##') &&
      !line.startsWith('#@#')
    );
}

// Convert to DNR rules (blocking only)
function toDNRRule(line, id) {
  // Handle ||domain^
  if (line.startsWith('||')) {
    const domain = line.slice(2).split('^')[0];
    return {
      id,
      priority: 1,
      action: { type: 'block' },
      condition: {
        urlFilter: domain,
        resourceTypes: ["main_frame", "sub_frame", "script", "xmlhttprequest", "image", "font"]
      }
    };
  }
  // Handle /path/
  if (line.startsWith('/') && line.endsWith('/')) {
    const path = line.slice(1, -1);
    return {
      id,
      priority: 1,
      action: { type: 'block' },
      condition: {
        urlFilter: path,
        resourceTypes: ["main_frame", "sub_frame", "script", "xmlhttprequest", "image", "font"]
      }
    };
  }
  // Handle domain.com/banner.jpg or similar
  if (/^[\w.-]+\//.test(line)) {
    return {
      id,
      priority: 1,
      action: { type: 'block' },
      condition: {
        urlFilter: line,
        resourceTypes: ["main_frame", "sub_frame", "script", "xmlhttprequest", "image", "font"]
      }
    };
  }
  // fallback: skip
  return null;
}

async function main() {
  const urls = process.argv.slice(2);
  let rules = [];
  let id = 1;
  for (const url of urls) {
    console.log(`Downloading: ${url}`);
    const txt = await download(url);
    const lines = parseFilterList(txt);
    for (const line of lines) {
      const rule = toDNRRule(line, id++);
      if (rule) rules.push(rule);
    }
  }
  fs.writeFileSync('converted-rules.json', JSON.stringify(rules, null, 2));
  console.log(`Wrote ${rules.length} rules to converted-rules.json`);
}

main();