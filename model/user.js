const { DataTypes } = require('sequelize');
const sequelize = require("../utils/database");

const User = sequelize.define('user', {
    id : {
        type : DataTypes.INTEGER,
        primaryKey : true,
        autoIncrement : true,
        allowNull : false
    },
    name : {
        type : DataTypes.CHAR(28),
        allowNull : false
    },
    phone : {
        type : DataTypes.CHAR(10),
        allowNull : false,
        unique : true
    },
    password : {
        type : DataTypes.STRING,
        allowNull : false
    }
}, {
    timestamps : false
})

module.exports = User;