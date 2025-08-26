// /04-core-code/ui-manager.js

export class UIManager {
    constructor(appElement, eventAggregator) {
        this.appElement = appElement;
        this.inputDisplay = document.getElementById('input-display');
        this.resultsTableBody = document.querySelector('.results-table tbody');
        
        // --- [新增] 獲取總價顯示區的 DOM 元素 ---
        this.totalSumValueElement = document.getElementById('total-sum-value');
        
        this.eventAggregator = eventAggregator;
    }

    render(state) {
        if (state.ui.currentView === 'QUICK_QUOTE') {
            this._renderQuickQuoteView(state);
        }
    }

    _renderQuickQuoteView(state) {
        // 更新輸入顯示框
        if (this.inputDisplay) {
            this.inputDisplay.textContent = state.ui.inputValue || '';
        }

        // 更新結果表格
        if (this.resultsTableBody) {
            const { rollerBlindItems } = state.quoteData;
            const { activeCell } = state.ui;

            if (rollerBlindItems.length === 0) {
                this.resultsTableBody.innerHTML = `<tr><td colspan="4" style="color: #888;">Please enter dimensions to begin...</td></tr>`;
            } else {
                this.resultsTableBody.innerHTML = rollerBlindItems.map((item, index) => {
                    const isWHighlighted = index === activeCell.rowIndex && activeCell.column === 'width';
                    const isHHighlighted = index === activeCell.rowIndex && activeCell.column === 'height';
                    
                    let typeClass = '';
                    if (item.fabricType === 'BO1') {
                        typeClass = 'type-bo1';
                    } else if (item.fabricType === 'SN') {
                        typeClass = 'type-sn';
                    }

                    return `
                        <tr data-row-index="${index}">
                            <td data-column="width" class="${isWHighlighted ? 'highlighted-cell' : ''}">${item.width || ''}</td>
                            <td data-column="height" class="${isHHighlighted ? 'highlighted-cell' : ''}">${item.height || ''}</td>
                            <td data-column="TYPE" class="${typeClass}">${(item.width || item.height) ? (item.fabricType || '') : ''}</td>
                            <td data-column="Price" class="text-right">${item.linePrice ? '$' + item.linePrice.toFixed(2) : ''}</td>
                        </tr>
                    `;
                }).join('');
            }
        }

        // --- [新增開始] ---
        // 更新總價顯示區
        if (this.totalSumValueElement) {
            // 安全地從 state 中獲取 totalSum
            const totalSum = state.quoteData.summary ? state.quoteData.summary.totalSum : null;

            if (typeof totalSum === 'number') {
                // 如果 totalSum 是一個數字，則格式化並顯示
                this.totalSumValueElement.textContent = `$${totalSum.toFixed(2)}`;
            } else {
                // 否則 (為 null 或 undefined)，清空顯示
                this.totalSumValueElement.textContent = '';
            }
        }
        // --- [新增結束] ---
    }
}
