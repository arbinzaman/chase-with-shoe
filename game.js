const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Responsive Canvas
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// Game Settings
let gravity = 0.6;
let gameSpeed = 6;
let gameOver = false;
let score = 0;

let bgOffset = 0;
let groundOffset = 0;

// Images
let runnerImg = new Image();
runnerImg.src = "./runner.png";

let chaserImg = new Image();
chaserImg.src = "./chaser.png";

let obstacleImg = new Image();
obstacleImg.src = "./obstacle.svg";

// Characters
let runner = {
  x: 200,
  y: 0,
  width: 80,
  height: 100,
  dy: 0,
  jumping: false
};

let chaser = {
  x: 50,
  y: 0,
  width: 80,
  height: 100
};

let obstacles = [];
let distance = 150;

function resetPositions() {
  runner.y = canvas.height - 150;
  chaser.y = canvas.height - 150;
}
resetPositions();

// Jump
function jump() {
  if (!runner.jumping && !gameOver) {
    runner.dy = -16;
    runner.jumping = true;
  }
}

// Desktop control
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") jump();
});

// Mobile control
canvas.addEventListener("touchstart", () => {
  if (gameOver) {
    restartGame();
  } else {
    jump();
  }
});

// Prevent scroll on mobile
document.body.addEventListener("touchmove", e => {
  e.preventDefault();
}, { passive: false });

// Spawn obstacles
function spawnObstacle() {
  if (!gameOver) {
    obstacles.push({
      x: canvas.width,
      y: canvas.height - 130,
      width: 60,
      height: 60
    });
  }
}
setInterval(spawnObstacle, 2000);

// Restart
function restartGame() {
  gameOver = false;
  score = 0;
  distance = 150;
  gameSpeed = 6;
  obstacles = [];
  runner.dy = 0;
  runner.jumping = false;
  resetPositions();
  update();
}

// Moving Background
function drawBackground() {

  // Sky gradient
  let gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#1a1a1a");
  gradient.addColorStop(1, "#333");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Moving skyline layer
  bgOffset -= 0.5;
  if (bgOffset <= -canvas.width) bgOffset = 0;

  ctx.fillStyle = "#2a2a2a";
  for (let i = 0; i < 2; i++) {
    ctx.fillRect(bgOffset + i * canvas.width, canvas.height - 300, canvas.width, 200);
  }

  // Moving ground
  groundOffset -= gameSpeed;
  if (groundOffset <= -40) groundOffset = 0;

  ctx.fillStyle = "#111";
  for (let i = 0; i < canvas.width / 40 + 2; i++) {
    ctx.fillRect(i * 40 + groundOffset, canvas.height - 80, 20, 80);
  }
}

// Main Loop
function update() {

  if (gameOver) {
    drawBackground();

    ctx.fillStyle = "white";
    ctx.textAlign = "center";

    let titleSize = Math.max(30, Math.min(canvas.width * 0.08, 80));
    let subSize = Math.max(18, Math.min(canvas.width * 0.04, 40));

    ctx.font = `${titleSize}px Arial`;
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);

    ctx.font = `${subSize}px Arial`;
    ctx.fillText("Tap To Restart", canvas.width / 2, canvas.height / 2 + 60);

    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBackground();

  // Gravity
  runner.dy += gravity;
  runner.y += runner.dy;

  if (runner.y > canvas.height - 150) {
    runner.y = canvas.height - 150;
    runner.jumping = false;
  }

  // Obstacles
  for (let i = 0; i < obstacles.length; i++) {

    obstacles[i].x -= gameSpeed;

    ctx.drawImage(
      obstacleImg,
      obstacles[i].x,
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
      distance -= 25;
      obstacles.splice(i, 1);
      i--;
    }

    // Remove offscreen + increase score
    if (obstacles[i] && obstacles[i].x + obstacles[i].width < 0) {
      obstacles.splice(i, 1);
      i--;
      score++;
    }
  }

  // Chaser logic
  if (distance > 0) {
    chaser.x = runner.x - distance;
  } else {
    gameOver = true;
  }

  // Draw characters
  ctx.drawImage(runnerImg, runner.x, runner.y, runner.width, runner.height);
  ctx.drawImage(chaserImg, chaser.x, chaser.y, chaser.width, chaser.height);

  // Responsive Score
  ctx.fillStyle = "white";
  ctx.textAlign = "left";

  let scoreSize = Math.max(18, Math.min(canvas.width * 0.035, 40));
  let padding = canvas.width * 0.02;

  ctx.font = `${scoreSize}px Arial`;
  ctx.fillText("Score: " + score, padding, scoreSize + padding);

  // Increase difficulty slowly
  gameSpeed += 0.002;

  requestAnimationFrame(update);
}

update();