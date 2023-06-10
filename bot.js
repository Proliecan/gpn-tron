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
                    }
                },
                player: {
                    id: playerId,
                    x: 0,
                    y: 0,
                },
            }
        }
    },
}

bot.makeMove = (game) => {
    let moves ={
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