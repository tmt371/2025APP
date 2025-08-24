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
        this._setupKeyboard();
        this._setupKeyboardSwitcher(); // [新增] 初始化鍵盤切換器
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

    // [修改] 將此方法改名為 _setupKeyboard 以涵蓋所有鍵盤
    _setupKeyboard() {
        const flipper = document.getElementById('keyboard-flipper');
        if (flipper) {
            flipper.addEventListener('click', (event) => {
                const button = event.target.closest('button');
                if (!button) return;

                const key = button.dataset.key;
                if (key) {
                    console.log(`Key pressed: ${key}`);
                    this.eventAggregator.publish('virtualKeyPressed', { key });
                }
            });
        }
    }
    
    // [新增] 設定左右滑動切換鍵盤的功能
    _setupKeyboardSwitcher() {
        const switcherButton = document.getElementById('keyboard-switcher');
        const flipper = document.getElementById('keyboard-flipper');

        if (switcherButton && flipper) {
            switcherButton.addEventListener('click', () => {
                flipper.classList.toggle('show-functions');
            });
        }
    }
}
