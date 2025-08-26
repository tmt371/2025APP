// /04-core-code/config-manager.js

const FABRIC_TYPE_TO_MATRIX_MAP = {
    'BO': 'UNILINE_SUNSET',
    'BO1': 'WILSON_BYRON_BAY',
    'SN': 'UNILINE_UNIVIEW_10%' // 修正了之前發現的 SN 類型名稱不匹配問題
};

export class ConfigManager {
    constructor(eventAggregator) {
        this.eventAggregator = eventAggregator;
        this.priceMatrices = null;
        this.isInitialized = false;
    }

    async initialize() {
        if (this.isInitialized) return;

        try {
            const response = await fetch('./03-data-models/price-matrix-v1.0.json');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            this.priceMatrices = data.matrices;
            this.isInitialized = true;
            console.log("ConfigManager initialized and price matrices loaded.");

            // [新增] 偵錯碼：在主控台中打印出所有已載入的價格表名稱
            console.log("Available matrix keys:", Object.keys(this.priceMatrices));

        } catch (error) {
            console.error("Failed to load price matrices:", error);
            this.eventAggregator.publish('showNotification', { message: 'Error: Could not load the price list file!', type: 'error'});
        }
    }

    getPriceMatrix(fabricType) {
        if (!this.isInitialized || !this.priceMatrices) {
            console.error("ConfigManager not initialized or matrices not loaded.");
            return null;
        }
        const matrixName = FABRIC_TYPE_TO_MATRIX_MAP[fabricType];
        return this.priceMatrices[matrixName] || null;
    }
}
