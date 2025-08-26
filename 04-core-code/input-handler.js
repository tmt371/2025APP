// /04-core-code/input-handler.js

export class InputHandler {
    constructor(eventAggregator) {
        this.eventAggregator = eventAggregator;
    }

    initialize() {
        this._setupNumericKeyboard();
        this._setupTableInteraction(); // [新增]
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

    // [新增] 監聽表格的點擊
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
                    // 如果點擊的是表頭
                    this.eventAggregator.publish('tableHeaderClicked', { column });
                } else {
                    // 如果點擊的是儲存格
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
