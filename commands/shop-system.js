const { SlashCommandBuilder } = require('@discordjs/builders');
const { LocalData, Shop } = require("../utils/database");
const { Op } = require("sequelize");
const { errorEmbed } = require("../utils/embed");
const Config = require("../data/config.json");
const { MessageEmbed } = require("discord.js");

class EditShop{
    static async Hub(bot, interaction){

        switch(interaction.options.getSubcommand()){
            case "létrehoz":
                this.Create(bot, interaction);
                return;
            case "töröl":
                this.Delete(bot, interaction);
                return;
        }
    }

    static async Create(bot, interaction){
        const name = interaction.options.getString("név").substring(0,50);
        const description = interaction.options.getString("leírás").substring(0,255);
        const role = interaction.options.getRole("rang");
        const cost = Math.max(0, interaction.options.getInteger("ár"));
        let amount = interaction.options.getInteger("mennyiség", false);

        if(amount <= 0) amount = null;

        try{
            const dataPromise = await Shop.create({
                    SERVERID: interaction.guildId,
                    NAME: name,
                    DESCRIPTION: description,
                    TYPE: "role",
                    ID: role?.id,
                    PRICE: cost,
                    AMOUNT: amount <= 0 ? null : amount
                });
        }catch(err){
            if(err.name = "SequelizeUniqueConstraintError"){
                const embed = errorEmbed(
                    bot, "Ez a nevű áru már létezik",
                    [{name:"Megadott név", value: name}]
                );
            }else{
                const embed = errorEmbed(
                    bot, "Váratlan hibába ütköztünk",
                    [{name:"Hiba kód", value: error.name}]
                );
            }
        }

        const embed = new MessageEmbed()
            .setTitle("Áru sikeresen létrehozva")
            .setDescription("Hozzáadtál egy új árut a bolthoz")
            .setColor(Config.embed.colors.success)
            .setTimestamp()
            .addField("Neve", name, true)
            .addField("Rang", `<@&${role.id}>`, true)
            .addField("Leírás", description, false)
            .addField("Ára", cost.toLocaleString(), true)
            .addField("Mennyiség", amount.toLocaleString() ?? "Limitálatlan", true);

        
        interaction.reply({ embeds: [ embed ], ephemeral: true });
    }

    static async Delete(bot, interaction){
        const name = interaction.options.getString("neve").substring(0,50);

        const deletePromise = Shop.destroy(
            { where: { [Op.and]: [{ SERVERID: interaction.guildId }, { NAME: name }] } }
        ).catch(err => {
            const embed = errorEmbed(
                bot, "Váratlan hibába ütköztünk",
                [{ name: "Hiba kód", value: error.name }]
            )

            interaction.reply({ embeds: [ embed ] });

            return;
        });

        const destroyed = await deletePromise;

        if(destroyed <= 0){
            const embed = new MessageEmbed()
                .setTitle("Nem sikerült törölni az árut.")
                .setDescription("Nem létezik ilyen nevű áru.")
                .setColor(Config.embed.colors.error)
                .addField("Megadott név", name)
                .setTimestamp();

            interaction.reply({ embeds: [ embed ] });

            return;
        }

        const embed = new MessageEmbed()
                .setTitle("Áru sikeresen törölve")
                .setDescription("Sikeresen törölted az árut.")
                .setColor(Config.embed.colors.error)
                .addField("Törölt áru neve", name)
                .setTimestamp();

        interaction.reply({ embeds: [ embed ] });
    }
}

class Buy{
    async static Buy(bot, interaction){
        const [data, found] = await LocalData.findCreateFind({
            where: { [Op.and]: { SERVERID: interaction.guildId, ID: interaction.user.id } },
            defaults: { SERVERID: interaction.guildId, ID: interaction.user.id }
        });

        const name = interaction.options.getString("név").substring(0,50);
        const reciever = interaction.options.getMember("felhasználó", false) ?? interaction.member;

        const shopData = this._GetData(interaction, name);

        if(!shopData){

            const embed = new MessageEmbed()
                .setTitle("Vásárlás sikertelen")
                .setDescription("Nem létezik ilyen áru.")
                .setColor(Config.embed.colors.error)
                .setTimestamp()
                .addField("Megadott név", name);

            interaction.reply({ embeds: [ embed ] });

            return;
        }

        const hasBalance = this._ChangeBalance(interaction, shopData.PRICE)
    }
}


module.exports = {
    data: new SlashCommandBuilder()
        .setName("bolt")
        .setDescription("A szerver egyedi boltja")
        .addSubcommandGroup(commandGroup => 
            commandGroup.setName("szerkesztés")
                .setDescription("A bolt szerkesztéséhez kapcsolódó parancsok.")
                .addSubcommand(subcommand => 
                    subcommand.setName("létrehoz")
                        .setDescription("Létrehoz egy új árut")
                        .addStringOption(option => 
                            option.setName("név")
                                .setDescription("Az eladó áru neve, maximum 50 karakter")
                                .setRequired(true)
                            )
                        .addStringOption(option => 
                            option.setName("leírás")
                                .setDescription("Az eladó áru leírása, maximum 255 karakter")
                                .setRequired(true)
                            )
                        .addRoleOption(option =>
                            option.setName("rang")
                                .setDescription("A rang, amit meglehet venni")
                                .setRequired(true)
                            )
                        .addIntegerOption(option => 
                            option.setName("ár")
                                .setDescription("Az áru ára")
                                .setRequired(true)
                            )
                        .addIntegerOption(option => 
                            option.setName("mennyiség")
                                .setDescription("Vásárlási limit, ha nincs megadva bármennyi felhasználó megveheti")
                                .setRequired(false)
                            )
                    )
                .addSubcommand(subcommand => 
                    subcommand.setName("töröl")
                        .setDescription("Kitörli a megadott árut")
                        .addStringOption(option =>
                            option.setName("neve")
                                .setDescription("Az áru neve")
                                .setRequired(true)
                            )
                    )
            )
        .addSubcommand(subcommand => 
            subcommand.setName("vásárlás")
                .setDescription("Egy áru megvásárlása")
                .addStringOption(option => 
                    option.setName("név")
                        .setDescription("Az áru neve")
                        .setRequired(true)
                    )
                .addUserOption(option =>
                    option.setName("felhasználó")
                        .setDescription("Ha valakinek akarod ajándékba, itt jelölheted meg")
                        .setRequired(false)
                    )
            ),
    cooldown: { IsOn: false, Time: null }, // Time given in milliseconds
    async execute(bot, interaction) {
        
        switch(interaction.options.getSubcommandGroup()){
            case "szerkesztés":
                EditShop.Hub(bot, interaction);
                return;
        }

        switch(interaction.options.getSubCommand()){
            case "vásárlás":
                Buy.Buy(bot, interaction);
                return;
        }

    }
};