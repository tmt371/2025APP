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
                    // [修改] 現在也會發布 Price 表頭的點擊事件
                    this.eventAggregator.publish('tableHeaderClicked', { column });
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
