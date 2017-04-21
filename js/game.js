window.onload = function() {

function fitbrowser() {
    
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');

    // resize the canvas to fill browser window dynamically
    window.addEventListener('resize', resizeCanvas, false);

    function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            /**
             * Your drawings need to be inside this function otherwise they will be reset when 
             * you resize the browser window and the canvas goes will be cleared.
             */
            drawStuff(); 
    }
    resizeCanvas();

    function drawStuff() {
            // do your drawing stuff here
    }               
};

fitbrowser();

var game = new Phaser.Game(800, 800, Phaser.AUTO, '', { preload: preload, create: create, update: update });
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