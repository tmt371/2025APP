// /04_CoreCode/main.js

import { EventAggregator } from './EventAggregator.js';
import { StateManager } from './StateManager.js';
import { UIManager } from './UIManager.js';
import { InputHandler } from './InputHandler.js'; // [新增] 引入 InputHandler

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
        this.inputHandler = new InputHandler(this.eventAggregator); // [新增] 實例化 InputHandler
    }

    run() {
        // 1. 先渲染出初始畫面
        this.uiManager.render(this.stateManager.getState());

        // 2. [新增] 初始化輸入監聽器，讓按鈕開始有作用
        this.inputHandler.initialize();

        console.log("Application running and interactive.");
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.run();
});