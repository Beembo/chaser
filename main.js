const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const healthBar = document.querySelector("progress");

const SKELETON_WIDTH = 50;
const SKELETON_HEIGHT = 70;
const START_MAX_SPEED = 3;
const START_MIN_SPEED = 1.5;
const PLAYER_WIDTH = 50;
const PLAYER_HEIGHT = 70;
const PLAYER_SPEED = 5;
const POWERUP_SIZE = 50;
const ENEMY_SPAWN_INTERVAL = 5;
const ENEMY_SCREEN_OFFSET = 100;

class Game {
    constructor() {
        this.gameOver = false;
        this.pauseGame = false;
        this.numSpawn = 1;
        this.speedIncrement = 0.5;
        this.skeletonDamage = 1;
        this.maxSpeed = START_MAX_SPEED;
        this.minSpeed = START_MIN_SPEED;
    }
    updateScene() {
        if (health.onGround) {
            health.checkHealth();
        }
        if (star.onGround) {
            star.checkStar();
        }
        player.checkBounds();
        player.moveToward(mouse, player.speed);
        enemies.forEach(enemy => enemy.moveToward(player, enemy.speed));
        Enemy.checkEnemyCollisions();
        player.checkHit();
        scoreboard.updateScore();
        if (this.pauseGame) {
            this.loadPauseScreen();
        } else if (healthBar.value > 0) {
            requestAnimationFrame(this.drawScene.bind(this));
        } else {
            this.endGame();
        }
    }

    drawScene() {
        this.clearBackground();
        player.draw();
        enemies.forEach(enemy => enemy.draw());
        this.updateScene();
    }

    endGame() {
        this.pauseSounds();
        gameOverSound.currentTime = 1;
        gameOverSound.play();
        this.gameOver = true;
        ctx.font = "120px VT323";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
        ctx.font = "50px VT323";
        ctx.fillText(
            "CLICK to play again",
            canvas.width / 2,
            canvas.height / 2 + 50
        );
        ctx.textAlign = "left";
    }

    resetGame() {
        backgroundMusic.currentTime = 0;
        backgroundMusic.play();
        healthBar.value = 100;
        health.onGround = false;
        star.onGround = false;
        scoreboard.resetScore();
        this.resetEnemies();
        this.gameOver = false;
        requestAnimationFrame(this.drawScene.bind(this));
    }

    resetEnemies() {
        this.numSpawn = 1;
        this.maxSpeed = START_MAX_SPEED;
        this.minSpeed = START_MIN_SPEED;
        this.skeletonDamage = 1;
        enemies = [];
        enemies.push(new Enemy(-ENEMY_SCREEN_OFFSET, -ENEMY_SCREEN_OFFSET));
        enemies.push(new Enemy(canvas.width + ENEMY_SCREEN_OFFSET, -ENEMY_SCREEN_OFFSET));
        enemies.push(new Enemy(-ENEMY_SCREEN_OFFSET, canvas.height + ENEMY_SCREEN_OFFSET));
        enemies.push(new Enemy(canvas.width + ENEMY_SCREEN_OFFSET, canvas.height + ENEMY_SCREEN_OFFSET));
    }

    loadPauseScreen() {
        this.pauseSounds();
        ctx.font = "120px VT323";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText("PAUSED", canvas.width / 2, canvas.height / 2);
        ctx.font = "30px VT323";
        ctx.fillText(
            "HEALTH appears every five seconds.",
            canvas.width / 2,
            canvas.height / 2 + 50
        );
        ctx.fillText(
            "A STAR appears every ten seconds.",
            canvas.width / 2,
            canvas.height / 2 + 80
        );
        ctx.fillText(
            "A STAR kills three skeletons.",
            canvas.width / 2,
            canvas.height / 2 + 110
        );
        ctx.textAlign = "left";
    }

    clearBackground() {
        ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
        this.writeInstructions();
    }

    writeInstructions() {
        ctx.font = "20px VT323";
        ctx.fillStyle = "white";
        ctx.fillText("MOVE mouse to move.", 10, 20);
        ctx.fillText("CLICK to pause.", 10, 40);
    }

    activateKonamiCode() {
        //SOURCE: https://www.shutterstock.com/image-vector/seamless-pixelated-snow-texture-mapping-background-602230688?src=ofh7TSdxP506-TB16-Rnag-1-14
        backgroundImage.src = "https://image.ibb.co/bFDixw/grass_Konami.png";
        //Santa Hat SOURCE: http://moziru.com/explore/Santa%20Hat%20clipart%208%20bit/
        skeletonImage.src = "https://image.ibb.co/eznXqG/konami_Skeleton.png";
        playerImage.src = "https://image.ibb.co/hGFkAG/konami_Character.png";

        //SOURCE: https://www.youtube.com/watch?v=17731HiOiXg
        backgroundMusic.src =
        "https://raw.githubusercontent.com/mlouis2/chaser/master/sounds/KonamiMusic.mp3";
        backgroundMusic.currentTime = 0;
        backgroundMusic.play();
    }

    randomLocation(max, size) {
        return Math.random() * (max - size);
    }

    randomSpeed() {
        return Math.random() * (this.maxSpeed - this.minSpeed) + this.minSpeed;
    }

    pauseSounds() {
        skeletonSound.pause();
        backgroundMusic.pause();
    }
}

class Scoreboard {
    constructor() {
        this.score = 0;
        this.highScore = 0;
        this.scoreMiliseconds = 0;
        this.scoreText = document.getElementById("score");
        this.highScoreText = document.getElementById("highscore");
    }

    storeScore() {
        if (typeof Storage !== "undefined") {
            localStorage.setItem("highScore", this.highScore);
        }
    }

    retrieveScore() {
        if (typeof Storage !== "undefined") {
            if (
                localStorage.getItem("highScore") === undefined ||
                localStorage.getItem("highScore") === null
            ) {
                this.highScoreText.innerHTML = 0;
            }
            this.highScoreText.innerHTML = localStorage.getItem("highScore");
            this.highScore = localStorage.getItem("highScore");
        }
    }

    resetScore() {
        this.scoreMiliseconds = 0;
        scoreboard.retrieveScore();
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.highScoreText.innerHTML = this.highScore;
            scoreboard.storeScore();
        }
        this.score = 0;
        this.scoreText.innerHTML = 0;
    }

    updateScore() {
        this.scoreMiliseconds++;
        if (this.scoreMiliseconds % 100 === 0) {
            this.score++;
            if (this.score % ENEMY_SPAWN_INTERVAL === 0) {
                if (game.maxSpeed < player.speed - game.speedIncrement) {
                    game.minSpeed += game.speedIncrement;
                    game.maxSpeed += game.speedIncrement;
                }
                for (let x = 0; x < game.numSpawn; x++) {
                    enemies.push(new Enemy(canvas.width / 2, canvas.height + 50));
                }
            }
            Powerup.checkPowerups();
            this.scoreText.innerHTML = this.score;
        }
    }
}

class Sprite {
    draw() {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
    //Credit to Ryan Taus for helping me with the math for this function :)
    moveToward(leader, speed) {
        let dx = leader.x - this.x;
        let dy = leader.y - this.y;
        let hypot = this.distanceTo(leader);
        let speedx = speed * (dx / hypot);
        let speedy = speed * (dy / hypot);
        if (hypot > speed) {
            this.x += speedx;
            this.y += speedy;
        }
    }
    jumpBack(sprite2, amount) {
        let spriteJumpingMidX = this.x + this.width / 2;
        let spriteJumpingMidY = this.y + this.height / 2;
        let sprite2MidX = sprite2.x + sprite2.width / 2;
        let sprite2MidY = sprite2.y + sprite2.height / 2;
        if (spriteJumpingMidX > sprite2MidX) {
            this.x = this.x + amount;
        } else {
            this.x = this.x - amount;
        }
        if (spriteJumpingMidY > sprite2MidY) {
            this.y = this.y + amount;
        } else {
            this.y = this.y - amount;
        }
    }
    checkBounds() {
        if (this.x < 0) {
            this.x = 0;
        } else if (this.x + this.width > canvas.width) {
            this.x = canvas.width - this.width;
        }
        if (this.y < 0) {
            this.y = 0;
        } else if (this.y + this.height > canvas.height) {
            this.y = canvas.height - this.height;
        }
    }

    hasCollidedWith(sprite2) {
        return (
            this.x < sprite2.x + sprite2.width &&
            this.x + this.width > sprite2.x &&
            this.y < sprite2.y + sprite2.height &&
            this.height + this.y > sprite2.y
        );
    }

    distanceTo(sprite2) {
        return Math.hypot(this.x - sprite2.x, this.y - sprite2.y);
    }
}

class Player extends Sprite {
    constructor(x, y, width, height, speed) {
        super();
        this.image = playerImage;
        Object.assign(this, {
            x,
            y,
            width,
            height,
            speed
        });
    }
    checkHit() {
        enemies.forEach(enemy => {
            if (enemy.hasCollidedWith(player)) {
                enemy.jumpBack(player, 10);
                healthBar.value -= game.skeletonDamage;
                skeletonSound.play();
            }
        });
    }
}

class Enemy extends Sprite {
    constructor(x, y) {
        super();
        this.width = SKELETON_WIDTH;
        this.height = SKELETON_HEIGHT;
        this.speed = game.randomSpeed();
        this.image = skeletonImage;
        Object.assign(this, {
            x,
            y
        });
    }
    static checkEnemyCollisions() {
        for (let x = 0; x < enemies.length; x++) {
            for (let y = enemies.length - 1; y > x; y--) {
                if (enemies[x].hasCollidedWith(enemies[y])) {
                    enemies[x].jumpBack(enemies[y], 1);
                }
            }
        }
    }
}

class Powerup extends Sprite {
    static checkPowerups() {
        if (scoreboard.score % 5 === 0) {
            health.drawPowerup();
            health.onGround = true;
        }
        if (scoreboard.score % 10 === 0) {
            star.drawPowerup();
            star.onGround = true;
            game.skeletonDamage += 1;
        }
        if (scoreboard.score % 25 === 0) {
            game.numSpawn++;
        }
    }
    drawPowerup() {
        this.x = game.randomLocation(canvas.width, this.width);
        this.y = game.randomLocation(canvas.height, this.width);
        this.draw();
    }
}

class Health extends Powerup {
    constructor(x, y, width, height) {
        super();
        this.image = healthImage;
        this.onGround = false;
        this.healthValue = 30;
        Object.assign(this, {
            x,
            y,
            width,
            height
        });
    }
    checkHealth() {
        this.draw();
        if (player.hasCollidedWith(health)) {
            healthSound.play();
            healthBar.value += this.healthValue;
            this.onGround = false;
        }
    }
}

class Star extends Powerup {
    constructor(x, y, width, height) {
        super();
        this.starPower = 3;
        this.onGround = false;
        this.image = starImage;
        Object.assign(this, {
            x,
            y,
            width,
            height
        });
    }
    checkStar() {
        this.draw();
        if (player.hasCollidedWith(star)) {
            starSound.play();
            for (let x = 0; x < this.starPower; x++) {
                enemies.shift();
            }
            game.minSpeed = game.minSpeed - game.speedIncrement;
            game.maxSpeed = game.maxSpeed - game.speedIncrement;
            this.onGround = false;
        }
    }
}

function updateMouse(event) {
    const { left, top } = canvas.getBoundingClientRect();
    mouse.x = event.clientX - left;
    mouse.y = event.clientY - top;
}

function mouseClick(event) { //eslint-disable-line no-unused-vars
    if (game.gameOver) {
        game.resetGame();
    } else {
        if (game.pauseGame) {
            backgroundMusic.play();
            requestAnimationFrame(game.drawScene.bind(game));
        }
        game.pauseGame = !game.pauseGame;
    }
}

let konamiCode = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
let enteredKeys = [];
let currentPos = 0;

document.addEventListener("keydown", function(e) {
    let key = e.keyCode;
    if (key === konamiCode[currentPos]) {
        currentPos++;
        enteredKeys.push(key);
    } else {
        currentPos = 0;
        enteredKeys = [];
    }
    if (enteredKeys.length === konamiCode.length) {
        game.activateKonamiCode();
    }
});

document.body.addEventListener("mousemove", updateMouse);

let game = new Game();

let scoreboard = new Scoreboard();

let player = new Player(
    canvas.width / 2,
    canvas.height / 2,
    PLAYER_WIDTH,
    PLAYER_HEIGHT,
    PLAYER_SPEED
);

let star = new Star(
    game.randomLocation(canvas.width, POWERUP_SIZE),
    game.randomLocation(canvas.height, POWERUP_SIZE),
    POWERUP_SIZE,
    POWERUP_SIZE
);

let health = new Health(
    game.randomLocation(canvas.width, POWERUP_SIZE),
    game.randomLocation(canvas.height, POWERUP_SIZE),
    POWERUP_SIZE,
    POWERUP_SIZE
);

let enemies = [
    new Enemy(-ENEMY_SCREEN_OFFSET, -ENEMY_SCREEN_OFFSET),
    new Enemy(canvas.width + ENEMY_SCREEN_OFFSET, -ENEMY_SCREEN_OFFSET),
    new Enemy(-ENEMY_SCREEN_OFFSET, canvas.height + ENEMY_SCREEN_OFFSET),
    new Enemy(canvas.width + ENEMY_SCREEN_OFFSET, canvas.height + ENEMY_SCREEN_OFFSET)
];

let mouse = {
    x: 0,
    y: 0
};

backgroundMusic.play();
scoreboard.retrieveScore();
requestAnimationFrame(game.drawScene.bind(game));
