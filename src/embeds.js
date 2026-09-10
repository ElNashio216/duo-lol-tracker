const { EmbedBuilder } = require('discord.js');
const { getQueueName } = require('./queueNames');
const { generateCommentary } = require('./commentary');

function rankToString(entry) {
  if (!entry) return 'Sin clasificar';
  return `${entry.tier} ${entry.rank} (${entry.leaguePoints} LP)`;
}

function buildMatchEmbed({
  matchId,
  gameDurationMinutes,
  participants,
  teamWin,
  queueId,
  gameStartTimestamp,
}) {
  const isDuo = participants.length > 1;

  const title = isDuo
    ? `🎮 Partida en equipo — ${participants.map((p) => p.owner).join(' & ')}`
    : `🎮 Partida de ${participants[0].owner}`;

  const color = teamWin ? 0x2ecc71 : 0xe74c3c;

  const fields = participants.map((p) => ({
    name: `${p.label} — ${p.championName}`,
    value: `KDA: ${p.kills}/${p.deaths}/${p.assists}${p.rankDelta ? `\n${p.rankDelta}` : ''}`,
    inline: true,
  }));

  if (isDuo) {
    fields.push({
      name: '💬 Comentario del Reino',
      value: generateCommentary(participants),
      inline: false,
    });
  }

  const embed = new EmbedBuilder()
    .setTitle(title)
    .setColor(color)
    .setDescription(
      `${teamWin ? '✅ Victoria' : '❌ Derrota'} · 🕹️ ${getQueueName(queueId)}`
    )
    .addFields(fields)
    .setFooter({ text: `Duración: ${gameDurationMinutes} min · Match ID: ${matchId}` })
    // Usamos la fecha real de inicio de la partida (epoch ms que devuelve Riot),
    // no el momento en que el bot la detectó/posteó.
    .setTimestamp(gameStartTimestamp);

  return embed;
}

module.exports = { buildMatchEmbed, rankToString };
