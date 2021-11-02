const { MessageEmbed } = require("discord.js");
const { RandomInt } = require("../utils/random");
const { LocalData } = require("../utils/database");
const { Op } = require("sequelize");
const Config = require("../data/config.json");
const { Time } = require("../utils/time");
const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data : new SlashCommandBuilder()
        .setName("munka")
        .setDescription("Kockázatmentes pénzszerzési lehetőség."),
    cooldown: { IsOn: true, Time: Time.minute * 5 }, // Time given in milliseconds
    async execute(bot, interaction){
        
        const [data, found] = await LocalData.findCreateFind({
            where: { [Op.and]: { SERVERID: interaction.guildId, ID: interaction.user.id } },
            defaults: { SERVERID: interaction.guildId, ID: interaction.user.id }
        });

        const payment = RandomInt(Config.Jobs.Work.reward.min, Config.Jobs.Work.reward.max);
        
        const affectedRows = await LocalData.increment(
            { BALANCE: +payment },
            { where: { [Op.and]: {SERVERID: interaction.guild.id, ID: interaction.user.id } } }
        );

        if(affectedRows <= 0) return;

        const embed = new MessageEmbed()
            .setTitle("Szorgos dolgozó")
            .setAuthor(interaction.guild.name, interaction.guild.iconURL())
            .setDescription("Megjött a várva várt fizetésed.")
            .setTimestamp()
            .setColor(Config.embed.colors.money)
            .addFields(
                [
                    {name: "Fizetésed", value: payment.toLocaleString(), inline: true},
                    {name: "Új egyenleged", value: (data.BALANCE + payment).toLocaleString(), inline: true}
                ]
            )
            .setFooter("Hogy kipihend magad nem használhatod ezt a parancsot 5 percig.\n")


        interaction.reply({embeds: [embed], ephemeral: true});
    }
};