window.onload = function() {

var game;
var sprite;
var playersalad;
var weapon;
var cursors;
var fireButton;
var platforms;
var bulletScale = 0.25;
var rocketScale = 1;
var playerScale = 0.75;
var enemyScale = 0.25;
var playerHealth = 10; //debug
var playAgainButton;
var enemies;
var enemySprite;
var enemiesTotal = 3;
var requestURL = "/assets/levels.json";
var lvlData;
var lvlTotalLength = 10; //global level length in seconds
var counter = lvlTotalLength;
var timeCounter = 0;
var gameTimer;
var enemyPlatforms;
var interval;
var currentLevelIndex = 0;


   game = new Phaser.Game('100%', '100%', Phaser.AUTO, '', { preload: preload, create: create, update: update });


$.getJSON(requestURL, function(data) {
     lvlData = data;
});

//index, frequency, speed, img, strength
createEnemyAttack = function(enemySpeed, idx, health, angleSize) {

  this.enemySprite = game.add.sprite(game.world.randomX, 0, 'enemyAttack');
  this.enemySprite.anchor.set(0.5);
  this.alive = true;
  this.enemySprite.scale.setTo(enemyScale);
  game.physics.arcade.enable(this.enemySprite);
  this.enemySprite.body.collideWorldBounds = true;
  this.enemySprite.body.bounce.setTo(1, 1);
  this.enemySprite.body.velocity.y = 200;
  this.enemySprite.body.velocity.x = game.world.randomX * angleSize;
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
    game.load.image('triangle', 'assets/cannon_blue.png');
    game.load.image('circle', 'assets/drop_1_rotate.png');
    game.load.image('enemyAttack', 'assets/drop_2.png');
    game.load.image('land', 'assets/base_land.png');
    game.load.image('enemyLand', 'assets/enemyLand.png');
    game.load.image('gameover', 'assets/gameover.png');
    game.load.image('playagain', 'assets/playagain.png');
    game.load.image('invisible-box', 'assets/invisible.png');
    game.load.spritesheet('saladsprite', 'assets/saladsprite.png', 120, 120);

}

// New game default setup
function create() {

  game.physics.startSystem(Phaser.Physics.ARCADE);
  enemies = [];
  // Home base
  platforms = game.add.physicsGroup();
  platforms.create(0, game.world.height - 120, 'land');
  platforms.setAll('body.immovable', true);

  //enemyBase
  enemyPlatforms = game.add.physicsGroup();
  enemyPlatforms.create(0, -100, 'enemyLand');
  enemyPlatforms.setAll('body.immovable', true);

  //time counter
  timeCounter = game.add.text(game.world.width - 150, 40, 'time: ' + counter, { font: "64px Luckiest Guy", fill: "#ffffff", align: "center" });
  timeCounter.anchor.setTo(0.5, 0.5);

  // Salad, player's
  playersalad = game.add.sprite(game.world.centerX, game.world.height - 240, 'saladsprite');
  playersalad.anchor.set(0.5, 0.5);
  playersalad.scale.setTo(3);
  playersalad.frame = 0;    
  game.physics.arcade.enable(playersalad);
  playersalad.body.collideWorldBounds = false;
  playersalad.imageSmoothingEnabled = true;
  playersalad.angle = 0;
  playersalad.frame = 0;

  // Player
  sprite = this.add.sprite(game.world.centerX, game.world.height - 200, 'triangle');
  sprite.anchor.set(0.5);
  sprite.scale.setTo(playerScale);
  game.physics.arcade.enable(sprite);

  sprite.inputEnabled = true;
  sprite.input.allowVerticalDrag = false;
  sprite.input.enableDrag();
  sprite.body.collideWorldBounds = true;
  sprite.events.onDragUpdate.add(dragUpdate);

  createWeapons('default', 'circle', 900, 200, 8, false, sprite);
  cursors = this.input.keyboard.createCursorKeys();

  fireButton = this.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR, Phaser.KeyCode.SPACEBAR);

  // Default setup stuff
  game.stage.backgroundColor = '#EAFFE1';
  this.game.scale.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT;


}

// Salad rotation anim
function rotateSalad(maxAngle, rotatespeed) {
    if(playersalad.angle < maxAngle) {
        playersalad.angle = playersalad.angle + rotatespeed;
    } 
    else if(playersalad.angle == maxAngle) {
        playersalad.angle = playersalad.angle - rotatespeed; 
    }
    else if(playersalad.angle == -maxAngle) {
        playersalad.angle = playersalad.angle + rotatespeed;
    }
}


// Collision of an enemy with player's bullets
function bulletEnemyAttackCollision(first, second) {
  first.health -= 1;
  second.kill();
  if(first.health <= 0){
    first.alive = false;
    first.kill();
  }
}

// Enemy hitting player's base
function enemyAttackHit(first, second) {
    playerHealth -= 1;
    first.kill();
}

function gameOver() {
    $("#startButton").show();
}

$("#nextLevelButton").click(function() {
  nextlvl();
  $("#nextLevelButton").hide();
});


$('#startButton').click(function(){
  $("#startButton").hide();
    nextlvl();
});

function updateCounter() {
    counter--;
    timeCounter.setText('time: ' + counter);
}


function nextlvl() {
  timeCounter.setText('time: ' + lvlTotalLength);
  game.time.events.add(Phaser.Timer.SECOND * lvlTotalLength, endlvl, this);
  gameTimer = game.time.events.repeat(Phaser.Timer.SECOND, lvlTotalLength, updateCounter, this); //timeCounter

  var levelOn = true;
  inxEnemy = 0;
  function pushNewEnemy() {
    if(levelOn === true){
      enemies.push(new createEnemyAttack(lvlData[currentLevelIndex].speed, inxEnemy, lvlData[currentLevelIndex].health, lvlData[currentLevelIndex].angle)); //enemySpeed, idx, health, angleSize (0.0 - 1.0)
      inxEnemy++;
    }else {
      clearInterval(interval);
    }
   }
  if(levelOn === true){
    interval = setInterval(pushNewEnemy, lvlData[currentLevelIndex].interval);
  }

  function endlvl() {
    levelOn = false;
    for (var i = 0; i < enemies.length; i++){
        if (enemies[i].alive){
          enemies[i].enemySprite.kill();
        }
    }
    enemies = [];
  //  gameTimer.timer.kill();
    counter = lvlTotalLength;
    $("#nextLevelButton").show();
  }
  currentLevelIndex ++;
}

function dragUpdate(){
  weapon.fire();
}


function update() {

  for (var i = 0; i < enemies.length; i++){
      if (enemies[i].alive){
         game.physics.arcade.collide(enemies[i].enemySprite, weapon.bullets, bulletEnemyAttackCollision, false, this);
         game.physics.arcade.collide(enemies[i].enemySprite, platforms, enemyAttackHit, false, this);
      }
  }


  if(game.input.activePointer.isDown && game.input.y > (game.world.height - 200)) {
    sprite.x = game.input.x;
    weapon.fire();
  }

  if(playerHealth >= 3) {
      rotateSalad(40, 2);
  }

  if(playerHealth < 3) {
      rotateSalad(40, 2);
  }

  sprite.body.velocity.x = 0;
  playersalad.body.velocity.x = 0;
  playersalad.body.velocity.y = 0;

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
