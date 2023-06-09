// make tcp connection to server

const host = 'gpn-tron.duckdns.org';
const port = 4000;

// username is parameter after -n flag
const username = process.argv[process.argv.indexOf('-n') + 1];
// password is parameter after -p flag
const password = process.argv[process.argv.indexOf('-p') + 1];

const net = require('net');
const client = new net.Socket();

client.connect(port, host, function () {
    console.log('Connected to ' + host + ':' + port);
    // log answer from server
    client.on('data', function (data) {
        console.log(data.toString());
        handlePacket(data.toString());
    });

    // send join packet to server
    client.write('join|' + username + '|' + password + '\n');
    console.log('Joining game as ' + username);
});

handlePacket = function (packet) {
    // strip newline
    packet = packet.replace('\n', '');

    // split packet into array
    packet = packet.split('|');

    // lowercase packet type
    packet[0] = packet[0].toLowerCase();

    // handle packet
    switch (packet[0]) {
        case 'motd':
            //ignore
            break;
        case 'error':
            // log error in red
            console.log('\x1b[31m%s\x1b[0m', 'Error: ' + packet[1]);
            break;
        case 'game':
            // todo: make new game object
            break;
        case 'pos':
            // todo: record position
            break;
        case 'tick':
            // todo: pass game object to bot to make move
            // todo: send move to server
            // todo: record tick for reward
            break;
        case 'die':
            // todo: free up fields of died players
            break;
        case 'message':
            // drop packet
            break;
        case 'win':
            console.log('\x1b[32m%s\x1b[0m', 'You won!', '(won: ' + packet[1] + ', lost: ' + packet[2] + ')');
            //todo: reward massively (largest reward factor)
            break;
        case 'lose':
            console.log('\x1b[31m%s\x1b[0m', 'You lost!', '(won: ' + packet[1] + ', lost: ' + packet[2] + ')');
            // reward ticks per game survived
            break;
        default:
            console.log('\x1b[33m%s\x1b[0m', 'Unknown packet type: ' + packet[0]);
            break;
    }

}
