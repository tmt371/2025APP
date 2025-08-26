// /04-core-code/input-handler.js

export class InputHandler {
    constructor(eventAggregator) {
        this.eventAggregator = eventAggregator;
    }

    initialize() {
        this._setupNumericKeyboard();
        this._setupTableInteraction();
        this._setupFunctionKeys();
        this._setupPanelToggles(); // --- [新增] 呼叫設定面板切換的方法 ---
    }
    
    // --- [新增開始] ---
    /**
     * 設定兩個面板（數字鍵盤和功能鍵盤）的切換把手的事件監聽
     */
    _setupPanelToggles() {
        const numericToggle = document.getElementById('panel-toggle');
        if (numericToggle) {
            numericToggle.addEventListener('click', () => {
                this.eventAggregator.publish('userToggledNumericKeyboard');
            });
        }

        const functionToggle = document.getElementById('function-panel-toggle');
        if (functionToggle) {
            functionToggle.addEventListener('click', () => {
                this.eventAggregator.publish('userToggledFunctionKeyboard');
            });
        }
    }
    // --- [新增結束] ---

    /**
     * 設定鍵盤功能鍵 (F1, F2, Sum, Insert, Delete 等) 的事件監聽
     */
    _setupFunctionKeys() {
        const sumButton = document.getElementById('key-sum');
        if (sumButton) {
            sumButton.addEventListener('click', () => {
                this.eventAggregator.publish('userRequestedSummation');
            });
        }

        // --- [新增] 為右側功能面板的按鈕綁定事件 ---
        const insertButton = document.getElementById('key-insert');
        if (insertButton) {
            insertButton.addEventListener('click', () => {
                this.eventAggregator.publish('userRequestedInsertRow');
            });
        }

        const deleteButton = document.getElementById('key-delete');
        if (deleteButton) {
            deleteButton.addEventListener('click', () => {
                this.eventAggregator.publish('userRequestedDeleteRow');
            });
        }
    }

    _setupNumericKeyboard() {
        const numericKeyboard = document.getElementById('numeric-keyboard');
        if (numericKeyboard) {
            numericKeyboard.addEventListener('click', (event) => {
                const button = event.target.closest('button');
                if (!button) return;
                const key = button.dataset.key;
                if (key) {
                    this.eventAggregator.publish('numericKeyPressed', { key });
                }
            });
        }
    }

    _setupTableInteraction() {
        const table = document.getElementById('results-table');
        if (table) {
            table.addEventListener('click', (event) => {
                const target = event.target;
                const isHeader = target.tagName === 'TH';
                const isCell = target.tagName === 'TD';

                if (!isHeader && !isCell) return;

                const column = target.dataset.column;
                
                if (isHeader) {
                    if (column === 'Price') {
                        this.eventAggregator.publish('userRequestedPriceCalculation');
                    } else {
                        this.eventAggregator.publish('tableHeaderClicked', { column });
                    }
                } else {
                    const rowIndex = target.parentElement.dataset.rowIndex;
                    this.eventAggregator.publish('tableCellClicked', { 
                        rowIndex: parseInt(rowIndex, 10), 
                        column 
                    });
                }
            });
        }
    }
}
