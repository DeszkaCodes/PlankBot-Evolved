module.exports = {
    name: "ping",
    cooldown: { IsOn: false, Time: null }, // Time given in milliseconds
    help: {
        arguments: [],
        description: "Egy gyors check a bot válaszoló képességéről."
    },
    async execute(bot, message, args) {
        await message.reply("Pong.");
    }
};