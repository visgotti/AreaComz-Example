const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const http = require('http').Server(app);
const path = require('path');

const port = (process.env.PORT || 8080);

const ConnectorLoadBalancer = require('./ConnectorLoadBalancer');
const config = JSON.parse(fs.readFileSync(path.resolve('..', 'serverConfig.json')));

// initialize simple load balancer
const loadBalancer = new ConnectorLoadBalancer(config.connectors);

app.use(bodyParser.json({type: 'application/json'}));

app.use("/", express.static(path.resolve(__dirname, '..', 'client')));

app.get('/', function (req, res) {
    res.sendFile(path.resolve(__dirname, '..', 'client', 'index.html'))
});

app.get("/connector", function(req, res) {
    console.log('attempting to get connector');
    res.send(loadBalancer.getConnectorInfo());
});

http.listen(port, () => {
    console.log('Listening on port ', port);
});
