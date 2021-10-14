const Database = require("../utils/database");
const { Colors } = require("../utils/ansi")

module.exports = {
    name: "ready",
    once: true,
    execute(bot){
        Database.Init();

        console.log(`${Colors.Text.Green}${bot.user.username} is ready${Colors.Text.White}`);
    }
};