const { Client, Intents } = require('discord.js');
const { Settings } = require("./util/settings")

// Setting up intents and bot
const intents = [ 
    Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILDS,
]
const bot = new Client( {intents: intents} );


//on bot ready
bot.once("ready", () => {
    console.log(`${bot.user.username} is ready`);
});


//on message
bot.on("messageCreate", async message => {
    if(message.author.bot) return;

    const PREFIX = "!pb ";

    console.debug(`add xp to ${message.author.username}`);

    console.debug(`echo ${message.content}`);

    console.debug(!(message.content.startsWith(PREFIX) || message.content.startsWith(`<@!${bot.user.id}>`)));

    if(!(message.content.startsWith(PREFIX) || message.content.startsWith(`<@!${bot.user.id}>`))) return;
    
    console.debug("mentioned");

    await message.reply("got it");

});

//Logging in bot
bot.login(Settings.token);
