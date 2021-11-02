const dotenv = require("dotenv");

dotenv.config( { path: "./data/.env"});

const Settings = {
    token : process.env.BOT_TOKEN
}

module.exports = {Settings};