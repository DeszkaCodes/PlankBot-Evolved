const { MessageEmbed } = require("discord.js");
const { errorEmbed, EmbedBotAuthor } = require("../utils/embed");
const Config = require("../data/config.json");
const { Capitalize } = require("../utils/stringFunctions.js");

function HowToUse(command){

    let text = `${Config.prefix} ${command.name}`;

    if(command.help.arguments.length <= 0){
        return text;
    };

    for(let argument of command.help.arguments){
        if(argument.optional)
            text += " <" + argument.name + ">";
        else
            text += ` [${argument.name}]`
    };

    return text;
};

async function HasCommand(bot, message, args){
    const helpCommand = args[0];

    //search for the command
    if(!bot.commands.has(helpCommand)){
        const embed = errorEmbed(
            bot, "A megadott parancs nem található.",
            [{name: "Megadott parancs",value: helpCommand}]
        );

        message.reply({embeds:[embed]});

        return;
    }
    const command = bot.commands.get(helpCommand);

    const embed = EmbedBotAuthor(bot)
        .setTitle(`Parancs súgó - ${command.name}`)
        .setTimestamp()
        .setColor(Config.embed.colors.default)
        .setDescription(command.help.description)
        .addFields([
            {name: "Használat", value: HowToUse(command), inline: false },
            {name: "Cooldown", value: `${command.cooldown.IsOn ? "Van" : "Nincs"}`, inline: false },
        ]);

    if(command.help.arguments.length > 0){
        embed.addField(Config.embed.empty, "**Paraméterek:**", false)
        for(let argument of command.help.arguments){
            embed.addField(
                `${Capitalize(argument.name)} ${argument.optional ? "*(opcionális)*" : ""}`,
                Capitalize(argument.description),
                false
            );
        };
    };

    message.reply({embeds:[embed]});
};

async function NoCommandsGiven(bot, message, args){
    const commands = bot.commands;

    let arguments = "";

    for(let command of commands){
        arguments += `**${command[1].name}**: ${command[1].help.description.split("\n")[0]}\n`;
    };
    

    const embed = EmbedBotAuthor(bot)
        .setTitle("Parancs súgó")
        .setColor(Config.embed.colors.default)
        .setTimestamp()
        .setDescription("Összes parancs listája.")
        .addField(`Parancsok\n${Config.embed.empty}`, arguments);

    message.reply({embeds:[embed]});
};

module.exports = {
    name: "súgó",
    cooldown: { IsOn: false, Time: null }, // Time given in milliseconds
    help:{
        arguments: [{name: "parancs", description: "a keresett parancs neve", optional: true}],
        description: "Az összes parancs kilistázása\nHa van megadott parancs, akkor annak a részletei."
    },
    async execute(bot, message, args){
        //if no command given exterminate the process
        if(args.length <= 0)
            NoCommandsGiven(bot, message, args);
        else
            HasCommand(bot, message, args);
    }
};