const { Time } = require("../utils/time");
const { MessageEmbed } = require("discord.js");
const { errorEmbed } = require("../utils/embed");
const { LocalData } = require("../utils/database");
const Config = require("../data/config.json");
const { clamp } = require("../utils/math");
const { RandomInt } = require("../utils/random");
const { Op } = require("sequelize");

function DecideSuccess(){
    /**
     * Calculates if the user successfuly robs
     * @return {boolean} true if the user was successfully or false if they failed
     */
    const failPercentage = clamp(Config.Jobs.Steal.failChance, 0, 100);
    const rnd = RandomInt(0, 100);

    //if the failpercentage is larger than the rng number then it meanst the user lost
    return failPercentage >= rnd ? false : true;
};

module.exports = {
    name: "lop",
    cooldown: { IsOn: true, Time: Time.minute * 15 }, // Time given in milliseconds
    help: {
        arguments: [],
        description: "Egy kockázatos pénzszerzési módszer.\nVigyázz, ha lebuksz nagy az ára!"
    },
    async execute(bot, message, ...args){
        
        //preparation for the command
        const wasSuccessful = DecideSuccess();
        const payment = RandomInt(Config.Jobs.Steal.reward.min, Config.Jobs.Steal.reward.max);

        const [data, found] = await LocalData.findCreateFind({
            where: { [Op.and]: { SERVERID: message.guildId, ID: message.author.id } },
            defaults: { SERVERID: message.guildId, ID: message.author.id }
        });

        let affectedRows = 0;

        if(wasSuccessful){
            affectedRows = await LocalData.increment(
                { BALANCE: +payment },
                { where: { [Op.and]: {SERVERID: message.guild.id, ID: message.author.id } } }
            );
        }else{
            affectedRows = await LocalData.increment(
                { BALANCE: -payment },
                { where: { [Op.and]: {SERVERID: message.guild.id, ID: message.author.id } } }
            );
        }

        if(affectedRows <= 0){
            const embed = errorEmbed(
                bot, "Menekülés közben elejtetted a pénzed.",
                [{name: "Egy váratlan hiba történt.", value: Config.embed.empty}]
            )

            message.reply({embeds: embed});

            return;
        }
        
        const embed = new MessageEmbed()
            .setAuthor(message.guild.name, message.guild.iconURL())
            .setTimestamp()
            .setFooter("A nyomozás miatt várnod kell 15 percet, mielőtt újra lophatsz majd.\n");

        if(wasSuccessful){
            embed.setDescription("Zökkenőmentesen ment a rablás.");
            embed.addField("Zsákmány", payment.toLocaleString());
            embed.addField("Új egyenleged", (data.BALANCE + payment).toLocaleString())
            embed.setColor(Config.embed.colors.money);
        }else{
            embed.setDescription(
                "Nyomokat hagytál és elkaptak a rendőrök.\nEgy kis \"borravalóért\" cserébe elengedtek."
            );
            embed.addField("Fizetett összeg", payment.toLocaleString());
            embed.addField("Új egyenleged", (data.BALANCE - payment).toLocaleString())
            embed.setColor(Config.embed.colors.error);
        }
        
        await message.reply({embeds: [embed]});
    }
};