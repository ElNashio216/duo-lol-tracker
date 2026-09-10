const { Client, GatewayIntentBits } = require('discord.js');
const config = require('./config');
const { pollOnce } = require('./poller');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', () => {
  console.log(`✅ Bot conectado como ${client.user.tag}`);
  console.log(`Cuentas trackeadas: ${config.accounts.map((a) => a.label).join(', ')}`);

  runPoll(); // primera corrida apenas arranca
  setInterval(runPoll, config.pollIntervalMinutes * 60 * 1000);
});

async function runPoll() {
  try {
    await pollOnce(client);
  } catch (err) {
    console.error('Error en el poll de partidas:', err);
  }
}

client.login(config.discordToken);
