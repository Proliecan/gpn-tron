const net = require('net');
const bot = require('./bot');

// make tcp connection to server
const host = 'gpn-tron.duckdns.org';
const port = 4000;

// username is parameter after -n flag
const username = process.argv[process.argv.indexOf('-n') + 1];
// password is parameter after -p flag
const password = process.argv[process.argv.indexOf('-p') + 1];

// resources
const client = new net.Socket();
let game;

client.connect(port, host, function () {
    console.log('Connected to ' + host + ':' + port);
    // log answer from server
    client.on('data', function (data) {
        // console.log('Received: ' + data);
        handlePacket(data.toString());
    });

    // send join packet to server
    client.write('join|' + username + '|' + password + '\n');
    console.log('Joining game as ' + username);
});

handlePacket = function (packet) {
    // split at newline
    lines = packet.split('\n')

    lines.forEach(line => {
        handleLine(line)
    });
}

handleLine = (line) => {

    // split packet into array
    line = line.split('|');

    // lowercase packet type
    line[0] = line[0].toLowerCase();

    // handle packet
    switch (line[0]) {
        case '':
            // drop
            break;
        case 'motd':
            //ignore
            break;
        case 'error':
            // log error in red
            console.log('\x1b[31m%s\x1b[0m', 'Error: ' + line[1]);
            break;
        case 'game':
            game = bot.factory.newGame(parseInt(line[1]), parseInt(line[2]), parseInt(line[3]));
            console.log('<New game!>');
            break;
        case 'pos':
            game.map.positions[line[2]][line[3]] = line[1];
            if (line[1] == game.player.id) {
                game.player.x = parseInt(line[2]);
                game.player.y = parseInt(line[3]);
            }
            break;
        case 'tick':
            logMap();

            console.log('tick')
            let move = (bot.makeMove(game));
            console.log(move)
            // if no move break
            if (move == undefined) break;
            client.write('move|' + move + '\n')
            // todo: record tick for reward
            break;
        case 'die':
            // todo: free up fields of died players
            let diedPlayers = line.slice(1, line.length);
            // log in color
            let logline = '\x1b[31mPlayer(s) died: \x1b[0m';
            diedPlayers.forEach(player => {
                let colorCode = playerIDtoColorCode(player);
                logline += colorCode + player + '\x1b[0m, ';
            });
            console.log(logline);

            // remove died players from map
            diedPlayers.forEach(player => {
                game.map.removeDiedPlayer(player);
            });
            break;
        case 'message':
            // drop packet
            break;
        case 'win':
            console.log('\x1b[32m%s\x1b[0m', 'You won!', '(won: ' + line[1] + ', lost: ' + line[2] + ')');
            //todo: reward massively (largest reward factor)
            break;
        case 'lose':
            console.log('\x1b[31m%s\x1b[0m', 'You lost!', '(won: ' + line[1] + ', lost: ' + line[2] + ')');
            // reward ticks per game survived
            break;
        default:
            console.log('\x1b[33m%s\x1b[0m', 'Unknown packet type: ' + line[0]);
            break;
    }
}

logMap = () => {
    let map = game.map.positions;

    // use colored output and full block unicode character to draw map
    // o--> x
    // |
    // v y
    for (let i = 0; i < map.length; i++) {
        let line = '';
        for (let j = 0; j < map[i].length; j++) {
            let colorCode = playerIDtoColorCode(map[j][i]);

            if (map[j][i] == Number.POSITIVE_INFINITY)
                colorCode = '\x1b[37m';
            else if (map[j][i] == game.player.id)
                colorCode = '\x1b[32m';

            line += colorCode + '\u2588\x1b[0m';
            line += colorCode + '\u2588\x1b[0m';
        }
        console.log(line);
    }
}

playerIDtoColorCode = (id) => {
    id = (id % 5) + 1; // green (32) is reserved for player
    
    if (id == 2) id --;

    return '\x1b[3' + id + 'm';
}