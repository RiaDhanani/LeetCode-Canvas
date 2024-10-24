function createToggleButton() {
    const button = document.createElement('button');
    button.id = 'toggle-Leetcode_canvas-btn';
    button.innerText = 'Open Canvas';
    button.style.position = 'absolute';

    button.addEventListener('click', () => {
        const canvasContainer = document.getElementById('Leetcode_canvas-canvas');
        const controlsContainer = document.getElementById('paint-controls');
        const scrollableContainer = document.getElementById('scrollable-canvas-container');

        if (scrollableContainer.style.display === 'none' || !scrollableContainer.style.display) {
            button.innerText = 'Close Canvas';
            scrollableContainer.style.display = 'block';
            canvasContainer.style.display = 'block';
            controlsContainer.style.display = 'flex';
            canvasContainer.scrollIntoView({ behavior: 'smooth' });
        } else {
            button.innerText = 'Open Canvas';
            scrollableContainer.style.display = 'none';
            canvasContainer.style.display = 'none';
            controlsContainer.style.display = 'none';
        }
    });

    document.body.appendChild(button);


    const updateButtonPosition = () => {
        const mainContent = document.querySelector('.description__24sA');
        if (mainContent) {
            const rect = mainContent.getBoundingClientRect();
            button.style.top = `${window.scrollY + rect.bottom + 20}px`;
        }
    };

    window.addEventListener('scroll', updateButtonPosition);
}

function addPaintCanvas() {
    console.log("Attempting to add paint canvas...");

    fetch(chrome.runtime.getURL('content.html'))
    .then(response => response.text())
    .then(data => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = data;

        const mainContent = document.querySelector('.description__24sA');
        if (mainContent) {
            mainContent.appendChild(tempDiv);
            console.log("Canvas and controls added to main content");
        } else {
            document.body.appendChild(tempDiv);
            console.log("Canvas and controls added to body as fallback");
        }

        const canvas = document.getElementById('Leetcode_canvas-canvas');
        const controls = document.getElementById('paint-controls');
        canvas.style.display = 'none';
        controls.style.display = 'none';

        createToggleButton();

        initializePaintCanvas(canvas);
    })
    .catch(error => {
        console.error("Error loading content.html:", error);
    });
}

function initializePaintCanvas(canvas) {
    const ctx = canvas.getContext('2d');
    let painting = false;
    let strokeHistory = [];
    let undoneHistory = [];
    let images = [];

    let currentColor = '#0BDA51';
    let currentBrushSize = 6;
    let toolType = 'paintbrush';

    const canvasBackgroundColor = '#1e1e1e';

    const colorPicker = document.getElementById('color-picker');
    const brushSizePicker = document.getElementById('brush-size');
    const typeSelect = document.getElementById('type-select');

    const undoBtn = document.getElementById('undo-btn');
    const redoBtn = document.getElementById('redo-btn');

    const clearBtn = document.getElementById('clear-btn');

    const removeImageBtn = document.getElementById('remove-image-btn');

    const getMousePos = (canvas, event) => {
        const rect = canvas.getBoundingClientRect();
        return {
            x: (event.clientX - rect.left) * (canvas.width / rect.width),
            y: (event.clientY - rect.top) * (canvas.height / rect.height)
        };
    };

    function redraw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        images.forEach(image => {
            ctx.drawImage(image.img, image.x, image.y);
        });

        strokeHistory.forEach(stroke => {
            if (stroke.length === 0) return;
            ctx.beginPath();
            ctx.strokeStyle = stroke[0].color;
            ctx.lineWidth = stroke[0].size;
            ctx.moveTo(stroke[0].x, stroke[0].y);

            stroke.forEach(point => {
                ctx.lineTo(point.x, point.y);
                ctx.stroke();
            });
        });
        ctx.beginPath();
    }

    function startPosition(e) {
        painting = true;
        undoneHistory = [];
        strokeHistory.push([]);
        ctx.beginPath();
        draw(e);
    }

    function endPosition() {
        painting = false;
        ctx.beginPath();
    }

    function draw(e) {
        if (!painting) return;

        const mousePos = getMousePos(canvas, e);

        ctx.lineCap = 'round';

        if (toolType === 'eraser') {
            ctx.strokeStyle = canvasBackgroundColor;
            ctx.lineWidth = parseInt(currentBrushSize) + 15;
        } else {
            ctx.strokeStyle = currentColor;
            ctx.lineWidth = currentBrushSize;
        }

        ctx.lineTo(mousePos.x, mousePos.y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(mousePos.x, mousePos.y);

        strokeHistory[strokeHistory.length - 1].push({
            x: mousePos.x,
            y: mousePos.y,
            color: currentColor,
            size: currentBrushSize
        });
    }

    function undo() {
        if (strokeHistory.length > 0) {
            undoneHistory.push(strokeHistory.pop());
            redraw();
        }
        ctx.beginPath();
    }

    function redo() {
        if (undoneHistory.length > 0) {
            strokeHistory.push(undoneHistory.pop());
            redraw();
        }
        ctx.beginPath();
    }


    function clearCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        strokeHistory = [];
        redraw();
    }

    function removeImage() {
        images = [];
        redraw();
        updateRemoveImageButtonVisibility();
    }

    function updateRemoveImageButtonVisibility() {
        const removeImageBtn = document.getElementById('remove-image-btn');
        if (images.length > 0) {
            removeImageBtn.style.display = 'inline-block';
        } else {
            removeImageBtn.style.display = 'none';
        }
    }

    colorPicker.addEventListener('change', (e) => {
        currentColor = e.target.value;
    });

    brushSizePicker.addEventListener('change', (e) => {
        currentBrushSize = e.target.value;
    });

    typeSelect.addEventListener('change', (e) => {
        toolType = e.target.value;
    });

    undoBtn.addEventListener('click', undo);

    redoBtn.addEventListener('click', redo);

    clearBtn.addEventListener('click', clearCanvas);

    removeImageBtn.addEventListener('click', removeImage)

    canvas.addEventListener('dragover', (e) => {
        e.preventDefault();
    });

    canvas.addEventListener('drop', (e) => {
        e.preventDefault();
        const files = e.dataTransfer.files;

        if (files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                const img = new Image();
                img.onload = function() {
                    const scrollableContainer = document.getElementById('scrollable-canvas-container');
                    const scrollLeft = scrollableContainer.scrollLeft;
                    const scrollTop = scrollableContainer.scrollTop;

                    const visibleWidth = scrollableContainer.clientWidth;
                    const visibleHeight = scrollableContainer.clientHeight;

                    const x = scrollLeft + (visibleWidth - img.width) / 2;
                    const y = scrollTop + (visibleHeight - img.height) / 2;

                    images.push({ img, x, y });
                    redraw();
                    updateRemoveImageButtonVisibility();
                };
                img.src = URL.createObjectURL(file);
            }
        }
    });

    updateRemoveImageButtonVisibility();

    canvas.addEventListener('mousedown', startPosition);
    canvas.addEventListener('mouseup', endPosition);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseout', endPosition);
}

function forcePageReload(targetUrl) {
    if (targetUrl) {
        window.history.replaceState(null, null, targetUrl);
    }
    window.location.reload();
}

window.addEventListener('load', () => {
    console.log("Page loaded. Running content script...");

    addPaintCanvas();

    document.addEventListener('click', (event) => {
        const target = event.target.closest('a');
        if (target) {
            event.preventDefault();
            forcePageReload(target.href);
        }
    });

    window.addEventListener('popstate', () => {
        const isOnProblemPage = window.location.href.includes('/problems/');

        if (!isOnProblemPage) {
            forcePageReload(window.location.href);
        } else {
            const problemListUrl = '/list/problems';
            forcePageReload(problemListUrl);
        }
    });
});