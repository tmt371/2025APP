// /04_CoreCode/UIManager.js

/**
 * UIManager (臉孔 / 視覺導演)
 * 負責根據狀態渲染正確的 UI 視圖。
 */
export class UIManager {
    constructor(appElement, eventAggregator) {
        this.appElement = appElement; // 這是我們在 index.html 中定義的 <div id="app"></div>
        this.eventAggregator = eventAggregator;
    }

    // 主渲染函式，所有 UI 的更新都從這裡開始
    render(state) {
        // 根據當前的視圖狀態，決定要渲染哪個介面
        switch (state.ui.currentView) {
            case 'QUICK_QUOTE':
                this._renderQuickQuoteUI(state);
                break;
            // 未來會有 'MOL_VIEW', 'FINAL_QUOTE_VIEW' 等
            default:
                this.appElement.innerHTML = `<p>Error: Unknown view state.</p>`;
        }
    }

    // 私有方法，專門用來生成「第一階段：快速估價」的 HTML 結構
    _renderQuickQuoteUI(state) {
        // 使用模板字串來建立 HTML 結構
        const html = `
            <style>
                .quick-quote-container { display: flex; gap: 20px; height: 75vh; }
                .left-panel { flex: 1; display: flex; flex-direction: column; }
                .right-panel { flex: 3; overflow-y: auto; border-left: 1px solid #eee; padding-left: 20px;}
                .input-display { border: 1px solid #ccc; padding: 20px; font-size: 2em; text-align: right; margin-bottom: 20px; min-height: 40px; }
                .virtual-keyboard { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
                .virtual-keyboard button { padding: 20px; font-size: 1.5em; cursor: pointer; }
                .results-table { width: 100%; border-collapse: collapse; }
                .results-table th, .results-table td { border: 1px solid #ddd; padding: 8px; text-align: center; }
                .results-table thead { background-color: #f2f2f2; }
            </style>
            <div class="quick-quote-container">
                <div class="left-panel">
                    <div class="input-display" id="input-display"></div>
                    <div class="virtual-keyboard" id="virtual-keyboard">
                        <button data-key="1">1</button>
                        <button data-key="2">2</button>
                        <button data-key="3">3</button>
                        <button data-key="4">4</button>
                        <button data-key="5">5</button>
                        <button data-key="6">6</button>
                        <button data-key="7">7</button>
                        <button data-key="8">8</button>
                        <button data-key="9">9</button>
                        <button data-key="W">W</button>
                        <button data-key="0">0</button>
                        <button data-key="H">H</button>
                        <button data-key="DEL" style="grid-column: 1 / 3;">DELETE</button>
                        <button data-key="ENT">ENTER</button>
                    </div>
                </div>
                <div class="right-panel">
                    <h3>Quick Quote Results</h3>
                    <table class="results-table">
                        <thead>
                            <tr>
                                <th>W</th>
                                <th>H</th>
                                <th>TYPE</th>
                                <th>Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td colspan="4" style="color: #888;">Please enter dimensions to begin...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        this.appElement.innerHTML = html;
    }
}