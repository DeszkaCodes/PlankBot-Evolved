module.exports = {
    name: "ping",
    async execute(bot, message, args) {
        await message.reply("Pong.");
    }
};