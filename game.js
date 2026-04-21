function year() {
    const correctName = document.getElementById("glezna").value
      if (correctName == "Mākslinieka dārzs Živernī") {
        const yes = "Pareizs nosaukums"
    } else {
        const no = "Nepareizs nosaukums"
    }
   if (document.getElementById("g10").checked) {
        const yearYes = "Pareizais gads"
    } else if (document.getElementById("g18").checked or document.getElementById("g14").checked) {
        const yearNot = "Nepareizais gads"
    } else {
        const kl = "tev nav norādīts gads"
    }

    
    document.getElementById("answer").innerHTML = "Tev ir " + b + ". tavas krāsas kods ir " + i
}


const IMAGE = "240555.webp"
const PIECE_SIZE_MAP = { 3: 130, 4: 100, 5: 80 }

let grid, moves, startTime, timerInterval;

const diff = () => parseInt(document.getElementById('difficulty').value);
const ps = () => PIECE_SIZE_MAP[diff()];
const placed = () => document.querySelectorAll('.piece.correct').length;

function newGame() {
  clearInterval(timerInterval);
  moves = 0; startTime = null;
  updateStats();

  const d = diff(), size = ps(), dim = d * size;
  const src = document.createElement('canvas');
  src.width = dim; src.height = dim;

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    src.getContext('2d').drawImage(img, 0, 0, dim, dim);
    document.getElementById('preview-img').src = IMAGE;
    buildPuzzle(src, d, size, dim);
  };
  img.onerror = () => buildPuzzle(src, d, size, dim);
  img.src = IMAGE;
  if (img.complete) img.onload();
}

function buildPuzzle(src, d, size, dim) {
  document.getElementById('stat-total').textContent = d * d;

  const board = document.getElementById('board');
  board.innerHTML = '';
  board.style.cssText = `width:${dim}px;height:${dim}px;`;

  grid = Array.from({ length: d }, (_, r) =>
    Array.from({ length: d }, (_, c) => {
      const slot = document.createElement('div');
      slot.className = 'slot';
      slot.style.cssText = `left:${c * size}px;top:${r * size}px;width:${size}px;height:${size}px;`;
      slot.dataset.row = r; slot.dataset.col = c;
      board.appendChild(slot);
      slot.addEventListener('dragover', e => { e.preventDefault(); slot.classList.add('drag-over'); });
      slot.addEventListener('dragleave', () => slot.classList.remove('drag-over'));
      slot.addEventListener('drop', e => {
        e.preventDefault(); slot.classList.remove('drag-over');
        tryPlace(e.dataTransfer.getData('pieceId'), r, c);
      });
      return { slot, filled: false };
    })
  );

  const tray = document.getElementById('tray');
  tray.innerHTML = '';
  tray.style.gridTemplateColumns = `repeat(${d}, ${size}px)`;

  shuffle([...Array(d * d).keys()]).forEach(idx => {
    const pr = Math.floor(idx / d), pc = idx % d;
    const tile = document.createElement('canvas');
    tile.width = size; tile.height = size;
    tile.getContext('2d').drawImage(src, pc * size, pr * size, size, size, 0, 0, size, size);

    const piece = document.createElement('div');
    piece.className = 'piece';
    piece.id = 'piece-' + idx;
    piece.dataset.correctRow = pr;
    piece.dataset.correctCol = pc;
    piece.style.cssText = `width:${size}px;height:${size}px;position:relative;`;
    piece.draggable = true;

    const img = document.createElement('img');
    img.src = tile.toDataURL();
    img.width = size; img.height = size;
    piece.appendChild(img);

    piece.addEventListener('dragstart', e => {
      e.dataTransfer.setData('pieceId', piece.id);
      piece.classList.add('dragging');
      startTimer();
    });
    piece.addEventListener('dragend', () => piece.classList.remove('dragging'));
    addTouch(piece);
    tray.appendChild(piece);
  });

  tray.addEventListener('dragover', e => { e.preventDefault(); tray.classList.add('drag-over'); });
  tray.addEventListener('dragleave', () => tray.classList.remove('drag-over'));
  tray.addEventListener('drop', e => {
    e.preventDefault(); tray.classList.remove('drag-over');
    returnToTray(e.dataTransfer.getData('pieceId'));
  });
}

function tryPlace(pieceId, row, col) {
  const piece = document.getElementById(pieceId);
  if (!piece) return;
  const size = ps();

  if (piece.dataset.boardRow !== undefined) {
    const or = +piece.dataset.boardRow, oc = +piece.dataset.boardCol;
    grid[or][oc].filled = false;
    grid[or][oc].slot.classList.remove('filled');
  }

  piece.style.cssText = `position:absolute;left:${col * size}px;top:${row * size}px;width:${size}px;height:${size}px;`;
  piece.dataset.boardRow = row;
  piece.dataset.boardCol = col;
  document.getElementById('board').appendChild(piece);
  grid[row][col].filled = true;
  grid[row][col].slot.classList.add('filled');

  moves++;
  startTimer();

  const correct = +piece.dataset.correctRow === row && +piece.dataset.correctCol === col;
  piece.classList.toggle('correct', correct);
  if (correct) { toast('✓ Pareizi!'); checkWin(); }
  updateStats();
}

function returnToTray(pieceId) {
  const piece = document.getElementById(pieceId);
  if (!piece) return;
  if (piece.dataset.boardRow !== undefined) {
    const r = +piece.dataset.boardRow, c = +piece.dataset.boardCol;
    grid[r]?.[c] && (grid[r][c].filled = false, grid[r][c].slot.classList.remove('filled'));
    delete piece.dataset.boardRow; delete piece.dataset.boardCol;
    piece.classList.remove('correct');
  }
  piece.style.cssText = `width:${ps()}px;height:${ps()}px;position:relative;`;
  document.getElementById('tray').appendChild(piece);
  updateStats();
}

function addTouch(piece) {
  let clone;
  piece.addEventListener('touchstart', e => {
    const t = e.touches[0], size = ps();
    clone = piece.cloneNode(true);
    clone.style.cssText = `position:fixed;width:${size}px;height:${size}px;opacity:.85;pointer-events:none;z-index:999;left:${t.clientX - size / 2}px;top:${t.clientY - size / 2}px;`;
    document.body.appendChild(clone);
    startTimer();
  }, { passive: true });

  piece.addEventListener('touchmove', e => {
    e.preventDefault();
    const t = e.touches[0], size = ps();
    if (clone) { clone.style.left = (t.clientX - size / 2) + 'px'; clone.style.top = (t.clientY - size / 2) + 'px'; }
  }, { passive: false });

  piece.addEventListener('touchend', e => {
    clone?.remove(); clone = null;
    const el = document.elementFromPoint(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
    const slot = el?.closest('.slot');
    if (slot) tryPlace(piece.id, +slot.dataset.row, +slot.dataset.col);
    else if (el?.closest('#tray')) returnToTray(piece.id);
  });
}

function checkWin() {
  if (placed() < diff() * diff()) return;
  clearInterval(timerInterval);
  document.getElementById('win-time').textContent = formatTime(startTime ? Math.floor((Date.now() - startTime) / 1000) : 0);
  setTimeout(() => document.getElementById('win-overlay').classList.add('show'), 400);
}
function closeWin() { document.getElementById('win-overlay').classList.remove('show'); }

function startTimer() {
  if (startTime) return;
  startTime = Date.now();
  timerInterval = setInterval(() => {
    document.getElementById('stat-time').textContent = formatTime(Math.floor((Date.now() - startTime) / 1000));
  }, 1000);
}
function formatTime(s) { return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
function updateStats() { document.getElementById('stat-moves').textContent = moves; }

let toastTimer;
function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg; el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 1600);
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

newGame();
