// N areas and N connectors so create all possible combo render textures
function createPlayerTextures(renderer, connectorColors, areaColors) {
    var map = {};
    for(var i = 0; i < connectorColors.length; i++) {
        for(var j = 0; j < areaColors.length; j++) {
            var graphic = new PIXI.Graphics();
            graphic.lineStyle(2, connectorColors[i], .8);
            graphic.beginFill(areaColors[j], .8);
            graphic.drawRect(0, 0, 10, 10);
            var rT = PIXI.RenderTexture.create(10, 10);
            renderer.render(graphic, rT);
            var key = i + '-' + j;
            map[key] = rT;
        }
    }
    return map;
}