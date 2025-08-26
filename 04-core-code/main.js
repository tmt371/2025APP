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
                inputValue: '',
                inputMode: 'width',
                isEditing: false, // 新增：是否處於編輯現有儲存格模式
                activeCell: { rowIndex: 0, column: 'width' } 
            },
            quoteData: {
                rollerBlindItems: [
                    // 初始待命的第一行
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
        this.eventAggregator.subscribe('stateChanged', (state) => {
            this.uiManager.render(state);
        });
        this.eventAggregator.subscribe('showNotification', (data) => {
            alert(data.message);
        });

        this.eventAggregator.publish('stateChanged', this.stateManager.getState());
        this.inputHandler.initialize(); 

        console.log("Application running and interactive.");
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.run();
});
