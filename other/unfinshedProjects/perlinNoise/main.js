let width = window.innerWidth;
let height = window.innerHeight - 4;

window.addEventListener("resize", function () {
    width = window.innerWidth;
    height = window.innerHeight - 4;
});


const boundsCheck = function ({ x, y, velX, velY, radius, radians, setBack = 1, maxX, maxY }) { //only works with circle center
    let bounds = false;
    if (x < radius) {
        x = radius + setBack;
        bounds = true;
        radians = 2 * Math.PI;
    }
    else if ((x + radius) > maxX) {
        x = maxX - radius - setBack;
        bounds = true;
        radians = Math.PI;
    }
    else if (y < radius) {
        y = radius + setBack;
        bounds = true;
        radians = Math.PI / 2;
    }
    else if ((y + radius) > maxY) {
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
class Ball {
    constructor({ x, y, velX, velY, radius, turnSpeed, speed, radians }) {
        this.x = x || 10;
        this.y = y || 10;
        this.velX = velX || 2;
        this.velY = velY || 2;
        this.radius = radius || 4;
        this.turnSpeed = turnSpeed || 0.065;
        this.speed = speed || 1.03;
        this.angle = 0;
        this.radians = radians || 0;
        this.turn = 0;
    }

    randomMovement() {
        this.turn += this.turnSpeed;
        this.radians += map(noise(this.turn), 0, 1, -this.turnSpeed, this.turnSpeed);

        this.velX = Math.cos(this.radians) * this.speed;
        this.velY = Math.sin(this.radians) * this.speed;

        let bounds = boundsCheck({ x: this.x, y: this.y, velX: this.velX, velY: this.velY, radius: this.radius, radians: this.radians, maxX: width, maxY: height });
        if (bounds.bounds == true) {
            this.y = bounds.y;
            this.x = bounds.x;
            this.velX = bounds.velX;
            this.velY = bounds.velY;
            this.radians = bounds.radians;
        }

        this.x += this.velX;
        this.y += this.velY;
    }

    draw() {
        ellipse(this.x, this.y, this.radius, this.radius);
        // ellipse(this.x, this.y, this.radius / 2, this.radius / 2);
    }
}

let points = [];
let yOff = 0;
let yPos = 0;
let xOff = 0;
let xPos = 0;
const drawPoints = () => {
    yOff += 0.008;
    yPos = noise(yOff) * height;
    points.push({ x: width, y: yPos });
    if (points[0].x < 0) points.shift();
    points.forEach(point => point.x -= 1);
    points.forEach(point => {
        ellipse(point.x, point.y, 2, 2);
    });
}


let ball;
let balls = [];
const drawBalls = () => {
    balls.forEach(ball => {
        ball.randomMovement();
        ball.draw();
    })
}

function setup() {
    //setupBalls
    for (let i = 0; i < 100; i++) {
        balls[i] = new Ball({ radians: random(0, 1), x: random(0, 50) });
    }

    colorMode(HSB);
    ellipseMode(CENTER);
    createCanvas(width, height);
    noStroke();
    fill(125);
    background(0);
    translate(CENTER)
}

let up = true;
let hu = 0;
function draw() {
    background(0);
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
    drawBalls();
    drawPoints();
}
