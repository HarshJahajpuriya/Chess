const express = require('express');
const session = require('express-session');
const SocketIO = require('socket.io');
const path = require('path');
const router = require('./router/user');
const sequelize = require('./utils/database');
const { socketConnection } = require('./utils/socketConnection')




global.rootDir = __dirname;
global.loggedInUsersSocketMap = new Map();
global.ongoingGames = [];

const app = express();

app.use(express.static(path.join(__dirname, 'static')))
app.use(express.json())
app.use(session({secret: "chat-secret", resave: false, saveUninitialized: false, cookie:{maxAge: 60000*15}}));

app.use(router);

sequelize.sync(
    // {force : true}
).then( () => {
    console.log('Sequelization Done...')
    let httpServer = app.listen(5000, "0.0.0.0");
    let socketIO = SocketIO(httpServer);
    socketConnection(socketIO)
    
}).catch(err => {
    console.log(err)
})