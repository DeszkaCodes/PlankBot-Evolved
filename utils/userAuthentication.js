/*
 * Place for all the functions that are connected to user objects
*/

const { ClientApplication, User } = require("discord.js");

async function IsOwner(bot, user){

    //fetches the bot's owner team
    const application = await bot.application?.fetch();
    const owner = application.owner;

    if(typeof owner === ClientApplication){
        if(owner.members.has(user.id))
            return true;

    }else if(typeof owner === User){
        if(owner.id == user.id)
            return true;

    }

    return false;
}

module.exports = {
    IsOwner
};