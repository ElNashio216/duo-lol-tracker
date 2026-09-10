const fs = require('fs');
const path = require('path');

// Se guarda en /app/data (montado como volumen) para que sobreviva a reinicios
// y actualizaciones del contenedor.
const DB_PATH = path.join(__dirname, '..', 'data', 'db.json');

function load() {
  if (!fs.existsSync(DB_PATH)) {
    return { accounts: {}, postedMatches: [] };
  }
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
}

function save(data) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function getAccountState(label) {
  const data = load();
  return (
    data.accounts[label] || {
      puuid: null,
      summonerId: null,
      lastRank: null,
    }
  );
}

function saveAccountState(label, state) {
  const data = load();
  data.accounts[label] = state;
  save(data);
}

function hasPostedMatch(matchId) {
  const data = load();
  return data.postedMatches.includes(matchId);
}

function markMatchPosted(matchId) {
  const data = load();
  data.postedMatches.push(matchId);
  // Evita que el archivo crezca sin límite
  if (data.postedMatches.length > 500) {
    data.postedMatches = data.postedMatches.slice(-500);
  }
  save(data);
}

module.exports = {
  getAccountState,
  saveAccountState,
  hasPostedMatch,
  markMatchPosted,
};
