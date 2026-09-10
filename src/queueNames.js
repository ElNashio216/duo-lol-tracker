// Mapeo de queueId (Riot) a nombre legible del modo de juego.
// Referencia: https://static.developer.riotgames.com/docs/lol/queues.json
const QUEUE_NAMES = {
  400: 'Normal (Draft Pick)',
  420: 'Ranked Solo/Duo',
  430: 'Normal (Blind Pick)',
  440: 'Ranked Flex',
  450: 'ARAM',
  490: 'Normal (Quickplay)',
  700: 'Clash',
  830: 'Co-op vs IA (Intro)',
  840: 'Co-op vs IA (Principiante)',
  850: 'Co-op vs IA (Intermedio)',
  900: 'ARURF',
  1020: 'One for All',
  1300: 'Nexus Blitz',
  1400: 'Ultimate Spellbook',
  1900: 'URF',
};

function getQueueName(queueId) {
  return QUEUE_NAMES[queueId] || `Modo desconocido (ID ${queueId})`;
}

module.exports = { getQueueName };
