const { MessageEmbed, Permissions } = require("discord.js");
const Config = require("../data/config.json");
const { GetInvite } = require("../utils/clientHelper");

function errorEmbed(bot, errorMessage, fields) {
    const inviteLink = GetInvite(bot, Permissions.FLAGS.ADMINISTRATOR)

    const embed = new MessageEmbed()
        .setTitle("Hiba történt!")
        .setAuthor(bot.user?.username, bot.user?.avatarURL(), inviteLink)
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


function EmbedBotAuthor(bot){
    const inviteLink = GetInvite(bot, Permissions.FLAGS.ADMINISTRATOR);

    const embed = new MessageEmbed()
        .setAuthor(bot.user?.username, bot.user?.avatarURL(), inviteLink);

    return embed;
}


module.exports = {
    errorEmbed, EmbedBotAuthor
};