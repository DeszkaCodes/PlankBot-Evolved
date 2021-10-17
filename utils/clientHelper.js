const { User, Team, ClientApplication } = require("discord.js");

export function GetInvite(bot , flags){
    const invite = bot.generateInvite({
        scopes: ['bot'],
        permissions: flags
    });

    return invite;
}

export async function IsOwner(bot, user){

    //fetches the bot's owner team
    const application = await bot.application?.fetch();

    if(application instanceof ClientApplication){
        const owner = application.owner;
        
        if(owner instanceof Team){
            if(owner.members.has(user.id))
                return true;
            
        }else if(owner instanceof User){
            if(owner.id == user.id)
                return true;
        }
    }
        
        return false;
}