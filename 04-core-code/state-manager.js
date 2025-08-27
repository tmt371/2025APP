// /04-core-code/state-manager.js

const VALIDATION_RULES = {
    width: { min: 250, max: 3300, name: 'Width' },
    height: { min: 300, max: 3300, name: 'Height' }
};

const TYPE_SEQUENCE = ['BO', 'BO1', 'SN'];
const LOCAL_STORAGE_KEY = 'rollerBlindQuoteData';

export class StateManager {
    constructor(initialState, eventAggregator) {
        this.state = initialState;
        // --- [新增] 確保 UI 狀態包含 selectedRowIndex ---
        this.state.ui.selectedRowIndex = null;
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
        this.eventAggregator.subscribe('userRequestedInsertRow', () => this._handleInsertRow());
        this.eventAggregator.subscribe('userRequestedDeleteRow', () => this._handleDeleteRow());
        this.eventAggregator.subscribe('userRequestedSave', () => this._handleSave());
        this.eventAggregator.subscribe('userRequestedLoad', () => this._handleLoad());

        // --- [新增] 訂閱項次點擊事件 ---
        this.eventAggregator.subscribe('sequenceCellClicked', (data) => this._handleSequenceCellClick(data));
    }

    getState() { return this.state; }

    // ... [部分現有方法邏輯不變] ...
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

        // --- [修改] 點擊其他儲存格時，清除項次選擇狀態 ---
        this.state.ui.selectedRowIndex = null;

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
    _handleSave() {
        try {
            const dataToSave = JSON.stringify(this.state.quoteData);
            localStorage.setItem(LOCAL_STORAGE_KEY, dataToSave);
            this.eventAggregator.publish('showNotification', { message: 'Quote saved successfully!' });
            console.log('Quote data saved to localStorage.');
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
            this.eventAggregator.publish('showNotification', { message: 'Error: Could not save quote.', type: 'error' });
        }
    }
    _handleLoad() {
        try {
            const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (savedData) {
                const loadedQuoteData = JSON.parse(savedData);
                this.state.quoteData = loadedQuoteData;
                this.eventAggregator.publish('stateChanged', this.state);
                this.eventAggregator.publish('showNotification', { message: 'Quote loaded successfully!' });
                console.log('Quote data loaded from localStorage.');
            } else {
                this.eventAggregator.publish('showNotification', { message: 'No saved quote found.' });
            }
        } catch (error) {
            console.error('Failed to load from localStorage:', error);
            this.eventAggregator.publish('showNotification', { message: 'Error: Could not load quote data.', type: 'error' });
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

    /**
     * @fileoverview [修改] 需求四：實現價格自動清空
     */
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
            // --- [新增] 如果寬或高被清空，則價格也清空 ---
            if ((inputMode === 'width' || inputMode === 'height') && value === null) {
                targetItem.linePrice = null;
            }
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
        // 清除項次選擇狀態，因為現在焦點在 W/H 輸入上
        this.state.ui.selectedRowIndex = null;
        
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

    // --- [新增/重構開始] ---

    /**
     * 處理項次點擊事件，更新選定行
     */
    _handleSequenceCellClick({ rowIndex }) {
        // 切換選中狀態：如果點擊的是已選中的行，則取消選中，否則選中新行
        if (this.state.ui.selectedRowIndex === rowIndex) {
            this.state.ui.selectedRowIndex = null;
        } else {
            this.state.ui.selectedRowIndex = rowIndex;
        }
        this.eventAggregator.publish('stateChanged', this.state);
    }
    
    /**
     * 輔助方法：操作結束後，找到第一個寬度為空的儲存格並將焦點移過去
     */
    _focusOnNextEmptyWidthCell() {
        const items = this.state.quoteData.rollerBlindItems;
        const nextEmptyIndex = items.findIndex(item => item.width === null);

        if (nextEmptyIndex !== -1) {
            this.state.ui.activeCell = { rowIndex: nextEmptyIndex, column: 'width' };
            this.state.ui.inputMode = 'width';
        } else {
            // 如果都填滿了，就將焦點放在最後一行的寬度上
            this.state.ui.activeCell = { rowIndex: items.length - 1, column: 'width' };
            this.state.ui.inputMode = 'width';
        }
    }

    /**
     * @fileoverview [修改] 需求一：重構插入邏輯
     */
    _handleInsertRow() {
        const { selectedRowIndex } = this.state.ui;
        const items = this.state.quoteData.rollerBlindItems;

        if (selectedRowIndex === null) {
            this.eventAggregator.publish('showNotification', { message: 'Please select a row by clicking its number before inserting.' });
            return;
        }
        
        const rowBelowIndex = selectedRowIndex + 1;
        const rowBelow = items[rowBelowIndex];

        // 檢查下一行是否為無意義的空白行
        if (rowBelow && rowBelow.width === null && rowBelow.height === null) {
             this.eventAggregator.publish('showNotification', { message: 'Cannot insert a row above an existing empty row.' });
             return;
        }

        const newItem = { itemId: `item-${Date.now()}`, width: null, height: null, fabricType: null, linePrice: null };
        items.splice(rowBelowIndex, 0, newItem);
        
        this._focusOnNextEmptyWidthCell(); // 跳轉焦點
        this.state.ui.selectedRowIndex = null; // 清除選擇
        this.eventAggregator.publish('stateChanged', this.state);
        console.log(`Row inserted at index ${rowBelowIndex}.`);
    }

    /**
     * @fileoverview [修改] 需求二：重構刪除邏輯
     */
    _handleDeleteRow() {
        const { selectedRowIndex } = this.state.ui;
        const items = this.state.quoteData.rollerBlindItems;
        
        if (selectedRowIndex === null) {
            this.eventAggregator.publish('showNotification', { message: 'Please select a row by clicking its number before deleting.' });
            return;
        }

        const selectedItem = items[selectedRowIndex];
        
        // 保護機制：如果是最後一行且為空，不允許刪除
        if (selectedRowIndex === items.length - 1 && selectedItem.width === null && selectedItem.height === null) {
            this.eventAggregator.publish('showNotification', { message: 'Cannot delete the final empty row.' });
            return;
        }

        items.splice(selectedRowIndex, 1);
        
        // 如果刪除後為空，補一個空白行
        if (items.length === 0) {
            items.push({ itemId: `item-${Date.now()}`, width: null, height: null, fabricType: null, linePrice: null });
        }
        
        this._focusOnNextEmptyWidthCell(); // 跳轉焦點
        this.state.ui.selectedRowIndex = null; // 清除選擇
        this.eventAggregator.publish('stateChanged', this.state);
        console.log(`Row deleted at index ${selectedRowIndex}.`);
    }
    // --- [新增/重構結束] ---
}
