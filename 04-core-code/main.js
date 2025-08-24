// /04-core-code/main.js

import { EventAggregator } from './event-aggregator.js';
import { StateManager } from './state-manager.js';
import { UIManager } from './ui-manager.js';
import { InputHandler } from './input-handler.js';

class App {
    constructor() {
        console.log("Application starting...");

        const initialState = {
            ui: {
                currentView: 'QUICK_QUOTE',
                inputValue: '', // 用於顯示在輸入框的當前數值
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
        // [重要修改] 讓 UIManager 訂閱 stateChanged 事件
        // 這樣一來，每當大腦(State)有任何變化，臉孔(UI)都會自動更新
        this.eventAggregator.subscribe('stateChanged', (state) => {
            this.uiManager.render(state);
        });

        // 初始渲染
        this.uiManager.render(this.stateManager.getState());
        
        // 初始化輸入監聽器
        this.inputHandler.initialize(); 

        console.log("Application running and interactive.");
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.run();
});
