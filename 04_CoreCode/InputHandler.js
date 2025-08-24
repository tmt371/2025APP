// /04_CoreCode/InputHandler.js

/**
 * InputHandler (神經系統 / 事件翻譯官)
 * 負責監聽並翻譯使用者輸入，將其轉換為具語義的「意圖事件」。
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
        // 未來我們會在這裡加入虛擬鍵盤的監聽邏輯
        console.log("InputHandler initialized.");
    }

    /**
     * 設定鍵盤面板的收合/展開功能
     */
    _setupPanelToggle() {
        const toggleButton = document.getElementById('panel-toggle');
        const keyboardPanel = document.getElementById('keyboard-panel');

        if (toggleButton && keyboardPanel) {
            toggleButton.addEventListener('click', () => {
                // 當按鈕被點擊時，為鍵盤面板加上或移除 'is-collapsed' 這個 CSS class
                keyboardPanel.classList.toggle('is-collapsed');
            });
        }
    }
}