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
            cb(true);
            this.registerEvents();
        })
    }

    registerEvents(){
        this.clientSocket.on('event', (data) => {
            switch(data.type) {
                case "initialize_client":
                    //this.playerManager.initialize(data.x, data.y, data.connector, data.area, true);
                //  break;
                case "new_game_state":
                    //   this.playerManager.updatePlayersFromGameState(data.gameState);
                    break;
            }
        })
    }
}