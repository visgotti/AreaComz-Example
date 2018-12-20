const { Area } = require('../../lib/AreaComz/core/Area');

const MAP_WIDTH = 500;
const MAP_HEIGHT = 500;

module.exports = class AreaServer {
    constructor(URI, BROKER_URI, AREA_INDEX, GAME_ID) {
        this.area = new Area(URI, BROKER_URI, AREA_INDEX, GAME_ID);
        this.area.onClientConnect = this.handleClientConnect.bind(this);
        this.area.onChannelMessage = this.handleChannelMessage.bind(this);
        this.players = {};
        this.processInputs();
    }

    handleClientConnect(uid, data) {
        const player = new Player(uid, data.position.x, data.position.y);
        this.players[uid] = player;
    }

    // update inputs as we get them
    handleChannelMessage(message){
        Object.keys(message).forEach(uid => {
            if(this.players[uid]) {
                this.players[uid].setInput(message[uid]);
            }
        });
    }

    processInputs() {
        let states = [];
        setTimeout(() => {
            states = Object.keys(this.players).map(uid => {
                this.players[uid].movePlayer();
                return this.players[uid].getState();
            });
            if(states.length > 0) {
                this.area.broadcast(states);
            }
            this.processInputs();
        }, 1000/20); // process at 20fps
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
    constructor(sessionId, x, y) {
        this.uid = sessionId;
        this.speed = 5;
        this.x = x;
        this.y = y;
    }

    getState() {
        return {
            uid: this.uid, x: this.x, y: this.y
        }
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

    movePlayer() {
        if(this.pressingRight) {
            this.x += this.speed;
        }
        if(this.pressingLeft) {
            this.x -= this.speed;
        }
        if(this.pressingDown) {
            this.y += this.speed;
        }
        if(this.pressingUp) {
            this.y -= this.speed;
        }
    }
}

