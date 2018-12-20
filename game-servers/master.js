const fs = require('fs');
const path = require('path');
const cluster = require('cluster');
const ConnectorServer = require('./connector/Server');
const AreaServer = require('./area/Server');
const { Broker } = require('../lib/AreaComz/core/Broker');

const config = JSON.parse(fs.readFileSync(path.resolve('..', 'serverConfig.json')));
const currentGameId = 1;
if (cluster.isMaster) {
    // set up area data
    for (let i = 0; i < config.areas.length; i += 1) {
        cluster.fork({
            TYPE: 'AREA',
            AREA_INDEX: i,
            BROKER_URI: config.broker.URI,
            URI: config.areas[i].URI,
            GAME_ID: currentGameId,
        });
    }

    // creating 4 connectors rooms
    for (let i = 0; i < config.connectors.length; i += 1) {
        cluster.fork({
            TYPE: 'CONNECTOR',
            AREAS_DATA: JSON.stringify(config.areas),
            CONNECTOR_INDEX: i,
            BROKER_URI: config.broker.URI,
            GAME_ID: currentGameId,
            CONNECTOR_DATA: JSON.stringify(config.connectors[i])
        });
    }

    // create the broker
    const broker = new Broker(config.broker.URI, currentGameId);

} else {
    if (process.env.TYPE === 'AREA') {

        const { URI, BROKER_URI } = process.env;
        const AREA_INDEX = parseInt(process.env.AREA_INDEX);
        const GAME_ID = parseInt(process.env.GAME_ID);
      //  console.log('creating an area with params...', URI, BROKER_URI, AREA_INDEX, GAME_ID);
        const area = new AreaServer(URI, BROKER_URI, AREA_INDEX, GAME_ID);

        process.on('SIGINT', () => {
           // area.close();
        });

    } else if (process.env.TYPE === 'CONNECTOR') {
        // const URI = process.env.URI;

        const { BROKER_URI } = process.env;
        const AREAS_DATA = JSON.parse(process.env.AREAS_DATA);
        const GAME_ID = parseInt(process.env.GAME_ID);
        const CONNECTOR_INDEX = parseInt(process.env.CONNECTOR_INDEX);
        const CONNECTOR_DATA = JSON.parse(process.env.CONNECTOR_DATA);
        const connector = new ConnectorServer(CONNECTOR_DATA, BROKER_URI, AREAS_DATA, CONNECTOR_INDEX, GAME_ID);

        process.on('SIGINT', () => {
            //connector.close();
        });
    }
}
