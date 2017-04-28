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
var enemiesTotal = 3;
var enemiesAlive = 5;


//index, frequency, speed, img, strength
createEnemyAttack = function(enemySpeed, idx) {

  this.enemySprite = game.add.sprite(game.world.randomX, 0, 'enemyAttack');
  this.enemySprite.anchor.set(0.5);
  this.alive = true;
  this.enemySprite.scale.setTo(enemyScale);
  game.physics.arcade.enable(this.enemySprite);
  this.enemySprite.body.collideWorldBounds = true;
  this.enemySprite.body.bounce.setTo(1, 1);
  this.enemySprite.body.velocity.y = 200;
  this.enemySprite.body.velocity.x = game.world.randomX;
  this.enemySprite.name = idx.toString();
  this.enemySprite.health = 3;
  this.enemySprite.body.immovable = true;

};


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
  enemies = [];
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

  createWeapons('default', 'circle', 900, 200, 8, false, sprite);
  cursors = this.input.keyboard.createCursorKeys();

  fireButton = this.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR, Phaser.KeyCode.SPACEBAR);

  // Default setup stuff
  game.stage.backgroundColor = '#B6E4CC';
  this.game.scale.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT;

  for(var i = 0; i < enemiesTotal; i ++) {
    enemies.push(new createEnemyAttack(500, i)); //@param1 frequency @param2 speed @p3 img @p4 strength (shots needed to kill)
    }
  }

    //@p1 enemy, @p2 sprite's bullet (?)
function bulletEnemyAttackCollision(first, second) {
  first.health -= 1;
  second.kill();
  if(first.health <= 0){
    first.kill();
  }
}

// @param1 - ??, @param2 enemy ?
function enemyAttackHit(first, second) {
    playerHealth -= 1; //Aim: playerHealth vähenee riippuen enemyn tyypistä; aika intuitiivista.
    first.kill();
}

function gameOver() {
    //gameoverscreen = game.add.sprite(game.world.centerX - 200, game.world.centerY - 100, 'gameover');
    //gameoverscreen.scale.setTo(0.3);
    //weapon.autofire = false;
    playAgainButton = game.add.button(game.world.centerX - 100, game.world.centerY, 'playagain', newGameClick, this, 2, 1, 0);
}



    game.state.restart();



function update() {


for (var i = 0; i < enemies.length; i++){
    if (enemies[i].alive){
       game.physics.arcade.collide(enemies[i].enemySprite, weapon.bullets, bulletEnemyAttackCollision, false, this);
       game.physics.arcade.collide(enemies[i].enemySprite, platforms, enemyAttackHit, false, this);
    }
}




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
