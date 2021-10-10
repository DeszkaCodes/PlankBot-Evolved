const { Client, Intents } = require('discord.js');
const { Settings } = require("./util/settings")

// Setting up intents and bot
const intents = [ Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_PRESENCES ]
const bot = new Client( {intents: intents} );


bot.once("ready", () => {
    console.log(`${bot.user.username} is ready`);
});


//Logging in bot
bot.login(Settings.token);