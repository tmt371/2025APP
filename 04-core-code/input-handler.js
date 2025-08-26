// /04-core-code/input-handler.js

export class InputHandler {
    constructor(eventAggregator) {
        this.eventAggregator = eventAggregator;
    }

    initialize() {
        this._setupNumericKeyboard();
        this._setupTableInteraction();
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
                    // --- [修改開始] ---
                    // 根據架構文件，我們需要發布一個更具語義的事件來觸發價格計算
                    if (column === 'Price') {
                        // 當 Price 表頭被點擊時，發布專門的計算請求事件
                        this.eventAggregator.publish('userRequestedPriceCalculation');
                    } else {
                        // 對於其他表頭（例如 TYPE），維持原有的通用事件
                        this.eventAggregator.publish('tableHeaderClicked', { column });
                    }
                    // --- [修改結束] ---
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
