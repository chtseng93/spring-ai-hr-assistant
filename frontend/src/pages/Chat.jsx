import { useEffect, useRef, useState } from "react";
import { chatAgent } from "../lib/api.js";
import { conversationId } from "../lib/conversation.js";

// 對話頁：版面移植 original-design/conversation.html 的三欄區塊（header 由 Layout 提供）。
// 中欄串 GET /api/ai/rag/agent（純文字回應 + conversationId 對話記憶）；
// 左右欄為設計稿靜態內容（後端未提供文件庫清單 / 結構化來源）。

// 開場白：純前端靜態訊息（後端無 session 開始端點），不送出、不影響對話記憶
const GREETING =
  "您好，我是誠邑建築的 AI 招募助手。我已載入最新的「設計總監 JD」與「企業文化指南」。請問今天想進行哪方面的招募工作？需要我幫忙篩選履歷，還是草擬面試問題？";

// 把訊息陣列中最後一則 pending 換成 next；沒有則附加在尾端
function replaceLastPending(list, next) {
  const rev = [...list].reverse().findIndex((x) => x.pending);
  if (rev === -1) return [...list, next];
  const idx = list.length - 1 - rev;
  return list.map((x, k) => (k === idx ? next : x));
}

export default function Chat() {
  // {role:'user'|'assistant', text, pending?, error?}；初始只有開場白
  const [messages, setMessages] = useState([{ role: "assistant", text: GREETING }]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  // 訊息更新後自動捲到底
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    setSending(true);
    setMessages((m) => [
      ...m,
      { role: "user", text },
      { role: "assistant", text: "", pending: true },
    ]);
    try {
      const reply = await chatAgent(text, conversationId());
      // 後端偶爾回空字串（工具查無資料時 LLM 可能不產文字），給個可讀的替代訊息
      const shown = reply?.trim() ? reply : "（AI 未回覆內容，可能查無相關資料，請換個問法再試）";
      setMessages((m) => replaceLastPending(m, { role: "assistant", text: shown }));
    } catch (e) {
      setMessages((m) =>
        replaceLastPending(m, { role: "assistant", text: `回覆失敗：${e.message}`, error: true }),
      );
    } finally {
      setSending(false);
    }
  }

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="flex w-full h-[calc(100vh-80px)] overflow-hidden bg-background">
      {/* 左欄：文件庫（靜態） */}
      <aside className="hidden md:flex w-[280px] flex-shrink-0 flex-col border-r border-on-surface/10 bg-surface-container-low h-full overflow-y-auto">
        <div className="p-6 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="font-headline-md text-headline-md text-on-surface uppercase tracking-tight">
              Docs
            </h2>
            <span className="material-symbols-outlined text-primary">article</span>
          </div>
          <button
            disabled
            className="w-full py-4 bg-secondary-container text-on-secondary-container font-label-mono text-label-mono tracking-widest uppercase flex items-center justify-center gap-2 border border-on-surface opacity-60 cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-sm">upload</span>
            上傳文件
          </button>
          <p className="font-label-mono text-label-mono text-on-surface/40 tracking-[0.15em]">
            示意：後端未提供文件庫清單
          </p>
          <div className="flex flex-col gap-0 border-t border-on-surface/10 pt-4">
            <h3 className="font-label-mono text-label-mono text-on-surface/60 mb-4 tracking-[0.2em]">
              KNOWLEDGE_BASE
            </h3>
            <div className="flex flex-col gap-2">
              {[
                { name: "2024_Q3_設計總監JD.pdf", size: "1.2 MB", tag: "Indexed", icon: "check_circle", iconClass: "text-tertiary", badge: "bg-tertiary-container text-on-tertiary-container" },
                { name: "誠邑建築_企業文化指南.pdf", size: "4.5 MB", tag: "Processing", icon: "sync", iconClass: "text-primary animate-spin", badge: "bg-primary-container text-on-primary-container" },
                { name: "舊版面試題庫_2022.docx", size: "850 KB", tag: "Archived", icon: "remove_circle_outline", iconClass: "text-on-surface/40", badge: "bg-surface-variant text-on-surface-variant" },
              ].map((d) => (
                <div
                  key={d.name}
                  className="p-3 border border-on-surface bg-surface flex flex-col gap-2"
                >
                  <div className="flex justify-between items-start gap-2">
                    <span className="font-body-sm text-body-sm text-on-surface truncate font-bold">
                      {d.name}
                    </span>
                    <span className={`material-symbols-outlined text-[16px] shrink-0 ${d.iconClass}`}>
                      {d.icon}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-label-mono text-label-mono text-on-surface/50">
                      {d.size}
                    </span>
                    <span
                      className={`font-label-mono text-[9px] px-1 py-0.5 uppercase tracking-wider ${d.badge}`}
                    >
                      {d.tag}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* 中欄：對話 */}
      <div className="flex-1 min-w-0 flex flex-col relative bg-surface overflow-hidden">
        <div className="absolute top-0 left-0 w-full overflow-hidden pointer-events-none select-none z-0 opacity-5">
          <h1 className="font-display-xl text-[200px] leading-[0.8] text-on-surface whitespace-nowrap -ml-8 -mt-12 font-black tracking-tighter">
            ASSISTANT
          </h1>
        </div>

        <div className="h-16 border-b border-on-surface/10 flex items-center px-8 bg-surface/80 backdrop-blur-sm relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
            <span className="font-label-mono text-label-mono text-on-surface tracking-widest uppercase">
              Agent Active
            </span>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto p-8 flex flex-col gap-8 relative z-10">
          <div className="flex justify-center">
            <div className="bg-surface-container-high border border-on-surface/20 px-4 py-2 font-label-mono text-label-mono text-on-surface/60 text-center">
              INITIALIZING RECRUITMENT PROTOCOL v2.1
            </div>
          </div>

          {messages.map((m, i) =>
            m.role === "user" ? (
              <div key={i} className="flex gap-4 max-w-3xl self-end flex-row-reverse">
                <div className="w-10 h-10 bg-surface flex-shrink-0 flex items-center justify-center border border-on-surface">
                  <span className="material-symbols-outlined text-sm">person</span>
                </div>
                <div className="flex flex-col gap-1 w-full items-end">
                  <span className="font-label-mono text-label-mono text-on-surface/60">HR_ADMIN</span>
                  <div className="bg-surface border border-on-surface p-5 text-on-surface font-body-main text-body-main leading-relaxed whitespace-pre-wrap shadow-[4px_4px_0px_0px_rgba(28,27,27,1)]">
                    {m.text}
                  </div>
                </div>
              </div>
            ) : (
              <div key={i} className="flex gap-4 max-w-3xl">
                <div className="w-10 h-10 bg-primary flex-shrink-0 flex items-center justify-center border border-on-surface text-on-primary">
                  <span
                    className={`material-symbols-outlined text-sm ${m.pending ? "animate-spin" : ""}`}
                  >
                    {m.pending ? "sync" : "smart_toy"}
                  </span>
                </div>
                <div className="flex flex-col gap-1 w-full">
                  <span className="font-label-mono text-label-mono text-on-surface/60">
                    AI RECRUITER {m.pending ? "[PROCESSING]" : ""}
                  </span>
                  {m.pending ? (
                    <div className="bg-surface-container border border-on-surface p-5 min-h-[80px] flex items-center gap-2">
                      {[0, 150, 300].map((d) => (
                        <div
                          key={d}
                          className="w-2 h-2 bg-on-surface rounded-full animate-bounce"
                          style={{ animationDelay: `${d}ms` }}
                        />
                      ))}
                    </div>
                  ) : (
                    <div
                      className={`border p-5 font-body-main text-body-main leading-relaxed whitespace-pre-wrap shadow-[4px_4px_0px_0px_rgba(28,27,27,0.1)] ${
                        m.error
                          ? "bg-error-container border-error text-on-error-container"
                          : "bg-surface-container border-on-surface text-on-surface"
                      }`}
                    >
                      {m.text}
                    </div>
                  )}
                </div>
              </div>
            ),
          )}
        </div>

        <div className="p-6 bg-surface border-t border-on-surface/10 relative z-20">
          <div className="flex items-end gap-4 max-w-4xl mx-auto w-full">
            <div className="flex-1 bg-surface border border-on-surface focus-within:ring-1 focus-within:ring-on-surface">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                rows={2}
                placeholder="輸入訊息…（Enter 送出，Shift+Enter 換行）"
                className="w-full bg-transparent p-4 font-body-main text-body-main text-on-surface outline-none resize-none placeholder:text-on-surface/40"
              />
            </div>
            <button
              onClick={send}
              disabled={sending || !input.trim()}
              className="h-[88px] w-[88px] bg-secondary-container text-on-secondary-container border border-on-surface flex-shrink-0 flex items-center justify-center hover:bg-secondary-fixed transition-colors shadow-[4px_4px_0px_0px_rgba(28,27,27,1)] active:translate-y-1 active:translate-x-1 active:shadow-none disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[32px]">send</span>
            </button>
          </div>
        </div>
      </div>

      {/* 右欄：來源 / 追蹤（靜態） */}
      <aside className="hidden lg:flex w-[300px] flex-shrink-0 flex-col border-l border-on-surface/10 bg-surface-container-lowest h-full overflow-y-auto">
        <div className="p-6 flex flex-col gap-8">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-on-surface/20">
              <h2 className="text-xl text-on-surface font-bold tracking-tight uppercase">SOURCES</h2>
              <span className="font-label-mono text-[10px] bg-on-surface text-surface px-1">2 REFS</span>
            </div>
            <p className="font-label-mono text-label-mono text-on-surface/40 tracking-[0.15em] mb-4">
              示意：/rag/agent 僅回傳純文字，無結構化來源
            </p>
            <div className="flex flex-col gap-4">
              {[
                { doc: "2024_Q3_設計總監JD.pdf", quote: "候選人需具備十年以上跨部門協調經驗…", page: "PAGE 3" },
                { doc: "企業文化指南.pdf", quote: "面對大型建案的壓力，我們重視展現韌性與同理心的領導者…", page: "PAGE 12" },
              ].map((s) => (
                <div key={s.doc} className="border border-on-surface p-3 bg-surface">
                  <p className="font-label-mono text-label-mono text-on-surface/60 mb-1">
                    DOC: {s.doc}
                  </p>
                  <p className="font-body-sm text-body-sm text-on-surface line-clamp-3 leading-snug">
                    {s.quote}
                  </p>
                  <div className="mt-2 flex justify-end">
                    <span className="text-[10px] font-label-mono text-primary underline underline-offset-2">
                      {s.page}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-on-surface/20">
              <h2 className="text-xl text-on-surface font-bold tracking-tight uppercase">TRACE</h2>
              <span className="material-symbols-outlined text-[16px] text-on-surface/60">terminal</span>
            </div>
            <div className="relative pl-4 border-l border-on-surface/20 flex flex-col gap-4">
              {["Query Parsed", "Vector Search Executed", "Generating Response…"].map((t) => (
                <div key={t} className="relative">
                  <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 bg-surface border border-on-surface rounded-full" />
                  <div className="font-label-mono text-label-mono text-on-surface bg-surface-variant px-2 py-1 inline-block border border-on-surface/10">
                    {t}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
