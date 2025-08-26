// /04-core-code/main.js

import { EventAggregator } from './event-aggregator.js';
import { StateManager } from './state-manager.js';
import { UIManager } from './ui-manager.js';
import { InputHandler } from './input-handler.js';
import { ConfigManager } from './config-manager.js';
import { PriceCalculator } from './price-calculator.js';

class App {
    constructor() {
        const initialState = {
            ui: {
                currentView: 'QUICK_QUOTE',
                inputValue: '',
                inputMode: 'width',
                isEditing: false,
                activeCell: { rowIndex: 0, column: 'width' } 
            },
            quoteData: {
                rollerBlindItems: [
                    { itemId: `item-${Date.now()}`, width: null, height: null, fabricType: null, linePrice: null }
                ],
            }
        };

        // 實例化所有核心模組
        this.eventAggregator = new EventAggregator();
        this.configManager = new ConfigManager(this.eventAggregator);
        this.priceCalculator = new PriceCalculator(this.configManager, this.eventAggregator);
        
        // --- [修改開始] ---
        // StateManager 的建構函式不再需要 priceCalculator 實例，將其移除
        this.stateManager = new StateManager(initialState, this.eventAggregator); 
        // --- [修改結束] ---
        
        this.uiManager = new UIManager(document.getElementById('app'), this.eventAggregator);
        this.inputHandler = new InputHandler(this.eventAggregator); 
    }

    /**
     * run 方法現在是 async (非同步)，以確保我們先載入設定檔
     */
    async run() {
        console.log("Application starting...");
        
        // 在啟動任何互動功能之前，先等待價格表等設定檔載入完成
        await this.configManager.initialize();

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

// 啟動程式的事件監聽器現在也需要是 async
document.addEventListener('DOMContentLoaded', async () => {
    const app = new App();
    await app.run();
});
