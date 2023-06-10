module.exports = {
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
                enemies: [],
            }
        }
    },

    makeMove: (game) => {
        return 'up'
    }
}