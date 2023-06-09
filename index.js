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
    });

    // send join packet to server
    client.write('join|' + username + '|' + password + '\n');
    console.log('Joining game as ' + username);
});
