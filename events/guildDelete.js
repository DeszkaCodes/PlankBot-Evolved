const Database = require("../utils/database");
const { Op } = require("sequelize")

module.exports = {
    name: "guildDelete",
    async execute(bot, guild) {

        const serverData = await Database.ServerData.destroy({
            where: { [Op.and]: { ID: guild.id, PREMIUM: false } }
        });

    }
};