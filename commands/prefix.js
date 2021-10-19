const Database = require("../utils/database");
const { Permissions, MessageEmbed } = require("discord.js");
const { errorEmbed } = require("../utils/embed");
const Config = require("../data/config.json")

async function deletePrefix(message){
    const affectedRows = await Database.ServerData.update(
        { PREFIX: null },
        {where: { ID: message.guildId } }
    );

    return affectedRows > 0;
}


async function inputTests(bot, message, text){
    
}


module.exports = {
    name: "prefix",
    cooldown: { IsOn: false, Time: null }, // Time given in milliseconds
    async execute(bot, message, ...args){
        if(!message.member.permissions?.has(Permissions.FLAGS.ADMINISTRATOR)){

            const embed = errorEmbed(
                bot,
                "Nincs jogod végrehajtani ezt a parancsot.",
                [ {name: "Hiányos rang", value: "Adminisztrátor"} ]
            );

            await message.reply({embeds: [embed]});

            return;
        }

        text = args.join("").trim();

        
        //check if the prefix starts with "törlés"
        //if yes and the prefix doesn't end like this, then show error
        if(text.startsWith("törlés")){
            if(text.length > "törlés".length){
                const embed = errorEmbed(
                    bot,
                    "Egy szerver saját prefixuma nem kezdődhet \"törlés\" szóval.",
                    [
                        {name: "Megadott prefixum", value: text, inline: false},
                        {name: "Lehetséges prefixum", value: text.replace("törlés", "torles"), inline: false}
                    ]
                );
    
                await message.reply({embeds: [embed]});

                return;
            }

            //if doesn't delete the prefix
            if(await deletePrefix(message) > 0){
                const embed = new MessageEmbed()
                    .setTitle("Sikeres parancs!")
                    .setAuthor(bot.user?.username, bot.user?.avatarURL(),Config.embed.inviteLink)
                    .setColor(Config.embed.colors.success)
                    .setDescription("A szerver saját prefixuma törölve lett.")
                    .setTimestamp();

                await message.reply({embeds: [embed]});
            }
            else{
                const embed = errorEmbed(
                    bot,
                    "A szerver saját prefixuma nem lett törölve"
                );

                await message.reply({embeds: [embed]});
            }
            
            return;
        }//and if they didn't give any arguments, then throw error
        else if(text.length <= 0){
            const embed = errorEmbed(
                bot,
                "Nem adtál meg prefixumot."
            );

            await message.reply({embeds: [embed]});

            return;
        }

        //if the prefix doesn't start with a special character then throw error
        const pattern = new RegExp("^[^.!@#$%^&*()_+-=*]");

        if(pattern.test(text)){
            const embed = errorEmbed(
                bot,
                "A szerver saját prefixumának egy különleges karakterrel kell kezdődnie.",
                [
                    {name: "Megadott prefixum", value: text, inline: false},
                    {name: "Példa prefixum", value: `!${text}\n`, inline: false}
                ]
            );

            await message.reply({embeds: [embed]});

            return;
        }

        //if the prefixs is longer than the maximum length then throw error
        if(text.length > 10){
            const embed = errorEmbed(
                bot,
                "A megadott prefixum több mint a megengedett hossz.",
                [
                    {name: "Maximum méret", value: "10", inline: false},
                    {name: "Megadott prefixum mérete", value: text.length.toString(), inline: false}
                ]
            );

            await message.reply({embeds: [embed]});

            return;
        }

        const affectedRows = await Database.ServerData.update(
            { PREFIX: text },
            {where: { ID: message.guildId } }
        );

        if(affectedRows.length > 0){

            const embed = new MessageEmbed()
                .setTitle("Sikeresen beállítottad a prefixumot")
                .setAuthor(bot.user?.username, bot.user?.avatarURL(), Config.embed.inviteLink)
                .setColor(Config.embed.colors.success)
                .setDescription(
                    "A megadott prefixumot lementettük az adatbázisunkba.\n" +
                    "A hibák elkerülése végett, eltávolítottuk az összes szóközt az utolsón kívül."
                    )
                .addField("Prefixum", `${text}`)
                .addField("Információ", "Emelett még lehet használni az alapvető prefixumot is")
                .setTimestamp();

            await message.reply({embeds: [embed]});
        }
    }
};