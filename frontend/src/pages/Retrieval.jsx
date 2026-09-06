import { useState } from "react";

// 檢索頁：版面移植 original-design/retrieval.html <main>（header 由 Layout 提供）。
// 後端未提供向量檢索端點，全頁為示意；「檢索」按鈕僅跳提示，結果卡為設計稿範例內容。

const RESULTS = [
  {
    id: 1,
    sim: "0.92",
    source: "/candidates/resume_001.pdf",
    content:
      "在建築設計領域擁有超過10年的實務經驗。主導過多項大型商業綜合體及高端住宅項目，熟練掌握 AutoCAD, Revit, Rhino 等專業軟體。具備出色的跨部門溝通能力，能有效協調結構、機電等專業顧問團隊。在近期專案中，成功導入 BIM 技術，大幅提升設計效率並減少施工錯誤率達 30%。對於永續建築設計有深入研究，曾獲選參與多項綠建築標章申請專案。在團隊管理方面，帶領過 5-8 人的設計小組，負責專案進度控管與品質保證。對於建築法規有充分了解，能獨立完成請照圖說及相關行政流程。",
  },
  {
    id: 2,
    sim: "0.85",
    source: "/interviews/transcript_042.txt",
    content:
      "面試者提到，在上一份工作中最大的挑戰是處理預算超支的問題。他們透過重新評估材料選擇，並與供應商進行多輪談判，最終在不犧牲設計品質的前提下，將成本控制在預期範圍內。此外，對於 AI 在建築設計中的應用持開放態度，並表示願意學習相關新工具以提升工作效率。",
  },
];

function ResultCard({ r }) {
  const [expanded, setExpanded] = useState(false);
  const copy = () => navigator.clipboard?.writeText(r.content).catch(() => {});

  return (
    <div className="relative bg-surface-container-lowest border border-on-surface">
      <div className="absolute -top-3 left-4 bg-background px-2 font-headline-md text-headline-md text-primary">
        #{r.id}
      </div>
      <div className="absolute top-4 right-4 font-label-mono text-label-mono text-on-surface-variant flex gap-2">
        <span className="bg-surface-variant px-2 py-1">SIM: {r.sim}</span>
        <button onClick={copy} className="hover:text-primary transition-colors flex items-center">
          <span className="material-symbols-outlined text-[16px]">content_copy</span>
        </button>
      </div>
      <div className="p-8 pt-12">
        <div className="font-label-mono text-label-mono text-on-surface-variant mb-2 uppercase">
          Source: {r.source}
        </div>
        <div
          className={`font-body-main text-body-main text-on-surface transition-all duration-300 ${
            expanded ? "" : "line-clamp-3"
          }`}
        >
          {r.content}
        </div>
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-4 font-label-mono text-label-mono text-primary underline hover:text-on-surface transition-colors"
        >
          {expanded ? "COLLAPSE [ - ]" : "EXPAND [ + ]"}
        </button>
      </div>
    </div>
  );
}

export default function Retrieval() {
  return (
    <div className="flex flex-col w-full px-20 py-section-gap font-body-main">
      <div className="mb-8 bg-surface-variant border border-on-surface px-4 py-2 font-label-mono text-label-mono text-on-surface uppercase tracking-[0.15em]">
        此頁為示意畫面 — 後端未提供向量檢索端點
      </div>

      <div className="flex flex-col mb-16 relative z-10">
        <h1 className="font-headline-lg text-headline-lg text-on-surface uppercase tracking-tighter mb-4">
          RETRIEVAL
        </h1>
        <div className="w-full h-px bg-on-surface" />
      </div>

      <div className="flex flex-col md:flex-row gap-8 mb-section-gap relative z-10">
        <div className="flex-grow flex flex-col relative">
          <label className="font-label-mono text-label-mono text-on-surface absolute -top-3 left-0 bg-background px-1 z-10">
            QUERY
          </label>
          <input
            type="text"
            placeholder="輸入檢索關鍵字…"
            className="w-full bg-surface-container border border-on-surface p-4 font-body-main text-body-main text-on-surface focus:outline-none focus:ring-1 focus:ring-primary h-16 rounded-none"
          />
        </div>
        <div className="flex gap-4">
          <div className="flex flex-col relative w-32">
            <label className="font-label-mono text-label-mono text-on-surface absolute -top-3 left-0 bg-background px-1 z-10">
              TOP K
            </label>
            <input
              type="number"
              min="1"
              max="20"
              defaultValue="5"
              className="w-full bg-surface-container border border-on-surface p-4 font-body-main text-body-main text-on-surface focus:outline-none focus:ring-1 focus:ring-primary h-16 text-center rounded-none"
            />
          </div>
          <button
            onClick={() => window.alert("此頁為示意，後端未提供向量檢索端點")}
            className="bg-secondary-container text-on-secondary-container font-headline-md text-headline-md uppercase px-8 h-16 flex items-center justify-center hover:bg-secondary-fixed transition-colors border border-on-surface rounded-none"
          >
            檢索
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-8 w-full relative z-10">
        <div className="w-full h-px bg-on-surface/20 mb-8" />
        {RESULTS.map((r) => (
          <ResultCard key={r.id} r={r} />
        ))}
      </div>
    </div>
  );
}
