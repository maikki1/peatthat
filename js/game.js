window.onload = function() {




var game = new Phaser.Game('100%', '100%', Phaser.AUTO, '', { preload: preload, create: create, update: update });
function preload() {
    game.load.image('flower', 'assets/flower.png');
    game.load.image('triangle', 'assets/triangle-transp.png');
    game.load.image('circle', 'assets/purple-circle.png');
    /*game.load.spritesheet('dude', 'assets/dude.png', 32, 48)
    */
}

var sprite;
var weapon;
var cursors;
var fireButton;
var bulletScale = 0.05;

function create() {
  weapon = game.add.weapon(30, 'circle');
  weapon.bullets.forEach(function (b) {
    b.scale.setTo(bulletScale, bulletScale);
  }, this);
    weapon.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
    weapon.bulletAngleOffset = 90;
    weapon.bulletSpeed = 800;
    weapon.fireRate = 500;



  //  weapon.bullet.height = 0.5;

    sprite = this.add.sprite(game.world.centerX, game.world.height - 50, 'triangle');
    game.physics.arcade.enable(sprite);
    sprite.anchor.set(0.5);
    weapon.trackSprite(sprite, 0, -60);
    sprite.scale.setTo(0.05);

    sprite.inputEnabled = true;
    sprite.input.allowVerticalDrag = false;
    sprite.input.enableDrag();


    cursors = this.input.keyboard.createCursorKeys();
    fireButton = this.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR);

    game.stage.backgroundColor = '#B6E4CC';
    this.game.scale.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT;

}
function update() {

  sprite.body.velocity.x = 0;
  if (cursors.left.isDown)
  {
      sprite.body.velocity.x = -800;
  }
  else if (cursors.right.isDown)
  {
      sprite.body.velocity.x = 800;
  }

  if (fireButton.isDown)
  {
      weapon.fire();
  }

}


/* window.onloadin pari, do not touch */
};
