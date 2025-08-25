// /04-core-code/input-handler.js

export class InputHandler {
    constructor(eventAggregator) {
        this.eventAggregator = eventAggregator;
    }

    initialize() {
        this._setupNumericKeyboardPanelToggle();
        this._setupNumericKeyboard();
        this._setupFunctionPanelToggle(); // [修改] 改為監聽新的功能面板開關
        console.log("InputHandler initialized and listeners are active.");
    }

    _setupNumericKeyboardPanelToggle() {
        const toggleButton = document.getElementById('panel-toggle');
        const keyboardPanel = document.getElementById('numeric-keyboard-panel');
        
        if (toggleButton && keyboardPanel) {
            toggleButton.addEventListener('click', () => {
                keyboardPanel.classList.toggle('is-collapsed');
            });
        }
    }

    // [修改] 此方法現在只監聽數字鍵盤
    _setupNumericKeyboard() {
        const numericKeyboard = document.getElementById('numeric-keyboard');
        if (numericKeyboard) {
            numericKeyboard.addEventListener('click', (event) => {
                const button = event.target.closest('button');
                if (!button) return;

                const key = button.dataset.key;
                if (key) {
                    console.log(`Numeric Key pressed: ${key}`);
                    this.eventAggregator.publish('numericKeyPressed', { key });
                }
            });
        }
    }

    // [修改] 設定獨立的功能面板開關
    _setupFunctionPanelToggle() {
        const toggleButton = document.getElementById('function-panel-toggle');
        const functionPanel = document.getElementById('function-panel');

        if (toggleButton && functionPanel) {
            toggleButton.addEventListener('click', () => {
                functionPanel.classList.toggle('is-visible');
            });
        }
        
        // 未來我們也會在這裡監聽功能鍵盤內部的按鍵點擊
    }
}
