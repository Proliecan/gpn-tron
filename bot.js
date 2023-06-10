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