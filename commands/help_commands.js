const { MessageEmbed } = require("discord.js");
const { errorEmbed } = require("../utils/embed");

module.exports = {
    name: "segítség",
    cooldown: { IsOn: false, Time: null }, // Time given in milliseconds
    /*ARGUMENTS:
    */
    async execute(bot, message, ...args){
        //if no command given exterminate the process
        if(args.length <= 0){
            const embed = errorEmbed(
                bot, "Nem adtad meg a parancsot, amiről segítséget kérsz."
            );

            await message.reply({embeds: [embed]});

            return;
        };

        const command = args[0];

        //search for the command
        if(!bot.commands.has(command)){
            const embed = errorEmbed(
                bot, "A megadott parancs nem található.",
                [{name: "Megadott parancs",value: command}]
            );

            await message.reply({embeds:[embed]});

            return;
        }

        
    }
};