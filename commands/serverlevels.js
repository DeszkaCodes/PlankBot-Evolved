const Database = require("../utils/database");
const { Permissions, MessageEmbed } = require("discord.js");
const { errorEmbed } = require("../utils/embed");
const Config = require("../data/config.json")

module.exports = {
    name: "szintlépés",
    cooldown: { IsOn: false, Time: null }, // Time given in milliseconds
    async execute(bot, message, ...args) {
        if(!message.member.permissions?.has(Permissions.FLAGS.ADMINISTRATOR)) return;

        value = args.shift().toString().toLowerCase();

        option = value == "be" ? true : value == "ki" ? false : undefined;

        if(option == undefined) {

            const embed = errorEmbed(
                bot,
                "A megadott érték csak \"be\" vagy \"ki\" kapcsolás lehet",
                [ {name: "Beírt érték", value: value} ]
            )

            await message.reply({embeds: [embed]});
            return;
        }

        const affectedRows = await Database.ServerData.update(
            { LEVELING: option },
            { where: { ID: message.guildId } }
        );

        if(affectedRows.length > 0){

            const embed = new MessageEmbed()
                .setTitle(`Szintlépés sikeresen ${option ? "bekapcsolva" : "kikapcsolva"}`)
                .setAuthor(message.guild.name, message.guild.iconURL())
                .setColor(Config.embed.colors.success)
                .setDescription(`Mostantól a tagok ${option ? "szinteket léphetnek" : "nem léphetnek szinteket"}.`)
                .setTimestamp();

            await message.reply({embeds: [embed]});
        }
        else{
            const embed = errorEmbed(bot,
                "A szintlépést nem tudtuk átállítani."
            );

            await message.reply({embeds: [embed]});
        }

    }
};