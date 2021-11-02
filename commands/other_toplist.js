const Database = require("../utils/database");
const Config = require("../data/config.json");
const { GetUser } = require("../utils/userAuthentication");
const { ExpToLevel } = require("../utils/calculations");
const { MessageEmbed } = require("discord.js");
const { clamp } = require("../utils/math");
const { SlashCommandBuilder } = require("@discordjs/builders");

async function ValidateUser(bot, row){
    const rawUser = await GetUser(bot, row.ID);

    const userString = rawUser == undefined ? "Ismeretlen tag" : rawUser;

    return userString;
}

module.exports = {
    data : new SlashCommandBuilder()
        .setName("toplista")
        .setDescription("Az összes rang szintje csökkenő sorrendben")
        .addIntegerOption(option => 
            option.setName("oldal")
                .setDescription("Az oldal amelyiket meg szeretnéd tekinteni")),
    cooldown: { IsOn: false, Time: null }, // Time given in milliseconds
    async execute(bot, interaction){
        const count = await Database.LocalData.count({
            where: { SERVERID: interaction.guildId }
        });

        const pages = Math.ceil(count / Config.toplist.toplistPageLimit);

        if(pages <= 0){
            const embed = new MessageEmbed()
                .setTitle("Szintek toplistája")
                .setAuthor(interaction.guild.name, interaction.guild.iconURL())
                .setColor(Config.embed.colors.default)
                .setDescription(`Ezen a szerveren még senki nem ért el szintet.`)
                .setTimestamp();

            interaction.reply({ embeds: [ embed ] });

            return;
        }

        const rawPage = clamp(interaction.options.getInteger("oldal"), 1, pages)

        const page = rawPage - 1;

        const offset = page * Config.toplist.toplistPageLimit;

        const { found, rows } = await Database.LocalData.findAndCountAll({
            attributes: { exclude: ["SERVERID", "BALANCE"] },
            where: { SERVERID: interaction.guildId },
            limit: Config.toplist.toplistPageLimit,
            offset: offset,
            order: [["EXP", "DESC"]]
        });


        const embed = new MessageEmbed()
            .setTitle("Szintek toplistája")
            .setAuthor(interaction.guild.name, interaction.guild.iconURL())
            .setColor(Config.embed.colors.default)
            .setDescription(`Az összes tag szintje csökkenő sorrendben.`)
            .setFooter(`${page+1}/${pages}`)
            .setTimestamp()

        let index = 1;

        for (let row of rows){

            const lvl = ExpToLevel(row.EXP);

            if(lvl <= 0)
                continue;

            const user = await ValidateUser(bot, row);

            const name = user.username ? user.username : "Ismeretlen tag";

            embed.addField(
                `${index + offset}. ${name}`,
                "\u200B",
                true
            );
            embed.addField(
                `Elért szint és tapasztalat`,
                `${lvl.toLocaleString()} szint\n${row.EXP.toLocaleString()} XP`,
                true
            );

            embed.addField("\u200B","\u200B", false);

            index++;
        }

        interaction.reply({embeds: [embed]});
    }
};