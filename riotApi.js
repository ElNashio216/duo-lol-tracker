const config = require('./config');

const REGIONAL_BASE = `https://${config.region}.api.riotgames.com`;
const PLATFORM_BASE = `https://${config.platform}.api.riotgames.com`;

async function riotFetch(url) {
  const res = await fetch(url, {
    headers: { 'X-Riot-Token': config.riotApiKey },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Riot API error ${res.status} en ${url}: ${body}`);
  }
  return res.json();
}

// Riot ID (gameName#tagLine) -> { puuid, gameName, tagLine }
async function getAccountByRiotId(gameName, tagLine) {
  const url = `${REGIONAL_BASE}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
  return riotFetch(url);
}

// Últimos N match IDs jugados por un puuid
async function getMatchIdsByPuuid(puuid, count = 10) {
  const url = `${REGIONAL_BASE}/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=${count}`;
  return riotFetch(url);
}

// Detalle completo de una partida
async function getMatchById(matchId) {
  const url = `${REGIONAL_BASE}/lol/match/v5/matches/${matchId}`;
  return riotFetch(url);
}

// puuid -> datos de summoner (necesitamos el id encriptado para League-V4)
async function getSummonerByPuuid(puuid) {
  const url = `${PLATFORM_BASE}/lol/summoner/v4/summoners/by-puuid/${puuid}`;
  return riotFetch(url);
}

// summonerId -> entradas de ranked (filtrar por queueType === 'RANKED_SOLO_5x5')
async function getRankedEntries(summonerId) {
  const url = `${PLATFORM_BASE}/lol/league/v4/entries/by-summoner/${summonerId}`;
  return riotFetch(url);
}

module.exports = {
  getAccountByRiotId,
  getMatchIdsByPuuid,
  getMatchById,
  getSummonerByPuuid,
  getRankedEntries,
};
