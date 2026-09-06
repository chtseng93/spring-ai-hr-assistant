import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getMe } from "./api.js";

const AuthContext = createContext(null);

// 每個角色登入後的首頁
export const HOME = { HR: "/chat", ADMIN: "/settings" };

/** 全域登入狀態：mount 時打 getMe 判斷是否已有 session。 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { username, role } 或 null
  const [loading, setLoading] = useState(true);

  // 重新向後端確認登入者（登入成功後呼叫）
  const refresh = useCallback(async () => {
    setUser(await getMe());
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <AuthContext.Provider value={{ user, loading, refresh, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
