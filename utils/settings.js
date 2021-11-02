const dotenv = require("dotenv");

dotenv.config( { path: "./data/.env"});

const Settings = {
    token : process.env.BOT_TOKEN,
    debug : process.env.DEBUG,
    clientId : process.env.CLIENT_ID,
    debug_guildId : process.env.DEBUG_GUILD_ID
}

module.exports = {Settings};