require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Las cuentas vinculadas viven en config/accounts.json para que se puedan
// editar sin tocar código ni reconstruir la imagen de Docker.
const accountsPath = path.join(__dirname, '..', 'config', 'accounts.json');
const accounts = JSON.parse(fs.readFileSync(accountsPath, 'utf-8'));

module.exports = {
  discordToken: process.env.DISCORD_TOKEN,
  riotApiKey: process.env.RIOT_API_KEY,
  channelId: process.env.CHANNEL_ID,

  // Routing de la Riot API:
  // - "region" (regional routing) se usa para Account-V1 y Match-V5 → "americas" cubre LAS/LAN/NA/BR
  // - "platform" (platform routing) se usa para Summoner-V4 y League-V4 → LAS = "la2"
  region: process.env.REGION || 'americas',
  platform: process.env.PLATFORM || 'la2',

  pollIntervalMinutes: parseInt(process.env.POLL_INTERVAL_MINUTES || '5', 10),

  accounts,
};
