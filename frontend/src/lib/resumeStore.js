// 後端沒有履歷清單端點；這裡用 localStorage 記住「本瀏覽器上傳成功過的履歷」，
// 供 Resumes 表格與 Match 候選人下拉使用。非後端全量資料。
const KEY = "hr.uploadedResumes";

/** @returns {{resumeId:string, filename:string, uploadedAt:string}[]} 最新在前 */
export function list() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

/** @param {{resumeId:string, filename:string}} r  @returns 更新後的完整清單 */
export function add(r) {
  const next = [
    { resumeId: r.resumeId, filename: r.filename, uploadedAt: new Date().toISOString() },
    ...list().filter((x) => x.resumeId !== r.resumeId),
  ];
  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}
