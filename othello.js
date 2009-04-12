Ext.namespace('Ext.iiska');

Ext.iiska.OthelloBoard = function(element, forceNew) {
    Ext.iiska.OthelloBoard.superclass.constructor.call(this, element, forceNew);

    var dh = Ext.DomHelper;
    this.gridEl = dh.overwrite(this, {tag:'div', cls:'grid'}, true);
    dh.append(this.gridEl, {tag:'p', cls:'border', html:'╔═╤═╤═╤═╤═╤═╤═╤═╗'});
    for(var i=0;i<8;++i) {
        if (i > 0) {
            dh.append(this.gridEl, {tag:'p', cls:'border', html:'╟─┼─┼─┼─┼─┼─┼─┼─╢'});
        }
        dh.append(this.gridEl, {tag:'p', cls:'row row'+i, html:'║ │ │ │ │ │ │ │ ║'});
    }
    dh.append(this.gridEl, {tag:'p', cls:'border', html:'╚═╧═╧═╧═╧═╧═╧═╧═╝'});
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

               setMove: function(x, y, piece) {
                   var row = Ext.DomQuery.selectNode('p.row'+y, this.dom);
                   if (row) {
                       row.innerHTML = row.innerHTML.substring(0,2*x+1) + piece +
                           row.innerHTML.substring(2*x+2);
                   }
               },

               getMove: function(x, y) {
                   var row = Ext.DomQuery.selectNode('p.row'+y, this.dom);
                   if (row) {
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
               }
           });

Ext.namespace("Othello");
Othello.Player = function() {
    return {};
};

Othello.HumanPlayer = function() {
    Othello.HumanPlayer.superclass.constructor.call(this);
};
Ext.extend(Othello.HumanPlayer, Othello.Player, {});

Othello.AIWrapper = function() {
    Othello.AIWrapper.superclass.constructor.call(this);
};
Ext.extend(Othello.AIWrapper, Othello.Player, {});

Othello.Game = function(config) {
    var currentPlayer;
    var board = config.board;
    var logEl = config.logEl;

    var rows = Ext.DomQuery.select("p.row", board.dom);
    Ext.each(rows, function(i) {
                 Ext.fly(i).on("click", function(event, node) {
                                   var y = parseInt(node.className.match(/([0-9]+)/)[1],10);
                                   // Depends heavily on font-size, but using
                                   // single string without span elements makes the
                                   // DOM a lot lighter.
                                   var x = Math.floor((event.browserEvent.layerX-
                                                       node.offsetLeft) / 14);
                                   if (x<0) {x=0;}
                                   else if (x>7) {x=7;}
                                   board.setMove(x,y,'o');
                               }, this);
             }, this);

    return {
        //board: undefined,
        //logEl: undefined,

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
            var my = piece;
            var opp = (my === '○') ? '●' : '○';

            if (board.getMove(x,y) !== ' ') {
                return false;
            }

            function next() {
            }
            return true;
        },

        getPossibleMoves: function() {
            var area = this.getInterestingArea();
        },

        log: function(str) {
            if (logEl) {
                Ext.DomHelper.append(logEl, {tag:'p', html:str});
            }
        }
    };
};