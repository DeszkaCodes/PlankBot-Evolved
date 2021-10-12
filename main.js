const fs = require('fs');
const { Client, Intents } = require('discord.js');
const { Settings } = require("./utils/settings");

// Setting up intents and bot
const intents = [ 
    Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILDS,
]
const bot = new Client( {intents: intents} );


//Load events
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith(".js"));

for (const file of eventFiles){
    const event = require("./events/" + file);

    if(event.once)
        bot.once(event.name, (...args) => event.execute(...args));
    else
        bot.on(event.name, (...args) => event.execute(bot, ...args));
}


//Logging in bot
bot.login(Settings.token);
