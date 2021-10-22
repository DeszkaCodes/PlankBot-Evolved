const Database = require("../utils/database");
const Config = require("../data/config.json");
const { GetUser } = require("../utils/userAuthentication");
const { ExpToLevel } = require("../utils/calculations");
const { MessageEmbed } = require("discord.js");

async function ValidateUser(bot, row){
    const rawUser = await GetUser(bot, row.ID);

    const userString = rawUser == undefined ? "Ismeretlen tag" : rawUser;

    return userString;
}

module.exports = {
    name: "toplista",
    cooldown: { IsOn: false, Time: null }, // Time given in milliseconds
    help: {
        arguments: [{name: "oldal", description: "az nézni kívánt oldal", optional: true}],
        description: "A szerver tagjai szint toplistája."
    },
    async execute(bot, message, args){
        const count = await Database.LocalData.count({
            where: { SERVERID: message.guild.id }
        });

        const pages = Math.ceil(count / Config.toplist.toplistPageLimit);

        //TODO: error handle if there is no page number
        //TODO: error handle if there are more pages than the limit

        if(args[0] == undefined || args[0] <= 0)
            args[0] = 0;
        else
            args[0] = args[0] - 1;

        const page = args[0] > pages ? pages-1 : args[0] ;

        const offset = page * Config.toplist.toplistPageLimit;

        const { found, rows } = await Database.LocalData.findAndCountAll({
            attributes: { exclude: ["SERVERID", "BALANCE"] },
            where: { SERVERID: message.guild.id },
            limit: Config.toplist.toplistPageLimit,
            offset: offset,
            order: [["EXP", "DESC"]]
        });


        const embed = new MessageEmbed()
            .setTitle("Szintek toplistája")
            .setAuthor(message.guild.name, message.guild.iconURL())
            .setColor(Config.embed.colors.default)
            .setDescription(`Az összes tag szintje csökkenő sorrendben.`)
            .setFooter(`${page+1}/${pages}`)
            .setTimestamp()

        let index = 1;

        for (let row of rows){

            const user = await ValidateUser(bot, row);

            const name = user.username ? user.username : "Ismeretlen tag";

            embed.addField(
                `${index + offset}. ${name}`,
                "\u200B",
                true
            );
            embed.addField(
                `Elért szint és tapasztalat`,
                `${ExpToLevel(row.EXP).toLocaleString()} szint\n${row.EXP.toLocaleString()} XP`,
                true
            );

            embed.addField("\u200B","\u200B", false);

            index++;
        }

        await message.reply({embeds: [embed]});
    }
};