// /04-core-code/ui-manager.js

/**
 * UIManager (臉孔 / 視覺導演)
 * 負責根據狀態，更新畫面中對應的元素。
 */
export class UIManager {
    constructor(appElement, eventAggregator) {
        // 找到需要操作的各個 DOM 元素
        this.appElement = appElement;
        this.inputDisplay = document.getElementById('input-display');
        this.resultsTableBody = document.querySelector('.results-table tbody');
        this.eventAggregator = eventAggregator;
    }

    // 主渲染函式
    render(state) {
        // 根據當前的視圖狀態，決定要渲染哪個介面
        switch (state.ui.currentView) {
            case 'QUICK_QUOTE':
                this._renderQuickQuoteView(state);
                break;
            default:
                this.appElement.innerHTML = `<p>Error: Unknown view state.</p>`;
        }
    }

    // 渲染「快速估價」視圖的具體方法
    _renderQuickQuoteView(state) {
        // 更新輸入框的顯示
        this.inputDisplay.textContent = state.ui.inputValue || '';

        // 更新結果表格
        if (state.quoteData.rollerBlindItems.length === 0) {
            this.resultsTableBody.innerHTML = `<tr><td colspan="4" style="color: #888;">Please enter dimensions to begin...</td></tr>`;
        } else {
            // 根據數據生成表格的每一行
            this.resultsTableBody.innerHTML = state.quoteData.rollerBlindItems.map(item => `
                <tr>
                    <td>${item.width || ''}</td>
                    <td>${item.height || ''}</td>
                    <td>${item.fabricType || ''}</td>
                    <td>${item.linePrice ? '$' + item.linePrice.toFixed(2) : ''}</td>
                </tr>
            `).join('');
        }
    }
}
