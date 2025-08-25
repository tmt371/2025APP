// /04-core-code/ui-manager.js

export class UIManager {
    constructor(appElement, eventAggregator) {
        this.appElement = appElement;
        // 我們現在可以直接在建構函式中找到需要的元素
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
        // [修改] 更新輸入框的顯示
        if (this.inputDisplay) {
            this.inputDisplay.textContent = state.ui.inputValue || '';
        }

        // [修改] 更新結果表格
        if (this.resultsTableBody) {
            if (state.quoteData.rollerBlindItems.length === 0) {
                this.resultsTableBody.innerHTML = `<tr><td colspan="4" style="color: #888;">Please enter dimensions to begin...</td></tr>`;
            } else {
                // 根據數據生成表格的每一行，現在是四個獨立的儲存格
                this.resultsTableBody.innerHTML = state.quoteData.rollerBlindItems.map(item => `
                    <tr>
                        <td>${item.width || ''}</td>
                        <td>${item.height || ''}</td>
                        <td>${item.fabricType || ''}</td>
                        <td class="text-right">${item.linePrice ? '$' + item.linePrice.toFixed(2) : ''}</td>
                    </tr>
                `).join('');
            }
        }
    }
}
