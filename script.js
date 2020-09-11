// this variable will alternate between 'red' to 'yellow' each turn
var currentTurn = 'red';
var gameRunning = true;

// SETTER FOR CELLS
function setCell(column, row, color) {
    column--;
    row--;
    if (column < 0 || column > 6) { throw Error('Column ' + column + ' does not exist.')}
    if (row < 0 || row > 6) { throw Error('Row ' + row + ' does not exist.')}
    if (color == "red") {
        $("#row" + row + "column" + column).css("background-color", "red");
        return "Cell (" + (column + 1) + "," + (row + 1) + ") set to red.";
    } else if (color == "yellow") {
        $("#row" + row + "column" + column).css("background-color", "yellow");
        return "Cell (" + (column + 1) + "," + (row + 1) + ") set to yellow.";
    } else if (color == "empty") {
        $("#row" + row + "column" + column).css("background-color", "white");
        return "Cell (" + (column + 1) + "," + (row + 1) + ") set to empty.";
    }
}

// GETTER FOR CELLS
function getCell(column, row) {
    column--;
    row--;
    var color = $("#row" + row + "column" + column).css("background-color");
    switch (color) {
        case "rgb(255, 255, 255)":
            return 'empty';
        case "rgb(255, 255, 0)":
            return 'yellow';
        case "rgb(255, 0, 0)":
            return 'red';
        default:
            return color;
    }
}

function setWin(column, row) {
    column--;
    row--;
    if (column < 0 || column > 6) { throw Error('Column ' + column + ' does not exist.')}
    if (row < 0 || row > 6) { throw Error('Row ' + row + ' does not exist.')}
    $("#row" + row + "column" + column).addClass('winning-coin');
}

function isEmpty(column, row) { if (getCell(column, row) == 'empty') { return true } else { return false; } }

function declareLoss() {
    gameRunning = false;
    console.log('All holes are filled, and you have not reached 4 in a row.')
}

function declareWin() {
    gameRunning = false;
}

// this function gets and returns a list of all the cells around the original cell, including diagonal offsets, that match the color of the original cell
function getSurroundingMatches(column, row) {
    var originalColor = getCell(column, row);
    var offsets = [
        [-1,0],
        [-1,1],
        [0,1],
        [1,1],
        [1,0],
        [1,-1],
        [0,-1],
        [-1,-1]
    ];
    var surroundingCells = [];
    for (var i = 0; i < offsets.length; i++) {
        var offsetCellColor = getCell(column + offsets[i][0], row + offsets[i][1]);
        // if the offset cell color matches the original cell color put it in a temp list along with it's offset and distance from the original cell, in this case, 1
        if (offsetCellColor == originalColor) {
            var cellObject = {};
            cellObject.position = [column + offsets[i][0], row + offsets[i][1]];
            cellObject.color = offsetCellColor;
            cellObject.offset = offsets[i];
            cellObject.distance = 1;
            surroundingCells.push(cellObject);
        }
    }   
    return surroundingCells;
}

function getOffsetCell(column, row, offset) {
    // gets the cell with a specific offset to the given coordinates
    var cellObject = {};
    cellObject.position = [column + offset[0], row + offset[1]];
    cellObject.color = getCell(cellObject.position[0], cellObject.position[1]);
    cellObject.offset = offset;
    // should return a cell object without distance data
    return cellObject;
}

function getCellsWithOffset(cellObjectList, offset) {
    var templist = [];
    for (cellObject in cellObjectList) {
        if (cellObjectList[cellObject].offset[0] == offset[0] && cellObjectList[cellObject].offset[1] == offset[1]) {
            templist.push(cellObjectList[cellObject]);
        }
    }
    return templist;
}

function checkForWin(column, row) {
    // checks for 4 in a row from the placed coin, whose position is represented as (column, row) on a typical coordinate scale
    var connectedCells = [] // this variable will hold cell objects to be checked later to find a winning match

    // overall distance is how far away cells are to the original cell each step. When getting every adjecent cell, this should be increased to 1.
    var overallDistance = 0;
    // add every cell result from getSurroundingMatches() to the connectedCells list
    getSurroundingMatches(column, row).forEach((value, index, array) => {
        connectedCells.push(value);
    });
    overallDistance++;
    // loop until overall distance is equal to 4
    while (overallDistance < 4) {
        var templist = [];
        // loop through each item in the connectedCells list
        for (cellObject in connectedCells) {
            // if the cell has a distance that is not equal to the overall distance, then skip
            if (connectedCells[cellObject].distance != overallDistance) {continue;}
            // get the cell object using getOffsetCell()
            var newCellObject = getOffsetCell(connectedCells[cellObject].position[0], connectedCells[cellObject].position[1], connectedCells[cellObject].offset);
            // if the cell object's color matches the original cell's color, then give the cell object a distance property that is the original cell's distance property + 1
            if (newCellObject.color == connectedCells[cellObject].color) {
                newCellObject.distance = connectedCells[cellObject].distance + 1;
                // add the cell object to a temp list
                templist.push(newCellObject);
            }
        }
        // if the temp list is empty then break the loop
        if (templist.length == 0) {
            break;
        } else {
            templist.forEach((value, index, array) => {
                connectedCells.push(value);
            });
            overallDistance++;
        }
    }

    // put cellObjects into 'line' groups
    var lineGroups = {
        '1,1': [],
        '1,0': [],
        '0,1': [],
        '1,-1': []
    }
    offsetValues = [
        [1,1],
        [1,0],
        [0,1],
        [1,-1]
    ].forEach((value, index, array) => {
        var tempList = [];
        getCellsWithOffset(connectedCells, value).forEach((value, index, array) => {tempList.push(value);});
        getCellsWithOffset(connectedCells, [value[0] * -1, value[1] * -1]).forEach((value, index, array) => {tempList.push(value);});
        lineGroups[value.toString()] = tempList;
    });

    var winningCoins = [];

    for (i in lineGroups) {
        if (lineGroups[i].length + 1 >= 4) {
            lineGroups[i].forEach((value, index, array) => {
                winningCoins.push(value.position);
            });
        }
    }

    if (winningCoins.length > 0) {
        winningCoins.push([column, row]);
        return winningCoins;
    } else {
        return []
    }
}

function doTurn() {
    if (!gameRunning) {
        return 'Game over.';
    }
    var coinPlaced = false;
    var successfulPlace = false;
    var placeCoords = {};
    while (!successfulPlace) {
        var dropColumn = Math.floor(Math.random() * 7) + 1; // random number from 1 to 7
        if (!isEmpty(dropColumn, 1)) {
            var fullColumns = 0;
            for (var i = 0; i < 7; i++) {
                if (!isEmpty(i, 1)) {fullColumns++;}
            }
            if (fullColumns != 7) {
                continue;
            } else {
                declareLoss();
                successfulPlace = true;
                break;
            }

        }
        for (var i = 0; i < 7; i++) {
            if (!isEmpty(dropColumn, i + 1)) {
                setCell(dropColumn, i, currentTurn);
                placeCoords.x = dropColumn;
                placeCoords.y = i;
                coinPlaced = true;
                break;
            }
        }
        successfulPlace = true;
    }
    
    if (!coinPlaced) {
        setCell(dropColumn, 7, currentTurn);
        placeCoords.x = dropColumn;
        placeCoords.y = 7;
        coinPlaced = true;
    }
    var winningCoins = checkForWin(placeCoords.x, placeCoords.y);
    if (winningCoins.length > 0) {
        winningCoins.forEach((value, index, array) => {
            setWin(value[0], value[1]);
        });
        declareWin();
        return;
    }
    if (currentTurn == 'red') {
        currentTurn = 'yellow';
    } else if (currentTurn == 'yellow') {
        currentTurn = 'red';
    }
}

for (var i = 0; i < 7; i++) {
    $("#board").append("<tr id='row" + i + "'>");
    for (var k = 0; k < 7; k++) {
        $("#row" + i).append("<td id='row" + i + "column" + k + "'>");
        $("#row" + i + "column" + k).css('background-color', 'white');
    }
}