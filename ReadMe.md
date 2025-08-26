# 捲簾估價應用程式 (Roller Blind Quotation App) - 專案索引

**最後更新日期:** 2025年8月25日

## 專案描述

本專案旨在開發一個基於 Web 的捲簾估價應用程式，以簡化報價流程、統一計價標準並提升效率。應用程式支援離線操作，並具備完整的兩階段估價流程。

## 當前狀態

**第一階段與第二階段的規劃工作已全部完成。** 專案正式進入**第三階段：垂直切片開發**。

## 核心決策與商業邏輯摘要

* **兩階段估價流程**:
    1.  **快速估價**: 僅輸入 `W`, `H`, `TYPE` 快速得出概算總價。
    2.  **詳細規格設定 (MOL)**: 內部專用介面，用於設定馬達、配件等所有細節。

* **定價規則**:
    * 捲簾基礎價格由 `寬 x 高` 查閱對應的價格矩陣 (`BO`, `BO1`, `SN`) 決定。
    * 安裝費固定為 $20/支。
    * 電動配件（遙控器、充電器）的數量與馬達類型掛鉤，並有特定觸發邏輯。

## 專案文件索引

* **專案開發計畫書**: `/01-project-docs/產品估價應用程式_專案開發計畫_v2.3.docx`
* **工作流程與商業邏輯**: `/01-project-docs/Workflow_and_Business_Logic_zh-TW.txt`
* **UI 設計理據**: `/01-project-docs/UI_Design_Rationale_zh-TW.txt`
* **主應用程式入口**: `/index.html` (或 `app.html`)
* **最終報價單 (客戶版型)**: `/02-ui/quote-template-final.html`
* **最終詳細清單 (客戶附錄版型)**: `/02-ui/detailed-item-list-final.html`
* **數據結構藍圖**: `/03-data-models/quote-data-structure-final.js`
* **價格矩陣數據**: `/03-data-models/PriceMatrix_v1.0.json`

## 下一步計畫

**實現「快速估價」頁面的虛擬鍵盤互動功能。** 涉及模組：`InputHandler.js` 和 `StateManager.js`。
