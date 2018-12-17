const http = require('http')
const socketio = require('socket.io');

const Server = require('socket.io');
const { Connector } = require('../../lib/AreaComz/core/Connector');

module.exports = class ConnectorServer {
    constructor(CONNECTOR_DATA, BROKER_URI, AREAS_DATA, GAME_ID) {
        this.server = http.createServer();
        this.io = new socketio();
        this.io.attach(this.server, {
            pingInterval: 10000,
            pingTimeout: 5000,
            cookie: false,
        })

        this.server.listen(CONNECTOR_DATA.PORT);
        console.log('listening on...', CONNECTOR_DATA.PORT);
        this.registerEvents();
    }
    registerEvents() {
        this.io.on('connection', (socket) => {
            console.log('SOMEONE CONNECTED ON PID', process.pid);
        })
    }
};
