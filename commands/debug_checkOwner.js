const { IsOwner } = require("../utils/clientHelper");

module.exports = {
    name: "amianowner?",
    cooldown: { IsOn: false, Time: null }, // Time given in milliseconds
    help: {
        arguments: [],
        description: "Kimutatja, hogy a bot tulajaihoz tartozol-e."
    },
    async execute(bot, message, ...args){
        const isOwner = await IsOwner(bot, message.author);

        await message.reply(isOwner ? "Igen, bot tulajdonos vagy" : "Nem nem vagy bot tulajdonos");
    }
};