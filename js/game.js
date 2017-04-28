window.onload = function() {

var game = new Phaser.Game('100%', '100%', Phaser.AUTO, '', { preload: preload, create: create, update: update });

var sprite;
var weapon;
var cursors;
var fireButton;
var platforms;
var bulletScale = 0.05;
var rocketScale = 0.01;
var playerScale = 0.05;
var enemyScale = 0.08;
var playerHealth = 3; //debug
var playAgainButton;
var enemies;
var enemySprite;


//var enemyHealth = 15;

function newGameClick() {
    restart();
    //Tänne vois sit esim. lisätä pelaajatilastojen kasvattamista ymsyms.
}
//index, frequency, speed, img, strength
createEnemyAttack = function(enemySpeed) {
  this.health = 3;
  this.enemySprite = game.add.sprite(game.world.centerX, game.world.centerY, 'enemyAttack');
  this.enemySprite.anchor.set(0.5);
  this.alive = true;
  this.enemySprite.scale.setTo(enemyScale);
  game.physics.arcade.enable(this.enemySprite);
  this.enemySprite.body.collideWorldBounds = true;
  this.enemySprite.body.bounce.setTo(1, 1);
  this.enemySprite.body.velocity.y = 600;

   enemies.add(enemyAttack); //groupataan kaikki
};



// Game Over
function gameOver() {
    gameoverscreen = game.add.sprite(game.world.centerX - 200, game.world.centerY - 100, 'gameover');
    gameoverscreen.scale.setTo(0.3);
    weapon.autofire = false;
    enemies.forEach(this.destroy());
    enemyAttack.destroy();
    playAgainButton = game.add.button(game.world.centerX - 100, game.world.centerY, 'playagain', newGameClick, this, 2, 1, 0);

}

function restart() {
    game.state.restart();
}

// Create guns
// name: 'id' for later use(?), image: img, speed: Num, rate: Num, efficiency: Num, automatic: bool, whoseGun: Sprite
function createWeapons(name, image, speed, rate, efficiency, automatic, whoseGun) {
  weapon = game.add.weapon(30, image);
  weapon.bullets.forEach(function (b) {
        b.scale.setTo(bulletScale, bulletScale);
    }, this);
  weapon.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
  weapon.bulletAngleOffset = 90; //Halutaanko me modata tätäkin?
  weapon.bulletSpeed = speed;
  weapon.autofire = automatic;
  weapon.fireRate = rate;
  weapon.trackSprite(whoseGun, 0, -60);
  var weaponEfficiency = efficiency; //määrittelee, montako kertaa tällä pitää osua
  var weaponID = name;
}

// Preload images
function preload() {
    game.load.image('flower', 'assets/flower.png');
    game.load.image('triangle', 'assets/triangle-transp.png');
    game.load.image('circle', 'assets/purple-circle.png');
    game.load.image('enemyAttack', 'assets/enemy.png');
    game.load.image('land', 'assets/land.png');
    game.load.image('gameover', 'assets/gameover.png');
    game.load.image('playagain', 'assets/playagain.png');
}



// New game default setup
function create() {

  game.physics.startSystem(Phaser.Physics.ARCADE);
  createEnemyAttack();
  // Home base
  platforms = game.add.physicsGroup();
  platforms.create(0, game.world.height - 120, 'land');
  platforms.setAll('body.immovable', true);

  // Player
  sprite = this.add.sprite(game.world.centerX, game.world.height - 200, 'triangle');
  sprite.anchor.set(0.5);
  sprite.scale.setTo(playerScale);
  game.physics.arcade.enable(sprite);

  sprite.inputEnabled = true;
  sprite.input.allowVerticalDrag = false;
  sprite.input.enableDrag();
  sprite.body.collideWorldBounds = true;


  // Create a gun or two
  //@param1 name, @param2 img, @param3 speed, p4 freq, p5 efficiency, p6 autoplay, p7 whose
  createWeapons('default', 'circle', 900, 120, 8, true, sprite);
  //createWeapons('rocket', 'flower', 200, 500, 2, false, sprite);

  //"Event-listener-stuff", ie. listening to key-events for shooting.
  cursors = this.input.keyboard.createCursorKeys();

  fireButton = this.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR, Phaser.KeyCode.SPACEBAR);
  rocketButton = this.input.keyboard.addKey(Phaser.KeyCode.Q, Phaser.KeyCode.Q);    //Jos double-tap vastaisi tätä?



  // Default setup stuff
  game.stage.backgroundColor = '#B6E4CC';
  this.game.scale.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT;

   //...including enemy attacks
   enemies = game.add.group();
   createEnemyAttack(500); //@param1 frequency @param2 speed @p3 img @p4 strength (shots needed to kill)
}

    //@p1 enemy, @p2 sprite's bullet (?)
function bulletEnemyAttackCollision(first, second) {

}




// @param1 - ??, @param2 enemy ?
function enemyAttackHit(first, second) {
    playerHealth -= 1; //Aim: playerHealth vähenee riippuen enemyn tyypistä; aika intuitiivista.
    first.kill();
    console.log("You got hit!");
    console.log(playerHealth + " health");
}

/*  ..tänne.
*/


function update() {

      //    game.physics.arcade.collide(attacks[i].enemyAttack, platforms, enemyAttackHit, false, this);
      //    game.physics.arcade.collide(attacks[i].enemyAttack, weapon.bullets, bulletEnemyAttackCollision, false, this);


  sprite.body.velocity.x = 0;

  if(cursors === null) {
    console.log("cursors null");
  } else {
    if(cursors.left.isDown) {
        sprite.body.velocity.x = -800;
    }

    else if(cursors.right.isDown) {
        sprite.body.velocity.x = 800;
    }

    if(fireButton.isDown) {
       weapon.fire();
    }
  }

  if(playerHealth < 1) {
      gameOver();
  }
}

/* window.onloadin pari, do not touch */
};
