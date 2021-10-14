const Database = require("../utils/database");
const { ChannelManager } = require("discord.js");

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

        await channel.send(`Új tag csatlakozott! Üdvözlünk ${member}.`)

    }
};