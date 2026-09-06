import { useRef, useState } from "react";
import { uploadResume } from "../lib/api.js";
import { list as listResumes, add as addResume } from "../lib/resumeStore.js";

// 履歷管理頁：版面移植 original-design/resume-management.html <main>。
// 動態化：上傳串 POST /api/resumes、管線由單一 stage 狀態驅動、
// DOCUMENT REPOSITORY 表格讀 localStorage（後端無履歷清單端點）。

const STEPS = ["UPLOADED", "PARSING", "CHUNKING", "VECTORIZED"];

// 依 stage 與步驟索引，算出該步驟的視覺狀態
function stepState(stage, i) {
  if (stage === "failed") return i === 0 ? "failed" : "idle";
  if (stage === "idle") return "idle";
  if (stage === "done") return "done";
  // uploading：第 1 格完成、第 2 格處理中脈動、其餘待命
  if (i === 0) return "done";
  if (i === 1) return "active";
  return "idle";
}

const BOX = {
  done: "bg-on-surface border border-on-surface",
  active: "border border-on-surface bg-secondary-fixed animate-pulse",
  failed: "border border-primary bg-primary-container",
  idle: "border border-on-surface bg-surface",
};
const LINE = {
  done: "bg-on-surface",
  active: "bg-on-surface border border-on-surface border-dashed",
  failed: "bg-primary",
  idle: "bg-on-surface/20",
};

export default function Resumes() {
  const inputRef = useRef(null);
  const [rows, setRows] = useState(listResumes());
  const [stage, setStage] = useState("idle"); // idle | uploading | done | failed
  const [error, setError] = useState("");

  // 處理單一檔案：前端先擋非 PDF，再串上傳並寫入 localStorage
  async function handleFile(file) {
    setError("");
    if (!file) return;
    if (file.type !== "application/pdf") {
      setError("只接受 PDF 檔案");
      setStage("failed");
      return;
    }
    setStage("uploading");
    try {
      const res = await uploadResume(file); // { resumeId, filename }
      setRows(addResume(res));
      setStage("done");
      setTimeout(() => setStage("idle"), 1500);
    } catch (e) {
      setError(e.message);
      setStage("failed");
    }
  }

  const onDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files?.[0]);
  };

  const pickFile = () => inputRef.current?.click();

  return (
    <div className="flex flex-col w-full relative px-grid-margin">
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        hidden
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {/* Decorative Background Elements */}
      <div className="absolute top-40 right-10 w-96 h-96 bg-secondary-fixed/20 rounded-full blur-[100px] pointer-events-none z-0" />

      {/* Hero / Header Section */}
      <div className="relative w-full pt-16 pb-24 z-10">
        <div className="relative w-full flex justify-between items-end">
          <div className="w-2/3">
            <h1 className="font-display-xl text-display-xl text-on-surface uppercase tracking-tighter -ml-8 leading-[0.8] opacity-90 overflow-hidden">
              RESU
              <br />
              MES.
            </h1>
            <h2 className="font-headline-lg text-headline-lg text-on-surface mt-4">履歷管理</h2>
          </div>
          <div className="w-1/3 flex justify-end pb-4 relative z-20">
            <button
              onClick={pickFile}
              className="bg-secondary-fixed text-on-background font-label-mono text-label-mono px-8 py-6 uppercase tracking-[0.2em] border-none hover:bg-transparent hover:text-on-surface hover:ring-1 hover:ring-on-surface transition-all whitespace-nowrap"
            >
              Upload Resumes +
            </button>
          </div>
        </div>
      </div>

      {/* Upload & Pipeline Area */}
      <div className="relative w-full border border-on-surface bg-surface mb-24 z-10 group">
        <div className="absolute -top-3 -left-3 font-headline-md text-on-surface leading-none">+</div>
        <div className="absolute -top-3 -right-3 font-headline-md text-on-surface leading-none">+</div>
        <div className="absolute -bottom-3 -left-3 font-headline-md text-on-surface leading-none">+</div>
        <div className="absolute -bottom-3 -right-3 font-headline-md text-on-surface leading-none">+</div>
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Drag & Drop Zone */}
          <div
            onClick={pickFile}
            onDrop={onDrop}
            onDragOver={(e) => e.preventDefault()}
            className="p-8 border-b lg:border-b-0 lg:border-r border-on-surface flex flex-col items-center justify-center min-h-[300px] hover:bg-surface-variant transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-on-surface text-6xl mb-6 font-light">
              upload_file
            </span>
            <span className="font-label-mono text-label-mono uppercase tracking-[0.2em] text-on-surface mb-2">
              Drag &amp; Drop Documents
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">PDF / MAX 10MB</span>
          </div>

          {/* Pipeline Tracker */}
          <div className="p-8 flex flex-col justify-center bg-surface-container-lowest">
            <div className="font-label-mono text-label-mono uppercase tracking-[0.2em] text-on-surface-variant mb-12 flex justify-between items-center">
              <span>Processing Pipeline</span>
              <span className="material-symbols-outlined text-on-surface-variant">memory</span>
            </div>
            <div className="flex flex-col gap-6 relative z-10">
              {STEPS.map((label, i) => {
                const s = stepState(stage, i);
                return (
                  <div key={label} className="flex items-center gap-6 w-full">
                    <div
                      className={`w-6 h-6 flex-shrink-0 flex items-center justify-center ${BOX[s]}`}
                    >
                      {s === "done" && (
                        <span className="material-symbols-outlined text-on-primary text-[14px]">
                          check
                        </span>
                      )}
                      {s === "failed" && (
                        <span className="material-symbols-outlined text-on-primary-container text-[14px]">
                          close
                        </span>
                      )}
                    </div>
                    <div
                      className={`font-label-mono text-label-mono uppercase w-24 flex-shrink-0 tracking-[0.1em] ${
                        s === "idle" ? "text-on-surface-variant" : "text-on-surface"
                      }`}
                    >
                      {s === "failed" && i === 0 ? "FAILED" : label}
                    </div>
                    <div className={`flex-1 h-px ${LINE[s]}`} />
                  </div>
                );
              })}
            </div>
            {error && (
              <div className="mt-8 bg-error-container text-on-error-container font-label-mono text-label-mono uppercase tracking-[0.1em] px-4 py-3 border border-error">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Document Repository */}
      <div className="w-full flex flex-col z-10 pb-24">
        <div className="flex justify-between items-end mb-8 border-b border-on-surface pb-4">
          <h3 className="font-headline-md text-headline-md text-on-surface">DOCUMENT REPOSITORY</h3>
          <span className="font-label-mono text-label-mono text-on-surface-variant uppercase tracking-[0.2em]">
            [ {rows.length} RECORDS FOUND ]
          </span>
        </div>

        <div className="hidden md:grid grid-cols-12 gap-4 border-b border-on-surface pb-2 mb-2">
          <div className="col-span-5 font-label-mono text-label-mono uppercase text-on-surface-variant tracking-[0.1em]">
            Filename
          </div>
          <div className="col-span-2 font-label-mono text-label-mono uppercase text-on-surface-variant tracking-[0.1em]">
            Candidate
          </div>
          <div className="col-span-3 font-label-mono text-label-mono uppercase text-on-surface-variant tracking-[0.1em]">
            Time
          </div>
          <div className="col-span-2 font-label-mono text-label-mono uppercase text-on-surface-variant tracking-[0.1em] text-right">
            Status
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="py-8 font-body-main text-body-main text-on-surface-variant italic">
            尚無上傳紀錄
          </div>
        ) : (
          rows.map((r) => (
            <div
              key={r.resumeId}
              className="grid grid-cols-1 md:grid-cols-12 gap-4 border-b border-on-surface/20 py-4 items-center hover:bg-surface-container transition-colors -mx-grid-margin px-grid-margin"
            >
              <div className="col-span-1 md:col-span-5 font-body-main text-body-main text-on-surface flex items-center gap-3 truncate">
                <span className="material-symbols-outlined text-on-surface-variant">description</span>
                {r.filename}
              </div>
              <div className="col-span-1 md:col-span-2 font-body-main text-body-main text-on-surface-variant italic">
                —
              </div>
              <div className="col-span-1 md:col-span-3 font-label-mono text-label-mono text-on-surface-variant">
                {r.uploadedAt}
              </div>
              <div className="col-span-1 md:col-span-2 flex md:justify-end">
                <span className="bg-on-surface text-on-primary font-label-mono text-label-mono px-3 py-1 uppercase tracking-[0.1em]">
                  已解析
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
