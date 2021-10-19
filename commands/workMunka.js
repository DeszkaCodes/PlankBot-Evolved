const { MessageEmbed } = require("discord.js");
const { RandomInt } = require("../utils/betterRandom");
const { LocalData } = require("../utils/database");
const { Op } = require("sequelize");
const Config = require("../data/config.json")

module.exports = {
    name: "munka",
    cooldown: { IsOn: true, Time: null }, // Time given in milliseconds
    async execute(bot, message, ...args){

        const [data, found] = await LocalData.findCreateFind({
            where: { [Op.and]: { SERVERID: message.guildId, ID: message.author.id } },
            defaults: { SERVERID: message.guildId, ID: message.author.id }
        });

        const payment = RandomInt(2500, 5000);
        
        const affectedRows = await LocalData.increment(
            { BALANCE: +payment },
            { where: { [Op.and]: {SERVERID: message.guild.id, ID: message.author.id } } }
        );

        if(affectedRows <= 0) return;

        console.log(payment)
        console.log(data.BALANCE)
        console.log(typeof payment)
        console.log(typeof data.BALANCE)

        const embed = new MessageEmbed()
            .setTitle("Szorgos dolgozó")
            .setAuthor(message.guild.name, message.guild.iconURL())
            .setDescription("Munkád után kapod a jutalmad.")
            .setTimestamp()
            .setColor(Config.embed.colors.money)
            .addFields(
                [
                    {name: "Fizetésed", value: payment.toLocaleString(), inline: true},
                    {name: "Új egyenleged", value: (data.BALANCE + payment).toLocaleString(), inline: true}
                ]
            )


        await message.reply({embeds: [embed], ephemeral: true});
    }
};