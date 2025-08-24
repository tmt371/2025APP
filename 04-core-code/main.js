// /04-core-code/main.js

// 引入所有核心模組，注意路徑已全部更新為 kebab-case 小寫檔名
import { EventAggregator } from './event-aggregator.js';
import { StateManager } from './state-manager.js';
import { UIManager } from './ui-manager.js';
import { InputHandler } from './input-handler.js';

/**
 * App (應用程式主類別)
 * 這是我們整個應用程式的啟動器和總指揮。
 * 它的職責是：
 * 1. 建立並組合所有核心模組。
 * 2. 定義應用程式的初始狀態。
 * 3. 啟動應用程式的初始渲染和事件監聽。
 */
class App {
    constructor() {
        console.log("Application starting...");

        // 定義應用程式啟動時的初始數據狀態
        const initialState = {
            ui: {
                currentView: 'QUICK_QUOTE', // 初始視圖為「快速估價」
            },
            quoteData: {
                rollerBlindItems: [], // 初始捲簾列表為空
            }
        };

        // 按照依賴順序，實例化所有核心模組
        this.eventAggregator = new EventAggregator();
        this.stateManager = new StateManager(initialState, this.eventAggregator);
        this.uiManager = new UIManager(document.getElementById('app'), this.eventAggregator);
        this.inputHandler = new InputHandler(this.eventAggregator);
        // 未來會在這裡加入 ConfigManager, PriceCalculator 等
    }

    /**
     * 執行應用程式
     */
    run() {
        // 1. 根據初始狀態，渲染出第一個畫面
        this.uiManager.render(this.stateManager.getState());

        // 2. 初始化輸入監聽器，讓所有按鈕開始有作用
        this.inputHandler.initialize();

        console.log("Application running and interactive.");
    }
}

// 監聽事件：當整個 HTML 頁面載入完成後，才開始執行我們的應用程式
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.run();
});