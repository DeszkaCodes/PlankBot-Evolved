const Database = require("../utils/database");
const { ChannelManager, MessageEmbed } = require("discord.js");
const { Op } = require("sequelize");
const Config = require("../data/config.json");

module.exports = {
    name: "guildMemberRemove",
    async execute(bot, member){

        const [channelData, created] = await Database.ChannelData.findCreateFind({
            where: { ID: member.guild.id },
        });

        const localData = Database.LocalData.destroy({
            where: { [Op.and]: { SERVERID: member.guild.id, ID: member.id }}
        });

        let channel = null;

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
            .setTitle("Egy tag távozott közülünk")
            .addField(
                "Volt tag neve",
                member.user?.username
            )
            .setAuthor(member.guild.name, member.guild.iconURL())
            .setColor(Config.embed.colors.default)
            .setThumbnail(member.user?.avatarURL())
            .setTimestamp();

        await channel.send({embeds: [embed]})

    }
};