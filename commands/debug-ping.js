const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require("discord.js");

//TODO: make it fancy

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Visszaküldi a bot válaszidejét.'),
	cooldown: { IsOn: false, Time: null }, // Time given in milliseconds
	async execute(bot, interaction) {
		const embed = new MessageEmbed()
				.setTitle("Válaszidő")
				.setDescription("A bot válaszidejének lekérdezése")
				
				.setTimestamp();

		interaction.reply({ content: "Bot pingelése...", fetchReply: true }).then(async (msg) =>{
			const ping = msg.createdTimestamp - interaction.createdTimestamp;

			let color = "#00ff00";

			if(ping > 350)
				color = "#ff0000";
			else if(ping > 300)
				color = "#ff8c00";
			else if(ping > 250)
				color = "#ffcc00";
			

			embed.addField("Válaszidő", `*${ping}* ms`)
			embed.setColor(color)

			msg.edit({ embeds: [ embed ] });
		});
	},
};