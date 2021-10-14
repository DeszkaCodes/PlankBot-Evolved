const Sequelize = require("sequelize");
const Settings = require("../utils/settings");
const fs = require("fs");
const ANSI = require("../utils/ansi");

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
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    ID: {
        type: Sequelize.INTEGER,
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
        type: Sequelize.INTEGER,
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
        type: Sequelize.INTEGER(),
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
    MEMBERCHANNEL: {
        type: Sequelize.INTEGER,
        allowNull: true
    }
},
{ 
    timestamps: false
});



//FUNCTIONS
function Init(){
    try{
        LocalData.sync({force: false });
        GlobalData.sync({force: false });
        ServerData.sync({force: false });
    }
    catch (error){
        console.error(error.name());
        console.error(error.message());
        console.error(error.stack());
    }
};


//EXPORTS
module.exports = { Init, LocalData, GlobalData, ServerData };