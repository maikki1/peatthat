window.onload = function() {

var game = new Phaser.Game('100%', '100%', Phaser.AUTO, '', { preload: preload, create: create, update: update });
    
var sprite;
var weapon;
var cursors;
var fireButton;
var platforms;
var enemyAttack;
var bulletScale = 0.05;
var rocketScale = 0.01;
var playerScale = 0.05;
    

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
  weapon.bulletSpeedVariance = (weapon.bulletSpeed) / 3;
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
  createWeapons('default', 'circle', 900, 120, 8, true, sprite);
  //createWeapons('rocket', 'flower', 200, 500, 2, false, sprite);
    
    

  //"Event-listener-stuff", ie. listening to key-events for shooting.    
  cursors = this.input.keyboard.createCursorKeys();
    
  fireButton = this.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR, Phaser.KeyCode.SPACEBAR);  
  //rocketButton = this.input.keyboard.addKey(Phaser.KeyCode.Q, Phaser.KeyCode.Q);    

  // Bg default setup stuff    
  game.stage.backgroundColor = '#B6E4CC';
  this.game.scale.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT;

  createEnemyAttack(1000, 1000); //@param1 frequency @param2 speed (tätä modaamalla tasojen vaikeustason vaihtelu helppoa?)
}
    
    
var hitAmount = 0;
    
function bulletEnemyAttackCollision(first, second) {
    console.log(hitAmount);
    second.kill();
    hitAmount += 1;
    if(hitAmount == 5) {
      first.kill();
      hitAmount = 0;
    }
}

    
function enemyAttackHit(first, second) {
    first.kill();
    console.log("You got hit!");
}

function update() {

  game.physics.arcade.collide(enemyAttack, platforms, enemyAttackHit, false, this);

  sprite.body.velocity.x = 0;

  game.physics.arcade.collide(enemyAttack, weapon.bullets, bulletEnemyAttackCollision, false, this);

  //game.physics.arcade.collide(enemyAttack, rocket.bullets, bulletEnemyAttackCollision, false, this);


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
    /*
    if(rocketButton.isDown) {
        rocket.fire();
    }
    */
  }

    
}

function createEnemyAttack(frequency, speed) {
  enemyAttack = game.add.emitter(game.world.centerX, 0, 200);
  enemyAttack.width = game.world.width;
  enemyAttack.makeParticles('enemyAttack', 200, 200, true, true);
  enemyAttack.minParticleSpeed.set(-speed, 200);
  enemyAttack.maxParticleSpeed.set(speed, 200);
  enemyAttack.minParticleScale = 0.02;
  enemyAttack.maxParticleScale = 0.02;
  enemyAttack.bounce.setTo(1, 1);
  enemyAttack.setAll('body.immovable', true);

  enemyAttack.start(false, 0, frequency);

}

/* window.onloadin pari, do not touch */
};
