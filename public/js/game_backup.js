//game backup
window.onload = function() {

function newGame() {

var game = new Phaser.Game('100%', '100%', Phaser.AUTO, '', { preload: preload, create: create, update: update });

var sprite;
var weapon;
var cursors;
var fireButton;
var platforms;
var enemies;
var enemyAttack;
var bulletScale = 0.05;
var rocketScale = 0.01;
var playerScale = 0.05;
var playerHealth = 3; //debug
var playAgainButton;
var gameIsOn = true;

// Game Over
function gameOver() {
    /*
    for(var i in enemies) {
        enemies[i].
    }
    */
    gameIsOn = false;
    gameoverscreen = game.add.sprite(game.world.centerX - 200, game.world.centerY - 100, 'gameover');
    gameoverscreen.scale.setTo(0.3);
    $("#newGameButton").css("display", "block");
    $("#newGameButton").click(newGame());
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
  //weapon.autofire = ;
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

  // Ajattelin, että nämä kaikki kuitenkin on defaulttina jokaisessa pelissä, joten voivat olla create -funktiossa.

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
  createWeapons('default', 'circle', 900, 100, 8, true, sprite);

  //"Event-listener-stuff", ie. listening to key-events for shooting.
  cursors = this.input.keyboard.createCursorKeys();
  fireButton = this.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR, Phaser.KeyCode.SPACEBAR);

  // Default setup stuff
  game.stage.backgroundColor = '#B6E4CC';
  this.game.scale.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT;

  enemies = game.add.group();
  enemies.enableBody = true;
    if(gameIsOn) {
        createSingleEnemies();
    }
}

// My bullet(s) hitting enemy
function bulletEnemyAttackCollision(first, second) {
    second.kill();
    first.kill();
    }
}

// Enemy hitting my base
function enemyAttackHit(first, second) {
    playerHealth -= 1; //Aim: playerHealth vähenee riippuen enemyn tyypistä; aika intuitiivista.
    first.kill();
    console.log("You got hit!");
    console.log(playerHealth + " health");
}

function createEnemyAttack(frequency, speed, img, strength) {
  enemyAttack = game.add.emitter(game.world.centerX, 0, 200);
  enemyAttack.width = game.world.width;
  enemyAttack.makeParticles(img, 300, 300, true, true);
  enemyAttack.minParticleSpeed.set(-speed, 200);
  enemyAttack.maxParticleSpeed.set(speed, 200);
  enemyAttack.minParticleScale = 0.02;
  enemyAttack.maxParticleScale = 0.02;
  enemyAttack.bounce.setTo(1, 1);
  enemyAttack.setAll('body.immovable', true);
  enemyAttack.strength = strength;
  enemyAttack.hits = 0;
  enemyAttack.pendingDestroy = false;

  enemyAttack.start(false, 0, frequency);
  console.log("at createEnemyAttack now   " + enemyAttack) //Se bugi on täällä! Tää ei kuole, vaan pumppaa jatkuvasti uusia enemy attackeja.
};

function createSingleEnemies(amount) {
    for (var i = 0; i < 12; i++) {
        var enemy = enemies.create(i * 5, 0, 'flower');
        enemy.body.gravity.y = 6;
        enemy.body.bounce.y = 0.7 + Math.random() * 0.2;
    }
}

function update() {

  game.physics.arcade.collide(enemies, platforms, enemyAttackHit, false, this);
  game.physics.arcade.collide(enemies, weapon.bullets, bulletEnemyAttackCollision, false, this);

  sprite.body.velocity.x = 0;

    if(cursors.left.isDown) {
        sprite.body.velocity.x = -800;
    }

    else if(cursors.right.isDown) {
        sprite.body.velocity.x = 800;
    }

    if(fireButton.isDown) {
       weapon.fire();
    }

    if(playerHealth < 1) {
      gameOver();
    }
}


/* newGame():n pari. */
}

  newGame();

/* window.onloadin pari, do not touch */
};
