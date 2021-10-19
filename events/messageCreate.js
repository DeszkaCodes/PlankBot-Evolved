const Database = require("../utils/database");
const { Op }= require("sequelize");
const Random = require("../utils/betterRandom");
const { StartsWithStringArray } = require("../utils/stringFunctions");
const { ExpToLevel } = require("../utils/calculations");
const { MessageEmbed } = require("discord.js");
const { errorEmbed } = require("../utils/embed");
const Config = require("../data/config.json");
const { FormatMillisec } = require("../utils/time");

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

async function HandleCooldown(bot, message, command){

    const cooldownInfo = bot.commands.get(command).cooldown;

    if(!cooldownInfo.IsOn) return {IsOn: false, Time: null};

    const result = await Database.CommandCooldowns.findOne({
        where: { [Op.and]: { ID: message.author.id, COMMAND: command, SERVERID: message.guildId } }
    });
    
    if(!result){
        Database.CommandCooldowns.create({
            ID: message.author.id,
            SERVERID: message.guildId,
            COMMAND: command,
            ENDTIME: new Date(Date.now() + cooldownInfo.Time)
        })
        return {IsOn: false, Time: null};
    }

    if(Date.now() > result.ENDTIME){

        Database.CommandCooldowns.update(
            { ENDTIME: new Date(Date.now() + cooldownInfo.Time) },
            { where: { [Op.and]: { ID: message.author.id, COMMAND: command, SERVERID: message.guildId } }
        });

        return {IsOn: false, Time: null};
    }

    
    return {IsOn: true, Time: result.ENDTIME - Date.now() };
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
            const embed = errorEmbed(
                bot, "A megadott parancs nem létezik.",
                [{name: "Megadott parancs", value: command}]
            )

            await message.reply({embeds: [embed]});

            return;
        }

        // TODO: handle cooldown
        const cooldown = await HandleCooldown(bot, message, command)
        if(cooldown.IsOn){
            const embed = errorEmbed(
                bot, "Ezt a parancsot még nem tudod használni egy ideig.",
                [{name:"Következőnek használható", value: `${FormatMillisec(cooldown.Time)} múlva`}]
            )

            await message.reply({embeds: [embed]});

            return;
        }


        try{
            bot.commands.get(command).execute(bot, message, args);
        }catch(err){
            console.error(err.name);
            console.error(err.message);
            console.error(err.stack);

            const embed = errorEmbed(
                bot, "Egy kezeletlen hiba történt.",
                [
                    {name:"Hiba neve:", value: err.name.toString()},
                    {name:"Hiba Üzenete:", value: err.message.toString()},
                ]
            )

            await message.reply("Hiba történt.")
        }
    }
};