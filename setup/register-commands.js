const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { Settings } = require('../utils/settings');
const fs = require('fs');
const chalk = require("chalk");

function Register(){
    commands = []
    const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith(".js") || file.endsWith(".ts"));

    const clientId = Settings.clientId;
    const guildId = Settings.debug_guildId;


    for (const file of commandFiles) {
        const command = require(`../commands/${file}`);
        commands.push(command.data.toJSON());
    }

    const rest = new REST({ version: '9' }).setToken(Settings.token);


    (async () => {
        try {
            console.log(chalk.green('Started refreshing application (/) commands.'));

            if(Settings.debug){
                await rest.put(
                    Routes.applicationGuildCommands(clientId, guildId),
                    { body: commands },
                );
            }
            else{
                await rest.put(
                    Routes.applicationCommands(clientId),
                    { body: commands },
                );
            }

            console.log(chalk.greenBright('Successfully reloaded application (/) commands.'));
        } catch (error) {
            console.error(chalk.redBright(error));
        }
    })();
};

module.exports = Register