const Sequelize = require("sequelize");
const Settings = require("../utils/settings");
const fs = require("fs");
const ANSI = require("../utils/ansi");
const Config = require("../data/config.json");

//Connection
if(!fs.existsSync("./data/database/db.sqlite")){

    console.log(`${ANSI.Colors.Text.Red}Database file does not exist`);

    fs.writeFile("./data/database/db.sqlite", "", function (err) {
        if (err){
            console.error("Data base file could not be written");
            console.error(err.message);
            throw err;
        }else
            console.log(`${ANSI.Colors.Text.Green}Database successfully created${ANSI.Colors.Text.White}`);
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
    ID: Sequelize.STRING(18)
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
        allowNull: true,
    },
    COMMAND: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false
    },
    EXECUTIONTIME: {
        type: Sequelize.DATE,
        allowNull: false
    }
},
{
    timestamps: false
});



//FUNCTIONS
function Init(){
    LocalData.sync({force: false, alter: { drop: Config.database.databaseDropAlter } }).catch(console.error);
    GlobalData.sync({force: false, alter: { drop: Config.database.databaseDropAlter } }).catch(console.error);
    ServerData.sync({force: false, alter: { drop: Config.database.databaseDropAlter } }).catch(console.error);
    ChannelData.sync({force: false, alter: { drop: Config.database.databaseDropAlter } }).catch(console.error);
    CommandCooldowns.sync({force: false, alter: { drop: Config.database.databaseDropAlter } }).catch(console.error);
};


//EXPORTS
module.exports = {
    Init,
    LocalData,
    GlobalData,
    ServerData,
    ChannelData,
    CommandCooldowns
};