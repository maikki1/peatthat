$(document).ready(function () {


  $("#newGame").click(generateGame);


var game;
var sprite;
var playersalad;
var enemysalad;
var rotatedirection = 1;
var weapon;
var cursors;
var fireButton;
var platforms;
var bulletScale = 0.25; //Player bullet scale
var rocketScale = 1;
var playerScale = 0.7; // Both p and e scale
var enemyScale = 0.45; // Eenemy attack scale
var playerHealth = 9; //debug
var enemyHealth = 9;
var playAgainButton;
var enemies;
var attacks;
var enemyCanon;
var enemiesTotal = 3;
var requestURL = "/assets/levels.json";
var lvlData;
var lvlTotalLength = 40; //global level length in seconds
var counter = lvlTotalLength;
var timeCounter = 0;
var gameTimer;
var enemyPlatforms;
var interval;
var currentLevelIndex = 1;
var levelOn = false;
var attacksAlive = false;
var closestAttack = 0;
var enemyDefaultPosition;
var playerPoints = 0;
var gotext;
var pointsvisible;
var firstTween;
function generateGame() {
  playerPoints = 0;
    $("#newGame").hide();
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
  this.enemySprite.scale.setTo(enemyScale); // Miksi ovat eri kokoiset by default?
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
    game.load.image('enemy', 'assets/enemy.png');
    game.load.image('p_def_weapon', 'assets/player_drop.png');
    game.load.image('e_def_weapon', 'assets/enemy_drop.png');
    game.load.image('enemyAttack', 'assets/drop_db_down.png');
    game.load.image('land', 'assets/base_land.png');
    game.load.image('enemyLand', 'assets/invisible.png');
    game.load.image('invisible-box', 'assets/invisible.png');
    game.load.spritesheet('saladsprite', 'assets/saladsprite1.png', 374, 374);
    game.load.image('playerAttack', 'assets/drop_lb_up.png');
    game.load.image('background', 'assets/bg_demo2.png');
}

// New game default setup
function create() {
  console.log("create");

//var barConfig = {x: 200, y: 100};
//this.myHealthBar = new HealthBar(this.game, barConfig);

  // Default setup stuff
  //game.stage.backgroundColor = '#EAFFE1';
  //this.game.scale.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT;
  background = game.add.sprite(0, 0, 'background');
  background.width = game.world.width;
  background.height = game.world.height;
  game.stage.background = 'background';


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
  enemyPlatforms = game.add.sprite(game.world.width/2, game.world.height * 0.12 , 'enemyLand');
  enemyPlatforms.width = game.world.width;
  game.physics.arcade.enable(enemyPlatforms);
  enemyPlatforms.body.immovable = true;

//  enemyPlatforms.setAll('body.immovable', true);
  enemyPlatforms.anchor.set(0.5);

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
  enemysalad.scale.setTo(0.70);
  enemysalad.frame = 0;
  enemysalad.imageSmoothingEnabled = true;
  enemysalad.angle = -10;

  //time counter
  timeCounter = game.add.text(game.world.width - 100, 40, 'time: ' + counter, { font: "35px Luckiest Guy", fill: "#ffffff", align: "center" });
  timeCounter.anchor.setTo(0.5, 0.5);

  //level counter
  levelCounter = game.add.text(85, game.world.height - 40, 'level: ' + currentLevelIndex, { font: "35px Luckiest Guy", fill: "#ffffff", align: "center" });
  levelCounter.anchor.setTo(0.5, 0.5);

  //points visible to user
  pointsvisible = game.add.text(100, 35, 'points: ' + playerPoints, { font: "35px Luckiest Guy", fill: "#ffffff", align: "center" });
  pointsvisible.anchor.setTo(0.5, 0.5);

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

  createWeapons('default', 'p_def_weapon', 900, 400, 8, false, sprite); //name, image, speed, rate, efficiency, automatic, whoseGun
  turretWeapon('default', 'e_def_weapon', 900, 400, 8, false, enemyCanon);

  cursors = this.input.keyboard.createCursorKeys();

  fireButton = this.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR, Phaser.KeyCode.SPACEBAR);
  //rocketButton = this.input.keyboard.addkey(Phaser.KeyCode.)

  nextlvl();

}



function update() {

  rotateSalad(playersalad, 5, 0.5);
  rotateSalad(enemysalad, 20, 0.45);

  moveEnemyTurret(4);



  for (var r = 0; r < attacks.length; r++){
      if (attacks[r].enemySprite.alive){
        attacksAlive = true;
          if(closestAttack === 0){

            closestAttack = attacks[r];
        } else if(attacks[r].enemySprite.y < closestAttack.enemySprite.y){
            closestAttack = attacks[r];
          }
      }else {
        attacksAlive = false;
      }
  }


  // collision tests for enemies
  for (var i = 0; i < enemies.length; i++){
      if (enemies[i].alive){
         game.physics.arcade.collide(enemies[i].enemySprite, weapon.bullets, bulletEnemyAttackCollision, false, this);
         game.physics.arcade.collide(enemies[i].enemySprite, platforms, enemyAttackHit, false, this);
      }
  }
  // collision tests for players attacks
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


/* generateGame  */
}



//index, frequency, speed, img, strength
createEnemyAttack = function(enemySpeed, idx, health, angleSize) {
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



// Collision of an enemy's attack with player's bullets
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
  playerPoints ++;
  enemysalad.frame ++;
  updatePoints();
  first.alive = false;
  second.alive = false;
  first.kill();
  enemyHealth --;
    if(enemyHealth === 0) {
        gameOver();
    }
}

// Enemy hitting player's base
function enemyAttackHit(first, second) {
    playerHealth -= 1;
    playersalad.frame += 1;
    first.kill();
}

function gameOver() {
  gotext = game.add.text(game.world.centerX, game.world.centerY * 0.9 ,'Game Over', { font: "64px Luckiest Guy", fill: "#ffffff", align: 'center' });
  gotext.anchor.set(0.5, 0.5);
  console.log("game over happened");
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
  attacksAlive = false;


  $("#startButton").show();
  $(".gamePaused").show();
  game.destroy();
}


function updatePoints () {
    pointsvisible.setText('points: ' + playerPoints);
}

function updateCounter() {
    counter--;
    if(counter === 0){
      endlvl();
    }
    timeCounter.setText('time: ' + counter);
}

function updateLevelText() {
    levelCounter.setText('level: ' + currentLevelIndex);
}


function endlvl() {
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
  console.log("nextlvl");
  updateLevelText();
//  timeCounter.setText('time: ' + counter);
  game.time.events.add(Phaser.Timer.SECOND * lvlTotalLength, endlvl, this);

    gameTimer = game.time.events.repeat(Phaser.Timer.SECOND, lvlTotalLength, updateCounter, this);


  levelOn = true;
  var inxEnemy = 0;
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
  if(tapCounter <= 5) {
      //enemysalad.scale.setTo(0.70);
  }
    if(tapCounter > 5){
      attacks.push(new createPlayerAttack(600, indexAttack, 2)); //enemySpeed, idx, health
      indexAttack ++;
      //enemysalad.scale.setTo(0.80);
      tapCounter = 0;

    }
}




  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyCJ1ppllSj84MMPSjk3zIhMIHq98_3J2MY",
    authDomain: "peat-that.firebaseapp.com",
    databaseURL: "https://peat-that.firebaseio.com",
    projectId: "peat-that",
    storageBucket: "peat-that.appspot.com",
    messagingSenderId: "94034739294"
  };
  firebase.initializeApp(config);


      // FirebaseUI config.
      var uiConfig = {
        'callbacks': {
        // Called when the user has been successfully signed in.
          'signInSuccess': function(user, credential, redirectUrl) {
            handleSignedInUser(user);
            // Do not redirect.
            return false;
          }
        },
        signInOptions: [
          // Leave the lines as is for the providers you want to offer your users.
          firebase.auth.FacebookAuthProvider.PROVIDER_ID,
        ],
        // Terms of service url.
        tosUrl: '<your-tos-url>'
      };
      // Initialize the FirebaseUI Widget using Firebase.
      var ui = new firebaseui.auth.AuthUI(firebase.auth());

      var currentUid = null;


          var displayName;
          var email;
          var emailVerified;
          var photoURL;
          var uid;
          var providerData;

           initApp = function() {
             firebase.auth().onAuthStateChanged(function(user) {
               if (user) {
                 // User is signed in.
                 displayName = user.displayName;
                 email = user.email;
                 emailVerified = user.emailVerified;
                 photoURL = user.photoURL;
                 uid = user.uid;
                 providerData = user.providerData;
                 handleSignedInUser(user);
               } else {
                 // User is signed out.
                 displayName = null;
                 email = null;
                 emailVerified = null;
                 photoURL = null;
                 uid = null;
                 providerData = null;

                 //document.getElementById('sign-in-status').textContent = 'Signed out';
                 handleSignedOutUser();
                 gameEnd();
               }
             }, function(error) {
             });
           };





      // User In
        var handleSignedInUser = function(user) {
          currentUid = uid;


          function writeUserData(userId, name, email, imageUrl) {
            firebase.database().ref('users/' + userId).update({
              username: name,
              email: email,
              profile_picture : imageUrl
            });
          }
          writeUserData(uid, displayName, email, photoURL);
        //  document.getElementById('photo-container').style.display = 'block';
          $(".signed-in").css("display", "block");
        //  document.getElementById('menu-name').innerText = displayName;
          if (photoURL){
          //  document.getElementById('photo').src = photoURL;
          //  document.getElementById('photo').style.display = 'block';
          } else {
          //  document.getElementById('photo').style.display = 'none';
          }
        };





      /* Display the UI for a signed out user. */
      var handleSignedOutUser = function() {
        $(".signed-in").css("display", "none");

        ui.start('#firebaseui-auth-container', uiConfig);
        game.destroy();
      };

      $("#sign-out-text").click(signOutClicked);
      function signOutClicked() {
        firebase.auth().signOut().then(function() {
        // Sign-out successful.
        }).catch(function(error) {
        // An error happened.
        });
      }

      $("#sign-out-text").hover(
        function(){
        TweenLite.to($("#sign-out-text"), 0.1, {scale:1.2, ease: Back.easeInOut});
      },function(){

        TweenLite.to($("#sign-out-text"), 0.1, {scale:1, ease: Back.easeInOut});
      }
    );


    $("#startButton").hover(
      function(){
      TweenLite.to($("#startButton"), 0.2, {scale:1.1, ease: Back.easeInOut});
    },function(){

      TweenLite.to($("#startButton"), 0.2, {scale:1, ease: Back.easeInOut});
    }
  );


  $('#startButton').click(function(){
    $("#startButton").hide();
    $(".gamePaused").hide();
      levelOn = true;
      generateGame();
  });
  $('#nextLevelButton').click(function(){
    $("#nextLevelButton").hide();
      levelOn = true;
      nextlvl();
  });


  initApp();
  /*
  var dbRef = firebase.database().ref('users/' + uid).child("KillAmount");
  dbRef.set(Math.round(killAmount * 10));
  dbRef.on('value', function(datashot){
      //console.log(datashot.val());
  $("#killCounter").text(datashot.val());
  });*/





/* window.onloadin pari, do not touch */
});
