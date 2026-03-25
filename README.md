# AI-N8N

🚀 AI 內容生產線：基於 n8n 的自動化多代理系統 (MAS)

這是一個利用 n8n 流程自動化工具，結合 Google Gemini API 所建構的「自動化內容生成與交付系統」。本專案模擬了專業編輯部的協作流程，實現了從「一鍵選題」到「精美網頁信件發送」及「雲端備份」的完整自動化。

🌟 核心亮點 (Project Highlights)

多代理系統 (Multi-Agent System, MAS)：

Planner (內容規劃師)：負責結構分析，產出邏輯嚴謹的大綱。

Writer (專業作家)：根據大綱擴寫內容，確保專業的繁體中文語氣。

Editor (社群媒體編輯)：負責將內容轉化為精美的 HTML/CSS 日報格式。

物理級內容過濾 (Technical Solution)：

針對 AI 預覽版模型容易出現「重複指令」或「廢話過多」的痛點，自行開發了 V7 JavaScript 過濾邏輯，利用正則表達式強制擷取純淨代碼，確保系統輸出 100% 穩定。

魯棒性設計 (Robustness)：

內建 If-Else 錯誤處理節點，當 AI 回傳空值或異常時自動導向補救路徑，防止流程中斷。

端到端自動交付 (E2E Delivery)：

整合 Gmail API 自動寄送精美排版郵件，並透過 Google Drive API 實現自動備份。

🛠️ 技術棧 (Tech Stack)

自動化引擎: n8n (Self-hosted on Hugging Face)

人工智慧: Google Gemini API (1.5-pro / 2.5-flash)

腳本語言: JavaScript (Node.js)

外部整合: Google Gmail API, Google Drive API

📂 倉庫結構

workflow.json: n8n 完整流程匯出檔。

scripts/extract_html_v7.js: 核心 JavaScript 過濾器代碼。

README.md: 本說明文件。

⚙️ 安裝與設定 (Setup)

1. 匯入工作流

下載 workflow.json 並匯入至你的 n8n 介面。

2. 設定憑證 (Credentials)

Gemini API: 申請 API Key 並在節點中選取。

Google OAuth2:

前往 Google Cloud Console 啟用 Gmail 與 Drive API。

設定 OAuth Client ID 與 Secret。

在 n8n 中完成授權 (需確保 Authorized Redirect URI 正確)。

3. JavaScript 邏輯設定

確保 Code 節點 中貼入了 scripts/extract_html_v7.js 的內容，這是確保輸出的 HTML 不會包含 AI 廢話的關鍵。

📈 技術亮點展示：V7 過濾器

在開發過程中，我們發現 AI 模型偶爾會輸出「好的、這是您的網頁...」等贅字。為了實現企業級的穩定性，本專案採用了以下代碼進行處理：

// 核心 Regex 擷取邏輯範例
const regex = /```html\s*([\s\S]*?)\s*```/i;
const match = rawText.match(regex);
if (match) {
    cleanHtml = match[1].trim(); // 強制只抓取網頁標籤，過濾掉所有開場白
}
