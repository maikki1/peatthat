window.onload = function() {


var game = new Phaser.Game('100%', '100%', Phaser.AUTO, '', { preload: preload, create: create, update: update });
function preload() {
    game.load.image('flower', 'assets/flower.png');
    game.load.image('triangle', 'assets/triangle-transp.png');
    game.load.image('circle', 'assets/purple-circle.png');
    /*game.load.spritesheet('dude', 'assets/dude.png', 32, 48)
    */;
}
    
function create() {
    game.add.sprite(0, 0, 'flower');
}
function update() {
}   
 
    
/* window.onloadin pari, do not touch */    
}    