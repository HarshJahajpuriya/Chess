const { DataTypes } = require("sequelize");
const sequelize = require('../utils/database');
const User = require("./user");

const Friend = sequelize.define('friend', {
    id : {
        type : DataTypes.INTEGER,
        primaryKey : true,
        autoIncrement : true,
        allowNull : false
    },
    userPhone : {
        field : 'user_phone',
        type : DataTypes.CHAR(10),
        allowNull : false
    },
    friendPhone : { 
        field : 'friend_phone',
        type : DataTypes.CHAR(10),
        allowNull : false
    } 
}, {
    timestamps : false
});

User.belongsToMany(User, {
    through: 'friends', 
    as: 'user_phone',
    foreignKey: 'user'
})

User.belongsToMany(User, {
    through: 'friends',
    as: 'friend_phone',
    foreignKey: 'phone'
})

module.exports = Friend;