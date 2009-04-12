Ext.namespace('Ext.iiska');

Ext.iiska.OthelloBoard = function(element, forceNew) {
    Ext.iiska.OthelloBoard.superclass.constructor.call(this,
        element, forceNew);

    var dh = Ext.DomHelper;
    this.gridEl = dh.overwrite(this, {tag:'div', cls:'grid'}, true);
    dh.append(this.gridEl,
              {tag:'p', cls:'border', html:'╔═╤═╤═╤═╤═╤═╤═╤═╗'});
    for(var i=0;i<8;++i) {
        if (i > 0) {
            dh.append(this.gridEl,
                      {tag:'p', cls:'border', html:'╟─┼─┼─┼─┼─┼─┼─┼─╢'});
        }
        dh.append(this.gridEl,
                  {tag:'p', cls:'row row'+i, html:'║ │ │ │ │ │ │ │ ║'});
    }
    dh.append(this.gridEl,
              {tag:'p', cls:'border', html:'╚═╧═╧═╧═╧═╧═╧═╧═╝'});
    dh.append(this, {tag:'div', cls:'score', cn: [
                         {tag:'p', cls:'score', html:'White: 2, Black: 2'}
                     ]});

    this.setMove(3,3,'○');
    this.setMove(3,4,'●');
    this.setMove(4,3,'●');
    this.setMove(4,4,'○');
};

Ext.extend(Ext.iiska.OthelloBoard, Ext.Element, {
    gridEl: undefined,

    setMove: function(x, y, piece, turn) {
        var score;
        var row = Ext.DomQuery.selectNode('p.row'+y, this.dom);
        if (row) {
            row.innerHTML = row.innerHTML.substring(0,2*x+1) + piece +
                row.innerHTML.substring(2*x+2);
        }
        if (turn) {
            score = this.turnPieces(x, y, piece);
        }
        return score;
    },

    turnPieces: function(x, y, piece, simulate) {
        var dirs = [
            [1,1], [-1,1], [1,-1], [-1,-1],
            [1,0], [-1,0], [0, 1], [0, -1]
        ];
        var pieces = [];
        Ext.each(dirs, function(i) {
            var cx = x; var cy = y; var m;
            var tmp_pieces = [];
            for(;;) {
                cx += i[0]; cy += i[1];
                m = this.getMove(cx, cy);
                if ( (m === null) || (m === ' ') ) {
                    break;
                } else if (m != piece) {
                    tmp_pieces.push([cx, cy]);
                } else if (m === piece) {
                    pieces = pieces.concat(tmp_pieces);
                    break;
                }
            }
        }, this);
        if (!simulate) {
            Ext.each(pieces, function(i) {
                this.setMove(i[0], i[1], piece, false);
            }, this);
        }
        return pieces.length;
    },

    getMove: function(x, y) {
        var row = Ext.DomQuery.selectNode('p.row'+y, this.dom);
        if (row && (x >= 0) && (x < 8) ) {
            return row.innerHTML.charAt(2*x+1);
        }
        return null;
    },

    getRow: function(y) {
        var row = Ext.DomQuery.selectNode('p.row'+y, this.dom);
        if (row) {
            return row.innerHTML;
        }
        return null;
    },

    updateScore: function(score) {
        var s = Ext.DomQuery.selectNode("p.score", this.dom);
        s.innerHTML = String.format("White: {0}, Black: {1}",
                                    score.white, score.black);
    }
});

Ext.namespace("Othello");

Othello.Player = function() {};
Othello.Player.prototype = {
    score: 2
};

Othello.HumanPlayer = function(config) {
    Othello.HumanPlayer.superclass.constructor.call(this);
    this.piece = config.piece;
};
Ext.extend(Othello.HumanPlayer, Othello.Player, {});

Othello.AIWrapper = function() {
    Othello.AIWrapper.superclass.constructor.call(this);
};
Ext.extend(Othello.AIWrapper, Othello.Player, {});

Othello.Game = function(config) {
    this.playerIndex = 0;
    this.players = [new Othello.HumanPlayer({piece: '○'}),
                  new Othello.HumanPlayer({piece: '●'})];
    this.currentPlayer = this.players[this.playerIndex];
    this.board = config.board;
    this.logEl = config.logEl;

    var rows = Ext.DomQuery.select("p.row", this.board.dom);
    Ext.each(rows, function(i) {
        Ext.fly(i).on("click", function(event, node) {
            if (!(this.currentPlayer instanceof Othello.HumanPlayer)) {
                return false;
            }
            var y = parseInt(node.className.match(/([0-9]+)/)[1],10);
            // Depends heavily on font-size, but using
            // single string without span elements makes the
            // DOM a lot lighter.
            var x = Math.floor((event.browserEvent.layerX-
                node.offsetLeft) / 14);
            if (x<0) {x=0;}
            else if (x>7) {x=7;}

            this.makeMove(x,y,this.currentPlayer.piece);
        }, this);
    }, this);
};

Othello.Game.prototype = {
    playerIndex: undefined,
    currentPlayer: undefined,
    players: undefined,
    board: undefined,
    logEl: undefined,

        getInterestingArea: function() {
            var r, i;
            var x1=-1; var y1;
            var x2; var y2=8;

            for (i=0;i<8;++i) {
                r = board.getRow(i);
                if ( !y1 && r.match(/[○●]/) ) {
                    y1 = i;
                } else if ( (y1 >= 0) && !r.match(/[○●]/) ) {
                    y2 = i;
                    break;
                }
            }

            if (!y1) { y1 = 0; }

            for (i=y1;i<y2;++i) {
                r = board.getRow(i);
                for (var j=0,jl=r.length;j<jl;++j) {
                    var c = r.charAt(j);
                    if ( (c === '○') || (c === '●') ) {
                        if (x1 === -1) {
                            x1 = (j-1) / 2;
                        } else if (x1 > ((j-1) / 2)) {
                            x1 = (j-1) / 2;
                        }
                    }
                }
                for (j=r.length;(j--)>0;) {
                    var c = r.charAt(j);
                    if ( (c === '○') || (c === '●') ) {
                        if (!x2) {
                            x2 = ((j-1) / 2)+1;
                        } else if (((j-1) / 2)+1 > x2) {
                            x2 = ((j-1) / 2)+1;
                        }
                        break;
                    }
                }
            }

            if (x1 > 0) {x1--;}
            if (x2 < 8) {x2++;}
            if (y1 > 0) {y1--;}
            if (y2 < 8) {y2++;}

            return [x1, y1, x2, y2];
        },

        isLegalMove: function(x, y, piece) {
            if (this.board.getMove(x,y) !== ' ') {
                return false;
            } else if (this.board.turnPieces(x,y,piece,true) > 0) {
                return true;
            }
            return false;
        },

        makeMove: function(x, y, piece) {
            if (this.isLegalMove(x,y,piece)) {
                var score = this.board.setMove(x, y, piece, true);
                this.players[this.playerIndex].score += score + 1;
                this.players[this.playerIndex^1].score -= score;
                this.currentPlayer = this.players[this.playerIndex ^= 1];
                this.board.updateScore({
                    white: this.players[0].score,
                    black: this.players[1].score
                });
                this.log(String.format("Player with {0} pieces, make your move.", this.currentPlayer.piece));
            }
        },

        getPossibleMoves: function() {
            var area = this.getInterestingArea();
        },

        log: function(str) {
            var d = new Date();
            if (this.logEl) {
                Ext.DomHelper.append(this.logEl, {tag:'p', cn: [
                    {tag:'span', cls:'time', html:
                     String.format("[{0}] ", d.toLocaleTimeString())},
                     {tag:'span', html: str}
                ]});
            }
        }
    };