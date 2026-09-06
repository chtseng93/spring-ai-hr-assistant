import { Navigate, Outlet } from "react-router-dom";
import { useAuth, HOME } from "../lib/auth.jsx";

// 路由守衛。role: "HR" | "ADMIN"
// 未登入 → 導 /；角色不符 → 導去自己角色的首頁。
export default function RequireRole({ role }) {
  const { user, loading } = useAuth();
  if (loading) return null; // 初次載入時不閃畫面
  if (!user) return <Navigate to="/" replace />;
  if (user.role !== role) return <Navigate to={HOME[user.role] ?? "/"} replace />;
  return <Outlet />;
}
