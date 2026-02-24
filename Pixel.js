(() => {
  const canvas = document.getElementById('Pixel-can');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Configuration
  let gridSize = 32; // number of cells per side
  let pixelSize = 16; // pixel (cell) size in CSS pixels
  let tool = 'pencil';
  let color = '#000000';

  // Create UI controls (color + size) and insert before the canvas
  const controls = document.createElement('div');
  controls.style.margin = '8px 0';

  const colorLabel = document.createElement('label');
  colorLabel.textContent = 'Color: ';
  const colorInput = document.createElement('input');
  colorInput.type = 'color';
  colorInput.value = color;
  colorInput.addEventListener('input', e => color = e.target.value);
  colorLabel.appendChild(colorInput);

  const sizeLabel = document.createElement('label');
  sizeLabel.textContent = ' Brush: ';
  const sizeInput = document.createElement('input');
  sizeInput.type = 'range';
  sizeInput.min = 1;
  sizeInput.max = 8;
  sizeInput.value = 1;
  sizeInput.addEventListener('input', e => pixelSize = Math.max(1, Math.round(e.target.value) * 8));
  sizeLabel.appendChild(sizeInput);

  controls.appendChild(colorLabel);
  controls.appendChild(sizeLabel);
  const body = document.querySelector('body') || document.documentElement;
  body.insertBefore(controls, canvas);

  // Initialize canvas size & state
  function resizeCanvas() {
    canvas.width = gridSize * pixelSize;
    canvas.height = gridSize * pixelSize;
    canvas.style.width = (canvas.width / (window.devicePixelRatio || 1)) + 'px';
    canvas.style.height = (canvas.height / (window.devicePixelRatio || 1)) + 'px';
    canvas.style.imageRendering = 'pixelated';
  }

  let cells = new Array(gridSize * gridSize).fill('#ffffff');

  function render() {
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const c = cells[y * gridSize + x];
        ctx.fillStyle = c;
        ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
      }
    }
  }

  function setCell(x, y, val) {
    if (x < 0 || y < 0 || x >= gridSize || y >= gridSize) return;
    cells[y * gridSize + x] = val;
    ctx.fillStyle = val;
    ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
  }

  function getCellFromEvent(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = (e.touches ? e.touches[0].clientX : e.clientX);
    const clientY = (e.touches ? e.touches[0].clientY : e.clientY);
    const x = Math.floor(((clientX - rect.left) / rect.width) * canvas.width / pixelSize);
    const y = Math.floor(((clientY - rect.top) / rect.height) * canvas.height / pixelSize);
    return { x, y };
  }

  // Simple flood fill
  function floodFill(sx, sy, targetColor, replacementColor) {
    if (targetColor === replacementColor) return;
    const stack = [[sx, sy]];
    while (stack.length) {
      const [x, y] = stack.pop();
      if (x < 0 || y < 0 || x >= gridSize || y >= gridSize) continue;
      const idx = y * gridSize + x;
      if (cells[idx] !== targetColor) continue;
      cells[idx] = replacementColor;
      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }
    render();
  }

  // Tool handlers
  let drawing = false;
  canvas.addEventListener('mousedown', (e) => {
    drawing = true;
    handleDraw(e);
  });
  window.addEventListener('mouseup', () => drawing = false);
  canvas.addEventListener('mousemove', (e) => { if (drawing) handleDraw(e); });
  canvas.addEventListener('touchstart', (e) => { drawing = true; handleDraw(e); e.preventDefault(); });
  canvas.addEventListener('touchmove', (e) => { if (drawing) handleDraw(e); e.preventDefault(); });
  window.addEventListener('touchend', () => drawing = false);

  function handleDraw(e) {
    const { x, y } = getCellFromEvent(e);
    if (tool === 'pencil') {
      setCell(x, y, color);
    } else if (tool === 'eraser') {
      setCell(x, y, '#ffffff');
    } else if (tool === 'fill') {
      const idx = y * gridSize + x;
      const target = cells[idx];
      floodFill(x, y, target, color);
    }
  }

  // Hook up buttons from HTML
  const pencilBtn = document.getElementById('pencil');
  const eraserBtn = document.getElementById('eraser');
  const fillBtn = document.getElementById('fill');
  const saveBtn = document.getElementById('save');
  const loadBtn = document.getElementById('load');
  const quitBtn = document.getElementById('quit');

  if (pencilBtn) pencilBtn.addEventListener('click', () => { tool = 'pencil'; pencilBtn.disabled = true; eraserBtn && (eraserBtn.disabled = false); fillBtn && (fillBtn.disabled = false); });
  if (eraserBtn) eraserBtn.addEventListener('click', () => { tool = 'eraser'; eraserBtn.disabled = true; pencilBtn && (pencilBtn.disabled = false); fillBtn && (fillBtn.disabled = false); });
  if (fillBtn) fillBtn.addEventListener('click', () => { tool = 'fill'; fillBtn.disabled = true; pencilBtn && (pencilBtn.disabled = false); eraserBtn && (eraserBtn.disabled = false); });
  if (saveBtn) saveBtn.addEventListener('click', () => {
    // Export grid as a .pixel JSON file containing gridSize, pixelSize and each pixel's RGB and position
    const payload = {
      gridSize,
      pixelSize,
      pixels: []
    };
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const hex = cells[y * gridSize + x] || '#ffffff';
        const rgba = hexToRgb(hex);
        payload.pixels.push({ x, y, r: rgba.r, g: rgba.g, b: rgba.b, a: rgba.a });
      }
    }
    const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
    const link = document.createElement('a');
    link.download = 'pixel-art.pixel';
    link.href = URL.createObjectURL(blob);
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 5000);
  });
  if (loadBtn) loadBtn.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,.pixel,application/json';
    input.addEventListener('change', (ev) => {
      const file = ev.target.files && ev.target.files[0];
      if (!file) return;
      const isPixel = file.name && file.name.toLowerCase().endsWith('.pixel');
      const reader = new FileReader();
      if (isPixel) {
        reader.onload = (re) => {
          try {
            const payload = JSON.parse(re.target.result);
            if (payload.gridSize) {
              gridSize = payload.gridSize;
            }
            if (payload.pixelSize) {
              pixelSize = payload.pixelSize;
            }
            // Re-init cells if size changed
            cells = new Array(gridSize * gridSize).fill('#ffffff');
            if (Array.isArray(payload.pixels)) {
              payload.pixels.forEach(p => {
                const hex = p.a === 0 ? '#ffffff' : rgbToHex(p.r, p.g, p.b);
                if (p.x >= 0 && p.y >= 0 && p.x < gridSize && p.y < gridSize) {
                  cells[p.y * gridSize + p.x] = hex;
                }
              });
            }
            resizeCanvas();
            render();
          } catch (err) {
            console.error('Failed to parse .pixel file', err);
          }
        };
        reader.readAsText(file);
      } else {
        reader.onload = (re) => {
          const img = new Image();
          img.onload = () => {
            // Draw the image scaled down to gridSize x gridSize so each pixel maps to a cell
            const tmp = document.createElement('canvas');
            tmp.width = gridSize;
            tmp.height = gridSize;
            const tctx = tmp.getContext('2d');
            tctx.drawImage(img, 0, 0, tmp.width, tmp.height);
            const imgd = tctx.getImageData(0, 0, tmp.width, tmp.height).data;
            for (let y = 0; y < gridSize; y++) {
              for (let x = 0; x < gridSize; x++) {
                const i = (y * gridSize + x) * 4;
                const r = imgd[i], g = imgd[i + 1], b = imgd[i + 2], a = imgd[i + 3];
                const hex = a === 0 ? '#ffffff' : rgbToHex(r, g, b);
                cells[y * gridSize + x] = hex;
              }
            }
            render();
          };
          img.src = re.target.result;
        };
        reader.readAsDataURL(file);
      }
    });
    input.click();
  });
  if (quitBtn) quitBtn.addEventListener('click', () => { window.location.href = './index.html'; });

  // Initialize
  resizeCanvas();
  render();

  // Expose small API to console for debugging
  window.PixelApp = {
    setTool(t) { tool = t; },
    setColor(c) { color = c; colorInput.value = c; },
    clear() { cells.fill('#ffffff'); render(); },
    getData() { return cells.slice(); }
  };

  function componentToHex(c) {
    const hex = c.toString(16);
    return hex.length == 1 ? '0' + hex : hex;
  }

  function rgbToHex(r, g, b) {
    return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
  }

})();
