const Database = require("../utils/database");
const { Time } = require("../utils/time");
const { Op } = require("sequelize");
const chalk = require("chalk");
const Config = require("../data/config.json")
const { ArrayCycle } = require("../utils/array");

async function SetupIntervals(bot){

    //Deletes already expired cooldowns from database
    setInterval(async function() {
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
            })
            .catch(err =>
                    console.error(err)
                );
        }
    }, Config.intervals.cooldownTrim);

    //Changes presence of bot
    const cycle = new ArrayCycle(Config.botUser.activity);
    setInterval(async function() {
        const activity = cycle.next();
        bot.user?.setActivity({ name: activity.name, type: activity.type });
    }, Config.intervals.changePresence);
}

module.exports = {
    name: "ready",
    once: true,
    async execute(bot){
        await Database.Init();

        //Sets functions to be run periodically
        await SetupIntervals(bot);
        
        console.log(chalk.greenBright(`${bot.user.username} is ready`));
    }
};