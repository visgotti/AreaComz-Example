class PlayerManager {
    constructor(textureMap, playerStage){

        this.mappedKeys = {
            "87": "up",
            "38": "up", // up arrow
            "65": "left",
            "37": "left", // left arrow
            "83": "down",
            "40": "down", // down arrow
            "68": "right",
            "39": "right", // right arrow
        };

        this.mappedKeysReverse = {};
        for(var key in this.mappedKeys) {
            if(!(this.mappedKeys[key] in this.mappedKeysReverse)) {
                this.mappedKeysReverse[this.mappedKeys[key]] = [];
            }
            this.mappedKeysReverse[this.mappedKeys[key]].push(parseInt(key))
        };

        this.playerStage = playerStage;
        this.players = [];
        this.playerMap = {};
        this.clientPlayer = null;
        this.playerTextures = textureMap;
        this.renderTextureCombos = {};
        // keep track of which PIDS have been used
        this.connectorPids = [];

        this.serverPlayerStates = {};
    }

    initializeClient(x, y, id, areaIndex, pid, socket) {
        this.clientPlayer = {  x, y, id, areaIndex, pid };
        var sprite = new PIXI.Sprite(this.getTextureFromAreaAndPid(areaIndex, pid));
        sprite.x = x;
        sprite.y = y;
        this.clientPlayer.sprite = sprite;
        this.clientPlayer.socket = socket;
        this.players.push(this.clientPlayer);
        this.playerMap[id] = this.clientPlayer;
        playerStage.addChild(sprite);
        this.registerInputs();
    }


    getTextureFromAreaAndPid(areaIndex, pid) {
        let textureId;
        const connectorIndex = this.connectorPids.indexOf(pid);
        if(connectorIndex < 0) {
            this.connectorPids.push(pid);
            textureId = this.connectorPids.length - 1 + '-' + areaIndex;
        } else {
            textureId = connectorIndex + '-' + areaIndex;
        }
        return this.playerTextures[textureId];
    }

    updatePlayersFromGameState(gameStates) {
        for(let i = 0; i < gameStates.length; i++) {
            const state = gameStates[i];
            if(state.uid in this.playerMap) {
                const player = this.playerMap[state.uid];
                player.sprite.x = state.x;
                player.sprite.y = state.y;
            }
        }
    }

    update() {
        this.sendClientInputs();
    }

    sendClientInputs(){
        if(this.clientPlayer) {
            this.clientPlayer.socket.emit("client_input", this.clientPlayer.inputData);
        }
    }

    registerInputs() {
        this.clientPlayer.inputData = {
            pressingUp: false,
            pressingDown: false,
            pressingRight: false,
            pressingLeft: false,
        };

        document.onkeydown = event => {
            if(event.keyCode in this.mappedKeys){
                event.preventDefault();
            }
            this.handleKeyPress(event.keyCode)
        };

        document.onkeyup =  event => {
            if(event.keyCode in this.mappedKeys){
                event.preventDefault();
            }
            this.handleKeyUnpress(event.keyCode)
        };
    }

    handleKeyPress(keycode) {
        const {right, left, up, down} = this.mappedKeysReverse;
        let inputData = this.clientPlayer.inputData;

        if (right.indexOf(keycode) > -1) {
            inputData.pressingRight = true;
        }
        if (left.indexOf(keycode) > -1) {
            inputData.pressingLeft = true;
        }
        if (up.indexOf(keycode) > -1) {
            inputData.pressingUp = true;
        }
        if (down.indexOf(keycode) > -1) {
            inputData.pressingDown = true;
        }
    }

    handleKeyUnpress(keycode) {
        const { right, left, up, down,  } = this.mappedKeysReverse;
        let inputData = this.clientPlayer.inputData;

        if(right.indexOf(keycode) > -1) {
            inputData.pressingRight = false;
        }
        else if(left.indexOf(keycode) > -1) {
            inputData.pressingLeft = false;
        }
        else if(up.indexOf(keycode) > -1) {
            inputData.pressingUp = false;
        }
        else if(down.indexOf(keycode) > -1) {
            inputData.pressingDown = false;
        }
    }
}