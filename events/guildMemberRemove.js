const Database = require("../utils/database");
const { ChannelManager } = require("discord.js");
const { Op } = require("sequelize")

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

        await channel.send(`${member} elhagyta a szervert.`);

    }
};