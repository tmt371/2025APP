// /04-core-code/config-manager.js

const FABRIC_TYPE_TO_MATRIX_MAP = {
    'BO': 'UNILINE_SUNSET',
    'BO1': 'WILSON_BYRON_BAY',
    'SN': 'UNILINE_UNIVIEW_10'
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
            // [修改] 更新 fetch 路徑以匹配新的全小寫、短橫線命名
            const response = await fetch('./03-data-models/price-matrix-v1.0.json');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            this.priceMatrices = data.matrices;
            this.isInitialized = true;
            console.log("ConfigManager initialized and price matrices loaded.");
        } catch (error) {
            console.error("Failed to load price matrices:", error);
            this.eventAggregator.publish('showNotification', { message: '錯誤：無法載入價格表檔案！', type: 'error'});
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
