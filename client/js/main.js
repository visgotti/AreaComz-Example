var areaColors = [0xA9C2EE, 0xF884A7, 0x8CC7A6,  0x0045f4];
var connectorColors = [0xD90C84, 0xFFB90F, 0xFF6F61, 0xFEFF9E];


var canvas = document.getElementById('areas');
var renderer = PIXI.autoDetectRenderer(500, 500, { view: canvas, backgroundColor: 0xdadce3 });

// creates textures color to visualize area and connector connection
var playerTextures = createPlayerTextures(renderer, connectorColors, areaColors);
var playerManager = new PlayerManager(playerTextures);
var connectionManager = new ConnectionManager(playerManager);

renderer.view.width = 500;
renderer.view.height = 500;
renderer.view.style.width = 500 + 'px';
renderer.view.style.height = 500 + 'px';
renderer.view.style.display = 'block';
renderer.view.style.position = 'absolute';
renderer.view.style.top = 0;
renderer.view.style.left = 0;
renderer.view.style.zIndex = -1;

var mainStage = new PIXI.Container();
var gridStage = new PIXI.Container();
var playerStage = new PIXI.Container();
var textStage = new PIXI.Container();
mainStage.addChild(gridStage);
mainStage.addChild(playerStage);
mainStage.addChild(textStage);

var connectButton = new PIXI.Graphics();
connectButton.beginFill(0xA9C2EE, 1);
connectButton.drawRect(175, 210, 150, 80);

var connectButtonHover = new PIXI.Graphics();

connectButton.interactive = true;
connectButton.buttonMode = true;
connectButton.hovered = false;
connectText = new PIXI.Text("CONNECT", { fontSize: 15, fontWeight: 'bold', fill: "#f7f7f7" });
connectText.x = 212;
connectText.y = 243;

textStage.addChild(connectText);

connectButton.on('mouseover', () => {
    if(!connectButton.hovered) {
        connectButton.hovered = true;
        connectText.scale.set(1.05);
        connectButton.clear();
        connectButton.beginFill(0x3f78d9);
        connectButton.drawRect(166, 200, 150, 80);
        connectButton.scale.set(1.05);
    }
});

connectButton.on('mouseout', () => {
    connectButton.hovered = false;
    connectText.scale.set(1);

    connectButton.clear();
    connectButton.beginFill(0xA9C2EE);
    connectButton.drawRect(175, 210, 150, 80);
    connectButton.scale.set(1);
});

var connecting = false;
var loadingButton = new PIXI.Graphics();
loadingButton.beginFill(0x3f78d9);
loadingButton.drawRect(166, 200, 150, 80);
loadingButton.scale.set(1.05);
playerStage.addChild(loadingButton);
loadingButton.visible = false;
connectButton.on('mousedown', () => {

    requestConnectionInfo(function(err, connectorInfo) {
        if(err) {
            connecting = false;
            connectText.text = "FAILED TO CONNECT";
            return
        }
        connectionManager.connect(connectorInfo.HOST, connectorInfo.PORT, function(connected) {
            if(!connected) {
                connecting = false;
                connectText.text = "FAILED TO CONNECT";
                return
            }
            connecting = false;
            loadingButton.visible = false;
            connectText.visible = false;
        });
    });
    connecting = true;
    connectButton.visible = false;
    loadingButton.visible = true;
    connectText.x = 195;
    let connectTexts = [".", "..", "...", "...."];
    let i = 0;
    var changeText = () => {
        if(connecting) {
            connectText.text = "CONNECTING" + connectTexts[i];
            i++;
            if (i >= connectTexts.length) {
                i = 0;
            }
            setTimeout(() => {
                changeText();
            }, 400)
        }

    };
    changeText();

});

playerStage.addChild(connectButton);


// show visualization of area's spatial partition
var line = new PIXI.Graphics();
line.lineStyle(2, 0x8B7D7B);
line.moveTo(249, 0);
line.lineTo(249, 500);

line.moveTo(0, 249);
line.lineTo(500, 249);
line.lineStyle(2, 0x8B7D7B);

gridStage.addChild(line);

// draw labels of areas
var areaLabels = [];

for(var i = 0; i < areaColors.length; i++) {
    areaLabels.push(new PIXI.Text(i, { fontSize: 50, fontWeight: 'bold', fill: areaColors[i], stroke: '#000', strokeThickness: 5 }));
    gridStage.addChild(areaLabels[i]);
}

// top left
areaLabels[0].x = 110;
areaLabels[0].y = 95;

// top right
areaLabels[1].x = 370;
areaLabels[1].y = 95;

// bottom left
areaLabels[2].x = 105;
areaLabels[2].y = 350;

// bottom right
areaLabels[3].x = 365;
areaLabels[3].y = 350;

animate();

function animate() {
    requestAnimationFrame(animate);
    renderer.render(mainStage);
    update();
}

function update() {
    playerManager.update();
}