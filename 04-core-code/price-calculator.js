// /04-core-code/price-calculator.js

export class PriceCalculator {
    constructor(configManager, eventAggregator) {
        this.configManager = configManager;
        this.eventAggregator = eventAggregator;
        this.initialize();
    }

    initialize() {
        // 在這個階段，計算器是被動呼叫的，所以它不需要訂閱任何事件。
        // 未來當我們實現「計算總價」功能時，會在這裡添加事件監聽。
    }

    /**
     * 為單一捲簾項目計算基礎價格
     * @param {object} item - 包含 width, height, fabricType 的捲簾項目物件
     * @returns {number|null} - 返回計算出的價格，如果無法計算則返回 null
     */
    calculateRollerBlindPrice(item) {
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

        // --- 核心查價邏輯 ---

        // 1. 找到第一個「大於等於」輸入寬度的寬度級距索引
        //    findIndex 會返回第一個滿足條件的元素的索引
        const widthIndex = matrix.widths.findIndex(w => item.width <= w);

        // 2. 找到第一個「大於等於」輸入高度的高度級距索引
        const dropIndex = matrix.drops.findIndex(d => item.height <= d);

        // 3. 處理超出範圍的錯誤
        if (widthIndex === -1) {
            // 如果 findIndex 找不到，它會返回 -1
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
