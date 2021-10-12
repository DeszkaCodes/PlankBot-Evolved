const dotenv = require("dotenv");

dotenv.config( { path: "./data/.env"});

const Settings = {
    token : process.env.BOT_TOKEN,
    sqlDebug : Boolean(process.env.SQL_DEBUG),
}

module.exports = {Settings};