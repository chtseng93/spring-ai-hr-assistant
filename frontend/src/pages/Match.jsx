import { useEffect, useRef, useState } from "react";
import { getJobs, matchResume, uploadResume } from "../lib/api.js";
import { list as listResumes, add as addResume } from "../lib/resumeStore.js";

// 媒合頁：版面移植 original-design/match.html <main>（header 由 Layout 提供）。
// 動態化：候選人下拉讀 localStorage、職缺下拉串 GET /api/jobs、
// Run Match 串 POST /api/resumes/{id}/match。設計稿寫死的 Strengths/Gaps
// 換成單一「分析結果」區塊顯示後端回傳的 reason。

export default function Match() {
  const [jobs, setJobs] = useState([]);
  const [jobsError, setJobsError] = useState("");
  const [resumes, setResumes] = useState(listResumes());
  const [resumeId, setResumeId] = useState(listResumes()[0]?.resumeId || "");
  const [jobId, setJobId] = useState("");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null); // { score, reason }
  const [error, setError] = useState("");
  const [descOpen, setDescOpen] = useState(false);
  const uploadRef = useRef(null);

  // 載入職缺清單；失敗則記錄錯誤並停用 Run Match
  useEffect(() => {
    getJobs()
      .then((j) => {
        setJobs(j);
        setJobId((prev) => prev || j[0]?.id || "");
      })
      .catch((e) => setJobsError(e.message));
  }, []);

  // 臨時上傳一份 PDF，成功後加入下拉並自動選中
  async function onQuickUpload(file) {
    setError("");
    if (!file) return;
    if (file.type !== "application/pdf") {
      setError("只接受 PDF 檔案");
      return;
    }
    try {
      const res = await uploadResume(file);
      setResumes(addResume(res));
      setResumeId(res.resumeId);
    } catch (e) {
      setError(e.message);
    }
  }

  async function runMatch() {
    if (!resumeId || !jobId || running) return;
    setRunning(true);
    setError("");
    try {
      setResult(await matchResume(resumeId, jobId));
    } catch (e) {
      setError(e.message);
      setResult(null);
    } finally {
      setRunning(false);
    }
  }

  const selectedJob = jobs.find((j) => j.id === jobId);
  const score = result?.score ?? null;
  const barColor =
    score === null
      ? "bg-surface-variant"
      : score >= 80
        ? "bg-secondary-fixed"
        : score < 70
          ? "bg-error"
          : "bg-primary-container";
  const canRun = !!resumeId && !!jobId && !jobsError && !running;

  return (
    <div className="flex flex-col w-full px-20 py-section-gap gap-section-gap">
      {/* 選擇區 */}
      <section className="flex flex-col gap-12 relative">
        <div className="absolute -top-12 -left-12 font-headline-md text-on-surface opacity-20 pointer-events-none">
          +
        </div>
        <div className="absolute -bottom-12 -right-12 font-headline-md text-on-surface opacity-20 pointer-events-none">
          +
        </div>
        <div className="flex flex-col md:flex-row items-end gap-gutter w-full">
          {/* 候選人 */}
          <div className="flex flex-col gap-4 flex-1 relative">
            <label className="font-label-mono text-label-mono text-on-surface-variant uppercase tracking-widest">
              Select Candidate Profile
            </label>
            <div className="relative w-full border border-on-surface bg-surface-container-lowest">
              <select
                value={resumeId}
                onChange={(e) => setResumeId(e.target.value)}
                disabled={resumes.length === 0}
                className="w-full appearance-none bg-transparent font-body-main text-body-main text-on-surface py-4 px-6 outline-none rounded-none cursor-pointer disabled:cursor-not-allowed"
              >
                {resumes.length === 0 ? (
                  <option value="">尚無履歷</option>
                ) : (
                  resumes.map((r) => (
                    <option key={r.resumeId} value={r.resumeId}>
                      {r.filename}
                    </option>
                  ))
                )}
              </select>
              <span className="material-symbols-outlined absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
                expand_more
              </span>
            </div>
            {/* 絕對定位在下拉下方，不撐高整列，讓兩個下拉維持平行 */}
            <button
              onClick={() => uploadRef.current?.click()}
              className="absolute left-0 top-full mt-2 font-label-mono text-label-mono text-on-surface-variant hover:text-primary uppercase tracking-widest text-left"
            >
              + 臨時上傳 PDF
            </button>
            <input
              ref={uploadRef}
              type="file"
              accept="application/pdf"
              hidden
              onChange={(e) => onQuickUpload(e.target.files?.[0])}
            />
          </div>

          {/* 職缺 */}
          <div className="flex flex-col gap-4 flex-1">
            <label className="font-label-mono text-label-mono text-on-surface-variant uppercase tracking-widest">
              Select Target Position
            </label>
            <div className="relative w-full border border-on-surface bg-surface-container-lowest">
              <select
                value={jobId}
                onChange={(e) => setJobId(e.target.value)}
                disabled={!!jobsError || jobs.length === 0}
                className="w-full appearance-none bg-transparent font-body-main text-body-main text-on-surface py-4 px-6 outline-none rounded-none cursor-pointer disabled:cursor-not-allowed"
              >
                {jobsError ? (
                  <option value="">職缺載入失敗</option>
                ) : jobs.length === 0 ? (
                  <option value="">載入中…</option>
                ) : (
                  jobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.title}
                    </option>
                  ))
                )}
              </select>
              <span className="material-symbols-outlined absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
                expand_more
              </span>
            </div>
          </div>

          <button
            onClick={runMatch}
            disabled={!canRun}
            className="bg-secondary-fixed text-on-secondary-fixed font-headline-md text-headline-md py-4 px-12 hover:bg-on-surface hover:text-secondary-fixed transition-all duration-300 uppercase tracking-tighter shrink-0 border border-transparent disabled:bg-surface-variant disabled:text-on-surface-variant disabled:hover:bg-surface-variant disabled:hover:text-on-surface-variant disabled:cursor-not-allowed"
          >
            {running ? "ANALYZING..." : "Run Match"}
          </button>
        </div>
        {(error || jobsError) && (
          <div className="self-start bg-error-container text-on-error-container font-label-mono text-label-mono uppercase tracking-[0.1em] px-3 py-2 border border-error">
            {error || `職缺載入失敗：${jobsError}`}
          </div>
        )}
      </section>

      {/* 結果區 */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-gutter relative mt-12">
        <div className="absolute inset-x-0 -top-8 h-px bg-on-surface" />
        <div className="absolute -top-12 left-0 font-label-mono text-label-mono text-on-surface-variant bg-surface px-2">
          [SYS_MATCH_OUTPUT_01]
        </div>

        {/* 分數 */}
        <div className="col-span-1 lg:col-span-5 flex flex-col justify-start relative">
          <div className="flex flex-col gap-2 relative z-10">
            <div className="font-label-mono text-label-mono text-on-surface-variant bg-on-surface text-surface-container-lowest inline-block px-2 py-1 uppercase tracking-widest w-max mb-4">
              Match Score
            </div>
            <div className="flex items-baseline gap-4 -ml-4">
              <span className="font-display-xl text-display-xl text-on-surface tracking-tighter">
                {score ?? "--"}
              </span>
              <span className="font-headline-md text-headline-md text-on-surface-variant opacity-50">
                / 100
              </span>
            </div>
          </div>
          <div className="w-full h-px bg-surface-variant mt-8 relative">
            <div
              className={`absolute left-0 top-0 h-px transition-all duration-1000 ease-out ${barColor}`}
              style={{ width: `${score ?? 0}%` }}
            />
          </div>
        </div>

        {/* 分析結果（取代設計稿 Strengths/Gaps 雙欄） */}
        <div className="col-span-1 lg:col-span-7 flex flex-col gap-6 mt-12 lg:mt-0 pl-0 lg:pl-12 lg:border-l lg:border-on-surface/20">
          <h3 className="font-headline-md text-headline-md text-on-surface uppercase tracking-tight">
            分析結果
          </h3>
          {result ? (
            <p className="font-body-main text-body-main text-on-surface whitespace-pre-wrap leading-relaxed">
              {result.reason}
            </p>
          ) : (
            <p className="font-body-main text-body-main text-on-surface-variant italic">
              尚未執行媒合。選擇候選人與職缺後按 Run Match。
            </p>
          )}
        </div>
      </section>

      {/* 職缺說明手風琴 */}
      <section className="w-full">
        <div className="border border-on-surface bg-surface-container-lowest">
          <button
            onClick={() => setDescOpen((v) => !v)}
            className="w-full flex items-center justify-between p-6 bg-surface-variant hover:bg-surface-container-high transition-colors text-left outline-none"
          >
            <span className="font-headline-md text-headline-md text-on-surface uppercase tracking-tight">
              Job Description Details
            </span>
            <span
              className="material-symbols-outlined transition-transform duration-300"
              style={{ transform: descOpen ? "rotate(45deg)" : "rotate(0deg)" }}
            >
              add
            </span>
          </button>
          {descOpen && (
            <div className="p-8 flex flex-col gap-4">
              <span className="font-label-mono text-label-mono text-on-surface-variant uppercase">
                Position
              </span>
              <span className="font-body-main text-body-main text-on-surface font-bold">
                {selectedJob?.title || "—"}
              </span>
              <div className="w-full h-px bg-on-surface/10" />
              <p className="font-body-main text-body-main text-on-surface-variant leading-relaxed whitespace-pre-wrap">
                {selectedJob?.description || "無職缺說明"}
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
