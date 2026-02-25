// Pixel Art Settings JavaScript

document.addEventListener('DOMContentLoaded', function() {
    const themeSelect = document.getElementById('theme-select');
    const previewCanvas = document.getElementById('preview-canvas');

    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('pixelArtTheme') || 'light-mode';
    themeSelect.value = savedTheme;
    applyTheme(savedTheme);
    updatePreviewCanvas(savedTheme);

    // Handle theme change preview and save
    themeSelect.addEventListener('change', function() {
        const selectedTheme = this.value;
        applyTheme(selectedTheme);
        updatePreviewCanvas(selectedTheme);
        // Auto-save when theme changes
        localStorage.setItem('pixelArtTheme', selectedTheme);
        console.log('Theme saved:', selectedTheme);
    });

    function applyTheme(theme) {
        // Remove all theme classes
        document.body.className = '';

        // Add the selected theme class
        document.body.classList.add(theme);
    }

    function updatePreviewCanvas(theme) {
        if (!previewCanvas) return;

        const ctx = previewCanvas.getContext('2d');
        const width = previewCanvas.width;
        const height = previewCanvas.height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Set colors based on theme
        let bgColor, pixelColor1, pixelColor2, pixelColor3;

        switch(theme) {
            case 'light-mode':
                bgColor = '#ffffff';
                pixelColor1 = '#007bff';
                pixelColor2 = '#28a745';
                pixelColor3 = '#dc3545';
                break;
            case 'dark-mode':
                bgColor = '#1a1a1a';
                pixelColor1 = '#66b3ff';
                pixelColor2 = '#66ff66';
                pixelColor3 = '#ff6666';
                break;
            case 'dark-blue-mode':
                bgColor = '#0f1419';
                pixelColor1 = '#4da6ff';
                pixelColor2 = '#4dff4d';
                pixelColor3 = '#ff4d4d';
                break;
            case 'purple-mode':
                bgColor = '#1a0d2b';
                pixelColor1 = '#c299ff';
                pixelColor2 = '#99ff99';
                pixelColor3 = '#ff9999';
                break;
            default:
                bgColor = '#ffffff';
                pixelColor1 = '#007bff';
                pixelColor2 = '#28a745';
                pixelColor3 = '#dc3545';
        }

        // Fill background
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, width, height);

        // Draw a simple pixel art pattern
        const pixelSize = 10;

        // Draw a smiley face pattern
        const pattern = [
            [0, 0, 1, 0, 0, 1, 0, 0],
            [0, 1, 0, 0, 0, 0, 1, 0],
            [1, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 1],
            [0, 1, 0, 0, 0, 0, 1, 0],
            [0, 0, 1, 1, 1, 1, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0]
        ];

        for (let y = 0; y < pattern.length; y++) {
            for (let x = 0; x < pattern[y].length; x++) {
                if (pattern[y][x] === 1) {
                    // Cycle through colors for visual interest
                    const colorIndex = (x + y) % 3;
                    switch(colorIndex) {
                        case 0: ctx.fillStyle = pixelColor1; break;
                        case 1: ctx.fillStyle = pixelColor2; break;
                        case 2: ctx.fillStyle = pixelColor3; break;
                    }
                    ctx.fillRect(x * pixelSize + 10, y * pixelSize + 10, pixelSize, pixelSize);
                }
            }
        }

        // Add a border
        ctx.strokeStyle = pixelColor1;
        ctx.lineWidth = 2;
        ctx.strokeRect(1, 1, width - 2, height - 2);
    }
});