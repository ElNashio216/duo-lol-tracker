// Genera un comentario corto, cariñoso y sin mala onda sobre cómo le fue a
// cada uno en la partida. Nunca insulta ni hace sentir mal a nadie — el peor
// caso es una "pulla" tierna, siempre con cariño.

function kdaScore(p) {
  return (p.kills + p.assists) / Math.max(p.deaths, 1);
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const BALANCED_GOOD = [
  'Los dos estuvieron on fire hoy 🔥 el Reino está orgulloso de su dupla.',
  'Sincronizados como pareja real 👑 ¡buen partido de ambos!',
  'Dupla imparable — así se juega en equipo 💛',
];

const BALANCED_ROUGH = [
  'Partida dura para ambos hoy... pero el Reino los sigue queriendo igual 💛',
  'No fue la ronda más brillante para ninguno de los dos, ¡a la próxima el trono vuelve a lucir!',
  'Día difícil en la Grieta para los dos — descansen y vuelven con todo 🌙',
];

const MVP_TEMPLATES = [
  '{mvp} se puso la corona esta partida 👑, mientras que {other}... bueno, alguien tiene que sostenerle la capa 😅',
  'Otra vez {mvp} brillando ✨ — {other}, la próxima el trono es tuyo/a 💛',
  '{mvp} MVP indiscutido/a esta ronda. {other}, tranquilo/a, en el amor y en la Grieta no siempre se gana igual 😘',
  '{mvp} cargando el Reino entero hoy 💪 {other} sumó lo suyo, ¡para la próxima el dúo real vuelve al 100%!',
];

function generateCommentary(participants) {
  if (!participants || participants.length < 2) return '';

  const [a, b] = participants;
  const scoreA = kdaScore(a);
  const scoreB = kdaScore(b);
  const diff = Math.abs(scoreA - scoreB);

  // Diferencia chica de desempeño: comentario de equipo parejo
  if (diff < 0.75) {
    const bothGood = (scoreA + scoreB) / 2 >= 2.5;
    return pick(bothGood ? BALANCED_GOOD : BALANCED_ROUGH);
  }

  // Uno se destacó más que el otro: MVP + pulla tierna
  const mvp = scoreA > scoreB ? a.owner : b.owner;
  const other = scoreA > scoreB ? b.owner : a.owner;

  return pick(MVP_TEMPLATES).replace('{mvp}', mvp).replace('{other}', other);
}

module.exports = { generateCommentary };
