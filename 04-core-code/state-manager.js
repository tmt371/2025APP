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
        this.eventAggregator.subscribe('userRequestedSummation', () => this._handleSummationRequest());

        // --- [新增] 訂閱 Insert 和 Delete 事件 ---
        this.eventAggregator.subscribe('userRequestedInsertRow', () => this._handleInsertRow());
        this.eventAggregator.subscribe('userRequestedDeleteRow', () => this._handleDeleteRow());
    }

    getState() { return this.state; }

    // ... [現有的 _handleNumericKeyPress, _handleTableCellClick, 等方法邏輯不變] ...
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
    _handleSummationRequest() {
        const items = this.state.quoteData.rollerBlindItems;
        for (const item of items) {
            if (!item.width && !item.height) continue; 
            if (!item.width || !item.height || !item.fabricType) {
                this.eventAggregator.publish('showNotification', {
                    message: `Cannot calculate sum. All rows must have Width, Height, and Type.`
                });
                if (this.state.quoteData.summary) {
                    this.state.quoteData.summary.totalSum = null;
                    this.eventAggregator.publish('stateChanged', this.state);
                }
                return;
            }
        }
        const total = items.reduce((sum, item) => {
            return sum + (item.linePrice || 0);
        }, 0);
        this.state.quoteData.summary = this.state.quoteData.summary || {};
        this.state.quoteData.summary.totalSum = total;
        this.eventAggregator.publish('stateChanged', this.state);
        console.log(`Sum calculated: ${total}`);
    }

    // --- [新增開始] ---
    /**
     * 處理插入新資料列的請求
     */
    _handleInsertRow() {
        const { activeCell } = this.state.ui;
        const items = this.state.quoteData.rollerBlindItems;
        const insertAtIndex = activeCell.rowIndex + 1; // 插入在當前行的下方

        const newItem = {
            itemId: `item-${Date.now()}`,
            width: null, height: null, fabricType: null, linePrice: null
        };

        items.splice(insertAtIndex, 0, newItem); // 使用 splice 插入新項目
        
        // 更新 activeCell 指向新插入的行
        this.state.ui.activeCell.rowIndex = insertAtIndex;

        this.eventAggregator.publish('stateChanged', this.state);
        console.log(`Row inserted at index ${insertAtIndex}.`);
    }

    /**
     * 處理刪除資料列的請求
     */
    _handleDeleteRow() {
        const { activeCell } = this.state.ui;
        const items = this.state.quoteData.rollerBlindItems;

        // 保護機制：如果只剩下一行，則不允許刪除
        if (items.length <= 1) {
            this.eventAggregator.publish('showNotification', { message: 'Cannot delete the last row.' });
            return;
        }

        items.splice(activeCell.rowIndex, 1); // 使用 splice 刪除項目

        // 更新 activeCell，避免指向不存在的索引
        if (activeCell.rowIndex >= items.length) {
            this.state.ui.activeCell.rowIndex = items.length - 1;
        }

        this.eventAggregator.publish('stateChanged', this.state);
        console.log(`Row deleted at index ${activeCell.rowIndex}.`);
    }
    // --- [新增結束] ---
}
