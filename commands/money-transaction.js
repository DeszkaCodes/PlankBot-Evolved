const { SlashCommandBuilder } = require('@discordjs/builders');
const { Op } = require("sequelize");
const { LocalData } = require("../utils/database");
const { MessageEmbed } = require("discord.js");
const Config = require("../data/config.json")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("utalás")
        .setDescription("Pénz átutalása valakinek")
        .addIntegerOption(option => 
            option.setName("összeg")
                .setDescription("Az átutalni kívánt összeg")
                .setRequired(true))
        .addUserOption(option => 
            option.setName("felhasználó")
                .setDescription("A felhasználó akinek utalod az összeget")
                .setRequired(true)),
    cooldown: { IsOn: false, Time: null }, // Time given in milliseconds
    async execute(bot, interaction) {
        
        const amount = interaction.options.getInteger("összeg");
        const reciever = interaction.options.getMember("felhasználó");

        const senderPromise = LocalData.findCreateFind({
            where: { [Op.and]: { SERVERID: interaction.guildId, ID: interaction.user.id } },
            defaults: { SERVERID: interaction.guildId, ID: interaction.user.id }
        });

        const recieverPromise = LocalData.findCreateFind({
            where: { [Op.and]: { SERVERID: interaction.guildId, ID: reciever.id } },
            defaults: { SERVERID: interaction.guildId, ID: reciever.id }
        });

        if(amount <= 0){
            const embed = new MessageEmbed()
                .setTitle("Sikertelen utalás")
                .setDescription("Az utalás sikertelen volt.")
                .addField("Indok", "Az utalni kívánt összegnek többnek kell lennie mint nulla.", false)
                .addField("Próbált utalás összege", amount.toLocaleString(), false)
                .setColor(Config.embed.colors.error)
                .setTimestamp();

            interaction.reply({ embeds: [ embed ] });

            return;
        }

        //await the creation of the data
        const senderData = (await senderPromise)[0];
        const recieverData = (await recieverPromise)[0];

        if(senderData.BALANCE < amount){
            const embed = new MessageEmbed()
                .setTitle("Sikertelen utalás")
                .setDescription("Az utalás sikertelen volt.")
                .addField("Indok", "Többet utaltál, mint amennyi pénzed van.", false)
                .addField("Próbált utalás összege", amount.toLocaleString(), true)
                .addField("Egyenleged", senderData.BALANCE.toLocaleString(), true)
                .addField("Különbség", (amount -  senderData.BALANCE).toLocaleString(), false)
                .setColor(Config.embed.colors.error)
                .setTimestamp();

            interaction.reply({ embeds: [ embed ] });

            return;
        }

        //Take the amount of money from the sender
        LocalData.increment(
            { BALANCE: -amount },
            { where: { [Op.and]: {SERVERID: interaction.guild.id, ID: interaction.user.id } } }
        );


        //Add the amount of money to the reciever
        LocalData.increment(
            { BALANCE: +amount },
            { where: { [Op.and]: {SERVERID: interaction.guild.id, ID: reciever.id } } }
        );

        const embed = new MessageEmbed()
            .setTitle("Sikeres utalás!")
            .setDescription("Az utalás sikeres volt.")
            .setColor(Config.embed.colors.money)
            .setTimestamp()
            .addField("Utalt összeg", amount.toLocaleString(), false)
            .addField("Új egyenleged", (senderData.BALANCE-amount).toLocaleString(), true)
            .addField(`${reciever.nickname ?? "Ismeretlen"} új egyenlege`, (recieverData.BALANCE + amount).toLocaleString(), true);

        interaction.reply({ embeds: [ embed ] });
    }
};