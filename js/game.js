window.onload = function() {

var game;
var sprite;
var playersalad;
var enemysalad;
var rotatedirection = 1;
var weapon;
var cursors;
var fireButton;
var platforms;
var bulletScale = 0.25;
var rocketScale = 1;
var playerScale = 0.7;
var enemyScale = 0.45;
var playerHealth = 10; //debug
var playAgainButton;
var enemies;
var attacks;
var enemyCanon;
var enemiesTotal = 3;
var requestURL = "/assets/levels.json";
var lvlData;
var lvlTotalLength = 60; //global level length in seconds
var counter = lvlTotalLength;
var timeCounter = 0;
var gameTimer;
var enemyPlatforms;
var interval;
var currentLevelIndex = 0;
var levelOn = false;
var attacksAlive = false;
var closestAttack = 0;
var enemyDefaultPosition;


   game = new Phaser.Game('100%', '100%', Phaser.AUTO, '', { preload: preload, create: create, update: update });


$.getJSON(requestURL, function(data) {
     lvlData = data;
});

//index, frequency, speed, img, strength
createEnemyAttack = function(enemySpeed, idx, health, angleSize) {
  console.log(enemySpeed);
  this.enemySprite = game.add.sprite(game.world.randomX, 0, 'enemyAttack');
  this.enemySprite.anchor.set(0.5);
  this.alive = true;
  this.enemySprite.scale.setTo(enemyScale);
  game.physics.arcade.enable(this.enemySprite);
  this.enemySprite.body.collideWorldBounds = true;
  this.enemySprite.body.bounce.setTo(1, 1);
  this.enemySprite.body.velocity.y = enemySpeed;
//  this.enemySprite.body.velocity.x = game.world.randomX * angleSize;
  this.enemySprite.name = idx.toString();
  this.enemySprite.health = 3;
  this.enemySprite.body.immovable = true;
};

createPlayerAttack = function(attackSpeed, idx, health) {
  this.enemySprite = game.add.sprite(game.input.x, game.world.height, 'playerAttack');
  //this.enemySprite.anchor.set(0.5);
  this.alive = true;
  this.enemySprite.scale.setTo(enemyScale * 0.6);
  game.physics.arcade.enable(this.enemySprite);
  this.enemySprite.body.collideWorldBounds = true;
  this.enemySprite.body.bounce.setTo(1, 1);
  this.enemySprite.body.velocity.y = -attackSpeed;
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
  weapon.bulletAngleOffset = 90;
  weapon.bulletSpeed = speed;
  weapon.autofire = automatic;
  weapon.fireRate = rate;
  weapon.trackSprite(whoseGun, 0, -60);
  var weaponEfficiency = efficiency; //määrittelee, montako kertaa tällä pitää osua
  var weaponID = name;
}
// createWeapons('default', 'circle', 900, 200, 8, false, sprite);
// name: 'id' for later use(?), image: img, speed: Num, rate: Num, efficiency: Num, automatic: bool, whoseGun: Sprite
function turretWeapon(name, image, speed, rate, efficiency, automatic, whoseGun) {
  turret = game.add.weapon(30, image);
  turret.bullets.forEach(function (b) {
        b.scale.setTo(bulletScale, bulletScale);
    }, this);
  turret.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
  turret.bulletAngleOffset = 90; //Halutaanko me modata tätäkin?
  turret.bulletSpeed = -speed;
  turret.autofire = automatic;
  turret.fireRate = rate;
  turret.trackSprite(whoseGun, 0, 60);
  var turretEfficiency = efficiency; //määrittelee, montako kertaa tällä pitää osua
  var turretID = name;
}


// Preload images
function preload() {
    game.load.image('player', 'assets/player.png');
    game.load.image('enemy', 'assets/enemy_2.png');
    game.load.image('circle', 'assets/drop_1_rotate.png');
    game.load.image('enemyAttack', 'assets/drop_2.png');
    game.load.image('land', 'assets/base_land.png');
    game.load.image('enemyLand', 'assets/enemyLand.png');
    game.load.image('invisible-box', 'assets/invisible.png');
    game.load.spritesheet('saladsprite', 'assets/saladsprite1.png', 374, 374);
    game.load.image('playerAttack', 'assets/playerAttack.png');

}

// New game default setup
function create() {

  enemyDefaultPosition = new createPlayerAttack(250, indexAttack, 2);
  enemyDefaultPosition.enemySprite.x = game.world.width/2;
  enemyDefaultPosition.enemySprite.body.velocity.y = 0;
  //enemyDefaultPosition.enemySprite.body.kill();

  game.physics.startSystem(Phaser.Physics.ARCADE);
  enemies = [];
  attacks = [];
  // Home base
  platforms = game.add.physicsGroup();
  platforms.create(0, game.world.height - 120, 'land', game.world.width);
  platforms.setAll('body.immovable', true);

  //enemyBase
  enemyPlatforms = game.add.physicsGroup();
  enemyPlatforms.create(0, -100, 'enemyLand');
  enemyPlatforms.setAll('body.immovable', true);

  // Salad, player's
  playersalad = game.add.sprite(game.world.centerX, game.world.height - 60, 'saladsprite');
  playersalad.anchor.set(0.5, 0.95);
  playersalad.scale.setTo(1);
  playersalad.frame = 0;
  playersalad.imageSmoothingEnabled = true;
  playersalad.angle = 0;

  // Salad, enemy's
  enemysalad = game.add.sprite(game.world.centerX, 220, 'saladsprite');
  enemysalad.anchor.set(0.5, 0.8);
  enemysalad.scale.setTo(0.75);
  enemysalad.frame = 0;
  enemysalad.imageSmoothingEnabled = true;
  enemysalad.angle = -10;

  //time counter
  timeCounter = game.add.text(game.world.width - 150, 40, 'time: ' + counter, { font: "64px Luckiest Guy", fill: "#ffffff", align: "center" });
  timeCounter.anchor.setTo(0.5, 0.5);

  // Player
  sprite = this.add.sprite(game.world.centerX, game.world.height - 80, 'player');
  sprite.anchor.set(0.5);
  sprite.scale.setTo(playerScale);
  game.physics.arcade.enable(sprite);

  sprite.inputEnabled = true;
  sprite.input.allowVerticalDrag = false;
  sprite.input.enableDrag();
  sprite.body.collideWorldBounds = true;
  sprite.events.onDragUpdate.add(dragUpdate);

  // enemy
  enemyCanon = this.add.sprite(game.world.centerX, 80, 'enemy');
  enemyCanon.anchor.set(0.5);
  enemyCanon.scale.setTo(playerScale);
  game.physics.arcade.enable(enemyCanon);

  enemyCanon.inputEnabled = true;
  enemyCanon.input.allowVerticalDrag = false;
  enemyCanon.input.enableDrag();
  enemyCanon.body.collideWorldBounds = true;
  enemyCanon.events.onDragUpdate.add(dragUpdate);

  createWeapons('default', 'circle', 900, 200, 8, false, sprite);
  turretWeapon('default', 'circle', 900, 200, 8, false, enemyCanon);

  cursors = this.input.keyboard.createCursorKeys();

  fireButton = this.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR, Phaser.KeyCode.SPACEBAR);
  //rocketButton = this.input.keyboard.addkey(Phaser.KeyCode.)

  // Default setup stuff
  game.stage.backgroundColor = '#EAFFE1';
  this.game.scale.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT;


}

// Salad rotation anim
function rotateSalad(salad, maxAngle, rotatespeed) {
    if(rotatedirection == 1) { //by default 1, indicating rotate to the right.
        if(salad.angle == maxAngle) {
            rotatedirection = -1;
            salad.angle = salad.angle + rotatedirection * 0.25 * rotatespeed;
        }
        else {
            salad.angle = salad.angle + rotatedirection * 0.25 * rotatespeed;
        }
    }

    if(rotatedirection == -1) {
        if(salad.angle == -maxAngle) {
            rotatedirection = 1;
            salad.angle = salad.angle + rotatedirection * 0.25 * rotatespeed;
        }
        else {
            salad.angle = salad.angle + rotatedirection * 0.25 * rotatespeed;
        }
    }
}



// creating enemy turret
function moveEnemyTurret(turretSpeed){
  if(attacksAlive) {
    if(closestAttack.enemySprite.x < enemyCanon.body.x - turretSpeed){
      enemyCanon.body.x = enemyCanon.body.x - turretSpeed;
    }else if(closestAttack.enemySprite.x > enemyCanon.body.x){
      enemyCanon.body.x = enemyCanon.body.x + turretSpeed;
    }
  }


}



// Collision of an enemy with player's bullets
function bulletEnemyAttackCollision(first, second) {
  closestAttack = enemyDefaultPosition;
  first.health -= 1;
  second.kill();
  if(first.health <= 0){
    first.alive = false;
    first.kill();
  }
}

function bulletPlayerAttackCollision(first, second) {
  closestAttack = enemyDefaultPosition;
  first.health -= 1;
  second.kill();
  if(first.health <= 0){
    first.alive = false;
    first.kill();
  }
}

// Collision of playerAttack and enemyPlatforms
function playerAttackEnemyPlatform(first, second) {
  closestAttack = enemyDefaultPosition;
  console.log("1first.alive: " + first.alive);
  first.alive = false;
  second.alive = false;
  first.kill();
  console.log("first.alive: " + first.alive);
  console.log("first.name: " + first.name);
//  second.kill();
}

// Enemy hitting player's base
function enemyAttackHit(first, second) {
    playerHealth -= 1;
    playersalad.frame += 1;
    first.kill();
}

function gameOver() {
  console.log("gameover happened");
  levelOn = false;
  game.time.events.remove(gameTimer);
  for (var i = 0; i < enemies.length; i++){
      if (enemies[i].alive){
        enemies[i].enemySprite.kill();
      }
  }
  enemies = [];
  clearInterval(interval);
  playerHealth = 10;
  $("#startButton").show();
}

$("#nextLevelButton").click(function() {
  $("#nextLevelButton").hide();
  nextlvl();
});


$('#startButton').click(function(){
  $("#startButton").hide();
    levelOn = true;
    nextlvl();
});

function updateCounter() {
    counter--;
    if(counter === 0){
      endlvl();
    }
    timeCounter.setText('time: ' + counter);
}

function endlvl() {
  console.log("end levelii");
  levelOn = false;
  for (var i = 0; i < enemies.length; i++){
      if (enemies[i].alive){
        enemies[i].enemySprite.kill();
      }
  }
  enemies = [];
  counter = lvlTotalLength;
  $("#nextLevelButton").show();
}


function nextlvl() {
  counter = lvlTotalLength;
  timeCounter.setText('time: ' + counter);
  //game.time.events.add(Phaser.Timer.SECOND * lvlTotalLength, endlvl, this);
    gameTimer = game.time.events.repeat(Phaser.Timer.SECOND, lvlTotalLength, updateCounter, this);


/* timer = game.time.create(false);
 timer.add(3000, fadePictures, this);
 timer.start();
*/
  levelOn = true;
  var inxEnemy = 0;
  function pushNewEnemy() {
    console.log("push enemy levelOn" + levelOn);
    if(levelOn === true){
      console.log("pushed, level on");
      enemies.push(new createEnemyAttack(lvlData[currentLevelIndex].speed, inxEnemy, lvlData[currentLevelIndex].health, lvlData[currentLevelIndex].angle)); //enemySpeed, idx, health, angleSize (0.0 - 1.0)
      inxEnemy++;
    }else {
      clearInterval(interval);
    }
   }
  if(levelOn === true){
    interval = setInterval(pushNewEnemy, lvlData[currentLevelIndex].interval);
  }

  currentLevelIndex ++;
}

function dragUpdate(){
  weapon.fire();
}

var tapCounter = 0;
var indexAttack = 0;

function tapTimer(){

  timerOn = true;
  tapCounter++;


    if(tapCounter > 5){
      console.log("attack");
      attacks.push(new createPlayerAttack(250, indexAttack, 2)); //enemySpeed, idx, health
      console.log(attacks[indexAttack].enemySprite.y);
      indexAttack ++;
      tapCounter = 0;

    }
}


function update() {

  rotateSalad(playersalad, 5, 0.5);
  rotateSalad(enemysalad, 20, 0.45);
  moveEnemyTurret(6);

  /*if(attacksAlive){
    moveEnemyTurret();
  //  console.log(closestAttack.enemySprite.y);
}*/

  for (var r = 0; r < attacks.length; r++){

      if (attacks[r].enemySprite.alive){
        attacksAlive = true;

          if(closestAttack === 0){

            closestAttack = attacks[r];
          //  console.log("closestAttack = attacks[r].enemySprite.y; " + closestAttack);
        } else if(attacks[r].enemySprite.y < closestAttack.enemySprite.y){
            closestAttack = attacks[r];
          }
      }else {
        attacksAlive = false;
      }

//console.log(closestAttack.enemySprite.x);
  }








  for (var i = 0; i < enemies.length; i++){
      if (enemies[i].alive){
         game.physics.arcade.collide(enemies[i].enemySprite, weapon.bullets, bulletEnemyAttackCollision, false, this);
         game.physics.arcade.collide(enemies[i].enemySprite, platforms, enemyAttackHit, false, this);
      }
  }

  for (var m = 0; m < attacks.length; m++){
      if (attacks[m].alive){
         game.physics.arcade.collide(attacks[m].enemySprite, turret.bullets, bulletPlayerAttackCollision, false, this);
         game.physics.arcade.collide(attacks[m].enemySprite, enemyPlatforms, playerAttackEnemyPlatform, false, this);
      }
  }


  // fire by sliding
  if(game.input.activePointer.isDown && game.input.y > (game.world.height - 200)) {
    sprite.x = game.input.x;
    weapon.fire();
  }

 // attack to the enemy

  if(game.input.activePointer.isDown && game.input.y < (game.world.height/2)) {
    game.input.onTap.add(tapTimer, this);
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
  if(attacksAlive){
    turret.fire();
  }

  if(playerHealth < 1) {
      gameOver();
  }
}


/* window.onloadin pari, do not touch */
};
