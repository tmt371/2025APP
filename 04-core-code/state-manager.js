// /04-core-code/state-manager.js

// [新增] 定義驗證規則
const VALIDATION_RULES = {
    width: { min: 250, max: 3300, name: 'Width' },
    height: { min: 300, max: 3300, name: 'Height' }
};

export class StateManager {
    constructor(initialState, eventAggregator) {
        this.state = initialState;
        this.eventAggregator = eventAggregator;
        this.initialize();
    }

    initialize() {
        this.eventAggregator.subscribe('numericKeyPressed', (data) => this._handleNumericKeyPress(data.key));
    }

    getState() {
        return this.state;
    }

    _handleNumericKeyPress(key) {
        const isNumber = !isNaN(parseInt(key));
        
        if (isNumber) this.state.ui.inputValue += key;
        if (key === 'DEL') this.state.ui.inputValue = this.state.ui.inputValue.slice(0, -1);
        
        // [修改] W 和 H 鍵的邏輯
        if (key === 'W' || key === 'H') {
            const mode = key === 'W' ? 'width' : 'height';
            this.state.ui.inputMode = mode;
            this._findNextEmptyCell(mode);
        }

        // [修改] Enter 鍵的邏輯
        if (key === 'ENT') {
            this._commitValue();
        }
        
        this.eventAggregator.publish('stateChanged', this.state);
    }
    
    // [新增] 提交數值的核心邏輯
    _commitValue() {
        const { inputValue, inputMode, activeCell } = this.state.ui;
        const value = parseInt(inputValue, 10);

        // 1. 驗證輸入
        const rule = VALIDATION_RULES[inputMode];
        if (isNaN(value) || value < rule.min || value > rule.max) {
            this.eventAggregator.publish('showNotification', { 
                message: `${rule.name} must be between ${rule.min} and ${rule.max}.` 
            });
            this.state.ui.inputValue = ''; // 清空無效輸入
            return;
        }

        // 2. 更新數據
        const items = this.state.quoteData.rollerBlindItems;
        if (items[activeCell.rowIndex]) {
            items[activeCell.rowIndex][inputMode] = value;
        }

        // 3. [新增] 自動新增下一行
        // 如果我們剛填完的是最後一行，就自動新增一個待命的空行
        if (activeCell.rowIndex === items.length - 1) {
            items.push({ itemId: `item-${Date.now()}`, width: null, height: null, fabricType: null, linePrice: null });
        }
        
        // 4. 清空輸入框
        this.state.ui.inputValue = '';

        // 5. [新增] 找到下一個輸入目標
        this._findNextEmptyCell(inputMode);
    }

    // [新增] 尋找下一個空白儲存格並設定焦點
    _findNextEmptyCell(mode) {
        const items = this.state.quoteData.rollerBlindItems;
        for (let i = 0; i < items.length; i++) {
            if (items[i][mode] === null || items[i][mode] === '') {
                this.state.ui.activeCell = { rowIndex: i, column: mode };
                return;
            }
        }
        // 如果都滿了，預設焦點在最後一行的下一行
        this.state.ui.activeCell = { rowIndex: items.length - 1, column: mode };
    }
}
