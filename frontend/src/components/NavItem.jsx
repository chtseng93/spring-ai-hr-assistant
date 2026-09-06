import { NavLink } from "react-router-dom";

// 導覽單一連結：active 時套用設計稿的 text-primary + 粗體
export default function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "font-label-mono text-label-mono tracking-[0.2em] uppercase transition-colors",
          isActive ? "text-primary font-bold" : "text-on-surface-variant hover:text-on-surface",
        ].join(" ")
      }
    >
      {children}
    </NavLink>
  );
}
