const INTERVAL = 1000/30;

const canvas = document.getElementById('canvas');
const buffer = canvas.getContext('2d');
const width = canvas.width;

let matrix = new Int32Array(Math.ceil(width*width/31));
let newMatrix = new Int32Array(Math.ceil(width*width/31));
let changed = false;

const dot = (x, y, color, c = buffer) => {
  c.fillStyle = color;
  c.fillRect(x, y, 1, 1);
}

const getValueAt = (x, y, m = matrix) => {
  const index = x*width + y;
  const arrayIndex = Math.floor(index/31);
  const bitIndex = index%31;
  const value = m[arrayIndex] & (1 << bitIndex);
  return value > 0;
}

const setValueAt = (x, y, value, m) => {
  const index = x*width + y;
  const arrayIndex = Math.floor(index/31);
  const bitIndex = index%31;

  if (value) {
    m[arrayIndex] |= (1 << bitIndex);
  } else {
    m[arrayIndex] &= ~(1 << bitIndex);
  }
}

const startCalculation = () => {
  newMatrix.fill(0);

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < width; y++) {
      const isSet = getValueAt(x, y, matrix);
      let neighbors = checkNeighbors(x, y);

      if (!isSet) {
        if (neighbors === 3) {
          setValueAt(x, y, true, newMatrix);
        }
      } else {
        if (neighbors < 2 || neighbors > 3) {
          setValueAt(x, y, false, newMatrix);
        } else {
          setValueAt(x, y, true, newMatrix);
        }
      }
    }
  }

  matrix.set(newMatrix);
  changed = true;

  setTimeout(() => {
    startCalculation();
  }, INTERVAL);
}

const checkNeighbors = (x, y) => {
  const neighbors = [
    [x - 1, y - 1],
    [x - 1, y],
    [x - 1, y + 1],
    [x, y - 1],
    [x, y + 1],
    [x + 1, y - 1],
    [x + 1, y],
    [x + 1, y + 1],
  ];

  return neighbors.reduce((acc, neighbor) => {
    const [nx, ny] = neighbor;
    if (nx < 0 || nx >= width || ny < 0 || ny >= width) return acc;
    const isSet = getValueAt(nx, ny);
    if (isSet) {
      return acc + 1;
    }
    return acc;
  }, 0);
}

const render = () => {
  if (!changed) {
    requestAnimationFrame(render);
    return; 
  }

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < width; y++) {
      const isSet = getValueAt(x, y, matrix);
      dot(x, y, isSet ? 'white' : 'black');
    }
  }

  changed = false;

  requestAnimationFrame(render);
} 

const init = () => {
  for (let i = 0; i < width*width/7; i++) {
    const x = Math.floor(Math.random() * width);
    const y = Math.floor(Math.random() * width);
    setValueAt(x, y, 1, matrix);
  }
  changed = true;
}

init();
setTimeout(() => startCalculation(), INTERVAL);
render();
