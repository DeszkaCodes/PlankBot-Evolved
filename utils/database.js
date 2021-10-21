const Sequelize = require("sequelize");
const Settings = require("../utils/settings");
const fs = require("fs");
const Config = require("../data/config.json");
const chalk = require("chalk")

//Connection
if(!fs.existsSync("./data/database/db.sqlite")){

    console.log(chalk.redBright("Database file does not exist"));

    fs.writeFile("./data/database/db.sqlite", "", function (err) {
        if (err){
            console.error(chalk.redBright("Data base file could not be written"));
            console.error(chalk.redBright(err.message));
            throw err;
        }else
            console.log(chalk.greenBright("Database successfully created"));
    });
}

const sequelize = new Sequelize("database", "user", "password", {
    host: 'localhost',
	dialect: 'sqlite',
	logging: false,
    storage: "./data/database/db.sqlite",
    force: false
});


// CUSTOM TYPES
const customTypes = {
    ID: Sequelize.STRING(18),
    SHA512: Sequelize.STRING(128)
}


//TABLES
const LocalData = sequelize.define("LocalData", {
    SERVERID: {
        type: customTypes.ID,
        primaryKey: true,
        allowNull: false
    },
    ID: {
        type: customTypes.ID,
        primaryKey: true,
        allowNull: false
    },
    EXP: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    BALANCE: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
    }
},
{
    timestamps: false
});

const GlobalData = sequelize.define("GlobalData", {
    ID: {
        type: customTypes.ID,
        primaryKey: true,
        allowNull: false
    },
    EXP: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
    }
},
{
    timestamps: false
});

const ServerData = sequelize.define("ServerData", {
    ID: {
        type: customTypes.ID,
        primaryKey: true,
        allowNull: false
    },
    PREMIUM: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    PREFIX: {
        type: Sequelize.STRING(10),
        allowNull: true,
    },
    LEVELING: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
},
{ 
    timestamps: false
});

const ChannelData = sequelize.define("ChannelData", {
    ID: {
        type: customTypes.ID,
        primaryKey: true,
        allowNull: false
    },
    MEMBERCHANNEL: {
        type: customTypes.ID,
        allowNull: true
    }
},
{ 
    timestamps: false
});

const CommandCooldowns = sequelize.define("CommandCooldowns", {
    ID: {
        type: customTypes.ID,
        primaryKey: true,
        allowNull: false
    },
    SERVERID: {
        type: customTypes.ID,
        primaryKey: true,
        allowNull: false
    },
    COMMAND: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false
    },
    ENDTIME: {
        type: Sequelize.DATE,
        allowNull: false
    }
},
{
    timestamps: false
});

const Shop = sequelize.define("Shop", {
    SERVERID: {
        type: customTypes.ID,
        primaryKey: true,
        allowNull: false
    },
    ID: {
        type: customTypes.SHA512,
        primaryKey: true,
        allowNull: false
    },
    ROLEID: {
        type: customTypes.ID,
        allowNull: false
    },
    PRICE: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    AMOUNT: {
        type: Sequelize.INTEGER
    }
});



//FUNCTIONS
async function Init(){
    await Promise.all([
        LocalData.sync({force: false, alter: { drop: Config.database.databaseDropAlter } }).catch(console.error),
        GlobalData.sync({force: false, alter: { drop: Config.database.databaseDropAlter } }).catch(console.error),
        ServerData.sync({force: false, alter: { drop: Config.database.databaseDropAlter } }).catch(console.error),
        ChannelData.sync({force: false, alter: { drop: Config.database.databaseDropAlter } }).catch(console.error),
        CommandCooldowns.sync({force: false, alter: { drop: Config.database.databaseDropAlter } }).catch(console.error),
        Shop.sync({force: false, alter: { drop: Config.database.databaseDropAlter } }).catch(console.error)
    ]);
};


//EXPORTS
module.exports = {
    Init,
    LocalData,
    GlobalData,
    ServerData,
    ChannelData,
    CommandCooldowns,
    Shop
};