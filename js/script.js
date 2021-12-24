var canvas = document.getElementById("canvas"),
    ctx = canvas.getContext("2d"),
    elfImage = document.getElementById("elf");
greenGiftImage = document.getElementById("green_gift");
redGiftImage = document.getElementById("red_gift");
blueGiftImage = document.getElementById("blue_gift");
bombImage = document.getElementById("bomb");
bangImage = document.getElementById("bang");

var x = canvas.width / 2;
var y = canvas.height - 30;
var dx = 2;
var dy = -2;
const elfHeight = 70;
const elfWidth = 55;
var elfX = (canvas.width - elfWidth) / 2;
const elfSpeed = 10;
var rightPressed = false;
var leftPressed = false;
var spacePressed = false;
var spawnInterval;
var spawnTimer = 50;
var gifts = [];
var maxGift = 0;
const giftWidth = 40;
const giftHeight = 40;
var timer = 0;
var giftRotation = 0;
const TO_RADIANS = Math.PI / 180;
var score = 0;
var health = 3;
const bombChance = 5;
var elfRotation = 0;
var bangX;
var bangTime;
var snowHeight = 6;
var spawnTimeChangeInterval = 3000;
var titleColours = [];

// snowflake stuff
var snowflakes = [];
const maxSnowflakes = 80;
const snowflakeSize = 3;
const snowflakeMinSpeed = 1;
const snowflakeMaxSpeed = 4;
const snowflakeColours = ["rgba(255,255,255,0.95)", "rgba(255,255,255,0.65)", "rgba(255,255,255,0.4)"];

const gameModes = {
    TITLE: 'title',
    PLAYING: 'playing',
    GAMEOVER: 'gameover',
    WIN:'win',
};

var gameMode = gameModes.TITLE;

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

function keyDownHandler(e) {
    if (e.key == "Right" || e.key == "ArrowRight") {
        rightPressed = true;
    } else if (e.key == "Left" || e.key == "ArrowLeft") {
        leftPressed = true;
    } else if (e.code == "Space") {
        spacePressed = true;
    }
}

function keyUpHandler(e) {
    if (e.key == "Right" || e.key == "ArrowRight") {
        rightPressed = false;
    } else if (e.key == "Left" || e.key == "ArrowLeft") {
        leftPressed = false;
    } else if (e.code == "Space") {
        spacePressed = false;
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawSnow();

    timer++;

    switch (gameMode) {
        case gameModes.TITLE:
            titleScreen();
            break;
        case gameModes.GAMEOVER:
            gameOver();
            break;
        case gameModes.PLAYING:
            gameLoop();
            break;

        case gameModes.WIN:
            gameOverGift();
            break
    }
}

function titleScreen() {
    if (timer > titleColours.length) timer = 0;

    ctx.font = "50px Arial";
    ctx.fillStyle = titleColours[timer];
    ctx.fillText(`努力的lam蛋蛋`, 0, 50);
   
    ctx.fillStyle = "yellow";

    ctx.font = "30px Arial";
    ctx.fillText(`请按空格键开始!`, 65, 140);

    var highScore = getHighScore();
    if (highScore != -1) ctx.fillText(`High Score: ${highScore}`, 90, 220);

    drawRotatedImage(elfImage, canvas.width / 2 - elfWidth / 2, 330, elfRotation, 200);
    elfRotation += 2;
    if (elfRotation > 359) elfRotation = 0;

    if (spacePressed && timer > 5) {
        setGameMode(gameModes.PLAYING);
    }
}

function gameLoop() {
    drawSnowPerson();
    spawnGifts();
    processGifts();
    drawFloor();
    drawHUD();
    drawElf();
    drawBang();

    if (rightPressed) {
        elfX += elfSpeed;
        if (elfX + elfWidth > canvas.width) {
            elfX = canvas.width - (elfWidth + 5);
        }
    } else if (leftPressed) {
        elfX -= elfSpeed;
        if (elfX < -15) {
            elfX = -15;
        }
    }
}

function gameOver() {
    ctx.font = "50px Arial";
    ctx.fillStyle = "yellow";
    
    ctx.fillText(`继续努力！`, 80, 200);
    ctx.font = "30px Arial";
    ctx.fillText(`Final score: ${score}`, 130, 240);
    ctx.fillText('Press space to continue', 80, 280);

    if (spacePressed && timer > 5) {
        initialiseGame();
        setGameMode(gameModes.TITLE);
    }
}

function gameOverGift() {
    ctx.font = "50px Arial";
    ctx.fillStyle = "yellow";
    ctx.fillText(`拿到礼物`, 80, 200);
    ctx.fillText(`微信分数领取`, 80, 280);
    ctx.font = "30px Arial";


    if (spacePressed && timer > 5) {
        initialiseGame();
        setGameMode(gameModes.TITLE);
    }
}

function processGifts() {
    gifts.forEach((g) => {
        if (g && g.alive) {
            // draw gift
            drawGift(g);
            if (g.y > canvas.height) {
                g.alive = false;
                if (!g.bomb) score--;
            }

            // move gift
            g.y += g.speed;

            // rotate gift
            g.rotation += 5;
            if (g.rotation > 359) g.rotation = 0;

            // check for collision
            if ((g.y + (giftHeight / 2)) >= ((canvas.height - elfHeight - snowHeight) + 20) &&
                (g.y < canvas.height - snowHeight + 20)) {
                if ((elfX + 25) <= (g.x + (giftWidth / 2)) && ((elfX + 20) + (elfWidth)) >= g.x) {
                    g.alive = false;
                    if (!g.bomb) {
                        score += 5;
                        if (score >=468){
                            setHighScore();
                            setGameMode(gameModes.WIN);
                            
                        }
                    } else {
                        doBombCollision();
                    }
                }
            }

        }
    });
}

function drawGift(g) {
    switch (g.colour) {
        case 1:
            drawColouredGift(greenGiftImage, g);
            break;
        case 2:
            drawColouredGift(redGiftImage, g);
            break;
        case 3:
            drawColouredGift(blueGiftImage, g);
            break;
        case 4:
            drawRotatedImage(bombImage, g.x, g.y, 180, 45);
            break;
    }
}

function drawColouredGift(colourImage, g) {
    drawRotatedImage(colourImage, g.x, g.y, g.rotation, 35);
}

function doBombCollision() {
    health--;
    bangX = elfX;
    bangTime = 5;
    if (health == 0) {
        setHighScore();
        setGameMode(gameModes.GAMEOVER);
    }
}

function drawBang() {
    if (bangTime > 0) {
        bangTime--;
        ctx.drawImage(bangImage, bangX, (canvas.height - 75) - snowHeight, 75, 75);
    }
}


function drawElf() {
    ctx.drawImage(elfImage, elfX, (canvas.height - elfHeight) - (snowHeight - 2), 80, 80);
}

function spawn() {
    var newX = 5 + (Math.random() * (canvas.width - 5));

    var colour;
    var bomb = false;

    if (randomNumber(1, bombChance) == bombChance) {
        colour = 4;
        bomb = true;
    } else {
        colour = randomNumber(1, 3);
    }

    var newGift = {
        x: newX,
        y: 0,
        speed: randomNumber(2, 6),
        alive: true,
        rotation: 0,
        colour: colour,
        bomb: bomb,
    };

    gifts[maxGift] = newGift;
    maxGift++;
    if (maxGift > 75) {
        maxGift = 0;
    }
}

function spawnGifts() {
    if (timer > spawnTimer) {
        spawn();
        timer = 0;
    }
}

function drawRotatedImage(image, x, y, angle, scale) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle * TO_RADIANS);
    ctx.drawImage(image, -(image.width / 2), -(image.height / 2), scale, scale);
    ctx.restore();
}

function drawHUD() {
    ctx.font = "20px Arial";
    ctx.fillStyle = "yellow";
    ctx.fillText(`Score: ${score}`, 0, 25);

    var heart = '❤';
    var hearts = health > 0 ? heart.repeat(health) : " ";
    ctx.fillText("Helf:", canvas.width - 120, 25);
    ctx.fillStyle = "red";
    ctx.fillText(`${hearts}`, canvas.width - 60, 26);
}

function initialiseGame() {
    health = 3;
    elfX = (canvas.width - elfWidth) / 2;
    bangTime = 0;
    score = 0;
    snowHeight = 6;
    timer = 0;
    spawnTimer = 50;
    gifts = [];
}

function initialiseSnow() {
    for (i = 0; i < maxSnowflakes; i++) {
        var startY = -randomNumber(0, canvas.height);
        snowflakes[i] = {
            x: randomNumber(0, canvas.width - snowflakeSize),
            y: startY,
            startY: startY,
            colour: snowflakeColours[randomNumber(0, 3)],
            radius: (Math.random() * 3 + 1),
            speed: randomNumber(snowflakeMinSpeed, snowflakeMaxSpeed)
        };
    }
}

function drawSnow() {
    for (i = 0; i < maxSnowflakes; i++) {
        snowflakes[i].y += snowflakes[i].speed;
        if (snowflakes[i].y > canvas.height) snowflakes[i].y = snowflakes[i].startY;
        ctx.beginPath();
        ctx.arc(snowflakes[i].x, snowflakes[i].y, snowflakes[i].radius, 0, 2 * Math.PI, false);
        ctx.fillStyle = snowflakes[i].colour;
        ctx.fill();
    }
}

function drawFloor() {
    var snowTopY = canvas.height - snowHeight;

    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(0, snowTopY);
    ctx.lineTo(canvas.width, snowTopY);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.closePath();
    ctx.fill();
}

function drawSnowPerson() {
    var snowTopY = canvas.height - snowHeight;

    drawCircle("#fff", 100, snowTopY - 20, 40);
    drawCircle("#fff", 100, snowTopY - 70, 20);
    drawRectangle("#835C3B", 85, snowTopY - 105, 30, 20);
    drawRectangle("#835C3B", 75, snowTopY - 90, 50, 6);
    drawTriangle("#ffa500", 100, snowTopY - 64, 7);
    drawCircle("#000", 93, snowTopY - 76, 3);
    drawCircle("#000", 108, snowTopY - 76, 3);
    drawCircle("#000", 100, snowTopY - 40, 2);
    drawCircle("#000", 100, snowTopY - 30, 2);
    drawCircle("#000", 100, snowTopY - 20, 2);
}

function drawTriangle(color, x, y, height) {
    ctx.strokeStyle = ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - height, y - height);
    ctx.lineTo(x + height, y - height);
    ctx.fill();
}

function drawCircle(color, x, y, radius) {
    ctx.strokeStyle = ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
}

function drawRectangle(color, x, y, width, height) {
    ctx.strokeStyle = ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

function randomNumber(low, high) {
    return Math.floor(Math.random() * high) + low;
}

function makeColorGradient(frequency1, frequency2, frequency3,
    phase1, phase2, phase3,
    center, width, len) {
    var colours = [];

    for (var i = 0; i < len; ++i) {
        var r = Math.sin(frequency1 * i + phase1) * width + center;
        var g = Math.sin(frequency2 * i + phase2) * width + center;
        var b = Math.sin(frequency3 * i + phase3) * width + center;
        colours.push(RGB2Color(r, g, b));
    }
    return colours;
}

function RGB2Color(r, g, b) {
    return '#' + byte2Hex(r) + byte2Hex(g) + byte2Hex(b);
}

function byte2Hex(n) {
    var nybHexString = "0123456789ABCDEF";
    return String(nybHexString.substr((n >> 4) & 0x0F, 1)) + nybHexString.substr(n & 0x0F, 1);
}

function setColourGradient() {
    center = 128;
    width = 127;
    steps = 6;
    frequency = 2 * Math.PI / steps;
    return makeColorGradient(frequency, frequency, frequency, 0, 2, 4, center, width, 50);
}

function initialiseSpawnInterval() {
    if (gameMode === gameModes.PLAYING && spawnTimer > 2) {
        spawnTimer--;
        spawnTimeChangeInterval -= 50;
    }
}

function setGameMode(mode) {
    gameMode = mode;
    timer = 0;
}

function raiseSnow() {
    if (gameMode === gameModes.PLAYING && snowHeight < canvas.height) {
        snowHeight++;
    }
}

function setHighScore() {
    var currentHighScore = getHighScore();
    if (currentHighScore != -1 && score > currentHighScore) {
        localStorage.setItem("highScore", score);
    }
}

function getHighScore() {
    if (!localStorage) return -1;
    var highScore = localStorage.getItem("highScore");
    return highScore || 0;
}

titleColours = setColourGradient();
initialiseSnow();
setInterval(draw, 30);
setInterval(initialiseSpawnInterval, spawnTimeChangeInterval);
setInterval(raiseSnow, 666);