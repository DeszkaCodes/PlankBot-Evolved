


async function HandleCommand(bot, interaction){

	const command = bot.commands.get(interaction.commandName);

	    try {
	    	await command.execute(interaction);
	    } catch (error) {
	    	console.error(error);
	    	await interaction.reply(
                { content: 'There was an error while executing this command!', ephemeral: true }
            );
	    }
    }
};