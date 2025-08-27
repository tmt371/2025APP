// /04-core-code/ui-manager.js

export class UIManager {
    constructor(appElement, eventAggregator) {
        this.appElement = appElement;
        this.eventAggregator = eventAggregator;

        this.inputDisplay = document.getElementById('input-display');
        this.resultsTableBody = document.querySelector('.results-table tbody');
        this.totalSumValueElement = document.getElementById('total-sum-value');
        this.numericKeyboardPanel = document.getElementById('numeric-keyboard-panel');
        this.functionPanel = document.getElementById('function-panel');

        this.initialize();
    }

    initialize() {
        this.eventAggregator.subscribe('userToggledNumericKeyboard', () => this._toggleNumericKeyboard());
        this.eventAggregator.subscribe('userToggledFunctionKeyboard', () => this._toggleFunctionKeyboard());
    }

    render(state) {
        if (state.ui.currentView === 'QUICK_QUOTE') {
            this._renderQuickQuoteView(state);
        }
    }

    _renderQuickQuoteView(state) {
        if (this.inputDisplay) {
            this.inputDisplay.textContent = state.ui.inputValue || '';
        }

        if (this.resultsTableBody) {
            const { rollerBlindItems } = state.quoteData;
            const { activeCell } = state.ui;

            if (rollerBlindItems.length === 0 || (rollerBlindItems.length === 1 && !rollerBlindItems[0].width && !rollerBlindItems[0].height)) {
                // --- [修改] 更新 colspan 以符合新的欄位數量 ---
                this.resultsTableBody.innerHTML = `<tr><td colspan="5" style="color: #888;">Please enter dimensions to begin...</td></tr>`;
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
                            <td>${index + 1}</td>
                            <td data-column="width" class="${isWHighlighted ? 'highlighted-cell' : ''}">${item.width || ''}</td>
                            <td data-column="height" class="${isHHighlighted ? 'highlighted-cell' : ''}">${item.height || ''}</td>
                            <td data-column="TYPE" class="${typeClass}">${(item.width || item.height) ? (item.fabricType || '') : ''}</td>
                            <td data-column="Price" class="text-right">${item.linePrice ? '$' + item.linePrice.toFixed(2) : ''}</td>
                        </tr>
                    `;
                }).join('');
            }
        }

        if (this.totalSumValueElement) {
            const totalSum = state.quoteData.summary ? state.quoteData.summary.totalSum : null;
            if (typeof totalSum === 'number') {
                this.totalSumValueElement.textContent = `$${totalSum.toFixed(2)}`;
            } else {
                this.totalSumValueElement.textContent = '';
            }
        }
    }

    _toggleNumericKeyboard() {
        if (this.numericKeyboardPanel) {
            this.numericKeyboardPanel.classList.toggle('is-collapsed');
        }
    }

    _toggleFunctionKeyboard() {
        if (this.functionPanel) {
            this.functionPanel.classList.toggle('is-expanded');
        }
    }
}
