import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import { AuthProvider } from "./lib/auth.jsx";
import RequireRole from "./components/RequireRole.jsx";
import Layout from "./components/Layout.jsx";
import Login from "./pages/Login.jsx";
import Chat from "./pages/Chat.jsx";
import Resumes from "./pages/Resumes.jsx";
import Match from "./pages/Match.jsx";
import Settings from "./pages/Settings.jsx";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          {/* HR：業務頁 */}
          <Route element={<RequireRole role="HR" />}>
            <Route element={<Layout />}>
              <Route path="/chat" element={<Chat />} />
              <Route path="/resumes" element={<Resumes />} />
              <Route path="/match" element={<Match />} />
              {/* /retrieval：檢索測試頁尚未實作，暫時隱藏（頁面檔保留於 pages/Retrieval.jsx） */}
            </Route>
          </Route>
          {/* ADMIN：系統設定 */}
          <Route element={<RequireRole role="ADMIN" />}>
            <Route element={<Layout />}>
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>,
);
