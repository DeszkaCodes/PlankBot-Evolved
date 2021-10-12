const Sequelize = require("sequelize");

//Connection
const sequelize = new Sequelize("database", "user", "password", {
    host: 'localhost',
	dialect: 'sqlite',
	logging: false,
    storage: "./data/database/db.sqlite"
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
});


//FUNCTIONS
function Init(){
    try{
        LocalData.sync();

        GlobalData.sync();
    }
    catch (error){
        console.error(error.name())
    }
};


//EXPORTS
module.exports = { Init, LocalData, GlobalData };