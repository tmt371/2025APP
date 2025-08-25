// /04-core-code/main.js

import { EventAggregator } from './event-aggregator.js';
import { StateManager } from './state-manager.js';
import { UIManager } from './ui-manager.js';
import { InputHandler } from './input-handler.js';

class App {
    constructor() {
        console.log("Application starting...");

        // [修改] 更新初始狀態
        const initialState = {
            ui: {
                currentView: 'QUICK_QUOTE',
                inputValue: '',      // 用於顯示在輸入框的當前數值
                inputMode: 'width',  // 初始模式為輸入寬度
                activeRowIndex: null // 當前活動的行索引
            },
            quoteData: {
                rollerBlindItems: [],
            }
        };

        this.eventAggregator = new EventAggregator();
        this.stateManager = new StateManager(initialState, this.eventAggregator);
        this.uiManager = new UIManager(document.getElementById('app'), this.eventAggregator);
        this.inputHandler = new InputHandler(this.eventAggregator); 
    }

    run() {
        this.eventAggregator.subscribe('stateChanged', (state) => {
            this.uiManager.render(state);
        });

        // 觸發一次初始渲染
        this.eventAggregator.publish('stateChanged', this.stateManager.getState());
        
        this.inputHandler.initialize(); 

        console.log("Application running and interactive.");
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.run();
});
