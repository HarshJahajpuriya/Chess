const Sequelize = require('sequelize');

const sequelize = new Sequelize('chessdb', 'chessu', 'chessp', {
    dialect : 'mysql',
    host : 'localhost'
});

module.exports = sequelize;