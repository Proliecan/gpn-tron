module.exports = {
    factory: {
        newGame: (width, height, playerId) => {
            return {
                map: {
                    width: width,
                    height: height,
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