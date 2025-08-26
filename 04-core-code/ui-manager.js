// /04-core-code/ui-manager.js

export class UIManager {
    constructor(appElement, eventAggregator) {
        this.appElement = appElement;
        this.eventAggregator = eventAggregator;

        // --- [修改] 統一獲取所有需要操作的 DOM 元素 ---
        this.inputDisplay = document.getElementById('input-display');
        this.resultsTableBody = document.querySelector('.results-table tbody');
        this.totalSumValueElement = document.getElementById('total-sum-value');
        this.numericKeyboardPanel = document.getElementById('numeric-keyboard-panel');
        this.functionPanel = document.getElementById('function-panel');

        this.initialize(); // --- [新增] 呼叫初始化方法 ---
    }

    // --- [新增開始] ---
    /**
     * 初始化 UIManager，主要用於訂閱事件
     */
    initialize() {
        // 訂閱面板切換事件
        this.eventAggregator.subscribe('userToggledNumericKeyboard', () => this._toggleNumericKeyboard());
        this.eventAggregator.subscribe('userToggledFunctionKeyboard', () => this._toggleFunctionKeyboard());
    }
    // --- [新增結束] ---

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

        // 更新總價顯示區
        if (this.totalSumValueElement) {
            const totalSum = state.quoteData.summary ? state.quoteData.summary.totalSum : null;
            if (typeof totalSum === 'number') {
                this.totalSumValueElement.textContent = `$${totalSum.toFixed(2)}`;
            } else {
                this.totalSumValueElement.textContent = '';
            }
        }
    }

    // --- [新增開始] ---
    /**
     * 切換底部數字鍵盤的摺疊/展開狀態
     */
    _toggleNumericKeyboard() {
        if (this.numericKeyboardPanel) {
            this.numericKeyboardPanel.classList.toggle('is-collapsed');
        }
    }

    /**
     * 切換右側功能鍵盤的滑出/滑入狀態
     */
    _toggleFunctionKeyboard() {
        if (this.functionPanel) {
            this.functionPanel.classList.toggle('is-expanded');
        }
    }
    // --- [新增結束] ---
}
