module.exports = {
    name: "ping",
    cooldown: { IsOn: false, Time: null }, // Time given in milliseconds
    async execute(bot, message, args) {
        await message.reply("Pong.");
    }
};