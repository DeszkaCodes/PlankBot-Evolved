const Discord = require("discord.js");
const { errorEmbed } = require("../utils/embed");
const { GetInvite, IsOwner } = require("../utils/clientHelper");
const { SlashCommandBuilder } = require("@discordjs/builders");
const Config = require("../data/config.json");
const chalk = require("chalk");

module.exports = {
    data : new SlashCommandBuilder()
        .setName("hirdet")
        .setDescription("Elküldi az üzenetet minden szerver fő szobájába, ahol tag a bot.")
        .addStringOption(option => 
            option.setName("szöveg")
                .setDescription("A szöveg amit elküld a bot")
                .setRequired(true)),
    cooldown: { IsOn: false, Time: null }, // Time given in milliseconds
    async execute(bot, interaction){

        const text = interaction.options.getString("szöveg");

        if(!(await IsOwner(bot, interaction.user))){

            const embed = errorEmbed(
                bot,
                "Nincs jogod végrehajtani ezt a parancsot.",
                [ {name: "Indok", value: "Nem tartozol a bot tulajai közé."} ]
            );

            interaction.reply({embeds: [embed]});
            return;
        }

        const o2guilds = await bot.guilds.fetch();

        const inviteLink = GetInvite(bot, Discord.Permissions.FLAGS.ADMINISTRATOR);

        for (const [key, o2guild] of o2guilds){
            const guild = await o2guild.fetch();

            const embed = new Discord.MessageEmbed()
                .setTitle("FONTOS ÜZENET")
                .setAuthor(bot.user?.username, bot.user?.avatarURL(), inviteLink)
                .setColor("#e00000")
                .setDescription(text)
                .setTimestamp();

            guild.systemChannel?.send({embeds: [embed], content: "@everyone"});
        }

        const embed = new Discord.MessageEmbed()
            .setTitle("Üzenet sikeresen elküldve")
            .setDescription("Sikeresen elküldted az üzenetet minden szerverre.")
            .setColor(Config.embed.colors.success)
            .setTimestamp();

        interaction.reply({ embeds: [ embed ] });

        console.log(chalk.bold(`Global message sent to every possible guild:\n${text}\n\n`));
    }
};