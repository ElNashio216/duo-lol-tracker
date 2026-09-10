const config = require('./config');
const riot = require('./riotApi');
const db = require('./db');
const { buildMatchEmbed, rankToString } = require('./embeds');

// Resuelve y cachea el puuid + summonerId de una cuenta la primera vez que se usa
async function ensurePuuid(account) {
  const state = db.getAccountState(account.label);
  if (state.puuid) return state;

  const accData = await riot.getAccountByRiotId(account.gameName, account.tagLine);
  state.puuid = accData.puuid;

  const summoner = await riot.getSummonerByPuuid(accData.puuid);
  state.summonerId = summoner.id;

  db.saveAccountState(account.label, state);
  return state;
}

async function getCurrentSoloRank(summonerId) {
  const entries = await riot.getRankedEntries(summonerId);
  return entries.find((e) => e.queueType === 'RANKED_SOLO_5x5') || null;
}

async function pollOnce(client) {
  const channel = await client.channels.fetch(config.channelId);

  // 1. Asegurar puuid/summonerId de cada cuenta vinculada
  for (const account of config.accounts) {
    await ensurePuuid(account);
  }

  // 2. Juntar match IDs nuevos, agrupando por partida (para detectar cuando
  //    dos cuentas linkeadas jugaron la misma partida juntas)
  const candidateMatches = new Map(); // matchId -> Set(labels)
  for (const account of config.accounts) {
    const state = db.getAccountState(account.label);
    const matchIds = await riot.getMatchIdsByPuuid(state.puuid, 10);
    for (const matchId of matchIds) {
      if (db.hasPostedMatch(matchId)) continue;
      if (!candidateMatches.has(matchId)) candidateMatches.set(matchId, new Set());
      candidateMatches.get(matchId).add(account.label);
    }
  }

  // 3. Solo nos interesan las partidas jugadas en dúo (2+ cuentas vinculadas
  //    en la misma partida). Las partidas en solitario se marcan como vistas
  //    pero NO se postean ni se les pide el detalle completo (ahorra llamadas
  //    a la API).
  const matchesToProcess = [];
  for (const [matchId, labelsSet] of candidateMatches.entries()) {
    if (labelsSet.size < 2) {
      db.markMatchPosted(matchId);
      continue;
    }
    try {
      const matchData = await riot.getMatchById(matchId);
      matchesToProcess.push({ matchId, labelsSet, matchData });
    } catch (err) {
      console.error(`Error obteniendo detalle de partida ${matchId}:`, err.message);
    }
  }
  matchesToProcess.sort(
    (a, b) => a.matchData.info.gameStartTimestamp - b.matchData.info.gameStartTimestamp
  );

  // 4. Postear cada partida en dúo nueva
  for (const { matchId, labelsSet, matchData } of matchesToProcess) {
    await processMatch({ matchId, labelsSet, matchData, channel });
    db.markMatchPosted(matchId);
  }
}

async function processMatch({ matchId, labelsSet, matchData, channel }) {
  const participantsInfo = [];
  let teamWin = null;

  for (const label of labelsSet) {
    const account = config.accounts.find((a) => a.label === label);
    const state = db.getAccountState(label);
    const participant = matchData.info.participants.find((p) => p.puuid === state.puuid);
    if (!participant) continue;

    if (teamWin === null) teamWin = participant.win;

    // Tracking de rango: best-effort, no bloquea el posteo si falla
    let rankDelta = '';
    try {
      const currentRank = await getCurrentSoloRank(state.summonerId);
      const rankString = rankToString(currentRank);
      if (state.lastRank && state.lastRank !== rankString) {
        rankDelta = `📈 ${state.lastRank} → ${rankString}`;
      }
      state.lastRank = rankString;
      db.saveAccountState(label, state);
    } catch (err) {
      console.error(`No se pudo obtener el rango de ${label}:`, err.message);
    }

    participantsInfo.push({
      label,
      owner: account.owner,
      championName: participant.championName,
      kills: participant.kills,
      deaths: participant.deaths,
      assists: participant.assists,
      rankDelta,
    });
  }

  if (participantsInfo.length < 2) return; // por las dudas, no debería pasar acá

  const embed = buildMatchEmbed({
    matchId,
    gameDurationMinutes: Math.round(matchData.info.gameDuration / 60),
    participants: participantsInfo,
    teamWin,
    queueId: matchData.info.queueId,
    gameStartTimestamp: matchData.info.gameStartTimestamp,
  });

  await channel.send({ embeds: [embed] });
}

module.exports = { pollOnce };
