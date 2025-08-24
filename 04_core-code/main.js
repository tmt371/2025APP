// /04-core-code/main.js

// [修改] 更新所有 import 路徑以符合新的 kebab-case 小寫檔名
import { EventAggregator } from './event-aggregator.js';
import { StateManager } from './state-manager.js';
import { UIManager } from './ui-manager.js';
import { InputHandler } from './input-handler.js';

// 應用程式的主類別
class App {
    constructor() {
        console.log("Application starting...");

        const initialState = {
            ui: {
                currentView: 'QUICK_QUOTE',
            },
            quoteData: {
                rollerBlindItems: [],
            }
        };

        // 實例化所有核心模組
        this.eventAggregator = new EventAggregator();
        this.stateManager = new StateManager(initialState, this.eventAggregator);
        this.uiManager = new UIManager(document.getElementById('app'), this.eventAggregator);
        this.inputHandler = new InputHandler(this.eventAggregator);
    }

    run() {
        // 1. 先渲染出初始畫面
        this.uiManager.render(this.stateManager.getState());

        // 2. 初始化輸入監聽器，讓按鈕開始有作用
        this.inputHandler.initialize();

        console.log("Application running and interactive.");
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.run();
});