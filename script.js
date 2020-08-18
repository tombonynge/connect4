// Requirements
// Your game can look and work however you like but it must follow these basic rules.
// The board has six rows and seven columns
// Two players take turns selecting a column to drop their checker into
// When a player wins, a message appears to announce the victory
// After a player wins, it should be possible to reset the game and play again
// The gameplay should involve at least one animation (for example, the checkers could fall into their slot rather than just appear instantaneously)

//******My Notes******
//keep track of who's turn it is...
//detect current players column selection
//find the lowest empty space - put players piece in that (change holes class)
//check if the player won
//you only have to check if that player won, as they just moved and can only be the winner
//check vertically first, horizontally next and also diagonally.
//if there's a win. show some victory message. and reset the game
//if it's too hard...there is always location.reload()...
//if player did not win...switch players...

(function () {
    var currentPlayer = "player1";
    var arrow = $("#arrow");
    updateArrow();

    var isGameWon = false;
    var winningSlots = $(""); //keep track of the winning line!
    var currentColumn = 2; //keep track of which column player wants to add to.
    var WINNUM = 4; //the required number in a line, to win
    var MAXCOLUMNS = 7; //max number of columns
    var MAXROWS = 6; //max number of rows
    var MAXDEPTH = 2; //max depth of recursion for minimax function;

    $(".column").on("click", function (e) {
        if (!isGameWon) {
            var selectedColumn = $(e.currentTarget);
            takeTurn(selectedColumn); //putting this in a seperate function to enable calls from mouse or keyboard input...
        }
    });

    //add highlighting of columns
    $(".column").on("mouseover", function (e) {
        if (!isGameWon) {
            currentColumn = $(this).index();
            selectColumn();
        }
    });
    $(".column").on("mouseout", function (e) {
        if (!isGameWon) {
            $(this).removeClass("highlight");
        }
    });

    //updated this function...to prevent wrapping of columns
    function getDiagonalLines(row, col) {
        //north east direction
        var startRow = row;
        var startCol = col;
        //get the starting row and column
        while (startRow < MAXROWS - 1 && startCol > 0) {
            startRow++;
            startCol--;
        }

        //build the jquery object of slots
        var northEastDiagonal = $("");
        while (startCol < MAXCOLUMNS && startRow >= 0) {
            northEastDiagonal = northEastDiagonal.add(
                $(".column").eq(startCol).children().eq(startRow)
            );
            startCol++;
            startRow--;
        }

        //north west direction
        startRow = row;
        startCol = col;
        //get the starting row and column
        while (startRow < MAXROWS - 1 && startCol < MAXCOLUMNS - 1) {
            startRow++;
            startCol++;
        }
        //build the jquery object of slots
        var northWestDiagonal = $("");
        while (startCol >= 0 && startRow >= 0) {
            northWestDiagonal = northWestDiagonal.add(
                $(".column").eq(startCol).children().eq(startRow)
            );
            startCol--;
            startRow--;
        }

        return {
            northEastDiagonal,
            northWestDiagonal,
        };
    }

    function switchPlayers() {
        if (currentPlayer == "player1") {
            currentPlayer = "player2";
        } else {
            currentPlayer = "player1";
        }
        updateArrow();
    }

    function updateArrow() {
        if (currentPlayer == "player1") {
            arrow.removeClass("p2");
            arrow.addClass("p1");
            $("#right").text("Player 2");
            $("#left").text("> Player 1");
        }
        if (currentPlayer == "player2") {
            arrow.removeClass("p1");
            arrow.addClass("p2");
            $("#left").text("Player 1");
            $("#right").text("> Player 2");
        }
    }

    function takeTurn(selectedColumn) {
        //get the relevant slots
        var slotsInColumn = selectedColumn.children();
        //loop through slots backwards
        var emptySlotFound;
        var currentRow;
        for (var i = MAXROWS - 1; i >= 0; i--) {
            if (
                !slotsInColumn.eq(i).hasClass("player1") &&
                !slotsInColumn.eq(i).hasClass("player2")
            ) {
                slotsInColumn.eq(i).addClass(currentPlayer);
                emptySlotFound = true;
                currentRow = i + 1;
                break;
            }
        }

        if (!emptySlotFound) {
            return;
        }
        var player = currentPlayer === "player1" ? "Player 1" : "Player 2";
        if (checkForVictory(slotsInColumn)) {
            showWin();
            isGameWon = true;
            //infoPanel.text(player + " won!");
        } else {
            var slotsInRow = $(".slot:nth-child(" + currentRow + ")");
            if (checkForVictory(slotsInRow)) {
                showWin();
                isGameWon = true;
                //infoPanel.text(player + " won!");
            } else {
                var slotsDiagonal = getDiagonalLines(
                    currentRow - 1, //css children are not zero indexed!!
                    selectedColumn.index()
                );
                if (checkForVictory(slotsDiagonal.northEastDiagonal)) {
                    showWin();
                    isGameWon = true;
                    //infoPanel.text(player + " won!");
                } else {
                    if (checkForVictory(slotsDiagonal.northWestDiagonal)) {
                        showWin();
                        isGameWon = true;
                        //infoPanel.text(player + " won!");
                    } else {
                        switchPlayers();
                    }
                }
            }
        }
    }

    //this function can check for any orientation if we pass the right kind of 'slots' variable...
    function checkForVictory(slots) {
        var count = 0;
        for (var i = 0; i < slots.length; i++) {
            if (slots.eq(i).hasClass(currentPlayer)) {
                count++;
                winningSlots = winningSlots.add(slots.eq(i));
                if (count == WINNUM) {
                    return true;
                }
            } else {
                count = 0;
                winningSlots = $("");
            }
        }
    }

    //when called this function will add the winner class to slots in winningSlots (global).
    function showWin() {
        $(".column").removeClass("highlight");
        $("#arrow").hide();
        var winstring = "WIN!";
        var l = 0;
        winningSlots.each(function () {
            $(this).addClass("winner");
            $(this).children(0).text(winstring[l]);
            l++;
        });
    }

    /****KEYBOARD CONTROSL *****/
    $(document).on("keydown", function (e) {
        //console.log(e.keyCode);
        //right
        if (e.keyCode === 39) {
            if (!isGameWon) {
                if (++currentColumn > MAXCOLUMNS - 1) {
                    currentColumn = 0;
                }
                selectColumn();
            }
        }
        //left
        if (e.keyCode === 37) {
            if (!isGameWon) {
                if (--currentColumn < 0) {
                    currentColumn = MAXCOLUMNS - 1;
                }
                selectColumn();
            }
        }
        if (e.keyCode === 32) {
            event.preventDefault(); //stop the player from accidentally restarting when focus is on restart button
            if (!isGameWon) {
                takeTurn($(".column").eq(currentColumn));
            }
        }
        /*
        //test for computer play
        if (e.keyCode === 13) {
            var board = buildVirtualBoard();
            var scores = [];
            //console.log(board);
            for (var n = 0; n < MAXCOLUMNS; n++) {
                scores.push(
                    minimax(getPossibleGameState(board, n, 2), MAXDEPTH, true)
                );
            }

            var slotIndex = 0;
            for (var s = 0; s < scores.length; s++) {
                if (scores[s] > 0) {
                    slotIndex = s;
                }
            }

            var slotsInColumn = $(".column").eq(s).children();
            //loop through slots backwards
            for (var i = MAXROWS - 1; i >= 0; i--) {
                if (
                    !slotsInColumn.eq(i).hasClass("player1") &&
                    !slotsInColumn.eq(i).hasClass("player2")
                ) {
                    slotsInColumn.eq(i).addClass(currentPlayer);
                    break;
                }
            }
            switchPlayers();
        }*/
    });

    /*****RESET ******/
    $("#reset").on("click", function (e) {
        $(".slot").removeClass("player1");
        $(".slot").removeClass("player2");
        $(".slot").removeClass("winner");
        $(".hole").text("");
        isGameWon = false;
    });

    $("#menuBtn").on("click", function (e) {
        if (!$("#menu").hasClass("visible")) {
            $(this).addClass("visible");
            $(this).text("<<");
            $("#menu").addClass("visible");
        } else {
            $(this).removeClass("visible");
            $(this).text(">>");
            $("#menu").removeClass("visible");
        }
    });

    function selectColumn() {
        var columns = $(".column");
        columns.each(function () {
            $(this).removeClass("highlight");
        });
        columns.eq(currentColumn).addClass("highlight");
        moveArrow();
    }

    function moveArrow() {
        arrow.show();
        var pos = $(".column").eq(currentColumn).offset().left;

        arrow.offset({ top: 112, left: pos + 40 });
    }

    /********AI STUFF*******/
    function GameState(board, index, row, column) {
        this.board = board; //current state of the board
        this.index = index; //index where turn was made
        this.row = row; //row where turn was made
        this.column = column; //column where turn was made
    }

    //the magic stuff is right here...
    function minimax(gameState, depth, isMaximising) {
        //do some super cool recursion
        if (depth == 0) {
            return evaluatePosition(gameState, isMaximising);
        }

        if (isMaximising) {
            var maxScore = -Infinity;
            for (var col = 0; col < MAXCOLUMNS; col++) {
                var score = minimax(
                    getPossibleGameState(gameState.board, col, 2),
                    depth - 1,
                    false
                );
                maxScore = Math.max(maxScore, score);
                return maxScore;
            }
        } else {
            var maxScore = Infinity;
            for (var col = 0; col < MAXCOLUMNS; col++) {
                var score = minimax(
                    getPossibleGameState(gameState.board, col, 1),
                    depth - 1,
                    true
                );
                maxScore = Math.min(maxScore, score);
                return maxScore;
            }
        }
    }

    //build a virtual board state for the AI (just an indexed array of all slot ownership)
    function buildVirtualBoard() {
        var board = [];
        var slots = $(".slot");
        //grid columns by rows eg:
        //0 3 6
        //1 4 7
        //2 5 8
        for (var s = 0; s < slots.length; s++) {
            var value = 0;
            if (slots.eq(s).hasClass("player1")) {
                value = 1;
            }
            if (slots.eq(s).hasClass("player2")) {
                value = 2;
            }

            board.push(value);
        }
        return board;
    }

    function getPossibleGameState(board, column, player) {
        //return a new boardstate for evaluation based on a column index and which player it is...
        var possibleBoard = board.slice();
        var slotsInColumn = possibleBoard.slice(column, MAXROWS);
        //loop backwards through column slots and find open position
        for (var row = slotsInColumn.length - 1; row >= 0; row--) {
            if (slotsInColumn[row] == 0) {
                possibleBoard[column * MAXROWS + row] = player;
                break;
            }
        }

        return new GameState(possibleBoard, playPosition, row, column);
    }

    //evaluate virtual positions!
    function evaluatePosition(gameState, isMaximising) {
        //check boardstate for potential lines

        var player = isMaximising ? 2 : 1;
        var verticalSlots = gameState.board.slice(gameState.column, MAXROWS);
        var win = checkForComputerVictory(verticalSlots, player);

        if (win) {
            return 4;
        } else {
            var horizontalSlots = [];
            for (var m = 0; m < MAXCOLUMNS; m++) {
                horizontalSlots.push(
                    gameState.board[gameState.row + m * MAXROWS]
                );
            }
            win = checkForComputerVictory(horizontalSlots);
            if (win) {
                return 4;
            } else {
                //add diagonal wins here....
                return 0;
            }
        }
    }

    function checkForComputerVictory(slots, player) {
        var count = 0;
        for (var i = 0; i < slots.length; i++) {
            if (slots[i] == player) {
                count++;
                if (count == 2) {
                    return 4;
                }
            } else {
                count = 0;
            }
        }
        return 0;
    }
})();
