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
        this.eventAggregator.subscribe('userRequestedPriceCalculation', () => this._handlePriceCalculationRequest());
        this.eventAggregator.subscribe('priceCalculatedForRow', (data) => this._updatePriceForRow(data));

        // --- [新增] 訂閱由 InputHandler 發布的加總請求事件 ---
        this.eventAggregator.subscribe('userRequestedSummation', () => this._handleSummationRequest());
    }

    getState() { return this.state; }

    // ... [現有的 _handleNumericKeyPress, _handleTableCellClick, _commitValue 等方法邏輯不變] ...
    _handleNumericKeyPress(key) { 
        const isNumber = !isNaN(parseInt(key));
        if (isNumber) this.state.ui.inputValue += key;
        if (key === 'DEL') this.state.ui.inputValue = this.state.ui.inputValue.slice(0, -1);
        if (key === 'W' || key === 'H') {
            this._changeInputMode(key === 'W' ? 'width' : 'height');
        }
        if (key === 'ENT') { this._commitValue(); }
        this.eventAggregator.publish('stateChanged', this.state);
    }
    _handleTableCellClick({ rowIndex, column }) {
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
        this.eventAggregator.publish('stateChanged', this.state);
    }
    _commitValue() {
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
    _changeInputMode(mode) {
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
    _validateTableState() {
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
    _handlePriceCalculationRequest() {
        const items = this.state.quoteData.rollerBlindItems;
        items.forEach(item => {
            if (item.width && item.height && item.fabricType) {
                this.eventAggregator.publish('calculatePriceForRow', { item });
            }
        });
        console.log("Price calculation requests published for all valid rows.");
    }
    _updatePriceForRow({ itemId, price }) {
        if (!itemId || price === undefined) return;
        const itemToUpdate = this.state.quoteData.rollerBlindItems.find(item => item.itemId === itemId);
        if (itemToUpdate) {
            itemToUpdate.linePrice = price;
            this.eventAggregator.publish('stateChanged', this.state);
        }
    }

    // --- [新增開始] ---
    /**
     * 處理加總請求：驗證所有資料列，若通過則計算總價並更新狀態。
     */
    _handleSummationRequest() {
        const items = this.state.quoteData.rollerBlindItems;

        // 1. 驗證 (除錯)：檢查每一筆數據是否完整
        for (const item of items) {
            // 跳過最後一個用於新增的空白行
            if (!item.width && !item.height) continue; 

            if (!item.width || !item.height || !item.fabricType) {
                this.eventAggregator.publish('showNotification', {
                    message: `Cannot calculate sum. All rows must have Width, Height, and Type.`
                });
                // 清除可能存在的舊總價
                if (this.state.quoteData.summary) {
                    this.state.quoteData.summary.totalSum = null;
                    this.eventAggregator.publish('stateChanged', this.state);
                }
                return; // 停止運算
            }
        }

        // 2. 計算：如果所有數據都通過驗證
        const total = items.reduce((sum, item) => {
            // 只加總有價格的項目
            return sum + (item.linePrice || 0);
        }, 0);

        // 3. 更新狀態：確保 summary 物件存在，並寫入總價
        this.state.quoteData.summary = this.state.quoteData.summary || {};
        this.state.quoteData.summary.totalSum = total;
        
        // 4. 發布狀態變更，通知 UI 刷新
        this.eventAggregator.publish('stateChanged', this.state);
        console.log(`Sum calculated: ${total}`);
    }
    // --- [新增結束] ---
}
