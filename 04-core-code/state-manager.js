// /04-core-code/state-manager.js

const VALIDATION_RULES = {
    width: { min: 250, max: 3300, name: 'Width' },
    height: { min: 300, max: 3300, name: 'Height' }
};

const TYPE_SEQUENCE = ['BO', 'BO1', 'SN'];

export class StateManager {
    constructor(initialState, eventAggregator) {
        this.state = initialState;
        this.eventAggregator = eventAggregator;
        this.initialize();
    }

    initialize() {
        this.eventAggregator.subscribe('numericKeyPressed', (data) => this._handleNumericKeyPress(data.key));
        this.eventAggregator.subscribe('tableCellClicked', (data) => this._handleTableCellClick(data));
        this.eventAggregator.subscribe('tableHeaderClicked', (data) => this._handleTableHeaderClick(data));
    }

    getState() { return this.state; }

    _handleNumericKeyPress(key) {
        // ... 此部分邏輯與上一版幾乎相同 ...
        const isNumber = !isNaN(parseInt(key));
        if (isNumber) this.state.ui.inputValue += key;
        if (key === 'DEL') this.state.ui.inputValue = this.state.ui.inputValue.slice(0, -1);
        if (key === 'W' || key === 'H') {
            this._changeInputMode(key === 'W' ? 'width' : 'height');
        }
        if (key === 'ENT') { this._commitValue(); }
        this.eventAggregator.publish('stateChanged', this.state);
    }

    // [新增] 處理表格儲存格點擊
    _handleTableCellClick({ rowIndex, column }) {
        const item = this.state.quoteData.rollerBlindItems[rowIndex];
        if (!item) return;

        // 處理 W 和 H 點擊
        if (column === 'width' || column === 'height') {
            this.state.ui.inputMode = column;
            this.state.ui.activeCell = { rowIndex, column };
            this.state.ui.isEditing = true; // 進入編輯模式
            this.state.ui.inputValue = item[column] || ''; // 將現有值載入輸入框
        }

        // 處理 TYPE 點擊
        if (column === 'TYPE') {
            if (!item.width && !item.height) return; // 寬高皆為空，不執行
            const currentType = item.fabricType;
            const currentIndex = TYPE_SEQUENCE.indexOf(currentType);
            const nextIndex = (currentIndex + 1) % TYPE_SEQUENCE.length;
            item.fabricType = TYPE_SEQUENCE[nextIndex];
        }

        this.eventAggregator.publish('stateChanged', this.state);
    }

    // [新增] 處理表頭點擊
    _handleTableHeaderClick({ column }) {
        if (column === 'TYPE') {
            const items = this.state.quoteData.rollerBlindItems;
            if (items.length === 0) return;
            
            // 決定下一個批次設定的類型
            const firstItemType = items[0].fabricType;
            const currentIndex = TYPE_SEQUENCE.indexOf(firstItemType);
            const nextType = TYPE_SEQUENCE[(currentIndex + 1) % TYPE_SEQUENCE.length];

            // 批次更新所有項目
            items.forEach(item => {
                if (item.width || item.height) { // 只更新有尺寸的行
                    item.fabricType = nextType;
                }
            });
            this.eventAggregator.publish('stateChanged', this.state);
        }
    }
    
    // [修改] 提交數值的核心邏輯
    _commitValue() {
        const { inputValue, inputMode, activeCell, isEditing } = this.state.ui;
        const value = parseInt(inputValue, 10);
        
        const rule = VALIDATION_RULES[inputMode];
        if (inputValue && (isNaN(value) || value < rule.min || value > rule.max)) {
            this.eventAggregator.publish('showNotification', { message: `${rule.name} must be between ${rule.min} and ${rule.max}.` });
            this.state.ui.inputValue = '';
            return;
        }

        const items = this.state.quoteData.rollerBlindItems;
        const targetItem = items[activeCell.rowIndex];
        if (targetItem) {
            targetItem[inputMode] = value || null; // 如果為空則存儲null
        }

        if (isEditing) {
            this.state.ui.isEditing = false; // 退出編輯模式
        } else if (activeCell.rowIndex === items.length - 1 && (targetItem.width || targetItem.height)) {
            // 如果是在最後一行輸入，且該行已有數據，則自動新增
            items.push({ itemId: `item-${Date.now()}`, width: null, height: null, fabricType: null, linePrice: null });
        }
        
        this.state.ui.inputValue = '';
        this._changeInputMode(inputMode); // 重新尋找下一個目標
    }

    // [修改] 改變輸入模式並尋找焦點
    _changeInputMode(mode) {
        this.state.ui.inputMode = mode;
        this.state.ui.isEditing = false; // 切換模式時，總是退出編輯模式
        const items = this.state.quoteData.rollerBlindItems;
        let found = false;
        for (let i = 0; i < items.length; i++) {
            if (items[i][mode] === null || items[i][mode] === '') {
                this.state.ui.activeCell = { rowIndex: i, column: mode };
                found = true;
                break;
            }
        }
        if (!found) {
            this.state.ui.activeCell = { rowIndex: items.length - 1, column: mode };
        }
    }
}
