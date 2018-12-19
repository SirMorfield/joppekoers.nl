function int(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function float(min, max) {
    return Math.random() * (max - min) + min;
}
let up = true;
let hu = 0;
let boundsCheck = function ({ x, y, maxX, maxY, velX, velY, radius, bounceFriction, radians, setBack, speed, debug }) { //only works with circle center
    if (debug) {
        let reqArguments = [x, y, maxX, maxY, velX, velY, radius, speed];
        reqArguments.forEach(function (argument, index) {
            if (!argument && argument !== 0) throw new Error('Missing argument ' + index);
        });
        if (bounceFriction < 0 || bounceFriction > 1) throw new Error('Illegal value');
    }
    bounceFriction = 1 - bounceFriction; //inverting
    if (!bounceFriction) bounceFriction = 0;
    if (!radians) radians = 0;
    if (!setBack) setBack = 1;

    let bounds = false;

    if (x < radius) {
        velX *= -bounceFriction;
        x = radius + setBack;
        bounds = true;
        radians = 2 * Math.PI;
    }
    else if ((x + radius) > maxX) {
        velX *= -bounceFriction;
        x = maxX - radius - setBack;
        bounds = true;
        radians = Math.PI;
    }
    else if (y < radius) {
        velY *= -bounceFriction;
        y = radius + setBack;
        bounds = true;
        radians = Math.PI / 2;
    }
    else if ((y + radius) > maxY) {
        velY *= -bounceFriction;
        y = maxY - radius - setBack;
        bounds = true;
        radians = -Math.PI / 2;
    }

    return {
        velX: velX,
        velY: velY,
        x: x,
        y: y,
        bounds: bounds,
        radians: radians
    };
};
class RotationEnemy {
    constructor(_x, _y, _radius, _speed, _eyeSight, _color, _bounceFriction) {
        this.x = random(10, 30);
        this.y = random(10, 30);
        this.radius = 6;
        this.speed = 2;
        this.angle = 0;
        this.color = _color || 'rgb(255,0,0)';
        this.pointLength = 20;
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
        this.bounceFriction = _bounceFriction || 0;
        this.turn = 0;
        this.turnSpeed = 0.065;
        this.radians = 1;
    }

    randomMovement() {
        this.turn += this.turnSpeed;
        this.radians += map(noise(this.turn), 0, 1, -this.turnSpeed, this.turnSpeed);

        this.velX = Math.cos(this.radians) * this.speed;
        this.velY = Math.sin(this.radians) * this.speed;

        var bounds = boundsCheck({ x: this.x, y: this.y, maxX: width, maxY: height, velX: this.velX, velY: this.velY, radius: this.radius, speed: this.speed, radians: this.radians, debug: false });
        if (bounds.bounds == true) {
            this.y = bounds.y;
            this.x = bounds.x;
            this.velX = bounds.velX;
            this.velY = bounds.velY;
            this.radians = bounds.radians;
        }

        this.x += this.velX;
        this.y += this.velY;
        this.px = this.x - this.pointLength * Math.cos(this.radians);
        this.py = this.y - this.pointLength * Math.sin(this.radians);
    }

    draw() {
        ellipse(this.px, this.py, this.radius * 2, this.radius * 2);
        // ellipse(this.x, this.y, this.radius / 2, this.radius / 2);
    }
}

let points = [];
let entries = 1500;
let yOff = 0;
let yPos = 0;
let xOff = 0;
let xPos = 0;
let ball;
let balls = [];
let width = window.innerWidth;
let height = window.innerHeight;
function setup() {
    for (let i = 0; i < 7; i++) {
        balls[i] = new RotationEnemy(false, false, 10, float(0.05, 0.31), 500, 'rgb(255,2,2)', 0.95);
    }
    colorMode(HSB);
    ellipseMode(CENTER);
    createCanvas(width, height);
    noStroke();
    fill(125);
    background(0);
    strokeWeight(10);
}

function draw() {
    console.log(up)
    // background(0);
    // yOff += 0.01;
    // yPos = noise(yOff) * height;
    // points.push({ x: entries, y: yPos });
    // if (points[0].x < 0) points.shift();
    // points.forEach(function (point) { point.x -= 1; });
    // points.forEach(point => {
    //     ellipse(point.x, point.y, 2, 2);
    // });
    if (up) {
        hu += 0.5;
        if (hu > 255) {
            up = false;
            hu = 255;
        }
    }
    else {
        hu -= 0.5;
        if (hu < 0) {
            hu = 0
            up = true
        }
    }
    fill(hu, 255, 255);
    balls.forEach(function (ball, index) {

        ball.randomMovement();
        ball.draw();
    })
}
