// /04-core-code/state-manager.js

const VALIDATION_RULES = {
    width: { min: 250, max: 3300, name: 'Width' },
    height: { min: 300, max: 3300, name: 'Height' }
};

const TYPE_SEQUENCE = ['BO', 'BO1', 'SN'];

export class StateManager {
    // --- [修改開始] ---
    // 建構函式不再需要接收 priceCalculator 的實例，實現解耦
    constructor(initialState, eventAggregator) {
        this.state = initialState;
        this.eventAggregator = eventAggregator;
        // this.priceCalculator = priceCalculator; // [移除] 不再直接持有計算器的引用
        this.initialize();
    }

    initialize() {
        this.eventAggregator.subscribe('numericKeyPressed', (data) => this._handleNumericKeyPress(data.key));
        this.eventAggregator.subscribe('tableCellClicked', (data) => this._handleTableCellClick(data));
        this.eventAggregator.subscribe('tableHeaderClicked', (data) => this._handleTableHeaderClick(data));

        // [新增] 訂閱由 InputHandler 發布的價格計算請求
        this.eventAggregator.subscribe('userRequestedPriceCalculation', () => this._handlePriceCalculationRequest());
        
        // [新增] 訂閱由 PriceCalculator 發布的單筆價格計算結果
        this.eventAggregator.subscribe('priceCalculatedForRow', (data) => this._updatePriceForRow(data));
    }
    // --- [修改結束] ---

    getState() { return this.state; }

    // --- [核心邏輯不變的方法] ---
    _handleNumericKeyPress(key) { /* ... (此方法邏輯不變) ... */ 
        const isNumber = !isNaN(parseInt(key));
        if (isNumber) this.state.ui.inputValue += key;
        if (key === 'DEL') this.state.ui.inputValue = this.state.ui.inputValue.slice(0, -1);
        if (key === 'W' || key === 'H') {
            this._changeInputMode(key === 'W' ? 'width' : 'height');
        }
        if (key === 'ENT') { this._commitValue(); }
        this.eventAggregator.publish('stateChanged', this.state);
    }
    _handleTableCellClick({ rowIndex, column }) { /* ... (此方法邏輯不變) ... */
        const item = this.state.quoteData.rollerBlindItems[rowIndex];
        if (!item) return;

        if (column === 'width' || column === 'height') {
            this.state.ui.inputMode = column;
            this.state.ui.activeCell = { rowIndex, column };
            this.state.ui.isEditing = true;
            this.state.ui.inputValue = String(item[column] || '');
        }

        if (column === 'TYPE') {
            if (!item.width && !item.height) return;
            const currentType = item.fabricType;
            const currentIndex = TYPE_SEQUENCE.indexOf(currentType);
            const nextIndex = (currentIndex + 1) % TYPE_SEQUENCE.length;
            item.fabricType = TYPE_SEQUENCE[nextIndex];
        }

        this.eventAggregator.publish('stateChanged', this.state);
    }
    _commitValue() { /* ... (此方法邏輯不變) ... */
        const { inputValue, inputMode, activeCell, isEditing } = this.state.ui;
        const value = inputValue === '' ? null : parseInt(inputValue, 10);
        
        const rule = VALIDATION_RULES[inputMode];
        if (value !== null && (isNaN(value) || value < rule.min || value > rule.max)) {
            this.eventAggregator.publish('showNotification', { message: `${rule.name} must be between ${rule.min} and ${rule.max}.` });
            this.state.ui.inputValue = '';
            return;
        }

        const items = this.state.quoteData.rollerBlindItems;
        const targetItem = items[activeCell.rowIndex];
        if (targetItem) {
            targetItem[inputMode] = value;
        }
        
        if (this._validateTableState()) {
            if (isEditing) {
                this.state.ui.isEditing = false;
            } else if (activeCell.rowIndex === items.length - 1 && (targetItem.width || targetItem.height)) {
                items.push({ itemId: `item-${Date.now()}`, width: null, height: null, fabricType: null, linePrice: null });
            }
            
            this.state.ui.inputValue = '';
            this._changeInputMode(inputMode);
        }
    }
    _changeInputMode(mode) { /* ... (此方法邏輯不變) ... */
        this.state.ui.inputMode = mode;
        this.state.ui.isEditing = false;
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
    _validateTableState() { /* ... (此方法邏輯不變) ... */
        const items = this.state.quoteData.rollerBlindItems;
        for (let i = 0; i < items.length - 1; i++) {
            const item = items[i];
            if (!item.width && !item.height) {
                this.eventAggregator.publish('showNotification', {
                    message: `Row ${i + 1} is empty. Please fill in the dimensions or delete the row.`
                });
                this.state.ui.activeCell = { rowIndex: i, column: 'width' };
                this.state.ui.inputMode = 'width';
                return false;
            }
        }
        return true;
    }
    // --- [核心邏輯不變的方法結束] ---

    _handleTableHeaderClick({ column }) {
        if (column === 'TYPE') {
            const items = this.state.quoteData.rollerBlindItems;
            if (items.length === 0) return;
            
            const firstItemType = items[0].fabricType || TYPE_SEQUENCE[TYPE_SEQUENCE.length - 1];
            const currentIndex = TYPE_SEQUENCE.indexOf(firstItemType);
            const nextType = TYPE_SEQUENCE[(currentIndex + 1) % TYPE_SEQUENCE.length];

            items.forEach(item => {
                if (item.width || item.height) {
                    item.fabricType = nextType;
                }
            });
        }
        
        // --- [修改開始] ---
        // [移除] 不再直接處理 Price 表頭的點擊，因為 InputHandler 已發布專門事件
        /*
        if (column === 'Price') {
            this._calculateAllPrices();
        }
        */
        // --- [修改結束] ---

        this.eventAggregator.publish('stateChanged', this.state);
    }
    
    // --- [修改開始] ---
    // [移除] 移除舊的、緊密耦合的直接呼叫方法
    /*
    _calculateAllPrices() {
        const items = this.state.quoteData.rollerBlindItems;
        items.forEach(item => {
            const newPrice = this.priceCalculator.calculateRollerBlindPrice(item);
            if (newPrice !== null) {
                item.linePrice = newPrice;
            }
        });
        console.log("All prices recalculated.");
    }
    */
    // --- [修改結束] ---

    // --- [新增開始] ---
    /**
     * 處理「請求計算所有價格」事件。
     * 遍歷所有項目，並為每個數據完整的項目發布一個「計算單行價格」的事件。
     */
    _handlePriceCalculationRequest() {
        const items = this.state.quoteData.rollerBlindItems;
        
        items.forEach(item => {
            // 只有在寬、高、類型都已填寫的情況下，才發布計算任務
            if (item.width && item.height && item.fabricType) {
                this.eventAggregator.publish('calculatePriceForRow', { item });
            }
        });
        console.log("Price calculation requests published for all valid rows.");
    }

    /**
     * 處理「單行價格計算完成」事件。
     * 根據 itemId 找到對應的項目，並更新其價格。
     * @param {object} data - 包含 itemId 和 price 的事件數據
     */
    _updatePriceForRow({ itemId, price }) {
        if (!itemId || price === undefined) return;
        
        const itemToUpdate = this.state.quoteData.rollerBlindItems.find(item => item.itemId === itemId);

        if (itemToUpdate) {
            itemToUpdate.linePrice = price;
            // 最終，發布 stateChanged 事件，觸發 UI 重新渲染
            this.eventAggregator.publish('stateChanged', this.state);
        }
    }
    // --- [新增結束] ---
}
