const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// =====================
// RESPONSIVE
// =====================
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// Prevent scroll
document.body.style.margin = "0";
document.body.style.overflow = "hidden";
canvas.style.touchAction = "none";


// =====================
// GAME SETTINGS
// =====================
let gravity = 0.7;
let gameSpeed = 7;
let gameOver = false;
let score = 0;

let cameraX = 0;

let groundHeight = 120;
let baseY;

let distance = 250;


// =====================
// SOUND (MOBILE FIXED)
// =====================
let gameOverSound = new Audio("./fah.mp3");
gameOverSound.preload = "auto";
gameOverSound.volume = 1;

// Unlock audio on first touch/click (required for mobile)
function unlockAudio() {
  gameOverSound.play().then(() => {
    gameOverSound.pause();
    gameOverSound.currentTime = 0;
  }).catch(() => {});
}
document.addEventListener("touchstart", unlockAudio, { once: true });
document.addEventListener("click", unlockAudio, { once: true });


// =====================
// IMAGES
// =====================
let runnerImg = new Image();
runnerImg.src = "./runner.png";

let chaserImg = new Image();
chaserImg.src = "./chaser.png";

let obstacleImg = new Image();
obstacleImg.src = "./obstacle.svg";


// =====================
// PLAYER
// =====================
let runner = {
  x: 200,
  y: 0,
  width: 80,
  height: 100,
  dy: 0,
  jumps: 0,
  maxJumps: 2
};


// =====================
// CHASER
// =====================
let chaser = {
  x: 80,
  y: 0,
  width: 80,
  height: 100,
  frame: 0,
  frameTimer: 0
};


// =====================
// OBSTACLES
// =====================
let obstacles = [];

function spawnObstacle() {
  if (!gameOver) {
    obstacles.push({
      x: canvas.width + cameraX,
      y: baseY - 60,
      width: 60,
      height: 60
    });
  }
}
setInterval(spawnObstacle, 1500);


// =====================
// JUMP (DOUBLE)
// =====================
function jump() {
  if (runner.jumps < runner.maxJumps && !gameOver) {
    runner.dy = -18;
    runner.jumps++;
  }
}

document.addEventListener("keydown", (e) => {
  if (e.code === "Space") jump();
});

canvas.addEventListener("touchstart", () => {
  if (gameOver) restartGame();
  else jump();
});


// =====================
// RESTART
// =====================
function restartGame() {
  gameOver = false;
  score = 0;
  gameSpeed = 7;
  obstacles = [];
  distance = 250;
  runner.x = 200;
  runner.dy = 0;
  runner.jumps = 0;
  cameraX = 0;
  update();
}


// =====================
// BACKGROUND
// =====================
let bgFar = 0;
let bgMid = 0;
let groundOffset = 0;

function drawBackground() {

  baseY = canvas.height - groundHeight;

  // Sky
  let gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#0f2027");
  gradient.addColorStop(1, "#203a43");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Far layer
  bgFar -= gameSpeed * 0.2;
  ctx.fillStyle = "#1b1b1b";
  for (let i = 0; i < 2; i++) {
    ctx.fillRect(
      bgFar + i * canvas.width,
      canvas.height - 350,
      canvas.width,
      200
    );
  }

  // Mid layer
  bgMid -= gameSpeed * 0.4;
  ctx.fillStyle = "#222";
  for (let i = 0; i < 2; i++) {
    ctx.fillRect(
      bgMid + i * canvas.width,
      canvas.height - 300,
      canvas.width,
      200
    );
  }

  // Ground
  groundOffset -= gameSpeed;
  if (groundOffset <= -40) groundOffset = 0;

  ctx.fillStyle = "#111";
  for (let i = 0; i < canvas.width / 40 + 2; i++) {
    ctx.fillRect(
      i * 40 + groundOffset,
      baseY,
      20,
      groundHeight
    );
  }
}


// =====================
// GAME LOOP
// =====================
function update() {

  if (gameOver) {
    drawBackground();

    ctx.fillStyle = "white";
    ctx.textAlign = "center";

    ctx.font = "50px Arial";
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);

    ctx.font = "25px Arial";
    ctx.fillText("Tap To Restart", canvas.width / 2, canvas.height / 2 + 50);

    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();

  // Smooth Camera
  cameraX += (runner.x - cameraX - 250) * 0.08;

  // Gravity
  runner.dy += gravity;
  runner.y += runner.dy;

  if (runner.y > baseY - runner.height) {
    runner.y = baseY - runner.height;
    runner.dy = 0;
    runner.jumps = 0;
  }

  // Obstacles
  for (let i = 0; i < obstacles.length; i++) {

    obstacles[i].x -= gameSpeed;

    ctx.drawImage(
      obstacleImg,
      obstacles[i].x - cameraX,
      obstacles[i].y,
      obstacles[i].width,
      obstacles[i].height
    );

    // Collision
    if (
      runner.x < obstacles[i].x + obstacles[i].width &&
      runner.x + runner.width > obstacles[i].x &&
      runner.y < obstacles[i].y + obstacles[i].height &&
      runner.y + runner.height > obstacles[i].y
    ) {
      distance -= 30;
      obstacles.splice(i, 1);
      i--;
    }

    if (obstacles[i] && obstacles[i].x < cameraX - 200) {
      obstacles.splice(i, 1);
      score++;
    }
  }

  // Chaser Logic (Subway Style)
  if (distance > 0) {
    chaser.x = runner.x - distance;
  } else {
    if (!gameOver) {
      gameOverSound.currentTime = 0;
      gameOverSound.play();
    }
    gameOver = true;
  }

  // Draw Runner
  ctx.drawImage(
    runnerImg,
    runner.x - cameraX,
    runner.y,
    runner.width,
    runner.height
  );

  // Draw Chaser
  ctx.drawImage(
    chaserImg,
    chaser.x - cameraX,
    baseY - chaser.height,
    chaser.width,
    chaser.height
  );

  // Score
  ctx.fillStyle = "white";
  ctx.font = "26px Arial";
  ctx.textAlign = "left";
  ctx.fillText("Score: " + score, 20, 40);

  gameSpeed += 0.002;

  requestAnimationFrame(update);
}

update();