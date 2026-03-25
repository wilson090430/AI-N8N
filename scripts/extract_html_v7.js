/**
 * n8n Code Node - 終極精確提取邏輯 (V7)
 * * 核心功能：
 * 1. 物理過濾：自動尋找 ```html ... ``` 代碼塊或 <html>...</html> 區間。
 * 2. 攔截廢話：即便 AI 重複了指令，這段程式碼也會跳過廢話，只抓取真正的網頁代碼。
 * 3. 雙變數支援：產出 emailBody (供 Gmail) 與 final_text (供 Google Drive)。
 */

// 1. 取得前一個節點傳來的 JSON 資料
const item = $input.first().json;

// 2. 提取原始文字 (嘗試從 Gemini 常見的幾種輸出路徑抓取)
let rawText = (item.content && item.content.parts && item.content.parts[0].text) 
              || item.text 
              || item.output 
              || "";

let cleanHtml = "";

// 3. 策略 A：優先尋找被 Markdown 語法 ```html ... ``` 包住的內容
const markdownRegex = /```html\s*([\s\S]*?)\s*```/i;
const markdownMatch = rawText.match(markdownRegex);

if (markdownMatch && markdownMatch[1]) {
    // 成功找到代碼塊，這是最理想的情況
    cleanHtml = markdownMatch[1].trim();
} else {
    // 策略 B：若無代碼塊，尋找 <html> 標籤的區間
    const lowerText = rawText.toLowerCase();
    
    // 找第一個出現的 <html (通常是代碼開始)
    let htmlStart = lowerText.indexOf('<html');
    // 找最後一個出現的 </html> (通常是代碼結束)
    let htmlEnd = lowerText.lastIndexOf('</html>');

    // 💡 防呆檢查：如果抓到的 HTML 區段太短 (例如小於 200 字)，很可能是 AI 在複誦指令
    // 這時我們嘗試跳過開頭，往後找真正的 <html> 起點
    if (htmlStart !== -1 && htmlStart < 300 && rawText.includes('<html>', htmlStart + 1)) {
        const nextStart = lowerText.indexOf('<html', htmlStart + 1);
        if (nextStart !== -1) htmlStart = nextStart;
    }

    if (htmlStart !== -1 && htmlEnd !== -1 && htmlEnd > htmlStart) {
        // 成功定位：擷取從 <html 到 </html> 的純淨內容
        cleanHtml = rawText.substring(htmlStart, htmlEnd + 7).trim();
    } else {
        // 策略 C：若連標籤都沒有，則將 Markdown 符號移除後作為輸出
        cleanHtml = rawText.replace(/```html|```|`/gi, "").trim();
    }
}

// 4. 安全檢查：如果最後結果長度太短或長得不像 HTML，則輸出預防性報錯網頁
if (cleanHtml.length < 100 || cleanHtml.includes("</html> 結束的完整")) {
    cleanHtml = `
      <div style="font-family: sans-serif; padding: 20px; border: 2px solid #e74c3c; border-radius: 8px; background: #fff;">
        <h2 style="color: #e74c3c;">⚠️ AI 輸出異常 (已自動攔截鸚鵡學舌)</h2>
        <p>AI 本次未正確產出網頁代碼，僅重複了指令內容。這通常發生在預覽版模型 (2.5-flash) 邏輯混亂時。</p>
        <hr style="border:0; border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #666;">原始輸出片段預覽：${rawText.substring(0, 300)}...</p>
      </div>
    `;
}

// 5. 回傳整理後的結果
return [
  {
    json: {
      ...item,                // 保留 topic 等原始資料 (讓 Gmail 主旨可以引用)
      emailBody: cleanHtml,   // 🔥 給 Gmail Message 欄位使用的純淨變數
      final_text: cleanHtml   // 🔥 給 Google Drive File Content 使用的變數
    },
    // 同時產出二進位檔案，供 Google Drive「Upload」模式使用 (若需要)
    binary: {
      data: {
        data: Buffer.from(cleanHtml).toString('base64'),
        mimeType: 'text/html',
        fileExtension: 'html',
        fileName: 'AI_Daily_News.html'
      }
    }
  }
];
