import { Client, PermissionResolvable } from "discord.js";

export function GetInvite(bot: Client, flags: Array<PermissionResolvable>) : string{
    const invite: string = bot.generateInvite({
        scopes: ['bot'],
        permissions: flags
    });

    return invite;
}