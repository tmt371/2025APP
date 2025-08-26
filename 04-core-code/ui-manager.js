// /04-core-code/ui-manager.js

export class UIManager {
    constructor(appElement, eventAggregator) {
        this.appElement = appElement;
        this.inputDisplay = document.getElementById('input-display');
        this.resultsTableBody = document.querySelector('.results-table tbody');
        this.eventAggregator = eventAggregator;
    }

    render(state) {
        switch (state.ui.currentView) {
            case 'QUICK_QUOTE':
                this._renderQuickQuoteView(state);
                break;
            default:
                this.appElement.innerHTML = `<p>Error: Unknown view state.</p>`;
        }
    }

    _renderQuickQuoteView(state) {
        if (this.inputDisplay) {
            this.inputDisplay.textContent = state.ui.inputValue || '';
        }

        // [修改] 渲染表格時加入高亮邏輯
        if (this.resultsTableBody) {
            const { rollerBlindItems } = state.quoteData;
            const { activeCell } = state.ui;

            if (rollerBlindItems.length === 0) {
                this.resultsTableBody.innerHTML = `<tr><td colspan="4" style="color: #888;">Please enter dimensions to begin...</td></tr>`;
            } else {
                this.resultsTableBody.innerHTML = rollerBlindItems.map((item, index) => {
                    const isWHighlighted = index === activeCell.rowIndex && activeCell.column === 'width';
                    const isHHighlighted = index === activeCell.rowIndex && activeCell.column === 'height';
                    
                    return `
                        <tr>
                            <td class="${isWHighlighted ? 'highlighted-cell' : ''}">${item.width || ''}</td>
                            <td class="${isHHighlighted ? 'highlighted-cell' : ''}">${item.height || ''}</td>
                            <td>${item.fabricType || ''}</td>
                            <td class="text-right">${item.linePrice ? '$' + item.linePrice.toFixed(2) : ''}</td>
                        </tr>
                    `;
                }).join('');
            }
        }
    }
}
