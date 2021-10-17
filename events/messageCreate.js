const Database = require("../utils/database");
const { Op }= require("sequelize");
const Random = require("../utils/betterRandom");
const { StartsWithStringArray } = require("../utils/stringFunctions");
const { ExpToLevel } = require("../utils/calculations");
const { MessageEmbed } = require("discord.js");
const Config = require("../data/config.json");

const expConstraints = {
    min: 10,
    max: 15
};

async function HandleExp(message){
    //EXP Handling
    try{
        //Try to fetch the user's data or create it
        const [localData, found] = await Database.LocalData.findCreateFind({
            where: { [Op.and]: { SERVERID: message.guildId, ID: message.author.id } },
            defaults: { SERVERID: message.guildId, ID: message.author.id, }
        });

        const addedAmount = Random.RandomInt(expConstraints.min, expConstraints.max);

        //Increment the exp of the user by a random amount
        const affectedRows = await Database.LocalData.increment(
            { EXP:  +addedAmount },
            { where: { [Op.and]: { SERVERID: message.guildId, ID: message.author.id } } }
        );

        return { newExp: localData.EXP + addedAmount, oldExp: localData.EXP };

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
    
    if(serverData.PREFIX != undefined) prefixes.push(serverData.PREFIX + " ");

    return prefixes;
};

async function LevelHandling(bot, message){
    const [serverData, found] = await Database.ServerData.findCreateFind({
        attributes: [ "LEVELING" ],
        where: { ID: message.guildId }
    });

    if(!serverData.LEVELING) return;

    const exp = await HandleExp(message);

    const oldLvl = ExpToLevel(exp.oldExp);
    const newLvl = ExpToLevel(exp.newExp);


    // TODO: channel edit 
    if(oldLvl < newLvl){


        const embed = new MessageEmbed()
            .setTitle("Szintlépés")
            .setAuthor(message.guild.name, message.guild.iconURL())
            .setDescription(`${message.member?.nickname ?? message.author.username} elérte a következő szintet.`)
            .addField(
                `Eddigi szint`,
                `${oldLvl == 0 ? "Nem ért még el szintet." : oldLvl }`,
                true
            )
            .addField(
                `Új szint`,
                `${newLvl}`,
                true
            )
            .setColor(Config.embed.colors.money)
            .setThumbnail(message.author.avatarURL())
            .setTimestamp();

        await message.reply({embeds: [embed]});
    }
}


module.exports = {
    name: "messageCreate",
    async execute(bot, message) {
        if(message.author.bot) return;

        const PREFIX = await GetPrefix(message);


        await LevelHandling(bot, message);


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