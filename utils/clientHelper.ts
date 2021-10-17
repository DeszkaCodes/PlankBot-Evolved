import { Client, PermissionResolvable, User, Team, ClientApplication } from "discord.js";

export function GetInvite(bot: Client, flags: Array<PermissionResolvable>) : string{
    const invite: string = bot.generateInvite({
        scopes: ['bot'],
        permissions: flags
    });

    return invite;
}

export async function IsOwner(bot: Client, user: User): Promise<boolean>{

    //fetches the bot's owner team
    const application: (ClientApplication | undefined) = await bot.application?.fetch();

    if(application instanceof ClientApplication){
        const owner: (User | Team | null) = application.owner;
        
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