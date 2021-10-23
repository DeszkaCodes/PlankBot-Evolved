module.exports = {
    name: "ping",
    cooldown: { IsOn: false, Time: null }, // Time given in milliseconds
    help: {
        arguments: [],
        description: "Egy egyszerű program, hogy teszteld a bot látja-e az üzeneteid."
    },
    async execute(bot, message, args) {
        await message.reply("Pong.");
    }
};