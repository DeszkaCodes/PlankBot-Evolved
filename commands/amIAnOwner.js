//const { IsOwner } = require("../utils/clientHelper.js");

module.exports = {
    name: "amianowner?",
    async execute(bot, message, ...args){
        //const isOwner = await IsOwner(bot, message.author);

        await message.reply(isOwner ? "Igen, bot tulajdonos vagy" : "Nem nem vagy bot tulajdonos");
    }
};