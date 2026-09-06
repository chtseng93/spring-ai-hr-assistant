// 唯一與後端溝通的模組。所有呼叫走同源路徑，由 Vite proxy 轉給 :8087。

/** 解析回應：依 content-type 取 json 或 text；非 2xx 時 throw。 */
async function parse(res) {
  const isJson = (res.headers.get("content-type") || "").includes("application/json");
  const body = isJson ? await res.json() : await res.text();
  if (!res.ok) {
    const msg = isJson ? body.error || JSON.stringify(body) : body || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return body;
}

/** 包一層：把 fetch 的 TypeError（連線失敗）換成看得懂的訊息；遇 401 導回登入頁。 */
async function call(promise) {
  try {
    const res = await promise;
    if (res.status === 401) {
      window.location.assign("/");
      throw new Error("尚未登入或登入已過期");
    }
    return await parse(res);
  } catch (e) {
    if (e instanceof TypeError) throw new Error("無法連線後端 (localhost:8087)");
    throw e;
  }
}

/** 表單登入；帳密錯（401）時 throw，讓登入頁自己顯示錯誤（不導頁）。 */
export async function login(username, password) {
  const res = await fetch("/login", {
    method: "POST",
    body: new URLSearchParams({ username, password }),
  });
  if (!res.ok) throw new Error("帳號或密碼錯誤");
}

/** 登出：後端清 session，回 200。 */
export const logout = () => fetch("/logout", { method: "POST" });

/** 取目前登入者 { username, role }；未登入回 null（不導頁，供 AuthProvider 初次判斷）。 */
export async function getMe() {
  const res = await fetch("/api/auth/me");
  if (res.status === 401) return null;
  return parse(res);
}

export const getHealth = () => call(fetch("/health"));

export const getJobs = () => call(fetch("/api/jobs"));

/** file: 已由呼叫端確認為 PDF 的 File 物件 */
export function uploadResume(file) {
  const fd = new FormData();
  fd.append("file", file);
  return call(fetch("/api/resumes", { method: "POST", body: fd }));
}

export function matchResume(resumeId, jobId) {
  const url = `/api/resumes/${encodeURIComponent(resumeId)}/match?jobId=${encodeURIComponent(jobId)}`;
  return call(fetch(url, { method: "POST" }));
}

export function chatAgent(query, conversationId) {
  const url = `/api/ai/rag/agent?query=${encodeURIComponent(query)}&conversationId=${encodeURIComponent(conversationId)}`;
  return call(fetch(url));
}
