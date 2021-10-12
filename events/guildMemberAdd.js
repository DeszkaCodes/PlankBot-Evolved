const Database = require("../utils/database");
const { ChannelManager } = require("discord.js");

module.exports = {
    name: "guildMemberAdd",
    async execute(bot, member){

        const localData = await Database.LocalData.create({
            ID: member.id,
            SERVERID: member.guild.id
        });

        const [serverData, created] = await Database.ServerData.findCreateFind({
            where: { ID: member.guild.id },
            defaults: { ID: member.guild.id },
        });

        let channel = null

        if(serverData.MEMBERCHANNEL != undefined){
            channel = await ChannelManager.fetch(serverData.MEMBERCHANNEL);
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