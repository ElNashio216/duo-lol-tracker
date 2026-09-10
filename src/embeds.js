const { EmbedBuilder } = require('discord.js');

function rankToString(entry) {
  if (!entry) return 'Sin clasificar';
  return `${entry.tier} ${entry.rank} (${entry.leaguePoints} LP)`;
}

function buildMatchEmbed({ matchId, gameDurationMinutes, participants, teamWin }) {
  const isDuo = participants.length > 1;

  const title = isDuo
    ? `🎮 Partida en equipo — ${participants.map((p) => p.owner).join(' & ')}`
    : `🎮 Partida de ${participants[0].owner}`;

  const color = teamWin ? 0x2ecc71 : 0xe74c3c;

  const embed = new EmbedBuilder()
    .setTitle(title)
    .setColor(color)
    .setDescription(teamWin ? '✅ Victoria' : '❌ Derrota')
    .addFields(
      participants.map((p) => ({
        name: `${p.label} — ${p.championName}`,
        value: `KDA: ${p.kills}/${p.deaths}/${p.assists}${p.rankDelta ? `\n${p.rankDelta}` : ''}`,
        inline: true,
      }))
    )
    .setFooter({ text: `Duración: ${gameDurationMinutes} min · Match ID: ${matchId}` })
    .setTimestamp();

  return embed;
}

module.exports = { buildMatchEmbed, rankToString };
