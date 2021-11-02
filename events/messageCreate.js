const Database = require("../utils/database");
const { Op }= require("sequelize");
const Random = require("../utils/random");
const { ExpToLevel } = require("../utils/calculations");
const { MessageAttachment } = require("discord.js");
const Config = require("../data/config.json");
const Canvas = require("canvas");
const { ResponsiveText } = require("../utils/imagemanipulator");



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
            //create all promises
            const expPromise = this.HandleExp(message);
            
            const exp = await expPromise;
            
            const oldLvl = ExpToLevel(exp.oldExp);
            const newLvl = ExpToLevel(exp.newExp);
            
            const attachmentPromise = LocalExp.CreateImage(bot, message, exp.newExp, newLvl);

            const [serverData, found] = await Database.ServerData.findCreateFind({
                attributes: [ "LEVELING" ],
                where: { ID: message.guildId }
            });

            
            if(!serverData.LEVELING) return;
        
            // TODO: channel edit 
            if(oldLvl < newLvl){
        
                const attachment = await attachmentPromise

                message.reply({ files: [attachment] });
            }
        };

        static async CreateImage(bot, message, xp, lvl){

            const backgroundPromise = Canvas.loadImage("./files/images/backgrounds/levelUp.png");
            const avatarPromise = Canvas.loadImage(message.author.displayAvatarURL({ format: 'jpg', size: 256 }));

            //create base image with background
            const canvas = Canvas.createCanvas(700, 250);
            const context = canvas.getContext("2d");
            const background = await backgroundPromise;

            context.drawImage(background, 0, 0, canvas.width, canvas.height);


            //create text

            context.fillStyle = "#ffffff";

            let text = "SZINTLÉPÉS!"
            context.font = "bold 36px verdana";

            context.fillText(text, canvas.width / 2.5, canvas.height / 3);

            text = `${message.author.username} elérte a(z) ${lvl}. szintet`;

            context.font = ResponsiveText(
                    canvas, 300,
                    text,
                    30
                );

            context.fillText(text, canvas.width / 2.5, canvas.height / 1.90);

            text = `${xp} XP`;

            context.font = ResponsiveText(
                canvas, 100,
                text,
                18,
                "italic normal lighter"
            );

            context.fillText(text, canvas.width / 2.5, canvas.height / 1.4);


            //add user image
            const avatarLocation = {x: 50, y: 25, size: 200};

	        context.beginPath();
	        context.arc(
                100 + avatarLocation.x, 100 + avatarLocation.y, avatarLocation.size / 2, 0, Math.PI * 2, true
            );
	        context.closePath();
	        context.clip();
        
            const avatar = await avatarPromise;
            context.drawImage(avatar, avatarLocation.x, avatarLocation.y, avatarLocation.size, avatarLocation.size);
            context.strokeStyle = "#000000";
            context.lineWidth = 5;
            context.stroke();


            //create an attachment and return it
            const attachment = new MessageAttachment(canvas.toBuffer(), "lvlUp.png");

            return attachment;
        }
};

module.exports = {
    name: "messageCreate",
    async execute(bot, message) {
        if(message.author.bot) return;
        
        LocalExp.LevelHandling(bot, message);
    }
};