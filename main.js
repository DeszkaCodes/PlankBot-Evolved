const fs = require('fs');
const { Client, Intents } = require('discord.js');
const Discord = require('discord.js')
const { Settings } = require("./utils/settings");


// Setting up intents and bot
const intents = [ 
    Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILDS,
]
const bot = new Client( {intents: intents} );


//Load events
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith(".js") || file.endsWith(".ts"));

for (const file of eventFiles){
    const event = require("./events/" + file);

    if(event.once)
        bot.once(event.name, (...args) => event.execute(...args));
    else
        bot.on(event.name, (...args) => event.execute(bot, ...args));
}


//Load commands
bot.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith(".js") || file.endsWith(".ts"));

for (const file of commandFiles){
    const command = require("./commands/" + file);

    bot.commands.set(command.name, command);
}


//Logging in bot
bot.login(Settings.token);
