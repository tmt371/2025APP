// /04-core-code/input-handler.js

/**
 * InputHandler (神經系統 / 事件翻譯官)
 * 負責監聽所有使用者的操作，並發布對應的事件。
 */
export class InputHandler {
    constructor(eventAggregator) {
        this.eventAggregator = eventAggregator;
    }

    /**
     * 初始化所有事件監聽器
     */
    initialize() {
        this._setupPanelToggle();
        this._setupVirtualKeyboard();
        console.log("InputHandler initialized and listeners are active.");
    }

    _setupPanelToggle() {
        const toggleButton = document.getElementById('panel-toggle');
        const keyboardPanel = document.getElementById('keyboard-panel');

        if (toggleButton && keyboardPanel) {
            toggleButton.addEventListener('click', () => {
                keyboardPanel.classList.toggle('is-collapsed');
            });
        }
    }

    _setupVirtualKeyboard() {
        const keyboard = document.getElementById('virtual-keyboard');
        if (keyboard) {
            keyboard.addEventListener('click', (event) => {
                // 確保我們點擊的是一個按鈕
                const button = event.target.closest('button');
                if (!button) return;

                const key = button.dataset.key;
                if (key) {
                    console.log(`Key pressed: ${key}`);
                    // 發布一個統一的按鍵事件，供其他模組監聽
                    this.eventAggregator.publish('virtualKeyPressed', { key });
                }
            });
        }
    }
}
