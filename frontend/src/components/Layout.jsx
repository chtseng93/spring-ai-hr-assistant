import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import NavItem from "./NavItem.jsx";
import { getHealth, logout } from "../lib/api.js";
import { useAuth } from "../lib/auth.jsx";

// 五個內頁共用外框：固定 header + 導覽 + 四角十字 + 後端連線狀態燈。
// 設計稿 header 取自 original-design/conversation.html。
export default function Layout() {
  const { user, setUser } = useAuth();
  const [online, setOnline] = useState(null); // null=檢查中, true/false

  // 登出：清後端 session + 前端狀態，回登入頁
  const onLogout = async () => {
    await logout();
    setUser(null);
    window.location.assign("/");
  };

  useEffect(() => {
    let alive = true;
    const ping = () =>
      getHealth()
        .then(() => alive && setOnline(true))
        .catch(() => alive && setOnline(false));
    ping();
    const t = setInterval(ping, 15000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  const dot =
    online === null ? "bg-on-surface/30" : online ? "bg-tertiary" : "bg-error animate-pulse";

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <div className="orange-blob -top-24 -left-24" />
      <div className="fixed top-4 left-4 z-50 text-on-surface font-headline-md">+</div>
      <div className="fixed top-4 right-4 z-50 text-on-surface font-headline-md">+</div>
      <div className="fixed bottom-4 left-4 z-50 text-on-surface font-headline-md">+</div>
      <div className="fixed bottom-4 right-4 z-50 text-on-surface font-headline-md">+</div>

      <header className="fixed top-0 left-0 w-full h-20 z-40 border-b border-on-surface/10 bg-[#E8E8E6]/80 backdrop-blur-md">
        <div className="w-full h-full px-grid-margin flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-headline-md text-on-surface tracking-tighter uppercase">誠邑建築</span>
            <span className="font-label-mono text-primary text-label-mono border border-primary px-2 py-0.5">
              AI RECRUITER
            </span>
          </div>
          <nav className="flex items-center gap-8">
            {/* 導覽列依角色顯示：HR 走業務頁、ADMIN 只有系統設定 */}
            {user?.role === "HR" && (
              <>
                <NavItem to="/chat">CHAT</NavItem>
                <NavItem to="/resumes">RESUMES</NavItem>
                <NavItem to="/match">MATCH</NavItem>
              </>
            )}
            {user?.role === "ADMIN" && <NavItem to="/settings">SETTINGS</NavItem>}
            {/* 設計稿此處為使用者頭像；改成使用者名 + 登出鈕，頭像右下角疊後端連線狀態燈 */}
            <div className="flex items-center gap-3 pl-4 border-l border-on-surface/20">
              <div
                className="relative"
                title={online === null ? "檢查後端連線中…" : online ? "後端連線正常" : "後端離線"}
              >
                <div className="w-8 h-8 rounded-full border border-on-surface bg-surface-variant flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
                    {user?.role === "ADMIN" ? "admin_panel_settings" : "badge"}
                  </span>
                </div>
                <span
                  className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#E8E8E6] ${dot}`}
                />
              </div>
              {user && (
                <>
                  <span className="font-label-mono text-on-surface uppercase tracking-widest">
                    {user.username}
                  </span>
                  <button
                    type="button"
                    onClick={onLogout}
                    className="font-label-mono text-on-surface-variant uppercase tracking-widest hover:text-primary transition-colors"
                  >
                    登出
                  </button>
                </>
              )}
            </div>
          </nav>
        </div>
      </header>

      <main className="relative pt-20 w-full min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
