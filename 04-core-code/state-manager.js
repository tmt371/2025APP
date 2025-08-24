// /04_CoreCode/StateManager.js

/**
 * StateManager (大腦)
 * 應用程式的數據核心，作為單一事實來源。
 */
export class StateManager {
    constructor(initialState, eventAggregator) {
        this.state = initialState;
        this.eventAggregator = eventAggregator;
    }

    // 允許外部獲取當前狀態的方法
    getState() {
        return this.state;
    }

    // 未來我們會在這裡添加更多監聽事件和更新狀態的方法
}