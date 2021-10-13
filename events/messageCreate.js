const Database = require("../utils/database");
const { Op }= require("sequelize");
const Random = require("../utils/betterRandom");
const { StartsWithStringArray } = require("../utils/stringFunctions");

const expConstraints = {
    min: 10,
    max: 15
};

async function HandleExp(message){
    //EXP Handling
    try{
        //Try to fetch the user's data or create it
        const localData = await Database.LocalData.findCreateFind({
            where: { [Op.and]: { SERVERID: message.guildId, ID: message.author.id } },
            defaults: { SERVERID: message.guildId, ID: message.author.id, }
        });

        //Increment the exp of the user by a random amount
        const affectedRows = await Database.LocalData.increment(
            { EXP:  +Random.RandomInt(expConstraints.min, expConstraints.max) },
            { where: { [Op.and]: { SERVERID: message.guildId, ID: message.author.id } } }
        );

        return affectedRows.EXP;

    }catch(error){
        console.error(error.name);
        console.error(error.message);
        console.error(error.stack);
    }
};

async function GetPrefix(message){
    const [serverData, created] = await Database.ServerData.findCreateFind({
        where: { ID: message.guildId },
        defaults: { ID: message.guildId, PREFIX: null },
    })

    prefixes = ["!pb "]
    
    if(serverData.PREMIUM)
        if(serverData.PREFIX != undefined) prefixes.push(serverData.PREFIX + " ");

    return prefixes;
};

module.exports = {
    name: "messageCreate",
    async execute(bot, message) {

        if(message.author.bot) return;

        const PREFIX = await GetPrefix(message);

        await HandleExp(message);


        if(!(StartsWithStringArray(message.content, PREFIX) || message.content.startsWith(`<@!${bot.user.id}>`))) return;

        const args = message.content.trim().split(/ +/).slice(1);
	    const command = args.shift().toLowerCase();


        if(!bot.commands.has(command)){
            await message.reply("Ez a parancs nem létezik.");
            return;
        }


        try{
            bot.commands.get(command).execute(bot, message, args);
        }catch(err){
            console.error(err.name);
            console.error(err.message);
            console.error(err.stack);

            await message.reply("Hiba történt.")
        }
    }
};