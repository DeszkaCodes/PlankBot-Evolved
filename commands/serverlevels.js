const Database = require("../utils/database");
const { Permissions } = require("discord.js")

module.exports = {
    name: "szintlépés",
    async execute(bot, message, ...args) {
        if(!message.member.permissions?.has(Permissions.FLAGS.ADMINISTRATOR)) return;

        value = args.shift().toString().toLowerCase();

        option = value == "be" ? true : value == "ki" ? false : undefined;

        if(option == undefined) {
            await message.reply("A megadott érték csak \"be\" vagy \"ki\" lehet.");
            return;
        }

        const affectedRows = await Database.ServerData.update(
            { LEVELING: option },
            { where: { ID: message.guildId } }
        );

        if(affectedRows.length > 0)
            await message.reply(`Szintlépés sikeresen ${option ? "bekapcsolva" : "kikapcsolva"}.`);
        else
            await message.reply("Szintlépés nem lett átállítva.");

    }
};