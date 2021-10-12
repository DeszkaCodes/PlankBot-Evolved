const Database = require("../utils/database");

module.exports = {
    name: "guildCreate",
    async execute(bot, guild) {

        const serverData = await Database.ServerData.findCreateFind({
            where: { ID: guild.id },
            defaults: { ID: guild.id }
        });

    }
};