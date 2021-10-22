const { MessageEmbed } = require("discord.js");
const { errorEmbed, EmbedBotAuthor } = require("../utils/embed");
const Config = require("../data/config.json")

function ArgumentsToString(command){

    let text = `${Config.prefix} ${command.name}`;

    if(command.help.arguments.length <= 0){
        return text;
    };

    for(let argument of command.help.arguments){
        if(argument.optional)
            text += " <" + argument.name + " - " + argument.description + ">";
        else
            text += ` [${argument.name} - ${argument.description}]`
    };

    return text;
}

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

        const helpCommand = args[0][0];

        console.log(bot.commands)
        console.log(helpCommand)

        //search for the command
        if(!bot.commands.has(helpCommand)){
            const embed = errorEmbed(
                bot, "A megadott parancs nem található.",
                [{name: "Megadott parancs",value: helpCommand}]
            );

            await message.reply({embeds:[embed]});

            return;
        }
        const command = bot.commands.get(helpCommand);

        const embed = EmbedBotAuthor(bot)
            .setTitle("Parancs súgó")
            .setTimestamp()
            .setColor(Config.embed.colors.default);

        const argsText = ArgumentsToString(command);
        const description = command.help.description;

        embed.setDescription(`${description}\n${argsText}`);

        await message.reply({embeds:[embed]});
    }
};