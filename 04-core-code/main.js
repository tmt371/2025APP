// /04-core-code/main.js

import { EventAggregator } from './event-aggregator.js';
import { StateManager } from './state-manager.js';
import { UIManager } from './ui-manager.js';
import { InputHandler } from './input-handler.js';

class App {
    constructor() {
        console.log("Application starting...");
        
        // [修改] 更新初始狀態，加入 activeCell
        const initialState = {
            ui: {
                currentView: 'QUICK_QUOTE',
                inputValue: '',
                inputMode: 'width',
                activeCell: { rowIndex: 0, column: 'width' } // 初始焦點
            },
            quoteData: {
                rollerBlindItems: [
                    { itemId: `item-${Date.now()}`, width: null, height: null, fabricType: null, linePrice: null }
                ],
            }
        };

        this.eventAggregator = new EventAggregator();
        this.stateManager = new StateManager(initialState, this.eventAggregator);
        this.uiManager = new UIManager(document.getElementById('app'), this.eventAggregator);
        this.inputHandler = new InputHandler(this.eventAggregator); 
    }

    run() {
        // 監聽 stateChanged 事件，更新 UI
        this.eventAggregator.subscribe('stateChanged', (state) => {
            this.uiManager.render(state);
        });

        // [新增] 監聽 showNotification 事件，彈出警示
        this.eventAggregator.subscribe('showNotification', (data) => {
            alert(data.message);
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
