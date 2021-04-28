var score = 4;
function main() {
socket.emit('startGame1');
    var ymax = window.innerHeight - 5;
    var xmax = window.innerWidth - 5;
    var xmin = 2;
    var ymin = 2;
    var keys = {
        up: false,
        down: false,
        left: false,
        right: false,
        esc: false,
        space: false
    }
    var numberEnemy = 2;
    var xEnemy = [];
    var yEnemy = [];
    var dxEnemy = [];
    var dyEnemy = [];
    var sizeEnemy = [];
    var minSizeEnemy = 30;
    var maxSizeEnemy = 55;
    var moreEnemy = 1;
    var count1 = 0;
    var count2 = 0;
    var spawnEnemy = 40;
    var drawExplotion = false;
    var drawExplotionAgain = false;
    var alive = true;

    var start = false;

    var xCandy = Math.floor((Math.random() * (xmax - 70)) + 70);
    var yCandy = Math.floor((Math.random() * (ymax - 70)) + 70);
    var count3 = 0;
    var sizeCandy = 30;
    var drawEatenCandy = false;
    var drawEatenCandyAgain = false;
    var count4 = 0;

    var speedPlayer = 5;
    var sizePlayer = 40;
    var xPlayer = window.innerWidth / 2;
    var yPlayer = window.innerHeight / 2;
    var dxPlayer = 0;
    var dyPlayer = 0;
    var terug = 3;

    function voidSetup() {
        setInterval(voidLoop, 1000 / 60);
        ctx = myCanvas.getContext('2d');
        youDied = new Image();
        youDied.src = "http://i.imgur.com/LxZpxzG.jpg";

    }
    voidSetup();


    function handleKeyDown(e) {
        if (e.keyCode == 65) {
            keys.left = true;
        }
        if (e.keyCode == 87) {
            keys.up = true
        }
        if (e.keyCode == 68) {
            keys.right = true;
        }
        if (e.keyCode == 83) {
            keys.down = true;
        }
        if (e.keyCode == 27) {
            keys.esc = true;
        }
        if (e.keyCode == 32) {
            keys.space = true;
        }

    }

    function handleKeyUp(e) {
        if (e.keyCode == 65) {
            keys.left = false;
        }
        if (e.keyCode == 87) {
            keys.up = false
        }
        if (e.keyCode == 68) {
            keys.right = false;
        }
        if (e.keyCode == 83) {
            keys.down = false;
        }
        if (e.keyCode == 27) {
            keys.esc = false;
        }

        if (e.keyCode == 32) {
            keys.space = true;
        }
    }


    function setupPlayer() {
        player = new Image();
        player.src = "http://i.imgur.com/WpDig3w.png";
        window.onkeydown = handleKeyDown;
        window.onkeyup = handleKeyUp;
    }
    setupPlayer();

    function loopPlayer() {
        dxPlayer = 0
        dyPlayer = 0
        if (keys.left && xPlayer >= xmin) dxPlayer = -Math.abs(speedPlayer);
        if (keys.right && (xPlayer + sizePlayer) <= xmax) dxPlayer = Math.abs(speedPlayer);
        if (keys.up && yPlayer >= ymin) dyPlayer = -Math.abs(speedPlayer);
        if (keys.down && (yPlayer + sizePlayer) <= ymax) dyPlayer = Math.abs(speedPlayer);
        if (keys.esc) alive = false;
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        ctx.drawImage(player, xPlayer, yPlayer, sizePlayer, sizePlayer);
        xPlayer += dxPlayer;
        yPlayer += dyPlayer;
    }

    function setupEnemy() {
        for (var i = 0; i < numberEnemy; i++) {
            xEnemy[i] = Math.floor((Math.random() * (xmax - 10)) + 10);
            yEnemy[i] = Math.floor((Math.random() * (ymax - 10)) + 10);
            sizeEnemy[i] = Math.floor((Math.random() * maxSizeEnemy) + minSizeEnemy);
            dxEnemy[i] = Math.floor((Math.random() * 4.5) + 0.8);
            dyEnemy[i] = Math.floor((Math.random() * 4.5) + 0.8);
        }
        Enemy = new Image();
        Enemy.src = "http://i.imgur.com/dspoGdh.png";
        explotion = new Image();
        explotion.src = "http://i.imgur.com/7Y1word.png"

    }
    setupEnemy();

    function oneMoreEnemy(n) {
        xEnemy[n] = spawnEnemy;
        yEnemy[n] = spawnEnemy;
        sizeEnemy[n] = Math.floor((Math.random() * maxSizeEnemy) + minSizeEnemy);
        dxEnemy[n] = Math.floor((Math.random() * 4.5) + 0.8);
        dyEnemy[n] = Math.floor((Math.random() * 4.5) + 0.8);
    }

    function loopEnemy() {
        for (var i = 0; i < numberEnemy; i++) {
            ctx.drawImage(Enemy, xEnemy[i], yEnemy[i], sizeEnemy[i], sizeEnemy[i]);
            if (xEnemy[i] <= xmin || (xEnemy[i] + sizeEnemy[i]) >= xmax) {
                dxEnemy[i] = -dxEnemy[i];
            }
            if (yEnemy[i] <= ymin || (yEnemy[i] + sizeEnemy[i]) >= ymax) {
                dyEnemy[i] = -dyEnemy[i];
            }
            xEnemy[i] += dxEnemy[i];
            yEnemy[i] += dyEnemy[i];
        }
        count1 += 1
        if (count1 == 70) {
            numberEnemy += moreEnemy;
            count1 = 0;

            oneMoreEnemy(numberEnemy);
        }
    }

    function setupCandy() {
        candy = new Image();
        candy.src = "http://i.imgur.com/WkZw5F6.png"
        eat = new Image();
        eat.src = "http://i.imgur.com/ozilzOT.png"
    }
    setupCandy();

    function newCandy() {
        xCandy = Math.floor((Math.random() * (xmax - 70)) + 70);
        yCandy = Math.floor((Math.random() * (ymax - 70)) + 70);
    }

    function voidLoop() {
        if (start == false) {
            ctx.fillStyle = 'black';
            ctx.font = "43px Futura";
            ctx.textAlign = "center";
            ctx.fillRect((window.innerWidth / 2) - 237, (window.innerHeight / 2) + 30 - 175, 500, 180);
            ctx.fillStyle = 'red';
            ctx.fillText("Press space to start", window.innerWidth / 2, (window.innerHeight / 2) - 40);
            if (keys.space) start = true;
        }

        if (start == true) {
            if (sizePlayer < 25) alive = false;
            if (alive == true) {
                score += 1;
                loopPlayer();
                loopEnemy();

                if (count3 < 220) {
                    count3 += 1;
                    ctx.drawImage(candy, xCandy, yCandy, sizeCandy, sizeCandy);
                }
                if (count3 == 220) {
                    count3 = 0;
                    newCandy();
                }

                var xAfstandCandy = xPlayer - xCandy;
                var yAfstandCandy = yPlayer - yCandy;
                var candyAfstand = Math.sqrt(xAfstandCandy * xAfstandCandy + yAfstandCandy * yAfstandCandy);
                ab();
                if (candyAfstand < (sizePlayer / 2) + (sizeCandy / 2)) {
                    
                    sizePlayer += 4;
                    score += 200;
                    newCandy();
                    drawEatenCandy = true;

                }

                if (drawEatenCandy == true) {
                    ctx.drawImage(explotion, xPlayer - 10, yPlayer - 10, sizePlayer + 20, sizePlayer + 20);
                    drawEatenCandy = false;
              
                    drawEatenCandyAgain = true;
                }

                if (count3 < 90 && drawEatenCandyAgain == true) {
                    count3 += 1;
                    ctx.drawImage(eat, xPlayer - 10, yPlayer - 10, sizePlayer + 20, sizePlayer + 30);
                    ctx.font = "43px Futura";
                    ctx.fillText("+200", (window.innerWidth / 2), window.innerHeight / 2 - 120);
                }
                if (count3 == 90) {
                    drawEatenCandyAgain = false;
                    count3 = 0;
                }



                ctx.fillStyle = 'lightblue';
                ctx.fillRect(xmax - 80, 0, 105, 38);
                ctx.strokeRect(xmax - 80, 0, 105, 38);
                ctx.fillStyle = 'red';
                ctx.font = "23px Futura";
                ctx.textAlign = "right";
                ctx.fillText(score, xmax - 2, ymin + 25);
                for (a = 0; a < numberEnemy; a++) {
                    var xAfstand = xPlayer - xEnemy[a];
                    var yAfstand = yPlayer - yEnemy[a];
                    var afstand = Math.sqrt(xAfstand * xAfstand + yAfstand * yAfstand);


                    if (afstand < (sizePlayer / 2) + (sizeEnemy[a] / 2)) {

                        sizePlayer -= 4;
                        xEnemy[a] = spawnEnemy;
                        drawExplotion = true;
                    }
                    if (drawExplotion == true) {
                        ctx.drawImage(explotion, xPlayer - 10, yPlayer - 10, sizePlayer + 20, sizePlayer + 20);
                        drawExplotion = false;
             
                        drawExplotionAgain = true;
                    }

                    if (count2 < 88 && drawExplotionAgain == true) {
                        count2 += 1;
                        ctx.drawImage(explotion, xPlayer - 20, yPlayer - 20, sizePlayer + 40, sizePlayer + 40);
                    }
                    if (count2 == 88) {
                        drawExplotionAgain = false;
                        count2 = 0;
                    }
                }
            }
            if (alive == false) {
                ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
                ctx.fillStyle = "darkred";
                var edge = 10;
                ctx.fillRect((window.innerWidth / 2) - 287 - edge, (window.innerHeight / 2) - 175 - edge, 575 + (edge * 2), 350 + (edge * 2));
                ctx.drawImage(youDied, (window.innerWidth / 2) - 287, (window.innerHeight / 2) - 175, 575, 350);
                ctx.font = "100px Futura";
                ctx.textAlign = "left";
                ctx.fillText(score, (window.innerWidth / 2) - 120, window.innerHeight / 2 + 160);
                ctx.fillStyle = "darkred";
                ctx.textAlign = "center";
                ctx.font = "30px Futura";
                ctx.fillText("Score: ", (window.innerWidth / 2) - 170, window.innerHeight / 2 + 130);
                ctx.fillText("Press ctrl + r to restart", (window.innerWidth / 2), window.innerHeight / 2 - 120);
            }
        }
    }
}

function handleResize() {
    document.querySelector('#myCanvas').width = window.innerWidth;
    document.querySelector('#myCanvas').height = window.innerHeight - 4;
}
window.addEventListener('resize', handleResize);
window.addEventListener('load', handleResize);