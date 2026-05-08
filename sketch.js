const W = 1000;
const H = 650;

let planes = [];
let score = 0;
let lives = 3;
let gameOver = false;
let spawnTimer = 0;
let selectedPlane = null;

function setup() {
  createCanvas(W, H);
  textFont('monospace');
}

function draw() {
  background(10, 25, 42);
  drawGrid();
  drawRunway();

  if (!gameOver) {
    spawnTimer--;
    if (spawnTimer <= 0) {
      planes.push(createPlane());
      spawnTimer = int(random(90, 170));
    }
  }

  updatePlanes();
  checkCollisions();
  drawHUD();

  if (gameOver) {
    drawGameOver();
  }
}

function drawGrid() {
  stroke(40, 74, 102);
  strokeWeight(1);
  for (let x = 0; x < W; x += 50) line(x, 0, x, H);
  for (let y = 0; y < H; y += 50) line(0, y, W, y);
}

function drawRunway() {
  noStroke();
  fill(70);
  rect(W / 2 - 120, H / 2 - 20, 240, 40, 6);
  fill(230);
  for (let i = -100; i <= 100; i += 25) rect(W / 2 + i, H / 2 - 2, 12, 4);
  fill(130, 230, 130);
  ellipse(W / 2, H / 2, 22, 22);
}

function updatePlanes() {
  for (let i = planes.length - 1; i >= 0; i--) {
    const p = planes[i];
    if (!gameOver) {
      let desired = p.heading;
      if (p.path.length > 0) {
        const target = p.path[0];
        const ang = atan2(target.y - p.y, target.x - p.x);
        desired = degrees(ang);
        if (dist(p.x, p.y, target.x, target.y) < 14) p.path.shift();
      }

      p.heading = lerpAngle(p.heading, desired, 0.04);
      p.x += cos(radians(p.heading)) * p.speed;
      p.y += sin(radians(p.heading)) * p.speed;

      if (dist(p.x, p.y, W / 2, H / 2) < 20 && p.path.length === 0) {
        score += 10;
        planes.splice(i, 1);
        continue;
      }

      if (p.x < -50 || p.x > W + 50 || p.y < -50 || p.y > H + 50) {
        lives--;
        planes.splice(i, 1);
        if (lives <= 0) gameOver = true;
        continue;
      }
    }

    drawPlane(p);
    drawPath(p);
  }
}

function drawPlane(p) {
  push();
  translate(p.x, p.y);
  rotate(radians(p.heading));
  stroke(p === selectedPlane ? color(255, 235, 120) : color(130, 220, 255));
  strokeWeight(p === selectedPlane ? 3 : 2);
  noFill();
  triangle(-10, -6, -10, 6, 12, 0);
  pop();

  noStroke();
  fill(220);
  textSize(12);
  text(`${p.id}`, p.x + 10, p.y - 12);
}

function drawPath(p) {
  if (p.path.length === 0) return;
  noFill();
  stroke(255, 190, 70, 180);
  strokeWeight(1.5);
  beginShape();
  vertex(p.x, p.y);
  for (const pt of p.path) vertex(pt.x, pt.y);
  endShape();
}

function checkCollisions() {
  if (gameOver) return;
  for (let i = 0; i < planes.length; i++) {
    for (let j = i + 1; j < planes.length; j++) {
      if (dist(planes[i].x, planes[i].y, planes[j].x, planes[j].y) < 22) {
        gameOver = true;
        return;
      }
    }
  }
}

function drawHUD() {
  noStroke();
  fill(0, 90);
  rect(10, 10, 320, 80, 8);
  fill(210);
  textSize(18);
  text(`PONTOS: ${score}`, 20, 35);
  text(`VIDAS: ${lives}`, 20, 58);
  textSize(13);
  text('Clique num avião para selecionar e desenhe rota com cliques.', 20, 80);
}

function drawGameOver() {
  fill(0, 180);
  rect(0, 0, W, H);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(44);
  text('FIM DE JOGO', W / 2, H / 2 - 30);
  textSize(20);
  text(`Pontuação: ${score}  |  Pressione R para reiniciar`, W / 2, H / 2 + 20);
  textAlign(LEFT, BASELINE);
}

function createPlane() {
  const edge = int(random(4));
  let x, y;
  if (edge === 0) { x = -20; y = random(H); }
  if (edge === 1) { x = W + 20; y = random(H); }
  if (edge === 2) { x = random(W); y = -20; }
  if (edge === 3) { x = random(W); y = H + 20; }

  const targetAng = degrees(atan2(H / 2 - y, W / 2 - x));
  return {
    id: `FLT${int(random(100, 999))}`,
    x, y,
    heading: targetAng + random(-30, 30),
    speed: random(1.2, 2.1),
    path: []
  };
}

function mousePressed() {
  if (gameOver) return;
  let hit = null;
  for (const p of planes) {
    if (dist(mouseX, mouseY, p.x, p.y) < 16) {
      hit = p;
      break;
    }
  }

  if (hit) {
    selectedPlane = hit;
    if (keyIsDown(SHIFT)) selectedPlane.path = [];
    return;
  }

  if (selectedPlane) selectedPlane.path.push({ x: constrain(mouseX, 0, W), y: constrain(mouseY, 0, H) });
}

function keyPressed() {
  if (key === 'r' || key === 'R') {
    planes = [];
    score = 0;
    lives = 3;
    gameOver = false;
    selectedPlane = null;
    spawnTimer = 40;
  }
  if (key === 'c' || key === 'C') {
    if (selectedPlane) selectedPlane.path = [];
  }
}

function lerpAngle(a, b, t) {
  let diff = ((b - a + 540) % 360) - 180;
  return a + diff * t;
}
