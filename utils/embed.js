const { MessageEmbed } = require("discord.js");
const Config = require("../data/config.json");

function errorEmbed(bot, errorMessage, fields) {
    const inviteLink = Config.embed.inviteLink

    const embed = new MessageEmbed()
        .setTitle("Hiba történt!")
        .setAuthor(bot.user?.username, bot.user?.avatarURL(), Config.embed.inviteLink)
        .setColor(Config.embed.colors.error)
        .setDescription(errorMessage)
        .setTimestamp();

    try{
        for (let field of fields) {
            embed.addField(
                field.name,
                field.value,
                field.inline ? true : false
            );
        };
    }catch(error){}

    return embed;
}


module.exports = {
    errorEmbed
};