const Database = require("../utils/database");
const { ChannelManager, MessageEmbed } = require("discord.js");
const Config = require("../data/config.json")

module.exports = {
    name: "guildMemberAdd",
    async execute(bot, member){

        const localData = await Database.LocalData.create({
            ID: member.id,
            SERVERID: member.guild.id
        });

        const [channelData, created] = await Database.ChannelData.findCreateFind({
            where: { ID: member.guild.id },
        });

        let channel = null

        if(channelData.MEMBERCHANNEL != undefined){
            channel = await ChannelManager.fetch(channelData.MEMBERCHANNEL);
        }
        else if(member.guild.systemChannel){
            channel = member.guild.systemChannel;
        }
        else{
            return;
        }

        const embed = new MessageEmbed()
            .setTitle("Új tag érkezett közénk")
            .addField(
                "Új tag neve",
                member.user?.username
            )
            .setAuthor(member.guild.name, member.guild.iconURL())
            .setColor(Config.embed.colors.default)
            .setThumbnail(member.user?.avatarURL())
            .setTimestamp();

        await channel.send({embeds: [embed]})

    }
};