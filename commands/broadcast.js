const Discord = require("discord.js");
const { IsOwner } = require("../utils/userAuthentication")

module.exports = {
    name: "broadcast",
    async execute(bot, message, text){

        text = text.join(" ");

        if(!IsOwner(bot, message.author)){
            await message.reply("Nincs jogod végre hajtani ezt a parancsot");
            return;
        }

        const o2guilds = await bot.guilds.fetch();

        const inviteLink = "https://discord.com/api/oauth2/authorize?client_id=890537505605181480&permissions=8&scope=bot";

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