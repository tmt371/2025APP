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
        this._setupNumericKeyboardPanel();
        this._setupFunctionPanel();
        console.log("InputHandler initialized and listeners are active.");
    }

    // 設定數字鍵盤面板的收合/展開功能
    _setupNumericKeyboardPanel() {
        const toggleButton = document.getElementById('panel-toggle');
        const keyboardPanel = document.getElementById('numeric-keyboard-panel');
        
        if (toggleButton && keyboardPanel) {
            toggleButton.addEventListener('click', () => {
                keyboardPanel.classList.toggle('is-collapsed');
            });
        }
    }

    // 設定功能鍵盤面板的顯示/隱藏功能
    _setupFunctionPanel() {
        // 我們需要在數字鍵盤上找到那個觸發按鈕
        const numericKeyboard = document.getElementById('numeric-keyboard');
        const functionPanel = document.getElementById('function-panel');

        if (numericKeyboard && functionPanel) {
            numericKeyboard.addEventListener('click', (event) => {
                const button = event.target.closest('button');
                if (!button) return;

                const key = button.dataset.key;

                // 如果點擊的是功能鍵盤開關
                if (key === 'TOGGLE_FUNCTIONS') {
                    functionPanel.classList.toggle('is-visible');
                    return; // 結束，不發布按鍵事件
                }
                
                // 如果是其他按鍵，則發布通用按鍵事件
                if (key) {
                    console.log(`Key pressed: ${key}`);
                    this.eventAggregator.publish('numericKeyPressed', { key });
                }
            });
        }
    }
}
