const Database = require("../utils/database");
const { Op }= require("sequelize");
const Random = require("../utils/random");
const { StartsWithStringArray } = require("../utils/stringFunctions");
const { ExpToLevel } = require("../utils/calculations");
const { MessageEmbed, MessageAttachment } = require("discord.js");
const { errorEmbed } = require("../utils/embed");
const Config = require("../data/config.json");
const { FormatMillisec } = require("../utils/time");
const Canvas = require("canvas");
const fs = require("fs")



class LocalExp{
        static async HandleExp(message){
            //EXP Handling
            try{
                //Try to fetch the user's data or create it
                const [localData, found] = await Database.LocalData.findCreateFind({
                    where: { [Op.and]: { SERVERID: message.guildId, ID: message.author.id } },
                    defaults: { SERVERID: message.guildId, ID: message.author.id, }
                });
        
                const addedAmount = Random.RandomInt(
                    Config.EXPConstraints.local.min,
                    Config.EXPConstraints.local.max
                    );
        
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

        static async LevelHandling(bot, message){
            const [serverData, found] = await Database.ServerData.findCreateFind({
                attributes: [ "LEVELING" ],
                where: { ID: message.guildId }
            });
        
            if(!serverData.LEVELING) return;
        
            const exp = await this.HandleExp(message);
        
            const oldLvl = ExpToLevel(exp.oldExp);
            const newLvl = ExpToLevel(exp.newExp);
        
        
            // TODO: channel edit 
            if(oldLvl < newLvl){
        
                const attachment = await LocalExp.CreateImage(bot, message, exp.newExp, newLvl);

                //lvl up embed
                /*const embed = new MessageEmbed()
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
                    .setTimestamp();*/
        
                //await message.reply({embeds: [embed]});
                await message.reply({ files: [attachment] });
            }
        };

        static async CreateImage(bot, message, xp, lvl){

            //create base image with background
            const canvas = Canvas.createCanvas(700, 250);
            const context = canvas.getContext("2d");
            const background = await Canvas.loadImage("./files/images/backgrounds/levelUp.png");

            context.drawImage(background, 0, 0, canvas.width, canvas.height);


            //create text

            //TODO: continue
            const text = `${message.author?.username}\t${lvl} szint`;
            const fontSize = 24;
            context.font = `${fontSize}px verdana`;

            while(context.measureText(text).width > canvas.width - 300){
                context.font = `${fontSize-=10}px verdana`;
            }

            context.fillStyle = "#ffffff";
            context.fillText(text, canvas.width / 2.5, canvas.height / 2.8);


            //add user image
            const avatarLocation = {x: 50, y: 25, size: 200};

	        context.beginPath();
	        context.arc(
                100 + avatarLocation.x, 100 + avatarLocation.y, avatarLocation.size / 2, 0, Math.PI * 2, true
            );
	        context.closePath();
	        context.clip();
        
            const avatar = await Canvas.loadImage(message.author.displayAvatarURL({ format: 'jpg', size: 256 }));
            context.drawImage(avatar, avatarLocation.x, avatarLocation.y, avatarLocation.size, avatarLocation.size);


            //create an attachment and return it
            const attachment = new MessageAttachment(canvas.toBuffer(), "lvlUp.png");

            return attachment;
        }
};

class GlobalExp{
    static async HandleExp(message){
        //EXP Handling
        try{
            //Try to fetch the user's data or create it
            const [localData, found] = await Database.GlobalData.findCreateFind({
                where: { ID: message.author.id },
                defaults: { ID: message.author.id }
            });
    
            const addedAmount = Random.RandomInt(
                    Config.EXPConstraints.global.min,
                    Config.EXPConstraints.global.max
                );
    
            //Increment the exp of the user by a random amount
            const affectedRows = await Database.GlobalData.increment(
                { EXP:  +addedAmount },
                { where: { ID: message.author.id } }
            );
    
            return { newExp: localData.EXP + addedAmount, oldExp: localData.EXP };
    
        }catch(error){
            console.error(error.name);
            console.error(error.message);
            console.error(error.stack);
        }
    };
}

async function GetPrefix(message){
    const [serverData, created] = await Database.ServerData.findCreateFind({
        where: { ID: message.guildId },
        defaults: { ID: message.guildId, PREFIX: null },
    })

    prefixes = [Config.prefix]
    
    if(serverData.PREFIX != undefined) prefixes.push(serverData.PREFIX + " ");

    return prefixes;
};



async function HandleCooldown(bot, message, command){

    const cooldownInfo = bot.commands.get(command).cooldown;

    if(!cooldownInfo.IsOn) return {IsOn: false, Time: null};

    const result = await Database.CommandCooldowns.findOne({
        where: { [Op.and]: { ID: message.author.id, COMMAND: command, SERVERID: message.guildId } }
    });
    
    if(!result){
        if(!Number.isNaN(cooldownInfo.Time)){
            Database.CommandCooldowns.create({
                ID: message.author.id,
                SERVERID: message.guildId,
                COMMAND: command,
                ENDTIME: new Date(Date.now() + cooldownInfo.Time)
            });
        }
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
        

        await LocalExp.LevelHandling(bot, message);


        const PREFIX = await GetPrefix(message);

        
        //checks if the message starts with the correct prefix
        if(!(StartsWithStringArray(message.content, PREFIX) || message.content.startsWith(`<@!${bot.user.id}>`))) return;


        const args = message.content.trim().split(/ +/).slice(1);
	    const command = args.shift().toLowerCase();

        //checks if the command exist
        if(!bot.commands.has(command)){
            const embed = errorEmbed(
                bot, "A megadott parancs nem létezik.",
                [{name: "Megadott parancs", value: command}]
            )

            await message.reply({embeds: [embed]});

            return;
        }

        // checks if the command is on cooldown
        const cooldown = await HandleCooldown(bot, message, command)
        if(cooldown.IsOn){
            const embed = errorEmbed(
                bot, "Ezt a parancsot még nem tudod használni egy ideig.",
                [{name:"Következőnek használható", value: `${FormatMillisec(cooldown.Time)} múlva`}]
            )

            await message.reply({embeds: [embed]});

            return;
        }

        //executes the command
        try{
            bot.commands.get(command).execute(bot, message, args);

            //if the command was successfully execute add EXP
            GlobalExp.HandleExp(message);

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
        }
    }
};