const { addFriend } = require("./addFriend");
const { Game, Player } = require("./createGame");
const MapUser = require("./mapUser");

module.exports.socketConnection = (socketIO) => {
    socketIO.on('connection', (socket) => {
        console.log('Client Connected');
        console.log(socket.id);

        socket.on('disconnect', () => {
            console.log('Client disconnected');
            console.log(socket.id);
        })

        socket.on('InsertUserInMap', user => {
            console.log('InsertingUserInMap')
            let mapUser = new MapUser(user, socket);
            loggedInUsersSocketMap.set(user.mapId, mapUser);
            console.log(loggedInUsersSocketMap.keys())
        })
        
        socket.on('RemoveUserFromMap', (user) => {
            console.log(user);
            if(loggedInUsersSocketMap.has(user.mapId)) {
                loggedInUsersSocketMap.delete(user.mapId);
            }
            console.log(loggedInUsersSocketMap.keys())
        })

        socket.on('onChallenge', (challenge) => {
            opponent1 = challenge.opponent1;
            opponent1Socket = loggedInUsersSocketMap.get(opponent1)
            opponent2 = challenge.opponent2;
            opponent2Socket = loggedInUsersSocketMap.get(opponent2)
            wantsToAddFriend = challenge.wantsToAddFriend;
            console.log('Wants To Add Friend  :' + wantsToAddFriend)
            if(opponent2Socket) {
                let objectToSend = {
                    opponent1 : opponent1Socket.user,
                    opponent2 : opponent2Socket.user
                }
                opponent2Socket.socket.emit('onChallenge', objectToSend);
                addFriend(objectToSend.opponent1, objectToSend.opponent2, wantsToAddFriend);
            } else opponent1Socket.socket.emit('opponentIsOffline');
        })

        socket.on('onChallengeAccept', (challenge) => {
            opponent1 = challenge.opponent1;
            opponent1Socket = loggedInUsersSocketMap.get(opponent1.mapId)
            opponent2 = challenge.opponent2;
            opponent2Socket = loggedInUsersSocketMap.get(opponent2.mapId)
            // console.log('Challenge Accepted');
            // console.log(opponent1Socket)
            if(opponent1Socket) {
                let objectToSend = {
                    opponent1 : opponent1Socket.user,
                    opponent2 : opponent2Socket.user
                }
                opponent1Socket.socket.emit('onChallengeAccepted', objectToSend);
                opponent1Socket.isUserPlaying = true;
                opponent1Socket.gameId = ongoingGames.length;
                console.log(ongoingGames.length)
            }
        })

        socket.on('onChallengeReject', (challenge) => {
            opponent1 = challenge.opponent1.mapId;
            opponent2 = challenge.opponent2.mapId;
            console.log('Challenge Rejected');
            console.log(challenge)
            if(loggedInUsersSocketMap.get(opponent1))
                loggedInUsersSocketMap.get(opponent1).socket.emit('onChallengeRejected', {opponent1, opponent2});
        })

        socket.on('onBoard', (challenge) => {
            // console.log('OnBoard Server')
            opponent1 = challenge.opponent1;
            opponent1Socket = loggedInUsersSocketMap.get(opponent1.mapId)
            opponent2 = challenge.opponent2;
            opponent2Socket = loggedInUsersSocketMap.get(opponent2.mapId)
            if(opponent2Socket) {
                let objectToSend = {
                    opponent1 : opponent1Socket.user,
                    opponent2 : opponent2Socket.user
                }
                opponent2Socket.socket.emit('onBoard', objectToSend);
                opponent2Socket.isUserPlaying = true;
                opponent2Socket.gameId = ongoingGames.length;
                let player1 = new Player(opponent1.mapId, opponent1.name, 1);
                let player2 = new Player(opponent2.mapId, opponent2.name, 0);
                let game = new Game(opponent1, opponent2, opponent1Socket, opponent2Socket, player1, player2);
                ongoingGames.push(game);
                // console.log(ongoingGames)


                opponent1Socket.socket.emit('onGame', {player1, player2});
                opponent2Socket.socket.emit('onGame', {player1, player2});
            }
        })

        socket.on('onMove', moveDetails => {

            console.log("Executed onMove ...");

            // console.log(moveDetails)
            // console.log(ongoingGames)
            player = moveDetails.player;
            selectedPiece = moveDetails.piece;
            prevI = moveDetails.prevI;
            prevJ = moveDetails.prevJ;

            
            let game = null;
            ongoingGames.forEach(g => {
                // console.log(g.opponent1Id, g.opponent2Id, player.mapId)
                
                if(g.opponent1.mapId == player.mapId || g.opponent2.mapId == player.mapId) {
                    // console.log('1')
                    isGameValid = true;
                    game = g;
                }
            });

            // console.log(game)
            
            if(game === null) {
                console.log("Game does not exists...");  
                return;
            }
            
            
            turn = game.turn;
            // console.log(turn)

            // console.log('game.isplayer1InCheck()')
            // console.log(game.isplayer1InCheck())
            // console.log('game.isplayer2InCheck()')
            // console.log(game.isplayer2InCheck())
            

            if(turn == 1 && player.mapId == game.opponent1.mapId) {
                console.log("Player 1 turn")
                console.log(game.player1)
                console.log("ENDED HERE")
                game.selectPiece(selectedPiece, prevI, prevJ)
                if(game.movePiece(selectedPiece.i, selectedPiece.j, prevI, prevJ, game.player1)) {
                    console.log("PASSED1")
                    game.opponent2Socket.socket.emit('onOpponentMoved', {selectedPiece, prevI, prevJ, opponent : player})
                    if(game.turn == 1) game.turn = 0;
                    else game.turn = 1;
                }
                return
            } else if(turn == 0 && player.mapId == game.opponent2.mapId) {
                console.log("Player 2 turn")
                console.log(game.player2)
                console.log("ENDED HERE")
                game.selectPiece(selectedPiece, prevI, prevJ)
                if(game.movePiece(selectedPiece.i, selectedPiece.j, prevI, prevJ, game.player2)) {
                    console.log("PASSED")
                    game.opponent1Socket.socket.emit('onOpponentMoved', {selectedPiece, prevI, prevJ, opponent : player})
                    if(game.turn == 1) game.turn = 0;
                    else game.turn = 1;
                }
                return;
                
            } else {
                console.log("H")
                console.log(turn, player.mapId, game.opponent1.mapId, game.opponent2.mapId, prevI, prevJ)
            }
            opponent1Socket = game.opponent1Socket;
            opponent2Socket = game.opponent2Socket;

        }) 

    })
}