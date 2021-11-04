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
            case "változtat":
                this.Change(bot, interaction);
                return;
        }
    }

    static async Create(bot, interaction){
        const name = interaction.options.getString("név").substring(0,50);
        const description = interaction.options.getString("leírás").substring(0,255);
        const role = interaction.options.getRole("rang");
        const cost = Math.max(0, interaction.options.getInteger("ár"));
        let amount = interaction.options.getInteger("mennyiség", false);

        const botRole = interaction.guild.me.roles.highest;
        let positionDifference;

        if(role.name == "@everyone"){
            const embed = new MessageEmbed()
                .setTitle("Áru nem lett létrehozva")
                .setDescription("Ez egy nem eladható rang.")
                .setColor(Config.embed.colors.error)
                .addField("Indok", "Ez egy alap beépített rang.")
                .setTimestamp();

            interaction.reply({ embeds: [ embed ], ephemeral: true  });

            return;
        }
        else if((positionDifference = role.comparePositionTo(botRole)) >= 0){
            const embed = new MessageEmbed()
                .setTitle("Áru nem lett létrehozva")
                .setDescription("Ezt a rangot nem tudja oda adni a bot.")
                .setColor(Config.embed.colors.error)
                .setTimestamp()
                .addField("Indok", "A bot kisebb vagy egyenlő rangú, mint a megadott rang.");

            if(positionDifference != 0)
                embed.addField("Szintkülönbség", positionDifference.toLocaleString());
            else
                embed.addField("Szintkülönbség", "Egyenlő rangúak");

            interaction.reply({ embeds: [ embed ], ephemeral: true  });

            return;
        }
        else if(role.managed){
            const embed = new MessageEmbed()
                .setTitle("Áru nem lett létrehozva")
                .setDescription("Ez egy nem eladható rang.")
                .setColor(Config.embed.colors.error)
                .addField("Indok", "Ez egy bot alapvető rangja.")
                .setTimestamp();

            interaction.reply({ embeds: [ embed ], ephemeral: true  });

            return;
        }

        if(amount <= 0) amount = null;

        try{
            const count = await Shop.count({
                where: { SERVERID: interaction.guildId, NAME: name}
            });

            if(count >= 1)
                throw {name: "SequelizeUniqueConstraintError"}

            await Shop.create({
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
                
                interaction.reply({ embeds: [ embed ] });

                return;

            }else{
                const embed = errorEmbed(
                    bot, "Váratlan hibába ütköztünk",
                    [{name:"Hiba kód", value: error.name}]
                );
                
                interaction.reply({ embeds: [ embed ] });

                return;

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
            .addField("Mennyiség", amount?.toLocaleString() ?? "Limitálatlan", true);

        
        interaction.reply({ embeds: [ embed ], ephemeral: true });
    }

    static async Change(bot, interaction){
        const name = interaction.options.getString("név", false)?.substring(0,50);
        const description = interaction.options.getString("leírás", false)?.substring(0,255);
        const role = interaction.options.getRole("rang", false);
        let cost = interaction.options.getInteger("ár", false);
        let amount = interaction.options.getInteger("mennyiség", false);

        cost = cost == null ? null : Max(0, cost);
        amount = amount == null ? null : Max(0, amount);
/*
        console.log(name);
        console.log(description);
        console.log(role);
        console.log(cost);
        console.log(amount);
*/
        const botRole = interaction.guild.me.roles.highest;
        let positionDifference;

        if(role?.name == "@everyone"){
            const embed = new MessageEmbed()
                .setTitle("Áru nem lett létrehozva")
                .setDescription("Ez egy nem eladható rang.")
                .setColor(Config.embed.colors.error)
                .addField("Indok", "Ez egy alap beépített rang.")
                .setTimestamp();

            interaction.reply({ embeds: [ embed ], ephemeral: true  });

            return;
        }
        else if((positionDifference = role?.comparePositionTo(botRole)) >= 0){
            const embed = new MessageEmbed()
                .setTitle("Áru nem lett létrehozva")
                .setDescription("Ezt a rangot nem tudja oda adni a bot.")
                .setColor(Config.embed.colors.error)
                .setTimestamp()
                .addField("Indok", "A bot kisebb vagy egyenlő rangú, mint a megadott rang.");

            if(positionDifference != 0)
                embed.addField("Szintkülönbség", positionDifference.toLocaleString());
            else
                embed.addField("Szintkülönbség", "Egyenlő rangúak");

            interaction.reply({ embeds: [ embed ], ephemeral: true  });

            return;
        }
        else if(role?.managed){
            const embed = new MessageEmbed()
                .setTitle("Áru nem lett létrehozva")
                .setDescription("Ez egy nem eladható rang.")
                .setColor(Config.embed.colors.error)
                .addField("Indok", "Ez egy bot alapvető rangja.")
                .setTimestamp();

            interaction.reply({ embeds: [ embed ], ephemeral: true  });

            return;
        }

        const embed = new MessageEmbed()
            .setTitle("Áru sikeresen megváltoztatva")
            .setDescription("Változtattál egy áru részein.")
            .setColor(Config.embed.colors.success)
            .setTimestamp()
            .addField("Neve", name, true)
            .addField("Megváltoztatott komponensek", Config.embed.empty)


        if(description){
            Shop.update(
                { DESCRIPTION: description },
                { where: { SERVERID: interaction.guildId, NAME: name} }
            );

            embed.addField("Megváltoztatott leírás", description);
        }

        if(role){
            Shop.update(
                { ID: role.id },
                { where: { SERVERID: interaction.guildId, NAME: name} }
            );

            embed.addField("Megváltoztatott rang", `<@&${role.id}>`);
        }

        if(cost){
            Shop.update(
                { PRICE: cost },
                { where: { SERVERID: interaction.guildId, NAME: name} }
            );

            embed.addField("Megváltoztatott ár", cost.toLocaleString())
        }

        if(amount){
            if(amount == 0){
                Shop.update(
                    { AMOUNT: null },
                    { where: { SERVERID: interaction.guildId, NAME: name} },
                );

                embed.addField("Kikapcsoltad a mennyiség limitet", Config.embed.empty)
            }
            else{
                Shop.update(
                    { AMOUNT: amount },
                    { where: { SERVERID: interaction.guildId, NAME: name} },
                );

                embed.addField("Megváltoztatott mennyiség", amount.toLocaleString())
            }
        }

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

            interaction.reply({ embeds: [ embed ], ephemeral: true  });

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

            interaction.reply({ embeds: [ embed ], ephemeral: true  });

            return;
        }

        const embed = new MessageEmbed()
                .setTitle("Áru sikeresen törölve")
                .setDescription("Sikeresen törölted az árut.")
                .setColor(Config.embed.colors.error)
                .addField("Törölt áru neve", name)
                .setTimestamp();

        interaction.reply({ embeds: [ embed ], ephemeral: true  });
    }
}

class Buy{
    static async BuyEntry(bot, interaction){
        const buyerDataPromise = LocalData.findCreateFind({
            where: { [Op.and]: { SERVERID: interaction.guildId, ID: interaction.user.id } },
            defaults: { SERVERID: interaction.guildId, ID: interaction.user.id }
        });

        const name = interaction.options.getString("név").substring(0,50);
        const reciever = interaction.options.getMember("felhasználó", false) ?? interaction.member;

        const shopDataPromise = Shop.findOne(
            { where : { [Op.and]: [ { SERVERID: interaction.guildId }, { NAME: name } ] }}
        );

        const shopData = await shopDataPromise;
        
        
        if(!shopData){
            
            const embed = new MessageEmbed()
                .setTitle("Vásárlás sikertelen")
                .setDescription("Nem létezik ilyen áru.")
                .setColor(Config.embed.colors.error)
                .setTimestamp()
                .addField("Megadott név", name);
                
                interaction.reply({ embeds: [ embed ], ephemeral: true  });
                
                return;
        };


        const rolePromise = interaction.guild.roles.fetch(shopData.ID);


        //Only get the data, not the boolean return
        const buyerData = (await buyerDataPromise)[0];

        if(buyerData.BALANCE < shopData.PRICE){

            const embed = new MessageEmbed()
                .setTitle("Vásárlás sikertelen")
                .setDescription("Nincs elegendő pénzed az áru megvásárlásához.")
                .setColor(Config.embed.colors.error)
                .setTimestamp()
                .addField("Egyenleged", buyerData.BALANCE.toLocaleString(), true)
                .addField("Áru ára", shopData.PRICE.toLocaleString(), true);

            interaction.reply({ embeds: [ embed ], ephemeral: true });

            return;
        };


        const role = await rolePromise;

        const botRole = interaction.guild.me.roles.highest;

        if(role.comparePositionTo(botRole) >= 0){
            const embed = new MessageEmbed()
                .setTitle("Vásárlás sikertelen")
                .setDescription("Ezt a rangot nem tudja oda adni a bot.")
                .setColor(Config.embed.colors.error)
                .setTimestamp()
                .addField("Indok", "A bot kisebb vagy egyenlő rangú, mint a vásárolni kívánt rang.", true)

            interaction.reply({ embeds: [ embed ], ephemeral: true });

            return;
        }
        else if(role.managed){
            const embed = new MessageEmbed()
                .setTitle("Vásárlás sikertelen")
                .setDescription("Ezt egy tiltott rang.")
                .setColor(Config.embed.colors.error)
                .setTimestamp()
                .addField("Indok", "Ezt a rangot csak botok használhatják", true)

            interaction.reply({ embeds: [ embed ], ephemeral: true });

            return;
        }


        reciever.roles.add(role, "Megvásárolta a boltban.");

        LocalData.increment(
            { BALANCE: -shopData.PRICE },
            { where: { SERVERID: interaction.guildId, ID: interaction.user.id } }
        );

        if(shopData.AMOUNT <= 0 && shopData.AMOUNT != null){
            const embed = new MessageEmbed()
                .setTitle("Vásárlás sikertelen")
                .setDescription("Ez a rang elfogyott.")
                .setColor(Config.embed.colors.error)
                .setTimestamp();

            interaction.reply({ embeds: [ embed ], ephemeral: true });

            return;
        }else if(shopData.AMOUNT != null){
            Shop.increment(
                { AMOUNT: -1 },
                { where: { SERVERID: interaction.guildId, NAME: name } }
            );
        }

        const embed = new MessageEmbed()
                .setTitle("Vásárlás sikeres")
                .setDescription("Sikeresen megvettél egy rangot.")
                .setColor(role.hexColor)
                .setTimestamp()
                .addField("Új egyenleged", (buyerData.BALANCE-shopData.PRICE).toLocaleString(), true)
                .addField("Megkapott rang", `<@&${role.id}>`, true)
                .addField("Leírás", shopData.DESCRIPTION, false)

        interaction.reply({ embeds: [ embed ] });

    };

    static async Show(bot, interaction){
        const countPromise = Shop.count(
            { where: { SERVERID: interaction.guildId } }
        );

        const rawPage = interaction.options.getInteger("oldal", false) ?? 1

        const pageLimit = 10;
        const count = await countPromise;
        const allPages = Math.ceil(count / pageLimit);
        const page = rawPage-1;
        const offset = page * pageLimit;

        const shopDataPromise = Shop.findAndCountAll({
            attributes: { exclude: ["SERVERID", "TYPE"] },
            where: { SERVERID: interaction.guildId },
            limit: pageLimit,
            offset: offset,
            order: [["PRICE", "DESC"]]
        });

        if(allPages <= 0){
            const embed = new MessageEmbed()
                .setTitle("Bolt")
                .setAuthor(interaction.guild.name, interaction.guild.iconURL())
                .setColor(Config.embed.colors.default)
                .setDescription(`Milyen üresség... bár lenne itt bármi.`)
                .setTimestamp();

            interaction.reply({ embeds: [ embed ] });

            return;
        }

        const embed = new MessageEmbed()
            .setTitle(`${interaction.guild.name} boltja`)
            .setDescription("Válogass, mi csak szemnek szájnak ingere")
            .setColor(Config.embed.colors.default)
            .setTimestamp()
            .setFooter(`${rawPage}/${allPages}`);


        const shopData = await shopDataPromise;

        for(let data of shopData.rows){
            //line 1
            embed.addField("Áru neve", data.NAME, true);
            embed.addField("Rang", `<@&${data.ID}>`, true);
            embed.addField("Ár", data.PRICE.toLocaleString(), true);

            //line 2
            embed.addField("Leírás", data.DESCRIPTION, false);

            //
            embed.addField(Config.embed.empty, Config.embed.empty, false);
        }

        interaction.reply({ embeds: [ embed ], ephemeral: true });

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
                .addSubcommand(subcommand =>
                        subcommand.setName("változtat")
                            .setDescription("Megváltoztat valamit egy létező árun")
                            .addStringOption(option => 
                                option.setName("név")
                                    .setDescription("A megváltoztatni kívánt áru neve")
                                    .setRequired(true)
                                )
                            .addStringOption(option => 
                                option.setName("leírás")
                                    .setDescription("A megváltoztatni kívánt áru leírása")
                                    .setRequired(false)
                                )
                            .addRoleOption(option =>
                                option.setName("rang")
                                    .setDescription("A megváltoztatni kívánt áru rangja")
                                    .setRequired(false)
                                )
                            .addIntegerOption(option => 
                                option.setName("ár")
                                    .setDescription("A megváltoztatni kívánt áru ára")
                                    .setRequired(false)
                                )
                            .addIntegerOption(option => 
                                option.setName("mennyiség")
                                    .setDescription("Vásárlási limit, ha nincs megadva bármennyi felhasználó megveheti")
                                    .setRequired(false)
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
            )
        .addSubcommand(subcommand => 
                subcommand.setName("mutat")
                    .setDescription("Megmutatja a boltot")
                    .addIntegerOption(option =>
                            option.setName("oldal")
                                .setDescription("A megnézni kívánt oldal")
                                .setRequired(false)
                        )
            ),
    cooldown: { IsOn: false, Time: null }, // Time given in milliseconds
    async execute(bot, interaction) {
        
        try{
            switch(interaction.options.getSubcommandGroup()){
                case "szerkesztés":
                    EditShop.Hub(bot, interaction);
                    return;
            }
        }catch(error){
            if (!error.name == "COMMAND_INTERACTION_OPTION_NO_SUB_COMMAND_GROUP"){

                const embed = errorEmbed(
                    bot, "Egy váratlan hiba történt.",
                    [{name: "Hiba neve", value:`${error.name}`}]
                );

                interaction.reply({ embeds: [ embed ], ephemeral: true });

                return;
            }
        }

        switch(interaction.options.getSubcommand()){
            case "vásárlás":
                Buy.BuyEntry(bot, interaction);
                return;
            case "mutat":
                Buy.Show(bot, interaction);
                return;
        }

    }
};