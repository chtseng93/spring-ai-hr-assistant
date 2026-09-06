# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 專案概述


### 核心實體


### 功能範圍

### UI/UX 參考



### 開發限制
- `Design/` 資料夾內的檔案**不可修改**

## 開發環境

- **平台**：Windows 11，Shell 使用 PowerShell 7+
- **語言**：程式碼、註解、API、輸出內容、文件使用繁體中文

## 技術棧

- **後端**：Java 17 + Spring Boot 3.x + PostgreSQL 18（Docker 啟動）
- **前端**：React + Vite
- **建置工具**：後端使用 Maven；前端套件管理器使用 npm
- **資料存取**：Spring Data JPA（Hibernate）
- **Docker**：操作使用 `docker compose`（非 `docker-compose`）

### Java 路徑

- Java 17 目錄：`C:\Program Files\Java\openjdk-17.0.12`（Spring Boot 3 需 Java 17+）

## 文件規範

- 一個專案若分不同領域（前端、後端），CLAUDE.md 需在前後端目錄下分別撰寫
- 任何修改前都需要先更新文件（spec.md、api.md）
- 撰寫程式前必須充分理解規格文件內容，並將理解內容與開發者確認
- 若有後端程式需先規劃 API 文件（api.md），RESTful 風格

規格文件須包含以下內容，流程圖一律使用 mermaid 製作：

1. 架構與選型
2. 資料模型
3. 關鍵流程
4. 虛擬碼
5. 系統脈絡圖
6. 容器/部署概觀
7. 模組關係圖（Backend / Frontend）
8. 序列圖
9. ER 圖
10. 類別圖

## 專案結構規劃

### 後端原始碼結構

```
src/main/java/com/example/demo/
├── DemoApplication.java              # 主程式入口
├── controller/                       # API 控制器
│   ├── HealthController.java         # 健康檢查
│   └── ai/                           # AI 相關端點（預留）
├── service/                          # 業務邏輯
│   ├── impl/                         # 服務實作
│   └── ai/                           # AI 服務（預留）
├── model/                            # 資料模型
├── config/                           # 配置類別
│   └── AIConfig.java                 # AI 配置（預留）
└── util/                             # 工具類別
```

### 配置檔案組織

```
src/main/resources/
├── application.yml                   # 主配置
├── application-dev.yml               # 開發環境
├── application-prod.yml              # 生產環境
└── ai/                               # AI 相關配置（預留）
```

- 使用 `application.yml` + 環境變數管理 API Key
- 絕不硬編碼 API Key 在程式碼中
- 將 `.env` 檔案加入 `.gitignore`

## 程式規範

- 程式碼需有函式級別註解（註解使用中文），重要變數或物件也需加上註解
- 單一任務原則，勿過度開發
- **練習模式**：此專案為個人練習，只執行使用者明確指示的任務，不主動補完、延伸或預建未被要求的功能

## 任務管理

- 進行開發前須先進行任務拆分，任務都能獨立開發互不干擾，並將任務寫入 todolist
- 進行任務、完成任務都需要修改 todolist
- 新任務開始前都需先確認 todolist
- PR 前同步更新 `.project-memory/tasks.md`（供多人共用）

## 測試

- 任務完成前都須完成測試，測試完畢才能繼續下一任務
- PostToolUse hook 執行測試失敗時，**不需詢問使用者**，直接分析錯誤訊息、修正程式碼並重新觸發測試，持續循環直到測試通過（最多重試 3 次，超過則回報錯誤請使用者介入）

## 任務啟動協議（強制）

當開啟新任務或觸發任何技能時，必須先讀取並執行 auto-skill 技能的 SKILL.md。

## 開發輔助（superpowers）

善用 superpowers 技能輔助開發：
- 規劃新功能前 → `brainstorming`
- 動手前產出實作計畫 → `writing-plans`
- 除錯 → `systematic-debugging`
- 標記完成前 → `verification-before-completion`

## 長記憶（claude-mem）

- 全新專案首次開工、新人接手、大規模重構後 → 執行 `/learn-codebase`
- 其他情況不需手動執行，claude-mem 自動維護

## 專案記憶（多人共用）

開工前讀取：
- `.project-memory/architecture.md`
- `.project-memory/decisions.md`
- `.project-memory/tasks.md`

工作後更新：
- 任務變動 → `tasks.md`
- 技術決策 → `decisions.md`
- 踩坑經驗 → `lessons.md`
- 架構異動 → `architecture.md`
