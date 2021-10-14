/*
 * Place for all the functions that are connected to user objects
*/

const { ClientApplication, User, MessageMentions: { USERS_PATTERN }, Permissions } = require("discord.js");

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

async function UserFromMention(bot, mention){
    const matches = mention.match(USERS_PATTERN);

    // If supplied variable was not a mention, matches will be null instead of an array.
    if (!matches) return;

    // The first element in the matches array will be the entire mention, not just the ID,
    // so use index 1.
    const id = matches[1];

    return GetUser(bot, id);
}

async function GetUser(bot, id){
    try{
        return bot.users.cache.get(id);
    }catch(err){
        console.error(err)
        return;
    }
}

module.exports = {
    IsOwner,
    GetUser,
    UserFromMention,
};