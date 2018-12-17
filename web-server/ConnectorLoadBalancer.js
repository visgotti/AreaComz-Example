
// super simple load balancer that incremently reuses ports
// and sends to the client as they connect
module.exports = class ConnectorLoadBalancer {
    constructor(connectorData) {
        this.connectorData = connectorData;
        this.nextIndex = 0;
    }
    getConnectorInfo() {
        if(this.nextIndex >= this.connectorData.length - 1) {
            this.nextIndex = 0;
        } else {
            this.nextIndex++;
        }
        return this.connectorData[this.nextIndex];
    }
};