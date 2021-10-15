const Database = require("../utils/database");
const { Op } = require("sequelize")

module.exports = {
    name: "guildDelete",
    async execute(bot, guild) {

        const serverData = await Database.ServerData.destroy({
            where: { [Op.and]: { ID: guild.id, PREMIUM: false } }
        });

        const channelData = await Database.ServerData.destroy({
            where: { ID: guild.id }
        });

        const owner = await guild.fetchOwner();

        await owner.send("tutorial");

    }
};