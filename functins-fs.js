const fs = require('fs').promises;

async function readFile() {
  const file = await fs.readFile('./talker.json', 'utf-8');
  const talkers = JSON.parse(file);
  return talkers;
}

function writeFile(param) {
  return fs.writeFile('./talker.json', JSON.stringify(param));
}

module.exports = { readFile, writeFile };