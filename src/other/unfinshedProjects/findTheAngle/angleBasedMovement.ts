let canvas = document.getElementById('canvas'),
  ctx = canvas.getContext('2d'),
  width = 1320,
  height = 720,
  keys = [],
  scorebordSizeX = 75,
  renders = [],
  score = 1;
canvas.width = width + 75;
canvas.height = height;
window.onkeydown = function (e) { //to prevent scrolling with space bar
  return !(e.keyCode == 32);
};
document.body.addEventListener('keydown', function (e) {
  keys[e.keyCode] = true;
  if (e.keyCode === 27) { //if esc stop game
    renderEnd(0);
  }
});
document.body.addEventListener('keyup', function (e) {
  keys[e.keyCode] = false;
});

function int(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function float(min, max) {
  return (Math.random() * (max - min) + min);
}

socket.emit('findTheAngle');


let boundsCheck = function (_x, _y, _maxX, _maxY, _velX, _velY, _radius, _bounceFriction, _setBack) { //returns true if object goes over
  if (arguments.length < 7) throw new Error('Illegal argument count');
  if (!_bounceFriction) _bounceFriction = 1;
  if (!_setBack) _setBack = 1;
  _bounceFriction = -Math.abs(_bounceFriction); //make negative
  let _bounds = false;
  if (_x < _radius) {
    _velX *= _bounceFriction;
    _x = _radius + _setBack;
    _bounds = true;
  }
  if ((_x + _radius) > _maxX) {
    _velX *= _bounceFriction;
    _x = _maxX - _radius - _setBack;
    _bounds = true;
  }
  if (_y < _radius) {
    _velY *= _bounceFriction;
    _y = _radius + _setBack;
    _bounds = true;
  }
  if ((_y + _radius) > _maxY) {
    _velY *= _bounceFriction;
    _y = _maxY - _radius - _setBack;
    _bounds = true;
  }

  return {
    velX: _velX,
    velY: _velY,
    x: _x,
    y: _y,
    bounds: _bounds
  };
};

class Ship {
  constructor(_x, _y, _radius, _color, _id) {
    this.x = _x || width / 2;
    this.y = _y || height / 2;
    this.radius = _radius || 10;

    this.turnSpeed = 0;
    this.thrust = 0;
    this.turnSpeeds = [0.0009, 0.0015];
    this.thrusts = [0.0975, 0.18];
    this.isThrusting = false;
    this.isBraking = false;

    this.angle = 0;
    this.color = _color || 'rgb(255,0,0)';
    this.pointLength = 15;
    this.px = 0;
    this.py = 0;
    this.velX = 0;
    this.velY = 0;
    this.health = 100;
    this.distanceEnemy = 9999;
    this.firingSpeed = 0.25;
    this.collisionDamage = 10;
    this.invincible = true;
    this.friction = 0.98;
    this.isFiring = false;
    this.id = _id;
  }
  turn(_dir) {
    this.angle += this.turnSpeed * _dir;
  }
  update() {
    this.isFiring = keys[32];
    this.isThrusting = keys[87];
    this.isBraking = keys[83];
    // if (this.isFiring) {
    //   shoot({ x: this.x, y: this.y, velX: this.velX, velY: this.velY, speed: 8, angle: this.angle, id: this.id, color: 'rgb(255,2,2)' });
    // }
    if (keys[68]) this.turn(1);
    if (keys[65]) this.turn(-1);

    if (keys[16]) { // if shift
      this.thrust = this.thrusts[0]
      this.turnSpeed = this.turnSpeeds[0];
    } else {
      this.thrust = this.thrusts[1];
      this.turnSpeed = this.turnSpeeds[1];
    }

    var radians = this.angle / Math.PI * 180;

    if (this.isThrusting) {
      this.velX += Math.cos(radians) * this.thrust;
      this.velY += Math.sin(radians) * this.thrust;
    }
    if (this.isBraking) {
      this.velX -= Math.cos(radians) * (this.thrust * 0.95);
      this.velY -= Math.sin(radians) * (this.thrust * 0.95);
    }

    this.velX *= this.friction;
    this.velY *= this.friction;

    let newVel = boundsCheck(this.x, this.y, width, height, this.velX, this.velY, this.radius, this.bounceFriction);
    this.velX = newVel.velX;
    this.velY = newVel.velY;

    this.x -= this.velX;
    this.y -= this.velY;

    this.px = this.x - this.pointLength * Math.cos(radians);
    this.py = this.y - this.pointLength * Math.sin(radians);
    if (this.health <= 0 && !this.invincible) {
      renderEnd();
    }
    for (let i = 0; i < normalEnemies.length; i++) {
      this.distanceEnemy = Math.sqrt(Math.pow(this.x - normalEnemies[i].x, 2) + Math.pow(this.y - normalEnemies[i].y, 2));
      if (this.distanceEnemy <= normalEnemies[i].radius && !this.invincible) {
        this.health -= normalEnemies[i].damage;
      }
    }
  }
  draw() {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = 'rgb(0,0,0)';
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.px, this.py);
    ctx.closePath();
    ctx.stroke();
  }
}

let ship = new Ship(width / 2, height / 2, 10, 'rgb(255,0,0)', 'ship');

function renderShip() {
  ship.update();
  ship.draw();
}

class RotationEnemy {
  constructor(_x, _y, _radius, _speed, _eyeSight, _color, _bounceFriction) {
    this.x = _x || width / 2;
    this.y = _y || height / 2;
    this.radius = _radius || 10;
    this.speed = _speed;
    this.angle = 0;
    this.color = _color || 'rgb(255,0,0)';
    this.pointLength = 15;
    this.px = 0;
    this.py = 0;
    this.velX = 0;
    this.velY = 0;
    this.health = 100;
    this.collisionDamage = 10;
    this.friction = 0.98;
    this.distanceShip = 9999;
    this.eyeSight = 300;
    this.shipAngle = 0;
    this.stopFollowingDistance = 100;
    this.bounceFriction = _bounceFriction || 1;
  }
  follow() {

    let radians = Math.atan2(this.y - ship.y, this.x - ship.x);

    this.distanceShip = Math.sqrt(Math.pow((this.x - ship.x), 2) + Math.pow((this.y - ship.y), 2));
    if (this.distanceShip <= this.eyeSight && this.distanceShip >= this.stopFollowingDistance) {
      this.velX += Math.cos(radians) * this.speed;
      this.velY += Math.sin(radians) * this.speed;
    }

    this.velX *= this.friction;
    this.velY *= this.friction;

    let newVel = boundsCheck(this.x, this.y, width, height, this.velX, this.velY, this.radius, this.bounceFriction);
    this.velX = newVel.velX;
    this.velY = newVel.velY;

    this.y = newVel.y;
    this.x = newVel.x;

    this.x -= this.velX;
    this.y -= this.velY;

    this.px = this.x - this.pointLength * Math.cos(radians);
    this.py = this.y - this.pointLength * Math.sin(radians);
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = 'rgb(0,0,0)';
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.px, this.py);
    ctx.closePath();
    ctx.stroke();
  }
}

let rotationEnemies = [];

function makeRotationEnemy(_x) {
  for (let i = 0; i < _x; i++) {
    let kleur = 'rgb(' + int(30, 255) + ',' + int(30, 255) + ',' + int(30, 255) + ')';
    rotationEnemies.push(new RotationEnemy(int(10, 800), int(10, 800), int(8, 12), float(0.05, 0.31), 500, kleur, 0.95));
  }
}

// makeRotationEnemy(30);

function renderRotationEnemy() {
  for (let current of rotationEnemies) { //going through array
    if (current.health > 0) {
      current.follow(ship.x, ship.y);
      current.draw();
    }
  }
}

class NormalEnemy {
  constructor(_x, _y, _radius, _speed, _eyeSight, _color, _bounceFriction) {
    this.x = _x;
    this.y = _y;
    this.radius = _radius || 20;
    this.color = _color;
    this.distanceShip = 9999;
    this.distanceBullet = 9999;
    this.velX = 0;
    this.velY = 0;
    this.speed = _speed;
    this.eyeSight = _eyeSight || Math.sqrt((Math.pow(width, 2) + Math.pow(height, 2))) / 10;
    this.bounceFriction = _bounceFriction;
    this.stopFollowingDistance = 80;
    this.health = 100;
    this.damage = 5;
    this.collisionDamage = 10;
    this.friction = 0.992;
  }
  update(_targetX, _targetY) {
    if (this.health > 0) {
      this.distanceShip = Math.sqrt(Math.pow(this.x - _targetX, 2) + Math.pow(this.y - _targetY, 2));

      if (this.distanceShip <= this.eyeSight && this.distanceShip >= this.stopFollowingDistance) {
        this.velX -= (ship.x - this.x) / (300 / this.speed); // move toward ship
        this.velY -= (ship.y - this.y) / (300 / this.speed);
      }

      let newVel = boundsCheck(this.x, this.y, width, height, this.velX, this.velY, this.radius);
      this.velX = newVel.velX * this.friction;
      this.velY = newVel.velY * this.friction;

      this.x -= this.velX;
      this.y -= this.velY;

      for (let i = 0; i <= bullets.length; i++) { // basically doing damage to enemy by bullets
        this.distanceBullet = Math.sqrt(Math.pow(this.x - bullets[i].x, 2) + Math.pow(this.y - bullets[i].y, 2));
        if (this.distanceBullet <= this.radius) {
          bullets[i].health -= this.damage;
          this.health -= bullets[i].damage;
        }
      }
      if (this.health <= 0) {
        removedEnemies += 1;
        score += 1;
      }
    }
  }
  draw() {
    ctx.fillStyle = "red";
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
    // ctx.fillRect(this.x - 20, this.y - 30, this.x - 15, this.y - 25);
  }
}

let normalEnemies = [];

function makeNormalEnemy(_x) {
  for (let i = 0; i < _x; i++) {
    let kleur = 'rgb(' + int(30, 255) + ',' + int(30, 255) + ',' + int(30, 255) + ')';
    normalEnemies.push(new NormalEnemy(int(10, 500), int(10, 500), int(8, 12), float(0.05, 0.381), 500, kleur, -0.7));
  }
}

// makeNormalEnemy(10);
let removedEnemies = 0;

function renderNormalEnemy() {
  for (let current of normalEnemies) { //going through array
    if (current.health > 0) {
      current.update(ship.x, ship.y);
      current.draw();
    }
  }
}

class Bullet {
  constructor(obj) {
    this.x = obj.x;
    this.y = obj.y;
    this.velX = obj.velX;
    this.velY = obj.velY;
    this.color = obj.color;
    this.masterID = obj.id;
    this.radius = 4;
    this.health = 100;
    this.damage = 100;
    this.died = function () {
      removedBullets += 1;
      this.health = 0;
      removeBullet(this.masterID);
      this.died = function () { };
    };
  }
  update() {
    if (this.x > width || this.x < 0 || this.y > height || this.y < 0 || this.health <= 0) {
      this.died();
    }
    this.x -= this.velX;
    this.y -= this.velY;
  }
  draw() {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
  }
}
function removeBullet(_id) {
  for (let user of users) {
    if (user.id == _id) {
      for (let i = 0; i < user.bullets.length; i++) {
        if (user.bullets[i].health <= 0) {
          user.bullets.splice(i, 1);
        }
      }
    }
  }
}
// shoot({
//   x: this.x,
//   y: this.y,
//   velX: this.velX,
//   velY: this.velY,
//   speed: 8,
//   angle: this.angle,
//   id: this.id,
//   color: 'rgb(255,2,2)'
// });
let users = [];
// let users = [{
//     id: n,
//     bullets: [{x: n, y: n, velX: n, velY: n, speed: n},]
//   },];

function shoot(user) { //{x: n, y: n, velX: n, velY: n, speed: n, angle: n,id: n} -> 6
  if (Object.values(user).length !== 8) throw new Error('Illegal argument count');
  else {
    let radians = user.angle / Math.PI * 180;
    let bulletVelX = Math.cos(radians) * (user.speed);
    let bulletVelY = Math.sin(radians) * (user.speed);

    let a = users.findIndex(function (obj) {
      return obj.id == user.id;
    });
    let newBullet = new Bullet({
      x: user.x,
      y: user.y,
      velX: bulletVelY,
      velY: bulletVelY,
      color: user.color,
      id: user.id
    });

    if (a === -1) {
      users.push({
        id: user.id,
        bulletsShot: 0,
        bullets: [newBullet]
      });
    } else {
      users[a].bullets.push(newBullet);
      users[a].bulletsShot += 1;
    }
  }
}

var removedBullets = 0;
var renderBullets = function () {
  users.forEach(function (user) {
    user.bullets.forEach(function (bullet) {
      if (bullet.health > 0) {
        // console.log(bullet);
        bullet.update();
        bullet.draw();
        // console.log(bullet.health);
      }
    });
  });
};
let renderEnd = function () {
  renders = [];
  var d = new Date();
  let name = '<';
  name = prompt('What\'s your name?');
  socket.emit('a', [score, name, d.toLocaleDateString('en-GB')]);
  cancelAnimationFrame(req);
  loadScores();
  renderEnd = function () { };
};

var req;

function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < renders.length; i++) {
    renders[i]();
  }
  req = requestAnimationFrame(loop);
}

var scorebordMinX = width,
  scorebordMinY = 0,
  scorebordMaxX = width + scorebordSizeX,
  scorebordMaxY = height,
  newLine = 15,
  bigSkip = 22,
  accuracy;

function renderScore() {
  // between lines 15px
  // big skip 20px
  var line = 14;
  ctx.fillStyle = 'black';
  ctx.strokeStyle = 'black';
  ctx.font = '15px Arial';
  ctx.textAlign = 'left';
  ctx.strokeRect(scorebordMinX, scorebordMinY, scorebordMaxX, scorebordMaxY);

  ctx.fillText('Score:', scorebordMinX + 5, line);
  line += newLine;
  ctx.fillText(score, scorebordMinX + 5, line);
  line += bigSkip;

  ctx.fillText('Health:', scorebordMinX + 5, line);
  line += newLine;
  ctx.fillText(ship.health, scorebordMinX + 5, line);
  line += bigSkip;

  ctx.fillText('Kills', scorebordMinX + 5, line);
  line += newLine;
  ctx.fillText(removedEnemies, scorebordMinX + 5, line);
  line += bigSkip;

  ctx.fillText('Bullets:', scorebordMinX + 5, line);
  line += newLine;
  ctx.fillText(bullets.length, scorebordMinX + 5, line);
  line += bigSkip;

  ctx.fillText('Accuracy:', scorebordMinX + 5, line);
  line += newLine;
  accuracy = (removedEnemies / bullets.length) * 100 || 0;
  ctx.fillText(accuracy.toFixed(3) + '%', scorebordMinX + 5, line);
  line += bigSkip;

  ctx.fillText('Enemies:', scorebordMinX + 5, line);
  line += newLine;
  ctx.fillText("enemiesAlive", scorebordMinX + 5, line);
  line += bigSkip;
}

let loadScores = function () {
  socket.emit('getScores');
  socket.on('receiveScores', function (_x) {
    let rows;
    if (_x.length < 20) rows = _x.length;
    else rows = 20;

    let body = document.body;
    let tbl = document.createElement('table');
    tbl.style.width = '300px';
    for (let y = 0; y < rows; y++) {
      let tr = tbl.insertRow();
      for (let x = 0; x < 3; x++) {
        let td = tr.insertCell();
        td.appendChild(document.createTextNode(_x[y][x]));
        td.style.border = '1px solid black';
      }
    }
    body.appendChild(tbl);
    tableCreate = function () { }; //to prevent the function from running again
  });
  loadScores = function () { };
};

renders.push(renderBullets, renderRotationEnemy, renderShip, renderNormalEnemy);
//   shoot({ x: ship.x, y: ship.y, velX: 2, velY: 2, speed: 8, angle: ship.angle, id: ship.id, color: 'rgb(255,2,2)' });
