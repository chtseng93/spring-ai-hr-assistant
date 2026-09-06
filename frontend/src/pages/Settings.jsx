import { useState } from "react";

// 設定頁：版面移植 original-design/system-setting.html <main>（header 由 Layout 提供）。
// 後端無設定端點；此頁不寫入，僅在欄位變更 / 按 Save 時顯示未儲存橫幅。
// Chat Model 卡改為唯讀鏡像（實際值在後端 application.properties）。

const NOTE = "唯讀鏡像：實際值在後端 application.properties，此頁不寫入";
const DEFAULT_PROMPT =
  "你是一位專業的建築業招募顧問。你的目標是透過候選人的履歷，精準匹配最適合的職位。請保持專業、客觀且具備深厚的建築專業知識。在回答時，請優先考慮候選人的專案經驗與設計風格是否與公司文化相符。";

function SaveButton({ onSave, children, className = "" }) {
  return (
    <button
      onClick={onSave}
      className={`bg-secondary-fixed text-on-background font-label-mono text-label-mono uppercase tracking-[0.2em] px-8 py-4 rounded-[6px] hover:bg-secondary-container transition-colors ${className}`}
    >
      {children}
    </button>
  );
}

export default function Settings() {
  const [dirty, setDirty] = useState(false);
  const markDirty = () => setDirty(true);

  return (
    <div className="flex flex-col w-full relative">
      {dirty && (
        <div className="bg-on-surface text-on-primary w-full px-20 py-3 flex items-center justify-between mb-12 sticky top-20 z-30">
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-[18px]">warning</span>
            <span className="font-label-mono text-label-mono tracking-widest uppercase text-secondary-fixed">
              Unsaved Changes Detected / 有未儲存的變更（此頁為示意，不會寫入後端）
            </span>
          </div>
          <button
            onClick={() => setDirty(false)}
            className="text-on-primary hover:text-secondary-fixed transition-colors font-label-mono text-label-mono uppercase tracking-widest"
          >
            Dismiss [X]
          </button>
        </div>
      )}

      <div className="relative w-full mb-16 px-20">
        <h1 className="font-headline-lg text-headline-lg text-on-surface uppercase tracking-tighter relative z-10">
          System
          <br />
          Settings
        </h1>
        <div className="font-label-mono text-label-mono text-on-surface-variant uppercase tracking-[0.2em] mt-4 pl-1 border-l-2 border-primary">
          // 系統環境與模型參數設定
        </div>
      </div>

      <div className="flex flex-col w-full px-20 gap-12 pb-24 relative z-10">
        {/* CARD 1: Chat Model（唯讀鏡像） */}
        <div className="w-full md:w-10/12 lg:w-8/12 ml-auto relative bg-surface-container-lowest border border-on-surface p-8">
          <div className="absolute -top-3 -left-3 text-on-surface font-label-mono">+</div>
          <div className="absolute -bottom-3 -right-3 text-on-surface font-label-mono">+</div>
          <div className="flex justify-between items-start mb-10 border-b border-on-surface pb-4">
            <div>
              <h2 className="font-headline-md text-headline-md text-on-surface uppercase tracking-tight">
                Chat Model
              </h2>
              <p className="font-body-main text-body-main text-on-surface-variant mt-1">對話模型設定</p>
            </div>
            <span className="bg-on-surface text-on-primary font-label-mono text-label-mono px-3 py-1 uppercase">
              Active
            </span>
          </div>
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              <label className="font-label-mono text-label-mono text-on-surface-variant uppercase tracking-widest">
                Model Selection
              </label>
              <select
                disabled
                className="w-full bg-transparent border-b border-on-surface font-body-main text-body-main text-on-surface-variant py-3 appearance-none cursor-not-allowed"
              >
                <option>Ollama qwen3.5（由 application.properties 設定）</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-end">
                <label className="font-label-mono text-label-mono text-on-surface-variant uppercase tracking-widest">
                  Temperature (Creativity)
                </label>
                <span className="font-label-mono text-label-mono text-on-surface border border-on-surface px-2 py-0.5">
                  0.7
                </span>
              </div>
              <div className="w-full h-1 bg-surface-variant relative">
                <div className="absolute left-0 top-0 h-1 bg-primary" style={{ width: "35%" }} />
              </div>
            </div>
            <p className="font-label-mono text-label-mono text-on-surface/40 tracking-[0.15em]">
              {NOTE}
            </p>
            <SaveButton onSave={markDirty} className="self-start mt-4">
              Save Configuration
            </SaveButton>
          </div>
        </div>

        {/* CARD 2: Retrieval Engine */}
        <div className="w-full md:w-9/12 relative bg-surface-container-lowest border border-on-surface p-8">
          <div className="flex justify-between items-start mb-10 border-b border-on-surface pb-4">
            <div>
              <h2 className="font-headline-md text-headline-md text-on-surface uppercase tracking-tight">
                Retrieval Engine
              </h2>
              <p className="font-body-main text-body-main text-on-surface-variant mt-1">向量檢索設定</p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex flex-col gap-2 flex-1">
              <label className="font-label-mono text-label-mono text-on-surface-variant uppercase tracking-widest">
                Embedding Model
              </label>
              <select
                onChange={markDirty}
                className="w-full bg-transparent border-b border-on-surface font-body-main text-body-main text-on-surface py-3 focus:outline-none focus:border-primary appearance-none cursor-pointer"
              >
                <option>text-embedding-3-large</option>
                <option>text-embedding-3-small</option>
                <option>cohere-multilingual-v3</option>
              </select>
            </div>
            <div className="flex flex-col gap-2 w-full md:w-48">
              <label className="font-label-mono text-label-mono text-on-surface-variant uppercase tracking-widest">
                Top K Results
              </label>
              <input
                type="number"
                min="1"
                max="20"
                defaultValue="5"
                onChange={markDirty}
                className="w-full bg-transparent border-b border-on-surface font-body-main text-body-main text-on-surface py-3 focus:outline-none focus:border-primary"
              />
            </div>
          </div>
          <SaveButton onSave={markDirty} className="self-start mt-8 block">
            Save Configuration
          </SaveButton>
        </div>

        {/* CARD 3: System Prompt */}
        <div className="w-full md:w-11/12 ml-auto relative bg-surface-container-lowest border border-on-surface p-8">
          <div className="flex justify-between items-start mb-8 border-b border-on-surface pb-4">
            <div>
              <h2 className="font-headline-md text-headline-md text-on-surface uppercase tracking-tight">
                System Prompt
              </h2>
              <p className="font-body-main text-body-main text-on-surface-variant mt-1">
                系統提示詞 (AI 招募顧問人設)
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <textarea
              rows={8}
              defaultValue={DEFAULT_PROMPT}
              onChange={markDirty}
              className="w-full bg-transparent border border-on-surface p-6 font-body-main text-body-main text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-y"
            />
            <p className="font-label-mono text-label-mono text-on-surface/40 tracking-[0.15em]">
              {NOTE}
            </p>
          </div>
          <SaveButton onSave={markDirty} className="mt-8 block ml-auto">
            Save System Prompt
          </SaveButton>
        </div>
      </div>
    </div>
  );
}
