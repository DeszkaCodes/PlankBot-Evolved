const Discord = require("discord.js");
const { errorEmbed } = require("../utils/embed");
const { GetInvite, IsOwner } = require("../utils/clientHelper");

module.exports = {
    name: "broadcast",
    cooldown: { IsOn: false, Time: null }, // Time given in milliseconds
    help: {
        arguments: [{name: "üzenet", description: "közvetítendő üzenet", optional: false}],
        description: "Elküldi az üzenetet minden szerver fő szobájába, ahol tag a bot."
    },
    async execute(bot, message, text){

        text = text.join(" ");

        if(!IsOwner(bot, message.author)){

            const embed = errorEmbed(
                bot,
                "Nincs jogod végrehajtani ezt a parancsot.",
                [ {name: "Indok", value: "Nem tartozol a bot tulajai közé."} ]
            );

            message.reply({embeds: [embed]});
            return;
        }

        const o2guilds = await bot.guilds.fetch();

        const inviteLink = GetInvite(bot, Discord.Permissions.FLAGS.ADMINISTRATOR);

        for (const [key, o2guild] of o2guilds){
            const guild = await o2guild.fetch();

            const embed = new Discord.MessageEmbed()
                .setTitle("FONTOS ÜZENET")
                .setAuthor(bot.user?.username, bot.user?.avatarURL(), inviteLink)
                .setColor("#e00000")
                .setDescription(text)
                .setTimestamp();

            guild.systemChannel?.send({embeds: [embed], content: "@everyone"});
        }

        console.log(`Global message sent to every possible guild:\n${text}\n\n`);
    }
};