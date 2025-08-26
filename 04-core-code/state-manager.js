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
            this.eventAggregator.publish('stateChanged', this.state);
        }
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
                
                // [修正] 當驗證失敗時，除了移動焦點，還要強制重置輸入模式
                this.state.ui.activeCell = { rowIndex: i, column: 'width' };
                this.state.ui.inputMode = 'width'; // <--- 核心修正點
                
                return false;
            }
        }
        return true;
    }
}
