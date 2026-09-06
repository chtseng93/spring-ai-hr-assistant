import { useState } from "react";
import { Navigate } from "react-router-dom";
import { login } from "../lib/api.js";
import { useAuth, HOME } from "../lib/auth.jsx";

// 登入頁：串後端表單登入，成功後依角色導向對應首頁。
export default function Login() {
  const { user, loading, refresh } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // 已登入（含重新整理後帶著 session）→ 直接導去角色首頁
  if (!loading && user) return <Navigate to={HOME[user.role] ?? "/"} replace />;

  // 送出：呼叫 login()，成功後 refresh() 讓 AuthProvider 拿到使用者，上方判斷會接手導頁
  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(e.target.username.value, e.target.password.value);
      await refresh();
    } catch (err) {
      setError(err.message || "登入失敗");
      setBusy(false);
    }
  };

  return (
    <main className="w-full">
      <div className="flex flex-col w-full relative min-h-screen overflow-hidden text-on-surface">
        {/* Architectural Crosshairs */}
        <div className="absolute top-grid-margin left-grid-margin text-on-surface/30 font-label-mono select-none">
          +
        </div>
        <div className="absolute top-grid-margin right-grid-margin text-on-surface/30 font-label-mono select-none">
          +
        </div>
        <div className="absolute bottom-grid-margin left-grid-margin text-on-surface/30 font-label-mono select-none">
          +
        </div>
        <div className="absolute bottom-grid-margin right-grid-margin text-on-surface/30 font-label-mono select-none">
          +
        </div>
        {/* Decorative Hairlines */}
        <div className="absolute top-[20%] left-0 w-full h-[1px] bg-on-surface/10" />
        <div className="absolute left-[15%] top-0 w-[1px] h-full bg-on-surface/10" />
        {/* Massive Background Typography */}
        <div className="absolute top-0 left-0 w-full overflow-hidden pointer-events-none select-none z-0 mix-blend-multiply opacity-5">
          <h1 className="font-display-xl text-[20vw] leading-none tracking-tighter text-on-surface whitespace-nowrap -ml-[5vw]">
            SIGN IN
          </h1>
        </div>
        {/* Main Content Grid */}
        <div className="flex-1 w-full max-w-[1440px] mx-auto px-grid-margin py-grid-margin relative z-10 grid grid-cols-12 gap-gutter items-center min-h-[calc(100vh-80px)]">
          {/* Left Column: Branding & AI Visual */}
          <div className="col-span-12 lg:col-span-7 relative h-full flex flex-col justify-center items-start pt-section-gap lg:pt-0">
            {/* Overline Meta */}
            <div className="font-label-mono text-on-surface-variant uppercase tracking-widest mb-8 border-l border-on-surface pl-4">
              SYS_STATUS: ACTIVE<br />
              VER: 2.1.4 // RECRUITMENT PROTOCOL
            </div>
            <h2 className="font-headline-lg-mobile lg:font-headline-lg text-on-surface uppercase mb-4 z-20 relative mix-blend-difference text-white">
              誠邑建築<br />AI 招募助手
            </h2>
            <p className="font-body-main text-on-surface-variant max-w-md z-20">
              系統化篩選、智能媒合、數據驅動的人才決策核心。請登入以存取您的專屬控制台。
            </p>
          </div>
          {/* Right Column: Offset Login Card */}
          <div className="col-span-12 lg:col-span-4 lg:col-start-9 relative z-20 pb-section-gap lg:pb-0">
            {/* Card Decorative Crosshairs */}
            <div className="absolute -top-3 -left-3 text-on-surface font-label-mono z-30">+</div>
            <div className="absolute -bottom-3 -right-3 text-on-surface font-label-mono z-30">+</div>
            {/* Login Card */}
            <div className="bg-surface-container-lowest border border-on-surface p-8 lg:p-12 relative overflow-hidden group hover:bg-surface transition-colors duration-500">
              {/* Card Inner Hairline */}
              <div className="absolute top-0 left-0 w-2 h-full bg-primary transform origin-top scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-out" />
              <div className="flex items-center justify-between mb-12 border-b border-on-surface/20 pb-4">
                <span className="font-label-mono text-on-surface uppercase tracking-widest">
                  Authentication
                </span>
                <span className="material-symbols-outlined text-on-surface-variant text-sm">
                  fingerprint
                </span>
              </div>
              <form className="space-y-10" onSubmit={onSubmit}>
                {/* Username Input */}
                <div className="relative group/input">
                  <label
                    className="font-label-mono text-on-surface-variant uppercase tracking-widest absolute -top-5 left-0 transition-all group-focus-within/input:text-primary"
                    htmlFor="username"
                  >
                    USERNAME // 帳號
                  </label>
                  <input
                    className="w-full bg-transparent border-b border-on-surface text-on-surface font-body-main py-2 focus:outline-none focus:border-primary focus:ring-0 transition-colors placeholder:text-on-surface-variant/30"
                    id="username"
                    name="username"
                    placeholder="hr / admin"
                    required
                    type="text"
                  />
                </div>
                {/* Password Input */}
                <div className="relative group/input">
                  <label
                    className="font-label-mono text-on-surface-variant uppercase tracking-widest absolute -top-5 left-0 transition-all group-focus-within/input:text-primary"
                    htmlFor="password"
                  >
                    PASSWORD // 密碼
                  </label>
                  <input
                    className="w-full bg-transparent border-b border-on-surface text-on-surface font-body-main py-2 focus:outline-none focus:border-primary focus:ring-0 transition-colors placeholder:text-on-surface-variant/30"
                    id="password"
                    name="password"
                    placeholder="••••••••"
                    required
                    type="password"
                  />
                </div>
                <div className="flex items-center justify-between pt-4">
                  <label className="flex items-center space-x-2 cursor-pointer group-hover/checkbox">
                    <input
                      className="appearance-none w-4 h-4 border border-on-surface checked:bg-primary checked:border-primary rounded-none transition-colors relative after:content-[''] after:absolute after:hidden checked:after:block after:left-[4px] after:top-[1px] after:w-[6px] after:h-[10px] after:border-r-2 after:border-b-2 after:border-white after:rotate-45"
                      type="checkbox"
                    />
                    <span className="font-label-mono text-on-surface-variant">保持登入</span>
                  </label>
                  <a
                    className="font-label-mono text-on-surface-variant hover:text-primary transition-colors hover:underline"
                    href="#"
                  >
                    忘記密碼?
                  </a>
                </div>
                {/* 登入錯誤訊息 */}
                {error && (
                  <p className="font-label-mono text-error uppercase tracking-widest border-l-2 border-error pl-3">
                    {error}
                  </p>
                )}
                {/* Submit Button */}
                <button
                  className="w-full bg-secondary-fixed text-on-secondary-fixed font-headline-md text-xl py-4 rounded uppercase tracking-widest hover:bg-secondary-fixed-dim transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg mt-8 flex justify-center items-center group/btn relative overflow-hidden disabled:opacity-70 disabled:cursor-wait"
                  type="submit"
                  disabled={busy}
                >
                  {busy ? (
                    <>
                      <span className="material-symbols-outlined animate-spin relative z-10">
                        autorenew
                      </span>
                      <span className="relative z-10 ml-2">AUTHENTICATING...</span>
                    </>
                  ) : (
                    <>
                      <span className="relative z-10">ENTER SYSTEM</span>
                      <span className="absolute inset-0 bg-on-surface transform scale-x-0 group-hover/btn:scale-x-100 transition-transform duration-500 origin-left -z-0" />
                      <span className="relative z-10 material-symbols-outlined ml-2 group-hover/btn:text-background transition-colors duration-300">
                        arrow_forward
                      </span>
                      <span className="absolute inset-0 z-0 flex items-center justify-center opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300">
                        <span className="text-background font-headline-md text-xl uppercase tracking-widest flex items-center">
                          ENTER SYSTEM{" "}
                          <span className="material-symbols-outlined ml-2">arrow_forward</span>
                        </span>
                      </span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
        {/* Bottom Footer Meta */}
        <div className="absolute bottom-grid-margin left-0 w-full px-grid-margin flex justify-between items-end pointer-events-none z-10">
          <div className="font-label-mono text-on-surface/50 [writing-mode:vertical-rl] transform rotate-180">
            SECURE CONNECTION
          </div>
          <div className="font-label-mono text-on-surface/50 text-right">
            © 2024 CHENG YI ARCHITECTURE.<br />ALL RIGHTS RESERVED.
          </div>
        </div>
      </div>
    </main>
  );
}
