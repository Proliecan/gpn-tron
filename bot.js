bot = {
    factory: {
        newGame: (width, height, playerId) => {
            // let positions be a new 2d array of size width x height
            let positions = Array.from({ length: width }, () => Array.from({ length: height }, () => Number.POSITIVE_INFINITY));

            return {
                map: {
                    width: width,
                    height: height,
                    positions: positions,

                    removeDiedPlayer: (playerId) => {
                        for (let i = 0; i < positions.length; i++) {
                            for (let j = 0; j < positions[i].length; j++) {
                                if (positions[i][j] == playerId) {
                                    positions[i][j] = Number.POSITIVE_INFINITY;
                                }
                            }
                        }
                    },
                    resetHeads: () => {
                        // go through whole map and if negtive, take abs
                        for (let i = 0; i < positions.length; i++) {
                            for (let j = 0; j < positions[i].length; j++) {
                                if (positions[i][j] < 0) {
                                    positions[i][j] = Math.abs(positions[i][j]);
                                }
                            }
                        }
                    },
                },
                player: {
                    id: playerId,
                    x: 0,
                    y: 0,
                },
                enemies: [],
            }
        }
    },
}

bot.makeMove = (game) => {
    let moves = {
        up: bot.translate(game.player, bot.vector('up'), game.map.width, game.map.height),
        down: bot.translate(game.player, bot.vector('down'), game.map.width, game.map.height),
        left: bot.translate(game.player, bot.vector('left'), game.map.width, game.map.height),
        right: bot.translate(game.player, bot.vector('right'), game.map.width, game.map.height),
    }

    let badness = {
        up: 0,
        down: 0,
        left: 0,
        right: 0,
    }

    // check if move is possible
    bot.checkPossible(game, moves, badness)

    // check if a head is nearby
    let acceptableDistance = 2;
    let maxHeadPenalty = 1000;
    bot.checkHeads(game, moves, badness, acceptableDistance, maxHeadPenalty);

    // calculate degees of freedom
    let freedomMultiplier = 10;
    bot.checkDegreesOfFreedom(game, moves, badness, freedomMultiplier);

    console.log(badness);

    // select move with least badness
    let bestMove = undefined;
    let bestBadness = Number.POSITIVE_INFINITY;
    for (let move in badness) {
        if (badness[move] < bestBadness) {
            bestMove = move;
            bestBadness = badness[move];
        }
    }

    return bestMove;

}

bot.checkDegreesOfFreedom = (game, moves, badness, freedomMultiplier) => {
    // foreach move
    for (let i = 0; i < Object.keys(moves).length; i++) {
        // generate flood map
        let floodMap = Array.from({ length: game.map.width }, () => Array.from({ length: game.map.height }, () => 0));
        // fill flood map
        for (let i = 0; i < game.map.width; i++) {
            for (let j = 0; j < game.map.height; j++) {
                floodMap[i][j] = game.map.positions[i][j] == Number.POSITIVE_INFINITY ? 0 : -1;
            }
        }
        // count freedom
        let freedom = bot.countFreedom(floodMap, moves[Object.keys(moves)[i]], freedomMultiplier);

        // subtract freedom from badness
        badness[Object.keys(moves)[i]] -= freedom * freedomMultiplier;

        // log i and freedom
        console.log(i + ' ' + freedom);
    }

    console.log(badness);
}

bot.countFreedom = (floodmap, pos, freedomMultiplier) => {
    // mark myself as visited
    floodmap[pos.x][pos.y] = 1;

    // generate my neighbours
    let neighbours = [
        bot.translate(pos, bot.vector('up'), floodmap.length, floodmap[0].length),
        bot.translate(pos, bot.vector('down'), floodmap.length, floodmap[0].length),
        bot.translate(pos, bot.vector('left'), floodmap.length, floodmap[0].length),
        bot.translate(pos, bot.vector('right'), floodmap.length, floodmap[0].length),
    ];

    let freedom = 0;

    // for each neighbour
    for (let i = 0; i < neighbours.length; i++) {
        // if neighbour is free
        if (floodmap[neighbours[i].x][neighbours[i].y] == 0) {
            freedom++;
            // count freedom of neighbour
            freedom += bot.countFreedom(floodmap, neighbours[i], freedomMultiplier);
        }
    }

    return freedom;
}


bot.checkHeads = (game, moves, badness, acceptableDistance, MaxPenalty) => {
    // check if a head is nearby for every direction
    bot.checkHeadsDirection(game, moves, badness, acceptableDistance, 'up', MaxPenalty);
    bot.checkHeadsDirection(game, moves, badness, acceptableDistance, 'down', MaxPenalty);
    bot.checkHeadsDirection(game, moves, badness, acceptableDistance, 'left', MaxPenalty);
    bot.checkHeadsDirection(game, moves, badness, acceptableDistance, 'right', MaxPenalty);
}

bot.checkHeadsDirection = (game, moves, badness, acceptableDistance, direction, MaxPenalty) => {
    // calculate future position
    let futurePosition = bot.translate(game.player, bot.vector(direction), game.map.width, game.map.height);

    // check if in a acceptableDistance x acceptableDistance square there is a head
    for (let i = -acceptableDistance; i <= acceptableDistance; i++) {
        for (let j = -acceptableDistance; j <= acceptableDistance; j++) {
            // check enemy heads
            let checkPos = bot.translate(futurePosition, { x: i, y: j }, game.map.width, game.map.height);
            let enemy = game.enemies.find(enemy => enemy.x == checkPos.x && enemy.y == checkPos.y);

            if (enemy != undefined) {
                // the nearer the head, the worse the move
                badness[direction] += MaxPenalty / (Math.abs(i) + Math.abs(j) + 1);
            }
        }
    }
}

bot.checkPossible = (game, moves, badness) => {
    if (game.map.positions[moves.up.x][moves.up.y] != Number.POSITIVE_INFINITY)
        badness.up = Number.POSITIVE_INFINITY;
    if (game.map.positions[moves.down.x][moves.down.y] != Number.POSITIVE_INFINITY)
        badness.down = Number.POSITIVE_INFINITY;
    if (game.map.positions[moves.left.x][moves.left.y] != Number.POSITIVE_INFINITY)
        badness.left = Number.POSITIVE_INFINITY;
    if (game.map.positions[moves.right.x][moves.right.y] != Number.POSITIVE_INFINITY)
        badness.right = Number.POSITIVE_INFINITY;
}

bot.vector = (direction) => {
    switch (direction) {
        case 'up':
            return { x: 0, y: -1 };
        case 'down':
            return { x: 0, y: 1 };
        case 'left':
            return { x: -1, y: 0 };
        case 'right':
            return { x: 1, y: 0 };
        default:
            return { x: 0, y: 0 };
    }
}

bot.translate = (pos, vector, width, height) => {
    // map wraps
    let x = (pos.x + vector.x) % width;
    let y = (pos.y + vector.y) % height;

    // map wraps
    if (x < 0) x += width;
    if (y < 0) y += height;

    return { x: x, y: y };
}

module.exports = bot;