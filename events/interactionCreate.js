const Database = require("../utils/database");
const { Op }= require("sequelize");
const { errorEmbed } = require("../utils/embed");
const { FormatMillisec } = require("../utils/time");


async function HandleCooldown(bot, interaction, command){

	const cooldownInfo = command.cooldown;

	if(!cooldownInfo.IsOn) return {IsOn: false, Time: null};

	const result = await Database.CommandCooldowns.findOne({
		where: { [Op.and]: { ID: interaction.user.id, COMMAND: command.data.name, SERVERID: interaction.guildId } }
	});

	if(!result){
		if(!Number.isNaN(cooldownInfo.Time)){
			Database.CommandCooldowns.create({
				ID: interaction.user.id,
				SERVERID: interaction.guildId,
				COMMAND: command.data.name,
				ENDTIME: new Date(Date.now() + cooldownInfo.Time)
			});
		}
		return {IsOn: false, Time: null};
	}

	if(Date.now() > result.ENDTIME){

		Database.CommandCooldowns.update(
			{ ENDTIME: new Date(Date.now() + cooldownInfo.Time) },
			{ where: { [Op.and]: { ID: interaction.user.id, COMMAND: command.data.name, SERVERID: interaction.guildId } }
		});

		return {IsOn: false, Time: null};
	}


	return {IsOn: true, Time: result.ENDTIME - Date.now() };
}

async function HandleCommand(bot, interaction){

	const command = bot.commands.get(interaction.commandName);

	if (!command) return;	

	const cooldown = await HandleCooldown(bot, interaction, command);

	if(cooldown.IsOn){
		const embed = errorEmbed(
			bot, "Ezt a parancsot még nem tudod használni egy ideig.",
			[{name:"Következőnek használható", value: `${FormatMillisec(cooldown.Time)} múlva`}]
		);

		interaction.reply({ embeds: [ embed ]})

		return;
	}


	try {
		command.execute(bot, interaction);
	} catch (error) {
		const embed = errorEmbed(
			bot, "Hiba történt a parancs feldolgozása közben.",
			[
				{name: "Megadott parancs", value: command},
				{name: "Hibakód", value: error}
			]
		)

		interaction.reply({ embeds: [ embed ] });
	}
}

module.exports = {
    name: "interactionCreate",
    async execute(bot, interaction){
		if (interaction.isCommand())
			HandleCommand(bot, interaction);
    }
};