const Database = require("../utils/database");
const { Time } = require("../utils/time");
const { Op } = require("sequelize");
const chalk = require("chalk");
const Config = require("../data/config.json")

module.exports = {
    name: "ready",
    once: true,
    async execute(bot){
        await Database.Init();

        //Sets functions to be run periodically
        const TrimCommandCooldownInterval = setInterval(function() {
            for (let command of bot.commands.filter(comm => comm.cooldown.IsOn)) {
                Database.CommandCooldowns.destroy({
                    where: {
                        [Op.and]: [
                            { COMMAND: command[0] },
                            { ENDTIME: {
                                [Op.lt]: Date.now()
                            }}
                        ]
                    }
                });
            }
        }, Config.intervals.cooldownTrim);
        console.log(chalk.greenBright(`${bot.user.username} is ready`));
    }
};