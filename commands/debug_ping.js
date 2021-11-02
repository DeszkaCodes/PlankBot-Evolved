const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Ellenőrzi, hogy a bot megkapja az üzeneteid.'),
	cooldown: { IsOn: false, Time: null }, // Time given in milliseconds
	async execute(bot, interaction) {
		interaction.reply('Pong!');
	},
};