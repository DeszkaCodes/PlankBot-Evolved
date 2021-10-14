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


//TABLES
const LocalData = sequelize.define("LocalData", {
    SERVERID: {
        type: Sequelize.STRING(18),
        primaryKey: true,
        allowNull: false
    },
    ID: {
        type: Sequelize.STRING(18),
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
        type: Sequelize.STRING(18),
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
        type: Sequelize.STRING(18),
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
        type: Sequelize.STRING(18),
        primaryKey: true,
        allowNull: false
    },
    MEMBERCHANNEL: {
        type: Sequelize.STRING(18),
        allowNull: true
    }
},
{ 
    timestamps: false
});


//FUNCTIONS
function Init(){
    try{
        LocalData.sync({force: false, alter: { drop: Config.database.databaseDropAlter }, }).catch(console.error);
        GlobalData.sync({force: false, alter: { drop: Config.database.databaseDropAlter }, }).catch(console.error);
        ServerData.sync({force: false, alter: { drop: Config.database.databaseDropAlter }, }).catch(console.error);
        ChannelData.sync({force: false, alter: { drop: Config.database.databaseDropAlter }, }).catch(console.error);
    }
    catch (error){
        console.error(ANSI.Colors.Tex.Red);

        console.error(error.name());
        console.error(error.message());
        console.error(error.stack());

        console.error(ANSI.Colors.Tex.White);
    }
};


//EXPORTS
module.exports = { Init, LocalData, GlobalData, ServerData, ChannelData };