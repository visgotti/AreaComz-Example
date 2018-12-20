class ConnectionManager {
    constructor(playerManager){
        this.playerManager = playerManager;
        this.sockets = [];
    }
    connect(host, port, cb) {
        console.log('attempting to connect to host', host)
        console.log('port', port);
        this.clientSocket = io('http://' + host + ':' + port);
        this.clientSocket.on('connect', () => {
            this.registerEvents();
            cb(true);
        })
    }

    registerEvents(){
        this.clientSocket.on('event', (data) => {
            switch(data.type) {
                case "initialize_client":
                    this.playerManager.initializeClient(data.x, data.y, data.id, data.areaIndex, data.pid, this.clientSocket);
                    break;
                case "state_update":
                    this.playerManager.updatePlayersFromGameState(data.gameState);
                    break;
            }
        })
    }

    sendInputs(pressingUp, pressingDown, pressingRight, pressingLeft) {
        this.clientSocket.emit('input', { pressingUp, pressingDown, pressingRight, pressingLeft });
    }

    sendMessage() {
    }
}