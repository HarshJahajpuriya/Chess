let guestAccountFormBtn = document.querySelector('.guest-account-form-btn');
let modalCloseBtns = document.querySelectorAll(".close-modal");

let loggedInUser = null;
let socket = null;
const BLACK = 0;
const WHITE = 1;
let player1 = null;
let player2 = null;
let opponentId = null;

let player1DeadPiecesCount = 0;
let player2DeadPiecesCount = 0;


// myAlert("You are in check")
function myAlert(message) {
    console.log('In my alert' + message)
    document.querySelector('.alert-message').innerHTML = message;
    document.querySelector('.alert-div-container').style.top = "0";
    setTimeout(() => {
        document.querySelector('.alert-div-container').style.top = "-100px";
    }, 2000)
}

function myConfirm(message) {
    document.querySelector('.confirm-message').innerHTML = message;
    document.querySelector('.confirm-div-container').style.top = "0";
    setTimeout(() => {
        document.querySelector('.confirm-div-container').style.top = "-130px";
    }, 5000);
}

function confirmation(value, wantsToAddFriend) {
    console.log("Confirming " + value);
    if(value == true) {
        let opponent1 = loggedInUser.mapId;
        let opponent2 = opponentId;
        if(wantsToAddFriend != true)    wantsToAddFriend = document.getElementById("wantsToAddFriend").checked;
        console.log('Opponent1')
        console.log(opponent1)
        console.log('Opponent2')
        console.log(opponent2)
        socket.emit('onChallenge', {opponent1, opponent2, wantsToAddFriend});
        document.querySelector('.confirm-div-container').style.top = "-130px";
    } else if(value === false) {
        document.querySelector('.confirm-div-container').style.top = "-130px";
    }
}

function askToPlayFromList(oppId) {
    oppId = oppId.toString();
    opponentId = oppId;
    confirmation(true, true);
}

getLoggedInUser() 
.then(result => {
    if(result){
        console.log(result)
        socket = io();
        loggedInUser = result;
        socket.emit('InsertUserInMap', result);
        showLogInUserInterface(result); 
    }
}).catch(error => {
    console.log(error)
})

function eventListenerFromBackdrop() {
    loginModal.style.visibility = 'hidden';
}

function activeBackdrop(flag) {
    if (flag) {
        backdrop.style.zIndex = 100;
        backdrop.addEventListener('click', eventListenerFromBackdrop);
    } else {

        backdrop.style.zIndex = -100;

        if(loginModal.style.visibility == 'visible') {
            loginModal.style.visibility = 'hidden';
            loginForm.elements[0].value = ''
            loginForm.elements[1].value = ''
        } else if(signupModal.style.visibility == 'visible') {
            signupModal.style.visibility = 'hidden';
            signupForm.elements[0].value = ''
            signupForm.elements[1].value = ''
            signupForm.elements[2].value = ''
        } else if(guestModal.style.visibility == 'visible'){
            guestModal.style.visibility = 'hidden';
            guestForm.elements[0].value = ''
        }

        backdrop.removeEventListener('click', eventListenerFromBackdrop);
        removeErrors();
    }
}

backdrop.addEventListener('click', () => {
    activeBackdrop(false)
})

btnLogin.addEventListener('click', () => {
    activeBackdrop(true);
    loginModal.style.visibility = 'visible';
})
 
btnSignup.addEventListener('click', () => {
    activeBackdrop(true);
    signupModal.style.visibility = 'visible';
})

modalCloseBtns.forEach(closeBtn => {
    closeBtn.addEventListener('click', () => {
        activeBackdrop(false)
    })
})

guestAccountFormBtn.addEventListener('click', () => {
    activeBackdrop(true);
    guestModal.style.visibility = 'visible'
    loginModal.style.visibility = 'hidden';
    console.log(guestModal)
})

function displayInputError(inputElement, errMessage, opponentInputError) {
    if(opponentInputError) {
        inputElement.insertAdjacentHTML('afterend',
        `<div class="error"><small class="text-danger  opponent-input-error" style="float:right;" >**${errMessage}</small></div>`);   
        return
    }
    inputElement.insertAdjacentHTML('afterend',
        `<div class="error"><small class="text-danger" style="float:right;" >**${errMessage}</small></div>`);
}

function removeErrors() {
    document.querySelectorAll('.error').forEach(el => el.remove())
}

function enableForm(flag) {
    if(flag)
        document.querySelectorAll('input').forEach(input => input.disabled = false);
    else 
        document.querySelectorAll('input').forEach(input => input.disabled = true);
}

function addFriendInFriendList(friends) {
    if(!friends) {
        document.querySelector('.no-friend').style.display = 'visible';
        return;
    }
    let friendList = document.getElementById('friend-list');
    let friendLIHTML = '';
    for(friend of friends) {
        friendLIHTML = `<li class="friend">
                            <div class="name">  ${friend.name}  </div>
                            <button onclick="askToPlayFromList(${friend.phone})" class="btn invite-friend-btn">+</button>
                        </li>`;
        friendList.insertAdjacentHTML('beforeend', friendLIHTML);
    }
}

function showLogInUserInterface(user) {
    
    addFriendInFriendList(user.friends)

    activeBackdrop(false);
    document.querySelector('.opponent-input-container').style.zIndex = 20;
    if(user.id)    document.querySelector('.side-panel').style.left = '0';
    btnLogin.style.display = "none";
    btnSignup.style.display = "none";
    let loggedInUserIdHTML =`
        <div class="logged-in-user-info">
            <div class="logged-in-user-name">User Name : ${user.name}</div>
            <div class="logged-in-user-id">User ID : ${user.mapId}</div>
        </div>
        <button id="btnLogout" class="btn" onclick="logout()"> Logout </button>
    ` 
    document.querySelector('.title-holder').insertAdjacentHTML('beforeend', loggedInUserIdHTML)
}

function redirectToHome() {
    activeBackdrop(false);
    document.querySelector('.opponent-input-container').style.zIndex = -20;
    document.querySelector('.side-panel').style.left = '-310px';
    btnLogin.style.display = "inline-block";
    btnSignup.style.display = "inline-block";
    btnLogout.remove();
    document.querySelector('.logged-in-user-info').remove();
}

loginForm.addEventListener('submit', ev => {
    ev.preventDefault();
    removeErrors();
    enableForm(true);

    let phoneInput = loginForm.elements[0];
    let passwordInput = loginForm.elements[1];
    let errors = 0;
    let errMessage = '';


    errMessage = '';
    if (phoneInput.value.length == 0)
        errMessage = "Mobile number required"
    else if (!(/^[5-9][0-9]{9}$/).test(phoneInput.value))
        errMessage = "Invalid Mobile number"

    if(errMessage) {
        displayInputError(phoneInput, errMessage);
        errors++;
    } 

    errMessage = '';
        passwordInput.value = passwordInput.value.trim();
        if (passwordInput.value.length == 0) {
            displayInputError(passwordInput, "Password required");
            errors++;
        }   

    if(errors != 0) {
        enableForm(true);
        return;
    }

    loginUser({phone : phoneInput.value, password : passwordInput.value})
    .then(result => {
        console.log(result);
        socket = io();
        socketEventListeners(socket)
        loggedInUser = result;
        socket.emit('InsertUserInMap', result);
        showLogInUserInterface(result);
        enableForm(true);
    }).catch(err => {
        console.log(err);
        myAlert(err.message);
    })
})

signupForm.addEventListener('submit', ev => {
    ev.preventDefault()
    removeErrors();
    enableForm(false);
    
    let nameInput = signupForm.elements[0]; 
    let phoneInput = signupForm.elements[1];
    let passwordInput = signupForm.elements[2];

    let errors = 0

    let errMessage = '';
    nameInput.value = nameInput.value.trim();
    if (nameInput.value.length == 0)
        errMessage = "Name Required"
    else if (!(/^[A-Za-z ]*$/).test(nameInput.value))
        errMessage = "Name must contain characters"
    else if (nameInput.value.length < 2)
        errMessage = "Name must contain 2 characters"
    else if (nameInput.value.length > 20)
        errMessage = "Name must contain less than 20 characters"
    if(errMessage) {
        displayInputError(nameInput, errMessage);
        errors++;
    } 

    errMessage = '';
    if (phoneInput.value.length == 0)
        errMessage = "Mobile number required"
    else if (!(/^[5-9][0-9]{9}$/).test(phoneInput.value))
        errMessage = "Invalid Mobile number"
        if(errMessage) {
            displayInputError(phoneInput, errMessage);
            errors++;
        } 

    errMessage = '';
    passwordInput.value = passwordInput.value.trim();
    if (passwordInput.value.length == 0) {
        displayInputError(passwordInput, "Password required");
        errors++;
    }

    if(errors != 0)  {
        enableForm(true);
        return;    
    }   
    
    let user = new User(0, nameInput.value, phoneInput.value, passwordInput.value)
    createUser(user)
    .then(result => {
        console.log(result);
        socket = io();
        socketEventListeners(socket);
        loggedInUser = result;
        socket.emit('InsertUserInMap', result);
        showLogInUserInterface(result);
        enableForm(true);
    }).catch(err => {
        console.log(err);
        myAlert(err.message);
        enableForm(true)
    })
})

guestForm.addEventListener('submit', ev => {
    ev.preventDefault();
    removeErrors();
    enableForm(false);
    console.log(guestForm.elements)
    let nameInput = guestForm.elements[0];

    let errMessage = '';
    nameInput.value = nameInput.value.trim();
    if (nameInput.value.length == 0)
        errMessage = "Name Required"
    else if (!(/^[A-Za-z ]*$/).test(nameInput.value))
        errMessage = "Name must contain characters"
    else if (nameInput.value.length < 2)
        errMessage = "Name must contain 2 characters"
    else if (nameInput.value.length > 20)
        errMessage = "Name must contain less than 20 characters"
    if(errMessage) {
        displayInputError(nameInput, errMessage);
        enableForm(true);
        return;   
    } 
    
    createGuestAccount({name: nameInput.value})
    .then(result => {
        console.log('resolved here')
        console.log(result)
        socket = io();
        socketEventListeners(socket)
        loggedInUser = result;
        socket.emit('InsertUserInMap', result);
        console.log("InsertUserInMap Executed just before this line.")
        showLogInUserInterface(result);
        enableForm(true);
    }).catch( err => {
        console.log(err)
        myAlert(err.message);
    })
})

function logout() {
    logoutUser()
    .then( result => {
        console.log(result)
        if(result.loggedOut === true) {
            if(result.user != null)     
                socket.emit('RemoveUserFromMap', result.user);
            socket = null;
            redirectToHome();
        }    
    }).catch( error => {
        console.log(error)
    }) 
}

function onOpponentIdInputKeyUp(opponentIdInput) {
    removeErrors();
    opponentId = opponentIdInput.value;

    let errors = 0;
    
    if (opponentId.length == 0) {
        displayInputError(opponentIdInput, 'Mobile Number Required', true);
        errors++;
    } else if(opponentId.search(' ') != -1) {
        displayInputError(opponentIdInput, 'Id cannot contain spaces', true);
        errors++;
    } else if (!(/^[5-9][0-9]{9}$/).test(opponentId)) {
        displayInputError(opponentIdInput, 'Invalid Mobile Number', true);
        errors++;
    } else if (parseInt(loggedInUser.mapId) == opponentId) {
        displayInputError(opponentIdInput, 'Enter Opponent Mobile Number', true);
        errors++;
    }

    if(errors == 0) {
        
    findOpponent({opponentId : opponentId}).then(result => {
        let message = result.message;
        console.log(result)
        if(message == 'Opponent Found') {
            myConfirm(`Ask ${opponentId} to play...`);    
            setTimeout(() => {
                opponentIdInput.value = '';
            }, 2000)            
        } else {
            myAlert(message);
        } 
    }).catch (err => {
        console.log(err)
    })

    }

}
 
function challengeAccepted() {
    console.log('Challenge Accepted')
    socket.emit('onChallengeAccept', {opponent1, opponent2})
}

function challengeRejected() {
    console.log('Challenge Rejected')
    socket.emit('onChallengeReject', {opponent1, opponent2})
    document.querySelector('.challenge-request-container').style.right = '-400px';
}

function onKill(player, piece) {
    console.log(player, piece);
}

function socketEventListeners(socket) {
    
    socket.on('onChallenge', (challenge) => {
        console.log(challenge)
        opponent1 = challenge.opponent1;
        opponent2 = challenge.opponent2;

        document.querySelector('.challenge').innerHTML = `${opponent1.name} challenged you...`;
        document.querySelector('.challenge-request-container ').style.right = '36px';
    })

    socket.on('onChallengeAccepted', (challenge) => {
        console.log(challenge)
        opponent1 = challenge.opponent1;
        opponent2 = challenge.opponent2;
        console.log('Game Started for opponent1');
        console.log(opponent1)
        setUpBoard(opponent1, opponent2)
        socket.emit('onBoard', {opponent1, opponent2});
    })

    socket.on('onChallengeRejected', (challenge) => {
        console.log("OnchallengeRejected")
        opponent1 = challenge.opponent1;
        opponent2 = challenge.opponent2;
        console.log('Opponent refused.')
        myAlert(`${opponent2} refused to play...`);
    })

    socket.on('onBoard', (challenge) => {
        opponent1 = challenge.opponent1;
        opponent2 = challenge.opponent2;
        console.log(challenge)
        setUpBoard(opponent1, opponent2);
        console.log('Game started for opponent2');
    })

    socket.on('onGame', gameDetails => {
        player1 = gameDetails.player1;
        player2 = gameDetails.player2;
        console.log(player1)
        console.log(player2)
        console.log(loggedInUser)
    })

    socket.on('onOpponentMoved', opponentMove => {
        console.log("Opponent Moved");
        console.log(opponentMove)
        moveOpponentPiece(opponentMove.selectedPiece, opponentMove.prevI, opponentMove.prevJ)
    })

    socket.on('opponentIsOffline', () => {
        myAlert('Opponent is Offline...')
    })

    socket.on('onCheck', () => {
        myAlert(loggedInUser.name + ' is in check...')
    })

    socket.on('onPointScored', data => {
        console.log("DATA")
        console.log(data)
        document.getElementById("player-one-score").innerText = data.player1.points;
        document.getElementById("player-two-score").innerText = data.player2.points;
        let killedPiece = data.killedPiece;
        let tmpTurn = data.turn;
        document.getElementById("p1dp02").style.backgroundImage = "url('.images/white_pawn.png')"
        // let player1DeadPieces = document.querySelector('.player-one .dead-pieces')
        if (tmpTurn==BLACK) {
            // let player1KilledPiece = data.player1.deadPieces.pop()
            console.log(killedPiece)
            player1DeadPiecesCount++;
            let tmpStr = player1DeadPiecesCount;
            if(player1DeadPiecesCount<10) tmpStr = '0' + player1DeadPiecesCount;
            let d = document.getElementById('p2dp'+tmpStr)
            console.log(d)
            d.insertAdjacentHTML('afterbegin', `
                <img src="${killedPiece.img}">
            `)
        } else {
            // let player2KilledPiece = data.player2.deadPieces.pop()
            console.log(killedPiece)
            player2DeadPiecesCount++;
            let tmpStr = player2DeadPiecesCount;
            if(player2DeadPiecesCount<10) tmpStr = '0' + player2DeadPiecesCount;
            
            let d = document.getElementById('p1dp'+tmpStr)
            console.log(d)
            d.insertAdjacentHTML('afterbegin', `
                <img src="${killedPiece.img}">
            `)
        }
        // let player2DeadPieces = document.querySelector('.player-two .dead-pieces')
    }) 
}

function moveOpponentPiece(piece, prevI, prevJ) {
    board[prevI][prevJ] = null;
    document.getElementById(prevI + '' + prevJ).style.backgroundImage = '';
    board[piece.i][piece.j] = piece;
    document.getElementById(piece.i + '' + piece.j).style.backgroundImage = `url("${piece.img}")`;
    if (turn == WHITE) turn = BLACK;
    else if (turn == BLACK) turn = WHITE;
}        

function displayRules() {
    document.querySelector('.rules-reference-div').style.visibility = 'hidden';
    

    let rulesPageHTML = `
            <main class='rules-container'>
                <!-- <h2 class="rules-heading"> RULES </h2> -->
                <div class="rules-heading">
                    <div class="heading-text">
                        RULES
                    </div>
                    <div class="close-btn" >
                        <button type="button" class="close-rules" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                </div>
                <div class="rules-main-section">

                    <div class="rules-content">
                        <h2> The pieces are placed, one on a square, as follows: </h2>
                        <ul>
                            <li>
                                The <b> Rooks </b> are placed on the outside corners, right and left edge.
                            </li>
                            <li>
                                The <b> Knights </b> are placed immediately inside of the rooks.
                            </li>
                            <li>
                                The <b> Bishops </b> are placed immediately inside of the knights.
                            </li>
                            <li>
                                The <b> Queen </b> is placed on the central square of the same color of that of the
                                player:
                                white queen on the white square and black queen on the black square.
                            </li>
                            <li>
                                The <b> King </b> takes the vacant spot next to the queen.
                            </li>
                            <li>
                                The <b> Pawns </b> are placed one square in front of all of the other pieces.
                            </li>
                        </ul>

                        <h2> Basic moves </h2>
                        <ul>
                            <li>
                                The <b> King </b> moves exactly one square horizontally, vertically, or diagonally. A
                                special move with the king known as Castling is allowed only once per player, per game.
                            </li>
                            <li>
                                A <b> Rook </b> moves any number of vacant squares horizontally or vertically. It also
                                is
                                moved when castling.
                            </li>
                            <li>
                                A <b> Bishop </b> moves any number of vacant squares diagonally.
                            </li>
                            <li>
                                The <b> Queen </b> moves any number of vacant squares horizontally, vertically, or
                                diagonally.
                            </li>
                            <li>
                                A <b> Knight </b> moves to the nearest square not on the same rank, file, or diagonal.
                                (This
                                can be thought of as moving two squares horizontally then one square vertically, or
                                moving
                                one square horizontally then two squares vertically—i.e. in an "L" pattern.) The knight
                                is
                                not blocked by other pieces: it jumps to the new location.
                            </li>
                            <li>
                                <b>Pawns </b> have the most complex rules of movement:
                                <ul>
                                    <li class="inner-li">
                                        A pawn moves straight forward one square, if that square is vacant. If it has
                                        not
                                        yet moved, a pawn also has the option of moving two squares straight forward,
                                        provided both squares are vacant. Pawns cannot move backwards.
                                    </li>
                                    <li class="inner-li">
                                        Pawns are the only pieces that capture differently from how they move. A pawn
                                        can
                                        capture an enemy piece on either of the two squares diagonally in front of the
                                        pawn
                                        (but cannot move to those squares if they are vacant).
                                    </li>
                                </ul>
                            </li>
                        </ul>
                        <h2> Castling: </h2>
                        <p class="line-spacing">
                            Castling consists of moving the king two squares towards a rook, then placing the rook on
                            the
                            other side of the king, adjacent to it. It is not allowed to move both king and rook in the
                            same
                            time, because "Each move must be played with one hand only.". Castling is only permissible
                            if
                            all of the following conditions hold:
                        </p>
                        <ul>
                            <li>
                                The king and rook involved in castling must not have previously moved;
                            </li>
                            <li>
                                There must be no pieces between the king and the rook;
                            </li>
                            <li>
                                The king may not currently be in check, nor may the king pass through or end up in a
                                square
                                that is under attack by an enemy piece (though the rook is permitted to be under attack
                                and
                                to pass over an attacked square);
                            </li>
                            <li>
                                The castling must be kingside or queenside as shown in the diagram.
                            </li>
                        </ul>


                    </div>
                    <div class="side-pic">
                        <h1 class="piece-images-heading">Images Of Pieces</h1>
                                                
                            <div class="pieces-images">

                                <div class="piece-image-div">
                                    <div class="piece-image-container piece-image-left-container">
                                        <div class="piece rook"></div>
                                    </div>
                                    <div class="piece-image-container piece-image-right-container">
                                        <div class="piece knight"></div>
                                    </div>
                                    <div class="piece-name-container piece-name-left-container"> ROOK </div>
                                    <div class="piece-name-container piece-name-right-container"> KNIGHT </div>
                                </div>
                                
                                <div class="piece-image-div">
                                    <div class="piece-image-container piece-image-left-container ">
                                        <div class="piece bishop"></div>
                                    </div>
                                    <div class="piece-image-container piece-image-right-container">
                                        <div class="piece queen"></div>
                                    </div>
                                    <div class="piece-name-container piece-name-left-container"> BISHOP </div>
                                    <div class="piece-name-container piece-name-right-container"> QUEEN </div>
                                </div>
                                
                                <div class="piece-image-div">
                                    <div class="piece-image-container piece-image-left-container">
                                        <div class="piece king"></div>
                                    </div>
                                    <div class="piece-image-container piece-image-right-container">
                                        <div class="piece pawn"></div>
                                    </div>
                                    <div class="piece-name-container piece-name-left-container"> KING </div>
                                    <div class="piece-name-container piece-name-right-container"> PAWN </div> 
                                </div>
                                
                    </div>

                </div>

            </main>
    `;

    let mainContainer = document.querySelector('.container')
    mainContainer.insertAdjacentHTML("afterbegin", rulesPageHTML);
    activeBackdrop(true)
    backdrop.style.zIndex = 100;
    document.querySelector('.opponent-input-container').style.zIndex = -20;
    
    document.querySelector('.close-rules').addEventListener('click', () => {
        document.querySelector('.rules-container').remove();
        document.querySelector('.rules-reference-div').style.visibility = 'visible';
        if(loggedInUser != null) 
            document.querySelector('.opponent-input-container').style.zIndex = 20;
        activeBackdrop(false);
    })    
    
}


function setUpBoard(player1, player2) { 
    document.querySelector('main').style.display = 'none';
    console.log(player1)
    console.log(player2)
    let chessBoardHTML = `
    <div class='board'>
        <div class="player-one">
            <h1> ${player1.name} </h1>
            <h3> (Player One) </h3>
            <h5> UID:${player1.mapId} </h5>
            <h4 id="player-one-score">0</h4>
            <div class="dead-pieces">
                <div id="p1dp01"></div>
                <div id="p1dp02"></div>
                <div id="p1dp03"></div> <br>
                <div id="p1dp04"></div>
                <div id="p1dp05"></div>
                <div id="p1dp06"></div> <br>
                <div id="p1dp07"></div>
                <div id="p1dp08"></div>
                <div id="p1dp09"></div> <br>
                <div id="p1dp10"></div>
                <div id="p1dp11"></div>
                <div id="p1dp12"></div> <br>
                <div id="p1dp13"></div>
                <div id="p1dp14"></div>
                <div id="p1dp15"></div> <br>
            </div>
        </div>

        
        <table id="chessTable"></table>


        <div class="player-two">
            <h1> ${player2.name} </h1>
            <h3> (Player Two) </h3>
            <h5> UID:${player2.mapId} </h5>
            <h4 id="player-two-score">0</h4>
            <div class="dead-pieces">
                <div id="p2dp01"></div>
                <div id="p2dp02"></div>
                <div id="p2dp03"></div> <br>
                <div id="p2dp04"></div>
                <div id="p2dp05"></div>
                <div id="p2dp06"></div> <br>
                <div id="p2dp07"></div>
                <div id="p2dp08"></div>
                <div id="p2dp09"></div> <br>
                <div id="p2dp10"></div>
                <div id="p2dp11"></div>
                <div id="p2dp12"></div> <br>
                <div id="p2dp13"></div>
                <div id="p2dp14"></div>
                <div id="p2dp15"></div> <br>

            </div>
        </div>
 
    </div>
    `; 
 
    document.querySelector('body').insertAdjacentHTML('afterbegin', chessBoardHTML);
    JS()
 
}
  

var table = null, board = null, turn = null;

function JS() {
    table = document.getElementById('chessTable');
    for (var i = 0; i < 8; i++) {
        var tr = document.createElement('tr');
        table.appendChild(tr);
        for (var j = 0; j < 8; j++) {
            var td = document.createElement('td');
            td.addEventListener('click', movePiece);
            td.id = i + '' + j;
            if ((i + j) % 2 != 0) {
                td.innerText = i + "" + j;
                td.style.backgroundColor = "rgb(146, 122, 90)";
            } else {
                td.innerText = i + "" + j;
                td.style.backgroundColor = "rgb(250, 230, 207)";
            }
            tr.appendChild(td);
        }
    }
    
    turn = WHITE;
    var displayedMoves = [];
    var selectedPiece = null;

    let prevI = 0, prevJ = 0;

    
    var Player = function (id, name, color) {
        this.id = id;
        this.name = name;
        this.color = color;
        this.points = 0;
        this.deadPieces = [];
        this.kingPosition = color? '73' : '03';
    }
    
    // var player1 = new Player(101, "Ajit", WHITE);
    // var player2 = new Player(102, "Harsh", BLACK);
    
    //Piece Prototype
    var Piece = function (pieceCode, points, whiteImg, blackImg, color, i, j) {
        this.img = color ? whiteImg : blackImg;
        this.moves = [];
        this.i = i;
        this.j = j;
        this.color = color;
        this.points = points;
        this.pieceCode = pieceCode;
    }
    
    var King = Piece.bind(this, 1, 0, 'images/white_king.png', 'images/black_king.png');
    var Queen = Piece.bind(this, 2, 9, 'images/white_queen.png', 'images/black_queen.png');
    var Bishop = Piece.bind(this, 3, 3, 'images/white_bishop.png', 'images/black_bishop.png');
    var Knight = Piece.bind(this, 4, 3, 'images/white_knight.png', 'images/black_knight.png');
    var Rook = Piece.bind(this, 5, 5, 'images/white_rook.png', 'images/black_rook.png');
    var Pawn = Piece.bind(this, 6, 1, 'images/white_pawn.png', 'images/black_pawn.png');
    
    //Chess Matrix
    board = [];
    for (var i = 0; i < 8; i++) {
        board[i] = [];
        for (var j = 0; j < 8; j++) {
            board[i][j] = null;
        }
    }
    
    initBoard();
    function initBoard() {
        placePiece(new Rook(WHITE, 7, 7));
        placePiece(new Knight(WHITE, 7, 6));
        placePiece(new Bishop(WHITE, 7, 5));
        placePiece(new Queen(WHITE, 7, 4));
        placePiece(new King(WHITE, 7, 3));
        placePiece(new Bishop(WHITE, 7, 2));
        placePiece(new Knight(WHITE, 7, 1));
        placePiece(new Rook(WHITE, 7, 0));
        for (var j = 0; j <= 7; j++) {
            placePiece(new Pawn(WHITE, 6, j));
        }
        placePiece(new Rook(BLACK, 0, 7));
        placePiece(new Knight(BLACK, 0, 6));
        placePiece(new Bishop(BLACK, 0, 5));
        placePiece(new Queen(BLACK, 0, 4));
        placePiece(new King(BLACK, 0, 3));
        placePiece(new Bishop(BLACK, 0, 2));
        placePiece(new Knight(BLACK, 0, 1));
        placePiece(new Rook(BLACK, 0, 0));
        for (var j = 0; j <= 7; j++) {
            placePiece(new Pawn(BLACK, 1, j));
        }
            
        // placePiece(new Rook(BLACK, 0, 4));
        // placePiece(new King(BLACK, 3, 3));
        // placePiece(new Bishop(WHITE, 6, 5));
        // placePiece(new Queen(WHITE, 5, 6));
        // placePiece(new King(WHITE, 7, 3));
        // placePiece(new Bishop(WHITE, 5, 7));
        // placePiece(new Rook(WHITE, 4, 5));
        // placePiece(new Rook(WHITE, 2, 5));
        }
    
    function placePiece(piece) {
        board[piece.i][piece.j] = piece;
        var el = document.getElementById(piece.i + "" + piece.j);
        el.addEventListener('click', selectPiece);
        el.style.backgroundImage = "url('" + board[piece.i][piece.j].img + "')";
    }
    
    function removePiece(piece) {
        board[piece.i][piece.j] = null;
        var el = document.getElementById(piece.i + "" + piece.j);
        el.removeEventListener('click', selectPiece);
        el.style.backgroundImage = 'none';
    }
    
    function selectPiece(ev) {
        if((turn == WHITE && loggedInUser.mapId == player1.id) || 
         turn == BLACK && loggedInUser.mapId == player2.id)  {
            var i = parseInt(ev.target.id[0]);
            var j = parseInt(ev.target.id[1]);
            var piece = board[i][j];
        
            if(piece.color == turn) {
        
                if (piece.pieceCode == 6) populatePawnMoves(piece);
                else if (piece.pieceCode == 5) populateRookMoves(piece); 
                else if (piece.pieceCode == 4) populateKnightMoves(piece);
                else if (piece.pieceCode == 3) populateBishopMoves(piece);
                else if (piece.pieceCode == 2) {
                    populateRookMoves(piece);
                    populateBishopMoves(piece);
                }
                else if (piece.pieceCode == 1) {
                    populateKingMoves(piece);
                    filterMovesToAvoidCheck(piece);
                }

                prevI = i;
                prevJ = j;
                selectedPiece = piece;
                showPossibleMoves();
            }
        }
    }
    
    function isPlayer1InCheck() {
        
        let i = parseInt(player1.kingPosition[0]);
        let j = parseInt(player1.kingPosition[1]);
    
        let tmpKingPos = board[i][j];
        board[i][j] == null;
        let opponentAllMoves = getAllMoves(BLACK);
        board[i][j] = tmpKingPos;
        return opponentAllMoves.findIndex(block => {
            if(block == i+""+j) {
                console.log('Player 1 is in check')
                myAlert(player1.name + " is in check...")
                warnPlayer(document.querySelector('.player-one'))
                return block == i+""+j;
            }
        });
    }

    async function warnPlayer(player) {
        await setTimeout(() => {
            player.style.border = "2px solid orangered";
        }, 500);
        await setTimeout(() => {
            player.style.border = "none";
        }, 500);
        await setTimeout(() => {
            player.style.border = "2px solid orangered";
        }, 500);
        await setTimeout(() => {
            player.style.border = "none";
        }, 500);
    }
    

    function isPlayer2InCheck() {
        let i = parseInt(player2.kingPosition[0]);
        let j = parseInt(player2.kingPosition[1]);
        
        let tmpKingPos = board[i][j];
        board[i][j] == null;
        let opponentAllMoves = getAllMoves(WHITE);
        board[i][j] = tmpKingPos;
        return opponentAllMoves.findIndex(block => {
            if(block == i+""+j) {
                console.log('Player 2 is in check')
                myAlert(player2.name + " is in check...")
                warnPlayer(document.querySelector('.player-two'))
                return block == i+""+j;
            }
        });
    }
    
    function movePiece(ev) {
        console.log(player1)
        console.log(player2)
        var cellId = ev.target.id;
        var i = parseInt(ev.target.id[0]);
        var j = parseInt(ev.target.id[1]);
    
        displayedMoves.forEach(id => {
            if (cellId == id) {
                let killedPiece = null;
     
                if (board[i][j] != null && board[i][j].color != selectedPiece.color) { 
                    killedPiece = board[i][j];
                    // console.log(killedPiece)
                    killedPiece.img = board[i][j].img;
                    // console.log(killedPiece)
                    if(selectedPiece.pieceCode === 1) {
                        if((turn == WHITE && isPlayer1InCheck() != -1) || (turn == BLACK && isPlayer2InCheck() != -1)) {
                            populateKingMoves(selectedPiece);
                            let kingMoves = new Set(displayedMoves);
                            console.dir(kingMoves)
                            if(kingMoves.size <= 0) {
                                myAlert('Checkmate, You lost the game...');
                                displayedMoves.forEach(id =>
                                    document.getElementById(id).classList.remove('possible-position')
                                );
                                displayedMoves = [];
                                selectedPiece.moves = [];
                                return;
                            }
                            // alert('King will be dead after this move...');
                            // displayedMoves.forEach(id =>
                            //     document.getElementById(id).classList.remove('possible-position')
                            // );
                            // displayedMoves = [];
                            // selectedPiece.moves = [];
                            // return;
                        }
    
                        console.log("King killed someone...")
                        
                        // if(turn == WHITE) player1.kingPosition = i+""+j;
                        // else player2.kingPosition = i+""+j;
                    }                
                }
    
                
                
                if (board[i][j] != null && board[i][j].color != selectedPiece.color && selectedPiece.pieceCode != 1 && isPlayer1InCheck() != -1 && isPlayer2InCheck() != -1) {
                    
                    board[i][j] = null;
                    let opponentPiece = document.getElementById(i + '' + j);
                    opponentPiece.style.backgroundImage = '';
    
                    if(turn == WHITE) {
                        player1.points += killedPiece.points;
                        player2.deadPieces.push(killedPiece);
                        // updatePlayerOnePoints(player1.points)
                    } else {
                        player2.points += killedPiece.points;
                        player1.deadPieces.push(killedPiece);
                        // updatePlayerTwoPoints(player2.points)
                    }
                }
    
                document.getElementById(selectedPiece.i + '' + selectedPiece.j).style.backgroundImage = '';
                board[selectedPiece.i][selectedPiece.j] = null;
                let x, y;
                x = selectedPiece.i;
                selectedPiece.i = i;
                y = selectedPiece.j;
                selectedPiece.j = j;
                placePiece(selectedPiece);
    
                if(selectedPiece.pieceCode === 1) {
                    if(turn == WHITE) player1.kingPosition = i+""+j;
                    else player2.kingPosition = i+""+j;
                }
    
                if((turn == WHITE && isPlayer1InCheck() != -1) || (turn == BLACK && isPlayer2InCheck() != -1)) {
                    removePiece(selectedPiece)
                    if(selectedPiece.pieceCode === 1) placePiece(killedPiece)
                    
                    selectedPiece.i = x;
                    selectedPiece.j = y;
                    placePiece(selectedPiece);
                    if(selectedPiece.pieceCode === 1) {
                        if(turn == WHITE) player1.kingPosition = x+""+y;
                        else player2.kingPosition = x+""+y;
                    }
                    displayedMoves.forEach(id =>
                        document.getElementById(id).classList.remove('possible-position')
                    );
                    displayedMoves = [];
                    if(isPlayer2InCheck() != -1)  {
                        // myAlert('Player2 is in check...')
                    }
                    else if(isPlayer1InCheck() != -1) {
                        // myAlert('Player1 is in check...')
                    }
                    return;
                }
    
                if (board[i][j] != null && board[i][j].color != selectedPiece.color && selectedPiece.pieceCode == 1) {
                    
                    board[i][j] = null;
                    let opponentPiece = document.getElementById(i + '' + j);
                    opponentPiece.style.backgroundImage = '';
    
                    if(turn == WHITE) {
                        player1.points += killedPiece.points;
                        player2.deadPieces.push(killedPiece);
                        updatePlayerOnePoints(player1.points)
                    } else {
                        player2.points += killedPiece.points;
                        player1.deadPieces.push(killedPiece);
                        updatePlayerTwoPoints(player2.points)
                    }
                }
    
                if (selectedPiece.pieceCode == 6) {
                    if (selectedPiece.i == 0) {
                        board[i][j] = null;
                        if (j == 0 || j == 7) placePiece(new Rook(WHITE, i, j));
                        if (j == 1 || j == 6) placePiece(new Knight(WHITE, i, j));
                        if (j == 2 || j == 5) placePiece(new Bishop(WHITE, i, j));
                        if (j == 3 || j == 4) placePiece(new Queen(WHITE, i, j));
                    }
                    else if (selectedPiece.i == 7) {
                        board[i][j] = null;
                        if (j == 0 || j == 7) placePiece(new Rook(BLACK, i, j));
                        if (j == 1 || j == 6) placePiece(new Knight(BLACK, i, j));
                        if (j == 2 || j == 5) placePiece(new Bishop(BLACK, i, j));
                        if (j == 3 || j == 4) placePiece(new Queen(BLACK, i, j));
                    }
                }  
                          
                if(turn == WHITE) turn = BLACK;
                else turn = WHITE;
    
                if(turn == WHITE && isPlayer1InCheck() != -1) {
                    // myAlert('Player 1 is in check...')
                } else if (turn == BLACK && isPlayer2InCheck() != -1) {
                    // myAlert('Player 2 is in check...')
                }

                socket.emit('onMove',{
                    player : loggedInUser,
                    piece : selectedPiece,
                    prevI : prevI,
                    prevJ : prevJ 
                });
                
            }
        });
        displayedMoves.forEach(id =>
            document.getElementById(id).classList.remove('possible-position')
        );
        displayedMoves = [];
    }
    
    function showPossibleMoves() {
        displayedMoves.forEach(id => document.getElementById(id).classList.remove('possible-position'));
        selectedPiece.moves.forEach(id => {
            document.getElementById(id).classList.add('possible-position');
        });
        displayedMoves = selectedPiece.moves;
        selectedPiece.moves = [];
    }
    
    function populatePawnMoves(piece) {
        var ii = piece.i, jj = piece.j;
        if (piece.color == WHITE) {
            ii--;
            if (ii >= 0 && board[ii][jj] == null) {
                piece.moves.push(ii + '' + piece.j);
                if (piece.i == 6 && board[piece.i - 2][jj] == null) piece.moves.push((piece.i - 2) + '' + piece.j);
            }
            jj--;
            if (board[ii][jj] != null && board[ii][jj].color == BLACK) {
                piece.moves.push(ii + '' + jj);
            }
            jj += 2;
            if (board[ii][jj] != null && board[ii][jj].color == BLACK) {
                piece.moves.push(ii + '' + jj);
            }
        } else {
            ii++;
            if (ii <= 7 && board[ii][piece.j] == null) {
                piece.moves.push(ii + '' + piece.j);
                if (piece.i == 1 && board[piece.i + 2][jj] == null) piece.moves.push((piece.i + 2) + '' + piece.j);
            }
            jj--;
            if (jj >= 0 && board[ii][jj] != null && board[ii][jj].color == WHITE) {
                piece.moves.push(ii + '' + jj);
            }
            jj += 2;
            if (jj <= 7 && board[ii][jj] != null && board[ii][jj].color == WHITE) {
                piece.moves.push(ii + '' + jj);
            }
        }
    }
    
    function populateRookMoves(piece) {
    
        let kingPosition = null;
        if(turn == WHITE) kingPosition = player1.kingPosition;
        else kingPosition = player2.kingPosition;
    
        var x = parseInt(kingPosition[0]);
        var y = parseInt(kingPosition[1]);
    
        let tmpPiece = board[x][y];
    
        var ii = piece.i, jj = piece.j;
        ii--;
        jj = piece.j;
        while (ii >= 0) {
            if (board[ii][jj] != null) {
                if (board[ii][jj].color != piece.color) piece.moves.push(ii + '' + jj);
                break;
            }
            piece.moves.push(ii + '' + jj)
            ii--;
        }
        ii = piece.i + 1;
        jj = piece.j;
        while (ii <= 7) {
            if (board[ii][jj] != null) {
                if (board[ii][jj].color != piece.color) piece.moves.push(ii + '' + jj);
                break;
            }
            piece.moves.push(ii + '' + jj)
            ii++;
        }
        ii = piece.i;
        jj = piece.j - 1;
        while (jj >= 0) {
            if (board[ii][jj] != null) {
                if (board[ii][jj].color != piece.color) piece.moves.push(ii + '' + jj);
                break;
            }
            piece.moves.push(ii + '' + jj)
            jj--;
        }
        ii = piece.i;
        jj = piece.j + 1;
        while (jj <= 7) {
            if (board[ii][jj] != null) {
                if (board[ii][jj].color != piece.color) piece.moves.push(ii + '' + jj);
                break;
            }
            piece.moves.push(ii + '' + jj)
            jj++;
        }
    
        board[x][y] = tmpPiece;
    } 
    
    function populateKingMoves(piece) {
        ii = piece.i + 1;
        jj = piece.j;
        if (ii <= 7) {
            if (board[ii][jj] == null || board[ii][jj].color != piece.color)
                piece.moves.push(ii + '' + jj);
        }
    
        ii = piece.i - 1;
        if (ii >= 0) {
            if (board[ii][jj] == null || board[ii][jj].color != piece.color)
                piece.moves.push(ii + '' + jj);
        }
    
        ii = piece.i;
        jj = piece.j + 1;
        if (jj <= 7) {
            if (board[ii][jj] == null || board[ii][jj].color != piece.color)
                piece.moves.push(ii + '' + jj);
        }
    
        jj = piece.j - 1;
        if (jj >= 0) {
            if (board[ii][jj] == null || board[ii][jj].color != piece.color)
                piece.moves.push(ii + '' + jj);
        }
    
        ii = piece.i + 1;
        jj = piece.j + 1;
        if (ii <= 7 && jj <= 7) {
            if (board[ii][jj] == null || board[ii][jj].color != piece.color)
                piece.moves.push(ii + '' + jj);
        }
    
        ii = piece.i - 1;
        jj = piece.j - 1;
        if (ii >= 0 && jj >= 0) {
            if (board[ii][jj] == null || board[ii][jj].color != piece.color)
                piece.moves.push(ii + '' + jj);
        }
    
        ii = piece.i + 1;
        if (ii <= 7 && jj >= 0) {
            if (board[ii][jj] == null || board[ii][jj].color != piece.color)
                piece.moves.push(ii + '' + jj);
        }
    
        ii = piece.i - 1;
        jj = piece.j + 1;
        if (ii >= 0 && jj <= 7) {
            if (board[ii][jj] == null || board[ii][jj].color != piece.color)
                piece.moves.push(ii + '' + jj);
        }
    }
    
    function filterMovesToAvoidCheck(piece) {
        var opponentAllMoves = getAllMoves(!piece.color);
        piece.moves = piece.moves.filter(value => opponentAllMoves.indexOf(value) == -1);
    }
    
    function populateKnightMoves(piece) {
        ii = piece.i + 2;
        jj = piece.j + 1;
        if (ii <= 7 && jj <= 7) {
            if (board[ii][jj] == null || board[ii][jj].color != piece.color)
                piece.moves.push(ii + '' + jj);
        }
        ii = piece.i + 2;
        jj = piece.j - 1;
        if (ii <= 7 && jj >= 0) {
            if (board[ii][jj] == null || board[ii][jj].color != piece.color)
                piece.moves.push(ii + '' + jj);
        }
        ii = piece.i - 2;
        jj = piece.j - 1;
        if (ii >= 0 && jj >= 0) {
            if (board[ii][jj] == null || board[ii][jj].color != piece.color)
                piece.moves.push(ii + '' + jj);
        }
        ii = piece.i - 2;
        jj = piece.j + 1;
        if (ii >= 0 && jj <= 7) {
            if (board[ii][jj] == null || board[ii][jj].color != piece.color)
                piece.moves.push(ii + '' + jj);
        }
        jj = piece.j + 2;
        ii = piece.i + 1;
        if (ii <= 7 && jj <= 7) {
            if (board[ii][jj] == null || board[ii][jj].color != piece.color)
                piece.moves.push(ii + '' + jj);
        }
        jj = piece.j + 2;
        ii = piece.i - 1;
        if (ii >= 0 && jj <= 7) {
            if (board[ii][jj] == null || board[ii][jj].color != piece.color)
                piece.moves.push(ii + '' + jj);
        }
        jj = piece.j - 2;
        ii = piece.i - 1;
        if (ii >= 0 && jj >= 0) {
            if (board[ii][jj] == null || board[ii][jj].color != piece.color)
                piece.moves.push(ii + '' + jj);
        }
        jj = piece.j - 2;
        ii = piece.i + 1;
        if (ii <= 7 && jj >= 0) {
            if (board[ii][jj] == null || board[ii][jj].color != piece.color)
                piece.moves.push(ii + '' + jj);
        }
    }
    
    function populateBishopMoves(piece) {
        
        let kingPosition;
        if(turn == WHITE) kingPosition = player1.kingPosition;
        else kingPosition = player2.kingPosition;
    
        var x = parseInt(kingPosition[0]);
        var y = parseInt(kingPosition[1]);
    
        let tmpKingPiece = board[x][y];
        board[x][y] = null;
    
        ii = piece.i + 1;
        jj = piece.j + 1;
        while (ii <= 7 && jj <= 7) {
            if (board[ii][jj] != null) {
                if (board[ii][jj].color != piece.color) piece.moves.push(ii + '' + jj);
                break;
            }
            piece.moves.push(ii + '' + jj)
            ii++;
            jj++;
        }
        ii = piece.i - 1;
        jj = piece.j - 1;
        while (ii >= 0 && jj >= 0) {
            if (board[ii][jj] != null) {
                if (board[ii][jj].color != piece.color) piece.moves.push(ii + '' + jj);
                break;
            }
            piece.moves.push(ii + '' + jj)
            ii--;
            jj--;
        }
        ii = piece.i + 1;
        jj = piece.j - 1;
        while (ii <= 7 && jj >= 0) {
            if (board[ii][jj] != null) {
                if (board[ii][jj].color != piece.color) piece.moves.push(ii + '' + jj);
                break;
            }
            piece.moves.push(ii + '' + jj)
            ii++;
            jj--;
        }
        ii = piece.i - 1;
        jj = piece.j + 1;
        while (ii >= 0 && jj <= 7) {
            if (board[ii][jj] != null) {
                if (board[ii][jj].color != piece.color) piece.moves.push(ii + '' + jj);
                break;
            }
            piece.moves.push(ii + '' + jj)
            ii--;
            jj++;
        }
    
        board[x][y] = tmpKingPiece
    }
    
    function getAllMoves(color) {
        var moves = [];
        var allPieces = getAllPieces(color);
        allPieces.forEach(piece => {
            if (piece.pieceCode == 6) {
                var ii = piece.i, jj = piece.j;
                if (piece.color == WHITE) {
                    ii = piece.i - 1;
                    jj = piece.j - 1
                    if (ii >= 0 && jj >= 0)
                        piece.moves.push(ii + '' + jj);
                    jj = piece.j + 1
                    if (ii >= 0 && jj <= 7)
                        piece.moves.push(ii + '' + jj);
                } else {
                    ii = piece.i + 1;
                    jj = piece.j - 1
                    if (ii <= 7 && jj >= 0)
                        piece.moves.push(ii + '' + jj);
                    jj = piece.j + 1
                    if (ii <= 7 && jj <= 7)
                        piece.moves.push(ii + '' + jj);
                }
            }
            // populatePawnMoves(piece);
            else if (piece.pieceCode == 5) populateRookMoves(piece);
            else if (piece.pieceCode == 4) populateKnightMoves(piece);
            else if (piece.pieceCode == 3) populateBishopMoves(piece);
            else if (piece.pieceCode == 2) {
                populateRookMoves(piece);
                populateBishopMoves(piece);
            }
            else if (piece.pieceCode == 1) populateKingMoves(piece);
            moves = moves.concat(piece.moves);
            piece.moves = [];
        
        });
        return moves;
    }
    
    function getAllPieces(color) {
        var pieces = [];
        board.forEach(arr => arr.forEach(piece => {
            if (piece != null && piece.color == color)
                pieces.push(piece);
        }));
        i++;
        return pieces;
    }
    
    
    
    
    
    
      
    // updatePlayerOnePoints(10);
    
    // var p1dp01 = document.getElementById("p1dp01");
    // p1dp01.style.backgroundImage = "url(./images/white_pawn.png)";
    
    // var p1dp02 = document.getElementById("p1dp02");
    // p1dp02.style.backgroundImage = "url(./images/white_pawn.png)";
    
    // var p1dp03 = document.getElementById("p1dp03");
    // p1dp03.style.backgroundImage = "url(./images/white_pawn.png)";
    
    // var p1dp04 = document.getElementById("p1dp04");
    // p1dp04.style.backgroundImage = "url(./images/white_pawn.png)";
    
    // var p1dp05 = document.getElementById("p1dp05");
    // p1dp05.style.backgroundImage = "url(./images/white_pawn.png)";
    
    // var p1dp06 = document.getElementById("p1dp06");
    // p1dp06.style.backgroundImage = "url(./images/white_pawn.png)";
    
    // var p1dp07 = document.getElementById("p1dp07");
    // p1dp07.style.backgroundImage = "url(./images/white_pawn.png)";
    
    // var p1dp08 = document.getElementById("p1dp08");
    // p1dp08.style.backgroundImage = "url(./images/white_pawn.png)";
    
    // var p1dp09 = document.getElementById("p1dp09"); 
    // p1dp09.style.backgroundImage = "url(./images/white_rook.png)";
    
    // var p1dp10 = document.getElementById("p1dp10");
    // p1dp10.style.backgroundImage = "url(./images/white_rook.png)";
    
    // var p1dp11 = document.getElementById("p1dp11");
    // p1dp11.style.backgroundImage = "url(./images/white_knight.png)";
    
    // var p1dp12 = document.getElementById("p1dp12");
    // p1dp12.style.backgroundImage = "url(./images/white_knight.png)";
    
    // var p1dp13 = document.getElementById("p1dp13");
    // p1dp13.style.backgroundImage = "url(./images/white_bishop.png)";
    
    // var p1dp14 = document.getElementById("p1dp14");
    // p1dp14.style.backgroundImage = "url(./images/white_bishop.png)";
    
    // var p1dp15 = document.getElementById("p1dp15");
    // p1dp15.style.backgroundImage = "url(./images/white_queen.png)";
    
    
    
    
    
    
    // var p2dp01 = document.getElementById("p2dp01");
    // p2dp01.style.backgroundImage = "url(./images/black_pawn.png)";
    
    // var p2dp02 = document.getElementById("p2dp02");
    // p2dp02.style.backgroundImage = "url(./images/black_pawn.png)";
    
    // var p2dp03 = document.getElementById("p2dp03");
    // p2dp03.style.backgroundImage = "url(./images/black_pawn.png)";
    
    // var p2dp04 = document.getElementById("p2dp04");
    // p2dp04.style.backgroundImage = "url(./images/black_pawn.png)";
    
    // var p2dp05 = document.getElementById("p2dp05");
    // p2dp05.style.backgroundImage = "url(./images/black_pawn.png)";
    
    // var p2dp06 = document.getElementById("p2dp06");
    // p2dp06.style.backgroundImage = "url(./images/black_pawn.png)";
    
    // var p2dp07 = document.getElementById("p2dp07");
    // p2dp07.style.backgroundImage = "url(./images/black_pawn.png)";
    
    // var p2dp08 = document.getElementById("p2dp08");
    // p2dp08.style.backgroundImage = "url(./images/black_pawn.png)";
    
    // var p2dp09 = document.getElementById("p2dp09"); 
    // p2dp09.style.backgroundImage = "url(./images/black_rook.png)";
    
    // var p2dp10 = document.getElementById("p2dp10");
    // p2dp10.style.backgroundImage = "url(./images/black_rook.png)";
    
    // var p2dp11 = document.getElementById("p2dp11");
    // p2dp11.style.backgroundImage = "url(./images/black_knight.png)";
    
    // var p2dp12 = document.getElementById("p2dp12");
    // p2dp12.style.backgroundImage = "url(./images/black_knight.png)";
    
    // var p2dp13 = document.getElementById("p2dp13");
    // p2dp13.style.backgroundImage = "url(./images/black_bishop.png)";
    
    // var p2dp14 = document.getElementById("p2dp14");
    // p2dp14.style.backgroundImage = "url(./images/black_bishop.png)";
    
    // var p2dp15 = document.getElementById("p2dp15");
    // p2dp15.style.backgroundImage = "url(./images/black_queen.png)";}

} 