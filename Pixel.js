(() => {
  let canvas = document.getElementById('Pixel-can');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'Pixel-can';
    const body = document.querySelector('body') || document.documentElement;
    body.appendChild(canvas);
  }
  const ctx = canvas.getContext('2d');

  canvas.style.border = '2px solid #000';
  canvas.style.display = 'block';
  canvas.style.marginTop = '12px';

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
  const sizeInput = document.createElement('select');
  sizeInput.innerHTML = `
    <option value="8">1px</option>
    <option value="16">2px</option>
    <option value="24">3px</option>
    <option value="32">4px</option>
    <option value="40">5px</option>
    <option value="48">6px</option>
    <option value="56">7px</option>
    <option value="64">8px</option>
  `;
  sizeInput.value = '8'; // Default to 1px (8 actual pixels)
  sizeInput.addEventListener('change', e => pixelSize = parseInt(e.target.value));
  sizeLabel.appendChild(sizeInput);

  controls.appendChild(colorLabel);
  controls.appendChild(sizeLabel);
  const body = document.querySelector('body') || document.documentElement;
  body.insertBefore(controls, canvas);

  // UI Toggle functionality
  const ui1 = document.getElementById('ui1');
  const ui2 = document.getElementById('ui2');
  const ui3 = document.getElementById('ui3');
  const toggleBtn = document.getElementById('ui-toggle');
  
  // Custom button text configuration - edit these values to change button text
  const buttonTexts = {
    showUI1: 'Tools <',      // Text when showing UI1 (Tools)
    showUI2: 'Settings >',   // Text when showing UI2 (Settings) 
    showUI3: 'Canvas >'      // Text when showing UI3 (Canvas options)
  };
  
  // Track current UI state
  let currentUI = 1;
  
  if (ui2) ui2.style.display = 'none'; // Hide ui2 initially
  if (ui3) ui3.style.display = 'none'; // Hide ui3 initially
  if (toggleBtn) toggleBtn.textContent = buttonTexts.showUI2; // Start with showing UI2 next
  
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      // Cycle through UI states: 1 -> 2 -> 3 -> 1
      currentUI = currentUI % 3 + 1;
      
      // Hide all UIs first
      if (ui1) ui1.style.display = 'none';
      if (ui2) ui2.style.display = 'none';
      if (ui3) ui3.style.display = 'none';
      
      // Show the current UI
      if (currentUI === 1 && ui1) {
        ui1.style.display = 'block';
        toggleBtn.textContent = buttonTexts.showUI2;
      } else if (currentUI === 2 && ui2) {
        ui2.style.display = 'block';
        toggleBtn.textContent = buttonTexts.showUI3;
      } else if (currentUI === 3 && ui3) {
        ui3.style.display = 'block';
        toggleBtn.textContent = buttonTexts.showUI1;
      }
    });
  }

  // Canvas size buttons in UI3
  if (ui3) {
    const sizeButtons = ui3.querySelectorAll('button[data-size]');
    sizeButtons.forEach(button => {
      button.addEventListener('click', () => {
        const newSize = parseInt(button.getAttribute('data-size'));
        if (newSize && newSize > 0 && newSize <= 512) { // Max 512x512 for performance
          gridSize = newSize;
          // Reinitialize cells array with new size
          cells = new Array(gridSize * gridSize).fill('#ffffff');
          // Resize canvas and render
          resizeCanvas();
          render();
          console.log(`Canvas size changed to ${gridSize}x${gridSize}`);
        }
      });
    });
  }

  // Sitewide settings loader
  function loadSiteSettings() {
    // Load theme from localStorage first
    const savedTheme = localStorage.getItem('pixelArtTheme');
    if (savedTheme) {
      applyTheme(savedTheme);
    }

    // Attempts to fetch `/site-settings.json` at the site root and apply any defaults found there.
    return fetch('/site-settings.json', { cache: 'no-cache' })
      .then(res => {
        if (!res.ok) throw new Error('no site settings');
        return res.json();
      })
      .then(s => {
        if (s.gridSize) gridSize = s.gridSize;
        if (s.pixelSize) pixelSize = s.pixelSize;
        if (s.color) { color = s.color; colorInput.value = color; }
        if (s.tool) tool = s.tool;
        if (s.theme) applyTheme(s.theme);
      })
      .catch(() => { /* no site settings found or parse error; ignore */ });
  }

  // Apply theme to the page
  function applyTheme(theme) {
    // Remove existing theme classes
    document.body.className = document.body.className.replace(/mode/g, '').trim();

    // Add theme class
    if (theme) {
      document.body.classList.add(theme);
    }
  }
  colorInput.addEventListener('input', (e) => { color = e.target.value; });
  sizeInput.addEventListener('change', (e) => { pixelSize = parseInt(e.target.value); });

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
  const clearBtn = document.getElementById('clear');

  if (pencilBtn) pencilBtn.addEventListener('click', () => { tool = 'pencil'; pencilBtn.disabled = true; eraserBtn && (eraserBtn.disabled = false); fillBtn && (fillBtn.disabled = false); });
  if (eraserBtn) eraserBtn.addEventListener('click', () => { tool = 'eraser'; eraserBtn.disabled = true; pencilBtn && (pencilBtn.disabled = false); fillBtn && (fillBtn.disabled = false); });
  if (fillBtn) fillBtn.addEventListener('click', () => { tool = 'fill'; fillBtn.disabled = true; pencilBtn && (pencilBtn.disabled = false); eraserBtn && (eraserBtn.disabled = false); });
  // tool selection (no local persistence)
  [pencilBtn, eraserBtn, fillBtn].forEach(b => { if (!b) return; });
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
    console.log('Saving pixel art:', payload);
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.download = 'pixel-art.pixel';
    link.href = URL.createObjectURL(blob);
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 5000);
    console.log('Save initiated');
  });
  if (loadBtn) loadBtn.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pixel,image/*';
    input.addEventListener('change', (ev) => {
      const file = ev.target.files && ev.target.files[0];
      if (!file) return;
      console.log('Loading file:', file.name, file.type);
      const isPixel = file.name && file.name.toLowerCase().endsWith('.pixel');
      console.log('Is pixel file:', isPixel);
      const reader = new FileReader();
      if (isPixel) {
        reader.onload = (re) => {
            try {
              console.log('Parsing pixel file...');
              const payload = JSON.parse(re.target.result);
              console.log('Payload:', payload);
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
              console.log('Pixel file loaded successfully');
              // sitewide/local persistence is not used; loaded pixels applied
            } catch (err) {
              console.error('Failed to parse .pixel file', err);
            }
        };
        reader.readAsText(file);
      } else {
        reader.onload = (re) => {
          const img = new Image();
          img.onload = () => {
            console.log('Loading image file...');
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
            console.log('Image file loaded successfully');
          };
          img.src = re.target.result;
        };
        reader.readAsDataURL(file);
      }
    });
    input.click();
  });
  if (quitBtn) quitBtn.addEventListener('click', () => { window.location.href = './index.html'; });
  if (clearBtn) clearBtn.addEventListener('click', () => {
    // Fun fast clear animation - optimized for any canvas size
    const totalCells = gridSize * gridSize;
    let flashCount = 0;
    const maxFlashes = Math.min(6, Math.max(3, Math.floor(gridSize / 8))); // Scale flashes with grid size
    const flashInterval = setInterval(() => {
      if (flashCount >= maxFlashes) {
        clearInterval(flashInterval);
        cells.fill('#ffffff');
        render();
        return;
      }
      
      // Fill with random colors - optimized for performance
      for (let i = 0; i < totalCells; i++) {
        // Use bitwise operations for faster random color generation
        const rand = (Math.random() * 0xFFFFFF) | 0;
        cells[i] = '#' + rand.toString(16).padStart(6, '0');
      }
      render();
      flashCount++;
    }, 25); // Very fast 25ms intervals
  });

  // Initialize: load sitewide settings (if present), then size and render
  loadSiteSettings().then(() => {
    resizeCanvas();
    render();
  });

  // Expose small API to console for debugging
  window.PixelApp = {
    setTool(t) { tool = t; },
    setColor(c) { color = c; colorInput.value = c; },
    clear() { cells.fill('#ffffff'); render(); },
    getData() { return cells.slice(); }
  };

  // helper: convert hex -> rgba
  function hexToRgb(hex) {
    if (!hex) return { r: 255, g: 255, b: 255, a: 255 };
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(h => h + h).join('');
    const num = parseInt(hex, 16);
    return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255, a: 255 };
  }

  function componentToHex(c) {
    const hex = c.toString(16);
    return hex.length == 1 ? '0' + hex : hex;
  }

  function rgbToHex(r, g, b) {
    return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
  }

})();
