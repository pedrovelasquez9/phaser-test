"use strict";
var config = {
  type: Phaser.CANVAS,
  width: 800,
  height: 600,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 },
      debug: false,
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

var player;
var platforms;
var cursors;
var stars;
var score = 0;
var scoreText;
var bombs;
var gameOver = false;

var game = new Phaser.Game(config);

function preload() {
  this.load.image("sky", "assets/sky.png");
  this.load.image("ground", "assets/platform.png");
  this.load.image("star", "assets/star.png");
  this.load.image("bomb", "assets/bomb.png");
  //Carga una hoja que contiene las 9 posibles posiciones del personaje
  this.load.spritesheet("dude", "assets/dude.png", {
    frameWidth: 32,
    frameHeight: 48,
  });
}

function create() {
  this.add.image(400, 300, "sky");
  platforms = this.physics.add.staticGroup();

  platforms.create(400, 568, "ground").setScale(2).refreshBody();

  platforms.create(600, 400, "ground");
  platforms.create(50, 250, "ground");
  platforms.create(750, 220, "ground");

  //Definimos el personaje
  player = this.physics.add.sprite(100, 450, "dude");
  player.setBounce(0.2); //rebota tras saltar
  player.setCollideWorldBounds(true); //no puede salir de los bordes del mundo creado

  this.anims.create({
    key: "left", //nombre de la animación hacia la izquierda
    frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 3 }), //usa los frames cargados del 0 al 4
    frameRate: 10, //velocidad
    repeat: -1, //repetir animación de frames en cada vuelta
  });

  this.anims.create({
    key: "turn", //el personaje mira al frente de la camara
    frames: [{ key: "dude", frame: 4 }], //usa solo el frame 4
    frameRate: 20, //velocidad
  });

  this.anims.create({
    key: "right", //nombre de la animación hacia la derecha
    frames: this.anims.generateFrameNumbers("dude", { start: 5, end: 8 }), //usa los frames cargados del 5 al 8
    frameRate: 10, //velocidad
    repeat: -1, //repetir animación de frames en cada vuelta
  });
  player.setGravityY(200);
  this.physics.add.collider(player, platforms);

  cursors = this.input.keyboard.createCursorKeys();

  stars = this.physics.add.group({
    key: "star",
    repeat: 1,
    setXY: { x: 12, y: 0, stepX: 70 },
  });

  stars.children.iterate(function (child) {
    child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
  });

  this.physics.add.collider(stars, platforms);

  this.physics.add.overlap(player, stars, collectStar, null, this);
  scoreText = this.add.text(16, 16, "Score: 0", { fontSize: "30px" });

  bombs = this.physics.add.group();
  this.physics.add.collider(bombs, platforms);
  this.physics.add.collider(player, bombs, hitBomb, null, this);
}

function update() {
  if (cursors.left.isDown) {
    player.setVelocityX(-160);

    player.anims.play("left", true);
  } else if (cursors.right.isDown) {
    player.setVelocityX(160);

    player.anims.play("right", true);
  } else {
    player.setVelocityX(0);

    player.anims.play("turn");
  }

  if (cursors.up.isDown && player.body.touching.down) {
    player.setVelocityY(-430);
  }
}

function collectStar(player, star) {
  //Hacemos desaparecer la estrella
  star.disableBody(true, true);
  //Aumentamos la puntuación
  score += 10;
  scoreText.setText(`Score: ${score}`);

  //Verificamos si hemos recogido todas las estrellas
  if (stars.countActive(true) === 0) {
    stars.children.iterate(function (child) {
      child.enableBody(true, child.x, 0, true, true);
    });

    var bombXCoord =
      player.x < 400
        ? Phaser.Math.Between(400, 800)
        : Phaser.Math.Between(0, 400);

    var bomb = bombs.create(bombXCoord, 16, "bomb");
    bomb.setBounce(1);
    bomb.setCollideWorldBounds(true);
    bomb.setVelocityX(Phaser.Math.Between(-200, 200));
  }
}

function hitBomb(player, bomb) {
  this.physics.pause();
  player.setTint("0xff0000");
  player.anims.play("turn");
  gameOver = true;
}
