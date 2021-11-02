const Database = require("../utils/database");
const { Permissions, MessageEmbed } = require("discord.js");
const { errorEmbed } = require("../utils/embed");
const Config = require("../data/config.json")
const { SlashCommandBuilder } = require("@discordjs/builders");

async function ChangeLeveling(bot, interaction){
    
    const option = interaction.options.getString("állapot") == "true";

    const affectedRows = await Database.ServerData.update(
        { LEVELING: option },
        { where: { ID: interaction.guildId } }
    );

    if(affectedRows.length > 0){

        const embed = new MessageEmbed()
            .setTitle(`Szintlépés sikeresen ${option ? "bekapcsolva" : "kikapcsolva"}`)
            .setAuthor(interaction.guild.name, interaction.guild.iconURL())
            .setColor(Config.embed.colors.success)
            .setDescription(`Mostantól a tagok ${option ? "szinteket léphetnek" : "nem léphetnek szinteket"}.`)
            .setTimestamp();

        interaction.reply({embeds: [embed]});
    }
    else{
        const embed = errorEmbed(bot,
            "A szintlépést nem tudtuk átállítani."
        );

        interaction.reply({embeds: [embed]});
    }
}

module.exports = {
    data : new SlashCommandBuilder()
        .setName("beállítások")
        .setDescription("A szerver különböző beállításai állítása.")
        .addSubcommand(command => 
            command.setName("szintlépés")
                .setDescription("Be/Ki kapcsolja a szintlépéseket")
                .addStringOption(option => 
                    option.setName("állapot")
                        .setDescription("Ki/Be kapcsolás")
                        .setRequired(true)
                        .addChoice("ki", "false")
                        .addChoice("be", "true"))),
    cooldown: { IsOn: false, Time: null }, // Time given in milliseconds
    async execute(bot, interaction) {
        if(!interaction.member.permissions?.has(Permissions.FLAGS.ADMINISTRATOR)) return;

        switch(interaction.options.getSubcommand()){
            case "szintlépés":
                ChangeLeveling(bot, interaction);
                break;
        }
    }
};