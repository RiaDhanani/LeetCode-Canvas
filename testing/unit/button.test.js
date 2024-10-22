const { JSDOM } = require('jsdom');

const html = `
<div class="description__24sA"></div>
`;

describe('Leetcode_canvas Toggle Button', () => {
    let window, document, toggleButton, canvasContainer, controlsContainer, scrollableContainer;

    beforeAll(() => {
        const dom = new JSDOM(html, { runScripts: 'dangerously', resources: 'usable' });
        window = dom.window;
        document = window.document;

        scrollableContainer = document.createElement('div');
        scrollableContainer.id = 'scrollable-canvas-container';
        scrollableContainer.style.display = 'none';
        document.body.appendChild(scrollableContainer);

        canvasContainer = document.createElement('canvas');
        canvasContainer.id = 'Leetcode_canvas-canvas';
        canvasContainer.style.display = 'none';
        scrollableContainer.appendChild(canvasContainer);

        controlsContainer = document.createElement('div');
        controlsContainer.id = 'paint-controls';
        controlsContainer.style.display = 'none'; 
        document.body.appendChild(controlsContainer);

        function contentScript() {
            function createToggleButton() {
                const button = document.createElement('button');
                button.id = 'toggle-Leetcode_canvas-btn';
                button.innerText = 'Open Leetcode_canvas';
                button.style.position = 'absolute';

                button.addEventListener('click', () => {
                    const canvasContainer = document.getElementById('Leetcode_canvas-canvas');
                    const controlsContainer = document.getElementById('paint-controls');
                    const scrollableContainer = document.getElementById('scrollable-canvas-container');

                    if (scrollableContainer.style.display === 'none' || !scrollableContainer.style.display) {
                        button.innerText = 'Close Leetcode_canvas';
                        scrollableContainer.style.display = 'block';
                        canvasContainer.style.display = 'block';
                        controlsContainer.style.display = 'flex';
                        canvasContainer.scrollIntoView({ behavior: 'smooth' });
                    } else {
                        button.innerText = 'Open Leetcode_canvas';
                        scrollableContainer.style.display = 'none';
                        canvasContainer.style.display = 'none';
                        controlsContainer.style.display = 'none';
                    }
                });

                document.body.appendChild(button);
            }

            function addPaintCanvas() {
                const mainContent = document.querySelector('.description__24sA');
                if (mainContent) {
                    mainContent.appendChild(canvasContainer);
                } else {
                    document.body.appendChild(canvasContainer);
                }

                createToggleButton();
            }

            addPaintCanvas();
        }

        contentScript();
    });

    it('should create the toggle button with the correct initial text', () => {
        toggleButton = document.getElementById('toggle-Leetcode_canvas-btn');
        expect(toggleButton).toBeTruthy();
        expect(toggleButton.innerText).toBe('Open Leetcode_canvas'); 
    });

    it('should display the canvas and change button text to "Close Leetcode_canvas" when clicked', () => {
        toggleButton = document.getElementById('toggle-Leetcode_canvas-btn');
        
        toggleButton.click();

        expect(scrollableContainer.style.display).toBe('block'); 
        expect(canvasContainer.style.display).toBe('block'); 
        expect(controlsContainer.style.display).toBe('flex');
        expect(toggleButton.innerText).toBe('Close Leetcode_canvas');
    });

    it('should hide the canvas and change button text back to "Open Leetcode_canvas" when clicked again', () => {
        toggleButton = document.getElementById('toggle-Leetcode_canvas-btn');
        
        toggleButton.click();

        expect(scrollableContainer.style.display).toBe('none');
        expect(canvasContainer.style.display).toBe('none'); 
        expect(controlsContainer.style.display).toBe('none'); 
        expect(toggleButton.innerText).toBe('Open Leetcode_canvas');
    });
});
