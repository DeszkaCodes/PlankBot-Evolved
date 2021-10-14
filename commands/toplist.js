const Database = require("../utils/database");
const Config = require("../data/config.json");
const { GetUser } = require("../utils/userAuthentication");
const { ExpToLevel } = require("../utils/calculations");

async function ValidateUser(bot, row){
    const rawUser = await GetUser(bot, row.ID);

    const userString = rawUser == undefined ? "Ismeretlen tag" : rawUser;

    return `${userString} -> ${ExpToLevel(row.EXP)}`;
}

module.exports = {
    name: "toplista",
    async execute(bot, message, args){
        const count = await Database.LocalData.count({
            where: { SERVERID: message.guild.id }
        });

        const pages = Math.floor(count / Config.toplistPageLimit);

        const page = args[0] - 1;

        console.log(page)

        const { found, rows } = await Database.LocalData.findAndCountAll({
            attributes: { exclude: ["SERVERID", "BALANCE"] },
            where: { SERVERID: message.guild.id },
            limit: Config.toplistPageLimit,
            offset: page * 10,
            order: [["EXP", "DESC"]]
        });

        let text = "";
        let index = 1;

        for (let row of rows){

            const snippet = await ValidateUser(bot, row);

            text += `${index}. - ${snippet}\n`;

            index++;
        }

        await message.reply(text);

    }
};