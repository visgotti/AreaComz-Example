const http = require('http')
const socketio = require('socket.io');

const Server = require('socket.io');
const { Connector } = require('../../lib/AreaComz/core/Connector');

const MAP_WIDTH = 500;
const MAP_HEIGHT = 500;

module.exports = class ConnectorServer {
    constructor(CONNECTOR_DATA, BROKER_URI, AREAS_DATA, CONNECTOR_INDEX, GAME_ID) {
        this.server = http.createServer();

        this.connector = new Connector(BROKER_URI, AREAS_DATA, CONNECTOR_INDEX, GAME_ID);

        this.io = new socketio();

        this.io.attach(this.server, {
            pingInterval: 10000,
            pingTimeout: 5000,
            cookie: false,
        });

        this.clients = [];

        this.players = {};

        this.server.listen(CONNECTOR_DATA.PORT);
        console.log('listening on...', CONNECTOR_DATA.PORT);
        this.initializeAreaRects();
        this.registerClientEvents();
        this.registerAreaEvents();
        this.relayInputs();
        this.sendInput = false;
    }

    handleAreaMessage(){

    }

    relayInputs() {
        setTimeout(() => {
            if(this.sendInput) {
                this.connector.sendChannelStates();
            }
            this.relayInputs();
        }, 100)
    }

    registerAreaEvents() {
        this.connector.onAreaMessage = ((areaIndex, data) => {
            // get channel based on areaIndex
            const channel = this.connector.channels[areaIndex];
            for(let i = 0; i < channel.clients.length; i++) {
                // send updated states to all players in the channel.
                this.players[channel.clients[i].uid].socket.emit("event", {
                    type: "state_update",
                    gameState: data
                });
            }
        });
    }

    registerClientEvents() {
        console.log('register events')
        this.io.on('connection', (socket) => {
            console.log('SOMEONE CONNECTED ON PID', process.pid);

            let x = this.generateRandomNumber(20, 480);
            let y = this.generateRandomNumber(20, 480);

            let playerRect = { x, y, width: 10, height: 10 };

            let clientData = { id: socket.id, rect: playerRect };

            let areaIndex = this.getAreaFromPosition(playerRect);

            let channelClient = this.connector.initializeChannelClient(socket.id);
            this.connector.connectClientToArea(socket.id, areaIndex, {
                position: {
                    x, y
                }
            });

            socket.emit('event', {
                type: "initialize_client",
                pid: process.pid,
                id: clientData.id,
                x,
                y,
                areaIndex,
            });

            this.players[socket.id] = new Player(socket.id, socket, channelClient);

            socket.on('client_input', data => {
                this.sendInput = true;
                this.players[socket.id].setInput(data);
                this.players[socket.id].channelClient.updateState(this.players[socket.id].getInput());
            })
        });
    }

    // just going to hard code these for now
    initializeAreaRects(areaCount) {
        this.areaRects = [
            { x: 0, y: 0, width: 250, height: 250 },
            { x: 250, y: 0, width: 250, height: 250 },
            { x: 0, y: 250, width: 250, height: 250 },
            { x: 250, y: 250, width: 250, height: 250 }
        ]
    }

    generateRandomNumber(min , max) {

        let random_number = Math.random() * (max-min) + min;
        return Math.floor(random_number);
    }

    /*
        just going to do a collision check and whichever area
        collides first the player will be put into.
     */
    getAreaFromPosition(playerRect) {
        let rect1 = playerRect;
        for(let i = 0; i < this.areaRects.length; i++) {
            let rect2 = this.areaRects[i];
            if (rect1.x < rect2.x + rect2.width &&
                rect1.x + rect1.width > rect2.x &&
                rect1.y < rect2.y + rect2.height &&
                rect1.y + rect1.height > rect2.y) {
                return i;
                // collision detected!
            }
        }
    }
};

class Player {
    constructor(sessionId, socket, channelClient) {
        this.id = sessionId;
        this.socket = socket;
        this.channelClient = channelClient;
        this.pressingLeft = false;
        this.pressingUp = false;
        this.pressingDown = false;
        this.pressingRight = false;
    }

    setInput(input) {
        this.pressingLeft = input.pressingLeft;
        this.pressingRight = input.pressingRight;
        this.pressingDown = input.pressingDown;
        this.pressingUp = input.pressingUp;
    }
    getInput() {
        return {
            pressingLeft: this.pressingLeft,
            pressingRight: this.pressingRight,
            pressingDown: this.pressingDown,
            pressingUp: this.pressingUp
        }
    }
}

