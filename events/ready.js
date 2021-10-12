const Database = require("../utils/database")

module.exports = {
    name: "ready",
    once: true,
    execute(bot){
        Database.Init();

        console.log(`${bot.user.username} is ready`);
    }
};