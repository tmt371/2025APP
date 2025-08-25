// /04-core-code/state-manager.js

export class StateManager {
    constructor(initialState, eventAggregator) {
        this.state = initialState;
        this.eventAggregator = eventAggregator;
        this.initialize();
    }

    // [新增] 初始化，訂閱所有需要處理的事件
    initialize() {
        this.eventAggregator.subscribe('numericKeyPressed', (data) => this._handleNumericKeyPress(data.key));
    }

    getState() {
        return this.state;
    }

    // [新增] 處理所有數字鍵盤按鍵的核心方法
    _handleNumericKeyPress(key) {
        const isNumber = !isNaN(parseInt(key));
        
        // 處理數字鍵 0-9
        if (isNumber) {
            this.state.ui.inputValue += key;
        }

        // 處理刪除鍵
        if (key === 'DEL') {
            this.state.ui.inputValue = this.state.ui.inputValue.slice(0, -1);
        }

        // 處理 W 和 H 鍵
        if (key === 'W') {
            this.state.ui.inputMode = 'width';
            this.state.ui.activeRowIndex = null; // 準備新增
            console.log('Mode changed to WIDTH');
        }
        if (key === 'H') {
            this.state.ui.inputMode = 'height';
            this.state.ui.activeRowIndex = 0; // 從第一行開始
            console.log('Mode changed to HEIGHT');
        }

        // 處理 Enter 鍵
        if (key === 'ENT') {
            const value = parseInt(this.state.ui.inputValue, 10);
            if (isNaN(value) || value <= 0) {
                console.error("Invalid input value.");
                return; // 如果輸入無效，則不執行任何操作
            }

            if (this.state.ui.inputMode === 'width') {
                // 新增一筆新的捲簾項目
                const newItem = {
                    itemId: `item-${Date.now()}`, // 生成一個唯一的 ID
                    width: value,
                    height: null,
                    fabricType: null,
                    linePrice: null
                };
                this.state.quoteData.rollerBlindItems.push(newItem);
            }
            
            // 清空輸入框，準備下一次輸入
            this.state.ui.inputValue = '';
        }
        
        // 所有操作完成後，發布 stateChanged 事件通知 UI 更新
        this.eventAggregator.publish('stateChanged', this.state);
    }
}
