# 前端（誠邑建築 AI 招募助手）

依 `original-design/` 六張 Tailwind HTML 設計稿產出的 React + Vite 前端，串接既有 Spring Boot 後端（後端不改）。

## 開發啟動

前置：後端 `:8087` 已啟動、PostgreSQL（docker）已啟動、Ollama 已啟動。

```powershell
cd frontend
npm install
npm run dev
```

開 http://localhost:5173/

## 說明

- 所有 `/api`、`/health` 請求由 Vite proxy 轉發到 `http://localhost:8087`（見 `vite.config.js`）；後端無 CORS 且不可改，故走同源 proxy。
- Tailwind 主題（色票 / 字型 / 字級 / spacing）原樣移植自設計稿 inline config，見 `tailwind.config.js`。

### 真串後端的功能

| 頁面 | 端點 |
|------|------|
| Resumes 上傳 | `POST /api/resumes`（multipart，PDF）|
| Match 職缺清單 | `GET /api/jobs` |
| Match 執行 | `POST /api/resumes/{id}/match?jobId=` |
| Chat | `GET /api/ai/rag/agent?query=&conversationId=`（純文字回應）|
| 連線狀態燈 | `GET /health` |

### 後端未提供、以靜態或 localStorage 降級

- Login：無認證端點，送出直接導向 `/chat`
- Retrieval / Settings：整頁示意，按鈕僅跳提示、不寫入後端
- Chat 左右側欄（文件庫 / 來源 / TRACE）：設計稿靜態內容
- 履歷清單（Resumes 表格、Match 候選人下拉）：`localStorage["hr.uploadedResumes"]` 記錄本瀏覽器上傳成功的履歷
- Match 的 Strengths/Gaps 雙欄：改為單一區塊顯示後端回傳的 `reason`

詳見 `docs/superpowers/specs/2026-08-28-frontend-original-design-design.md`。

## 測試

```powershell
cd frontend
npm test
```

Vitest（jsdom）：`src/lib/api.test.js`（7）、`src/lib/resumeStore.test.js`（4）。

## 建置

```powershell
cd frontend
npm run build
```

產物在 `frontend/dist/`。
