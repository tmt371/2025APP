// /04-core-code/price-calculator.js

export class PriceCalculator {
    constructor(configManager, eventAggregator) {
        this.configManager = configManager;
        this.eventAggregator = eventAggregator;
        this.initialize();
    }

    initialize() {
        // --- [修改開始] ---
        // 從被動呼叫，改為主動訂閱「計算請求」事件
        this.eventAggregator.subscribe('calculatePriceForRow', (data) => this._handleCalculationRequest(data));
        // --- [修改結束] ---
    }

    // --- [新增開始] ---
    /**
     * 處理價格計算請求的事件處理器
     * @param {object} data - 包含 item 物件的事件數據
     */
    _handleCalculationRequest(data) {
        if (!data || !data.item) return;

        const { item } = data;
        const price = this._calculateRollerBlindPrice(item);

        // 如果成功計算出價格，就發布「價格已計算」事件，並附上 itemId 和價格
        if (price !== null) {
            this.eventAggregator.publish('priceCalculatedForRow', {
                itemId: item.itemId,
                price: price
            });
        }
    }
    // --- [新增結束] ---

    /**
     * 為單一捲簾項目計算基礎價格的核心邏輯
     * @param {object} item - 包含 width, height, fabricType 的捲簾項目物件
     * @returns {number|null} - 返回計算出的價格，如果無法計算則返回 null
     * [註解] 這個方法現在是模組內部的輔助方法，由事件處理器 _handleCalculationRequest 呼叫
     */
    _calculateRollerBlindPrice(item) {
        // 確保所有必要的計算參數都存在
        if (!item || !item.width || !item.height || !item.fabricType) {
            return null;
        }

        // 從 ConfigManager 獲取對應的價格矩陣
        const matrix = this.configManager.getPriceMatrix(item.fabricType);
        if (!matrix) {
            console.error(`Price matrix not found for fabric type: ${item.fabricType}`);
            return null;
        }

        // --- 核心查價邏輯 (此部分邏輯不變) ---

        // 1. 找到第一個「大於等於」輸入寬度的寬度級距索引
        const widthIndex = matrix.widths.findIndex(w => item.width <= w);

        // 2. 找到第一個「大於等於」輸入高度的高度級距索引
        const dropIndex = matrix.drops.findIndex(d => item.height <= d);

        // 3. 處理超出範圍的錯誤
        if (widthIndex === -1) {
            console.error(`Error: Width ${item.width} exceeds the maximum width in the price matrix.`);
            this.eventAggregator.publish('showNotification', { message: `寬度 ${item.width} 超出價目表最大範圍。`, type: 'error'});
            return null;
        }
        if (dropIndex === -1) {
            console.error(`Error: Height ${item.height} exceeds the maximum height in the price matrix.`);
            this.eventAggregator.publish('showNotification', { message: `高度 ${item.height} 超出價目表最大範圍。`, type: 'error'});
            return null;
        }

        // 4. 根據索引，在二維價格陣列中交叉查找到價格
        const price = matrix.prices[dropIndex][widthIndex];

        return price !== undefined ? price : null;
    }
}
