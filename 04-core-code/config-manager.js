// /04-core-code/config-manager.js

// 為了方便對應，我們在此定義布料類型與矩陣名稱的映射關係
const FABRIC_TYPE_TO_MATRIX_MAP = {
    'BO': 'UNILINE_SUNSET',
    'BO1': 'WILSON_BYRON_BAY',
    'SN': 'UNILINE_UNIVIEW_10'
};

export class ConfigManager {
    constructor(eventAggregator) {
        this.eventAggregator = eventAggregator;
        this.priceMatrices = null; // 初始為 null，代表尚未載入
        this.isInitialized = false;
    }

    /**
     * 非同步初始化方法，負責載入所有設定檔
     * @returns {Promise<void>}
     */
    async initialize() {
        if (this.isInitialized) return;

        try {
            // 從我們的數據模型資料夾中，異步載入價格矩陣 JSON 檔案
            const response = await fetch('../03-data-models/PriceMatrix_v1.0.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            this.priceMatrices = data.matrices; // 只儲存 matrices 部分
            this.isInitialized = true;
            console.log("ConfigManager initialized and price matrices loaded.");
        } catch (error) {
            console.error("Failed to load price matrices:", error);
            // 在真實應用中，我們可能會發布一個錯誤事件
            // this.eventAggregator.publish('configLoadFailed', { error });
        }
    }

    /**
     * 根據布料類型(BO, BO1, SN)獲取對應的價格矩陣
     * @param {string} fabricType - e.g., 'BO', 'BO1', 'SN'
     * @returns {object|null}
     */
    getPriceMatrix(fabricType) {
        if (!this.isInitialized || !this.priceMatrices) {
            console.error("ConfigManager not initialized or matrices not loaded.");
            return null;
        }
        const matrixName = FABRIC_TYPE_TO_MATRIX_MAP[fabricType];
        return this.priceMatrices[matrixName] || null;
    }
}
