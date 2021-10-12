const Sequelize = require("sequelize");
const Settings = require("../utils/settings");
const fs = require("fs");

//Connection
if(!fs.existsSync("./data/database/db.sqlite")){

    console.log("Database file does not exist");

    fs.writeFile("./data/database/db.sqlite", "", function (err) {
        if (err){
            console.error("Data base file could not be written");
            console.error(err.message);
            throw err;
        }else
            console.log("Database successfully created");
    });
}

const sequelize = new Sequelize("database", "user", "password", {
    host: 'localhost',
	dialect: 'sqlite',
	logging: console.log,
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


//FUNCTIONS
function Init(){
    try{
        LocalData.sync({force: false});

        GlobalData.sync({force: false});
    }
    catch (error){
        console.error(error.name())
    }
};


//EXPORTS
module.exports = { Init, LocalData, GlobalData };