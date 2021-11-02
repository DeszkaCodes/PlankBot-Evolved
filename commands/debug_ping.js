const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Ellenőrzi, hogy a bot megkapja az üzeneteid.'),
	async execute(interaction) {
		await interaction.reply('Pong!');
	},
};