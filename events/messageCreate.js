const Database = require("../utils/database");
const { Op }= require("sequelize");
const Random = require("../utils/betterRandom");

const expConstraints = {
    min: 10,
    max: 15
}

module.exports = {
    name: "messageCreate",
    async execute(bot, message) {

        if(message.author.bot) return;

        const PREFIX = "!pb ";

        //EXP Handling
        try{
            //Try to fetch the user's data or create it
            const localData = await Database.LocalData.findOrCreate({
                where: { [Op.and]: { SERVERID: message.guildId, ID: message.author.id } },
                defaults: { SERVERID: message.guildId, ID: message.author.id, }
            });

            //Increment the exp of the user by a random amount
            const affectedRows = await Database.LocalData.increment(
                { EXP:  +Random.RandomInt(expConstraints.min, expConstraints.max) },
                { where: { [Op.and]: { SERVERID: message.guildId, ID: message.author.id } } }
            );

        }catch(error){
            console.error(error.name);
            console.error(error.message);
            console.error(error.stack);
        }


        if(!(message.content.startsWith(PREFIX) || message.content.startsWith(`<@!${bot.user.id}>`))) return;

        await message.reply("got it");
    }
}