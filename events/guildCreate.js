const Database = require("../utils/database");
const { Op } = require("sequelize");

module.exports = {
    name: "guildCreate",
    async execute(bot, guild) {

        const serverData = await Database.ServerData.findOrCreate({
            where: { ID: guild.id },
            defaults: { ID: guild.id, PREFIX: null }
        });

    }
};