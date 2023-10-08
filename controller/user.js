const { generateGuestId } = require("../utils/generateguestId");
const User = require("../model/user");
const bcrypt = require('bcrypt');
const sequelize = require("../utils/database");
const Sequelize = require("Sequelize");

module.exports.createGuestUser = (req, res, next) => {
    let name = req.body.name;
    console.log('Here in create Guest User controller')
    console.log(name)
    let user = User.build({
        id : null,
        name : name,
        phone : null,
        password : null 
    });
    let userToSend = JSON.parse(JSON.stringify(user));
    userToSend.mapId = generateGuestId();
    userToSend.password = undefined;
    req.session.user =  userToSend;
    res.json(userToSend);
}

module.exports.createUser = (req, res, next) => {
    let user = req.body;
    console.log(req.body);
    console.log('Create User Controller')

    user.password = bcrypt.hashSync(user.password, 12);
    User.create(user).then(user => {
        console.log(user.id);
        let userToSend = JSON.parse(JSON.stringify(user));
        userToSend.mapId = user.phone;
        userToSend.password = undefined;
        req.session.user =  userToSend;
        res.json(userToSend);
    }).catch(err => {
        console.log(err);
        res.status(500).json({message: 'User already exists with entered mobile number.'});
    })
    
}

module.exports.loginUser = async (req, res, next) => {
    let credentials = req.body.credentials;
    console.log("In controller Login")
    console.log(req.body);

    if(loggedInUsersSocketMap.has(credentials.phone)) {
        res.status(401).json({message : "User ALready Logged In"})
        return
    }

    try {
        let users = await User.findAll({where : {phone : credentials.phone}}, {raw : true} );
        if(users) {
            let isUserFound = false;
            console.log(users)
            for(user of users) { 
                if(bcrypt.compareSync(credentials.password, user.password)) {
                    isUserFound = true;
                    let userToSend = JSON.parse(JSON.stringify(user));
                    userToSend.mapId = user.phone;
                    userToSend.password = undefined;
                    
                    sequelize.query(
                        `SELECT * FROM friends WHERE user_phone = ${userToSend.mapId} OR friend_phone = ${userToSend.phone};`,
                        { type: Sequelize.QueryTypes.SELECT }
                    ).then(async (result) => {
                        console.log(result);
                        if(result.length == 0) {
                            req.session.user =  userToSend;
                            res.json(userToSend);
                                                        return;
                        } else {
                            let friends = [];
                            for(friend of result) {
                                if(friend.user_phone == userToSend.mapId) {
                                    let tmpFriend = await User.findOne({where : {phone : friend.friend_phone}}, {raw: true});
                                    tmpFriend = JSON.parse(JSON.stringify(tmpFriend))
                                    tmpFriend.password = undefined;
                                    friends.push(tmpFriend);
                                } else {
                                    let tmpFriend = await User.findOne({where : {phone : friend.user_phone}}, {raw : true});
                                    tmpFriend = JSON.parse(JSON.stringify(tmpFriend))
                                    tmpFriend.password = undefined;
                                    friends.push(tmpFriend);
                                }
                            }
                            userToSend.friends = friends;
                            res.json(userToSend);
                            return;
                        }

                    }) .catch(error => {
                        console.log(error)
                    })
                    
                    
                }
            }
            if(isUserFound == false)    res.status(401).json({message : "Invalid Password"})
        } else  res.status(401).json({message : "User Not Found"})
    } catch (err) {
        console.log(err);
        res.status(500).json({message : 'Internal Server Error'})
    }
}

module.exports.getLoggedInUser = (req, res, next) => {
    console.log('In get Logged In user');
    console.log(req.session.user);

    res.json(req.session.user);
}

module.exports.logoutUser = (req, res, next) => {
    console.log('In log out user');
    let user = null;
    if(req.session) {
        user = req.session.user;
        console.log('user')
        console.log(user)
        if(loggedInUsersSocketMap.has(user.mapId)) {
            loggedInUsersSocketMap.delete(user.mapId)
        }
    }   
    req.session.destroy();
    res.send({loggedOut: true, user: user});
}
 
module.exports.findOpponent = (req, res, next) =>  {
    console.log("Finding Opponent" )
    let opponentId = req.body.opponentId
    let message = '';
    if(loggedInUsersSocketMap.has(opponentId)) {
        let tmpUser = loggedInUsersSocketMap.get(req.session.user.mapId);
        if(tmpUser.opponentID === null) {
            tmpUser.opponentID = opponentId;
            tmpUser.opponentSocket = loggedInUsersSocketMap.get(opponentId).socket;
            loggedInUsersSocketMap.set(req.session.user.mapId, tmpUser);
            message = 'Opponent Found'
        } else 
            message = 'Opponent is playing a game.';
        
        
    } else {
        message = 'Invalid Opponent Id or Opponent is Offline.'
    }
    // addFriend(req);
    console.log(message)
    res.json({message : message});

}

module.exports.authenticateUser = (req, res, next) => { 
    console.log('Authenticating User');
    console.log(req.session)
    if(!req.session.user) {
        console.log('Redirected to home');
        res.redirect('/');
        return;
    }
    next();
}
