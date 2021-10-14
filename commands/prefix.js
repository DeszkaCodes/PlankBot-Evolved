const Database = require("../utils/database");
const { Permissions } = require("discord.js");

async function deletePrefix(message){
    const affectedRows = await Database.ServerData.update(
        { PREFIX: null },
        {where: { ID: message.guildId } }
    );

    return affectedRows > 0;
}

module.exports = {
    name: "prefix",
    async execute(bot, message, ...args){
        if(!message.member.permissions?.has(Permissions.FLAGS.ADMINISTRATOR)) return;

        text = args.join("").trim();

        if(text.startsWith("törlés")){
            if(text.length > "törlés".length){
                await message.reply("A prefixum nem kezdődhet a \"törlés\" szóval");
                return;
            }

            if(await deletePrefix(message) > 0)
                await message.reply("A saját prefixumot töröltük.");
            else
                await message.reply("A saját prefixumot nem tudtuk törölni.");
            
            return;
        }else if(text.length <= 0){
            await message.reply("Nem adtál meg semmilyen prefixumot.");
            return;
        }


        if(text.length > 10){
            await message.reply("A prefixum nem lehet 10 karakternél hoszabb.");
            return;
        }

        const affectedRows = await Database.ServerData.update(
            { PREFIX: text },
            {where: { ID: message.guildId } }
        );

        if(affectedRows.length > 0){
            await message.reply(
                `Saját prefixum létrehozva: ${text}\n` +
                "Emellett megmaradt az eredeti prefixum is.\n" +
                "Hibák elkerülése végett, a megadott prefixumból eltávolítottuk a szóközöket."
            )
        }
    }
};