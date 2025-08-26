// /04-core-code/input-handler.js

export class InputHandler {
    constructor(eventAggregator) {
        this.eventAggregator = eventAggregator;
    }

    initialize() {
        this._setupNumericKeyboard();
        this._setupTableInteraction();
        this._setupFunctionKeys(); // --- [新增] 呼叫設定功能鍵的方法 ---
    }

    // --- [新增開始] ---
    /**
     * 設定功能鍵 (F1, F2, Sum) 的事件監聽
     */
    _setupFunctionKeys() {
        const sumButton = document.getElementById('key-sum');
        if (sumButton) {
            sumButton.addEventListener('click', () => {
                // 當 Sum 按鈕被點擊時，發布一個語義化的事件
                this.eventAggregator.publish('userRequestedSummation');
            });
        }

        // F1 和 F2 按鈕目前沒有功能，未來若有需要可在此處添加
        // const f1Button = document.getElementById('key-f1');
        // const f2Button = document.getElementById('key-f2');
    }
    // --- [新增結束] ---

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
