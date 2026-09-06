// 整個瀏覽器分頁共用一個對話 ID，讓後端 /api/ai/rag/agent 的對話記憶能延續。
const KEY = "hr.conversationId";

export function conversationId() {
  let id = sessionStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(KEY, id);
  }
  return id;
}
