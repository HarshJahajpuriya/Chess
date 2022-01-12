const WHITE = 1;
const BLACK = 0;

class Player {
    constructor(id, name, color) {
        this.id = id;
        this.name = name;
        this.color = color;
        this.points = 0;
        this.deadPieces = [];
        this.kingPosition = color? '73' : '03';
    }
}

class Game {
    constructor(opponent1, opponent2, opponent1Socket, opponent2Socket, player1, player2) {
        this.opponent1 = opponent1; 
        this.opponent2 = opponent2;
        this.opponent1Socket = opponent1Socket;
        this.opponent2Socket = opponent2Socket;
        this.player1 = player1;
        this.player2 = player2;
        this.board = [];
        this.turn = WHITE;
        this.displayedMoves = [];
        this.selectedPiece = null;
        this.Piece = function (pieceCode, points, color, i, j) {
            this.moves = [];
            this.i = i;
            this.j = j;
            this.color = color;
            this.points = points;
            this.pieceCode = pieceCode;
        }
        this.King = this.Piece.bind(this, 1, 0);
        this.Queen = this.Piece.bind(this, 2, 9);
        this.Bishop = this.Piece.bind(this, 3, 3);
        this.Knight = this.Piece.bind(this, 4, 3);
        this.Rook = this.Piece.bind(this, 5, 5);
        this.Pawn = this.Piece.bind(this, 6, 1);
        
        this.buildBoard();
        this.initBoard();
    }

    buildBoard() {
        for (var i = 0; i < 8; i++) {
            this.board[i] = [];
            for (var j = 0; j < 8; j++) {
                this.board[i][j] = null;
            }
        }
    }

    initBoard() {
        this.placePiece(new this.Rook(WHITE, 7, 7));
        this.placePiece(new this.Knight(WHITE, 7, 6));
        this.placePiece(new this.Bishop(WHITE, 7, 5));
        this.placePiece(new this.Queen(WHITE, 7, 4));
        this.placePiece(new this.King(WHITE, 7, 3));
        this.placePiece(new this.Bishop(WHITE, 7, 2));
        this.placePiece(new this.Knight(WHITE, 7, 1));
        this.placePiece(new this.Rook(WHITE, 7, 0));
        for (var j = 0; j <= 7; j++) {
            this.placePiece(new this.Pawn(WHITE, 6, j));
        }
        this.placePiece(new this.Rook(BLACK, 0, 7));
        this.placePiece(new this.Knight(BLACK, 0, 6));
        this.placePiece(new this.Bishop(BLACK, 0, 5));
        this.placePiece(new this.Queen(BLACK, 0, 4));
        this.placePiece(new this.King(BLACK, 0, 3));
        this.placePiece(new this.Bishop(BLACK, 0, 2));
        this.placePiece(new this.Knight(BLACK, 0, 1));
        this.placePiece(new this.Rook(BLACK, 0, 0));
        for (var j = 0; j <= 7; j++) {
            this.placePiece(new this.Pawn(BLACK, 1, j));
        }
    }

    placePiece(piece) {
        this.board[piece.i][piece.j] = piece;
    }

    removePiece(piece) {
        this.board[piece.i][piece.j] = null;
    }

    selectPiece(piece, prevI, prevJ) {
        if(piece.color == turn) {
            let x = piece.i;
            let y = piece.j;
            piece.i = prevI;
            piece.j = prevJ;
            if (piece.pieceCode == 6) this.populatePawnMoves(piece);
            else if (piece.pieceCode == 5) this.populateRookMoves(piece); 
            else if (piece.pieceCode == 4) this.populateKnightMoves(piece);
            else if (piece.pieceCode == 3) this.populateBishopMoves(piece);
            else if (piece.pieceCode == 2) {
                this.populateRookMoves(piece);
                this.populateBishopMoves(piece);
            }
            else if (piece.pieceCode == 1) {
                this.populateKingMoves(piece);
                this.filterMovesToAvoidCheck(piece);
            }

            piece.i = x;
            piece.j = y;

            this.selectedPiece = piece;
            this.displayedMoves = this.selectedPiece.moves;

            //console.log('In selectPiece')
            //console.log(this.selectedPiece)
            // //console.log(this.displayedMoves)
        }
    }

    isplayer1InCheck() {
        let i = parseInt(this.player1.kingPosition[0]);
        let j = parseInt(this.player1.kingPosition[1]);
    
        let tmpKingPos = this.board[i][j];
        this.board[i][j] == null;
        let opponentAllMoves = this.getAllMoves(BLACK);
        this.board[i][j] = tmpKingPos;
        return opponentAllMoves.findIndex(block => {
            if(block == i+""+j) {
                //console.log('Player 1 is in check')
                return block == i+""+j;
            }
        });
    }
    
    isplayer2InCheck() {
        let i = parseInt(this.player2.kingPosition[0]);
        let j = parseInt(this.player2.kingPosition[1]);
        
        let tmpKingPos = this.board[i][j];
        this.board[i][j] == null;
        let opponentAllMoves = this.getAllMoves(WHITE);
        this.board[i][j] = tmpKingPos;
        return opponentAllMoves.findIndex(block => {
            if(block == i+""+j) {
                //console.log('Player 2 is in check')
                return block == i+""+j;
            }
        });
    }

    movePiece(i, j, prevI, prevJ, player) {   

        // //console.log("player1")
        // //console.log(this.player1)
        // //console.log("player2")
        // //console.log(this.player2)

        console.log(this.selectedPiece);

        let l = this.selectedPiece.i;
        let m = this.selectedPiece.j;
        this.selectedPiece.i = prevI;
        this.selectedPiece.j = prevJ;

        //console.log(i,j)
        var killedPiece = null;
        let flag = false;      
        let cellId = i+""+j;   
        this.displayedMoves.forEach(id => {
            if (cellId == id) {
                if (this.board[i][j] != null && this.board[i][j].color != this.selectedPiece.color) { 
                    //console.log('1')
                    killedPiece = this.board[i][j];
                    console.log("Piece on board")
                    console.log(this.board[i][j])
                    if(this.selectedPiece.pieceCode === 1) {
                        if((turn == WHITE && this.isplayer1InCheck() != -1) || (turn == BLACK && this.isplayer2InCheck() != -1)) {
                            this.populateKingMoves(this.selectedPiece);
                            let kingMoves = new Set(this.displayedMoves);
                            console.dir(kingMoves)
                            if(kingMoves.size <= 0) {
                                //console.log('Checkmate, You lost the game...');
                                this.displayedMoves = [];
                                this.selectedPiece.moves = [];
                                return false;
                            }
                        }
                        //console.log("King killed someone...")
                    }    
                    console.log('killedPiece returned')            
                    console.log(killedPiece)        
                    console.log('player')
                    if(turn == WHITE) {
                        this.player1.points = this.player1.points + killedPiece.points;
                        this.player1.deadPieces.push(killedPiece)
                        console.log(this.player1)
                    } else {
                        this.player2.points = this.player2.points + killedPiece.points;
                        this.player2.deadPieces.push(killedPiece)
                        console.log(this.player2)
                    }
                    this.opponent1Socket.socket.emit('onPointScored', {player1 : this.player1, player2 : this.player2, turn: turn, killedPiece, killedPiece});
                    this.opponent2Socket.socket.emit('onPointScored', {player1 : this.player1, player2 : this.player2, turn: turn, killedPiece, killedPiece});
                    console.log("Emitted onPointScored")
                    // return toString(killedPiece);
                }
                
                
                if (this.board[i][j] != null && this.board[i][j].color != this.selectedPiece.color && this.selectedPiece.pieceCode != 1 && this.isplayer1InCheck() != -1 && this.isplayer2InCheck() != -1) {
                    //console.log('2')
                    
                    this.board[i][j] = null;
     
                    if(turn == WHITE) {
                        this.player1.points += killedPiece.points;
                        this.player2.deadPieces.push(killedPiece);
                    } else {
                        this.player2.points += killedPiece.points;
                        this.player1.deadPieces.push(killedPiece);
                    }
                }
    
                //console.log(this.selectedPiece.i, this.selectedPiece.j)

                this.board[this.selectedPiece.i][this.selectedPiece.j] = null;
                
                let x, y;
                x = this.selectedPiece.i;
                this.selectedPiece.i = i;
                y = this.selectedPiece.j;
                this.selectedPiece.j = j;
                this.placePiece(this.selectedPiece);
    
                if(this.selectedPiece.pieceCode === 1) {
                    if(turn == WHITE) this.player1.kingPosition = i+""+j;
                    else this.player2.kingPosition = i+""+j;
                }
                if((turn == WHITE && this.isplayer1InCheck() != -1) || (turn == BLACK && this.isplayer2InCheck() != -1)) {
                    //console.log('3')
                    this.removePiece(this.selectedPiece)
                    if(this.selectedPiece.pieceCode === 1) this.placePiece(killedPiece)
                    
                    this.selectedPiece.i = x;
                    this.selectedPiece.j = y;
                    this.placePiece(this.selectedPiece);
                    if(this.selectedPiece.pieceCode === 1) {
                        if(turn == WHITE) this.player1.kingPosition = x+""+y;
                        else this.player2.kingPosition = x+""+y;
                    }
                    this.displayedMoves = [];
                    if(this.isplayer2InCheck() != -1)  {
                        //console.log('this.player2 is in check...')
                    }
                    else if(this.isplayer1InCheck() != -1) {
                        //console.log('this.player1 is in check...')
                    }
                    return false;
                }
                if (this.board[i][j] != null && this.board[i][j].color != this.selectedPiece.color && this.selectedPiece.pieceCode == 1) {
                    //console.log('4')
                    
                    this.board[i][j] = null;
    
                    if(turn == WHITE) {
                        this.player1.points += killedPiece.points;
                        this.player2.deadPieces.push(killedPiece);
                    } else {
                        this.player2.points += killedPiece.points;
                        this.player1.deadPieces.push(killedPiece);
                    }
                }
                if (this.selectedPiece.pieceCode == 6) {
                    //console.log('5')
                    if (this.selectedPiece.i == 0) {
                        this.board[i][j] = null;
                        if (j == 0 || j == 7) this.placePiece(new this.Rook(WHITE, i, j));
                        if (j == 1 || j == 6) this.placePiece(new this.Knight(WHITE, i, j));
                        if (j == 2 || j == 5) this.placePiece(new this.Bishop(WHITE, i, j));
                        if (j == 3 || j == 4) this.placePiece(new this.Queen(WHITE, i, j));
                    }
                    else if (this.selectedPiece.i == 7) {
                        this.board[i][j] = null;
                        if (j == 0 || j == 7) this.placePiece(new this.Rook(BLACK, i, j));
                        if (j == 1 || j == 6) this.placePiece(new this.Knight(BLACK, i, j));
                        if (j == 2 || j == 5) this.placePiece(new this.Bishop(BLACK, i, j));
                        if (j == 3 || j == 4) this.placePiece(new this.Queen(BLACK, i, j));
                    }
                }  
                            
                //console.log('6')
                if(turn == WHITE) turn = BLACK;
                else turn = WHITE;
    
                if(turn == WHITE && this.isplayer1InCheck() != -1) {
                    //console.log('Player 1 is in check...')
                    this.opponent1Socket.socket.emit('onCheck');
                } else if (turn == BLACK && this.isplayer2InCheck() != -1) {
                    //console.log('Player 2 is in check...')
                    this.opponent2Socket.socket.emit('onCheck');
                }
                //console.log('7')
                flag = true;
                
            }
        });
        this.displayedMoves = [];
        if(flag == true) return true;
    }

    populatePawnMoves(piece) {
        var ii = piece.i, jj = piece.j;
        //console.log('In populatePawnMoves')
        //console.log(this.board.length)
        if (piece.color == WHITE) {
            ii--;
            if (ii >= 0 && this.board[ii][jj] == null) {
                piece.moves.push(ii + '' + piece.j);
                if (piece.i == 6 && this.board[piece.i - 2][jj] == null) piece.moves.push((piece.i - 2) + '' + piece.j);
            }
            jj--;
            if (this.board[ii][jj] != null && this.board[ii][jj].color == BLACK) {
                piece.moves.push(ii + '' + jj);
            }
            jj += 2;
            if (this.board[ii][jj] != null && this.board[ii][jj].color == BLACK) {
                piece.moves.push(ii + '' + jj);
            }
        } else {
            ii++;
            if (ii <= 7 && this.board[ii][piece.j] == null) {
                piece.moves.push(ii + '' + piece.j);
                if (piece.i == 1 && this.board[piece.i + 2][jj] == null) piece.moves.push((piece.i + 2) + '' + piece.j);
            }
            jj--;
            if (jj >= 0 && this.board[ii][jj] != null && this.board[ii][jj].color == WHITE) {
                piece.moves.push(ii + '' + jj);
            }
            jj += 2;
            if (jj <= 7 && this.board[ii][jj] != null && this.board[ii][jj].color == WHITE) {
                piece.moves.push(ii + '' + jj);
            }
        }
    }

    populateRookMoves(piece) {

        let kingPosition = null;
        if(turn == WHITE) kingPosition = this.player1.kingPosition;
        else kingPosition = this.player2.kingPosition;
    
        var x = parseInt(kingPosition[0]);
        var y = parseInt(kingPosition[1]);
    
        let tmpPiece = this.board[x][y];
    
        var ii = piece.i, jj = piece.j;
        ii--;
        jj = piece.j;
        while (ii >= 0) {
            if (this.board[ii][jj] != null) {
                if (this.board[ii][jj].color != piece.color) piece.moves.push(ii + '' + jj);
                break;
            }
            piece.moves.push(ii + '' + jj)
            ii--;
        }
        ii = piece.i + 1;
        jj = piece.j;
        while (ii <= 7) {
            if (this.board[ii][jj] != null) {
                if (this.board[ii][jj].color != piece.color) piece.moves.push(ii + '' + jj);
                break;
            }
            piece.moves.push(ii + '' + jj)
            ii++;
        }
        ii = piece.i;
        jj = piece.j - 1;
        while (jj >= 0) {
            if (this.board[ii][jj] != null) {
                if (this.board[ii][jj].color != piece.color) piece.moves.push(ii + '' + jj);
                break;
            }
            piece.moves.push(ii + '' + jj)
            jj--;
        }
        ii = piece.i;
        jj = piece.j + 1;
        while (jj <= 7) {
            if (this.board[ii][jj] != null) {
                if (this.board[ii][jj].color != piece.color) piece.moves.push(ii + '' + jj);
                break;
            }
            piece.moves.push(ii + '' + jj)
            jj++;
        }
    
        this.board[x][y] = tmpPiece;
    } 

    populateKingMoves(piece) {
        var ii = piece.i + 1;
        var jj = piece.j;
        if (ii <= 7) {
            if (this.board[ii][jj] == null || this.board[ii][jj].color != piece.color)
                piece.moves.push(ii + '' + jj);
        }
    
        ii = piece.i - 1;
        if (ii >= 0) {
            if (this.board[ii][jj] == null || this.board[ii][jj].color != piece.color)
                piece.moves.push(ii + '' + jj);
        }
    
        ii = piece.i;
        jj = piece.j + 1;
        if (jj <= 7) {
            if (this.board[ii][jj] == null || this.board[ii][jj].color != piece.color)
                piece.moves.push(ii + '' + jj);
        }
    
        jj = piece.j - 1;
        if (jj >= 0) {
            if (this.board[ii][jj] == null || this.board[ii][jj].color != piece.color)
                piece.moves.push(ii + '' + jj);
        }
    
        ii = piece.i + 1;
        jj = piece.j + 1;
        if (ii <= 7 && jj <= 7) {
            if (this.board[ii][jj] == null || this.board[ii][jj].color != piece.color)
                piece.moves.push(ii + '' + jj);
        }
    
        ii = piece.i - 1;
        jj = piece.j - 1;
        if (ii >= 0 && jj >= 0) {
            if (this.board[ii][jj] == null || this.board[ii][jj].color != piece.color)
                piece.moves.push(ii + '' + jj);
        }
    
        ii = piece.i + 1;
        if (ii <= 7 && jj >= 0) {
            if (this.board[ii][jj] == null || this.board[ii][jj].color != piece.color)
                piece.moves.push(ii + '' + jj);
        }
    
        ii = piece.i - 1;
        jj = piece.j + 1;
        if (ii >= 0 && jj <= 7) {
            if (this.board[ii][jj] == null || this.board[ii][jj].color != piece.color)
                piece.moves.push(ii + '' + jj);
        }
    }

    filterMovesToAvoidCheck(piece) {
        var opponentAllMoves = this.getAllMoves(!piece.color);
        piece.moves = piece.moves.filter(value => opponentAllMoves.indexOf(value) == -1);
    }

    getAllMoves(color) {
        var moves = [];
        var allPieces = this.getAllPieces(color);
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
            else if (piece.pieceCode == 5) this.populateRookMoves(piece);
            else if (piece.pieceCode == 4) this.populateKnightMoves(piece);
            else if (piece.pieceCode == 3) this.populateBishopMoves(piece);
            else if (piece.pieceCode == 2) {
                this.populateRookMoves(piece);
                this.populateBishopMoves(piece);
            }
            else if (piece.pieceCode == 1) this.populateKingMoves(piece);
            moves = moves.concat(piece.moves);
            piece.moves = [];
        
        });
        return moves;
    }

    populateKnightMoves(piece) {
        var ii = piece.i + 2;
        var jj = piece.j + 1;
        if (ii <= 7 && jj <= 7) {
            if (this.board[ii][jj] == null || this.board[ii][jj].color != piece.color)
                piece.moves.push(ii + '' + jj);
        }
        ii = piece.i + 2;
        jj = piece.j - 1;
        if (ii <= 7 && jj >= 0) {
            if (this.board[ii][jj] == null || this.board[ii][jj].color != piece.color)
                piece.moves.push(ii + '' + jj);
        }
        ii = piece.i - 2;
        jj = piece.j - 1;
        if (ii >= 0 && jj >= 0) {
            if (this.board[ii][jj] == null || this.board[ii][jj].color != piece.color)
                piece.moves.push(ii + '' + jj);
        }
        ii = piece.i - 2;
        jj = piece.j + 1;
        if (ii >= 0 && jj <= 7) {
            if (this.board[ii][jj] == null || this.board[ii][jj].color != piece.color)
                piece.moves.push(ii + '' + jj);
        }
        jj = piece.j + 2;
        ii = piece.i + 1;
        if (ii <= 7 && jj <= 7) {
            if (this.board[ii][jj] == null || this.board[ii][jj].color != piece.color)
                piece.moves.push(ii + '' + jj);
        }
        jj = piece.j + 2;
        ii = piece.i - 1;
        if (ii >= 0 && jj <= 7) {
            if (this.board[ii][jj] == null || this.board[ii][jj].color != piece.color)
                piece.moves.push(ii + '' + jj);
        }
        jj = piece.j - 2;
        ii = piece.i - 1;
        if (ii >= 0 && jj >= 0) {
            if (this.board[ii][jj] == null || this.board[ii][jj].color != piece.color)
                piece.moves.push(ii + '' + jj);
        }
        jj = piece.j - 2;
        ii = piece.i + 1;
        if (ii <= 7 && jj >= 0) {
            if (this.board[ii][jj] == null || this.board[ii][jj].color != piece.color)
                piece.moves.push(ii + '' + jj);
        }
    }

    populateBishopMoves(piece) {
    
        let kingPosition;
        if(turn == WHITE) kingPosition = this.player1.kingPosition;
        else kingPosition = this.player2.kingPosition;
    
        var x = parseInt(kingPosition[0]);
        var y = parseInt(kingPosition[1]);
    
        let tmpKingPiece = this.board[x][y];
        this.board[x][y] = null;
    
        var ii = piece.i + 1;
        var jj = piece.j + 1;
        while (ii <= 7 && jj <= 7) {
            if (this.board[ii][jj] != null) {
                if (this.board[ii][jj].color != piece.color) piece.moves.push(ii + '' + jj);
                break;
            }
            piece.moves.push(ii + '' + jj)
            ii++;
            jj++;
        }
        ii = piece.i - 1;
        jj = piece.j - 1;
        while (ii >= 0 && jj >= 0) {
            if (this.board[ii][jj] != null) {
                if (this.board[ii][jj].color != piece.color) piece.moves.push(ii + '' + jj);
                break;
            }
            piece.moves.push(ii + '' + jj)
            ii--;
            jj--;
        }
        ii = piece.i + 1;
        jj = piece.j - 1;
        while (ii <= 7 && jj >= 0) {
            if (this.board[ii][jj] != null) {
                if (this.board[ii][jj].color != piece.color) piece.moves.push(ii + '' + jj);
                break;
            }
            piece.moves.push(ii + '' + jj)
            ii++;
            jj--;
        }
        ii = piece.i - 1;
        jj = piece.j + 1;
        while (ii >= 0 && jj <= 7) {
            if (this.board[ii][jj] != null) {
                if (this.board[ii][jj].color != piece.color) piece.moves.push(ii + '' + jj);
                break;
            }
            piece.moves.push(ii + '' + jj)
            ii--;
            jj++;
        }
    
        this.board[x][y] = tmpKingPiece
    }
    
    getAllPieces(color) {
        var pieces = [];
        this.board.forEach(arr => arr.forEach(piece => {
            if (piece != null && piece.color == color)
                pieces.push(piece);
        }));
        // i++;
        return pieces;
    }
}

module.exports.Player = Player;
module.exports.Game = Game;