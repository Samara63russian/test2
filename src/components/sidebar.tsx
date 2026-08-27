"use client";

import {
  Activity,
  BarChart3,
  CalendarDays,
  ChevronLeft,
  CircleHelp,
  FolderKanban,
  LayoutDashboard,
  ListChecks,
  LogOut,
  PanelLeftClose,
  Settings,
  Star,
  Users,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import type { Person, ViewId } from "@/lib/types";
import { cn } from "@/lib/utils";

const primaryItems: {
  id: ViewId;
  label: string;
  icon: typeof LayoutDashboard;
  count?: number;
}[] = [
  { id: "overview", label: "Обзор", icon: LayoutDashboard },
  { id: "my-tasks", label: "Мои задачи", icon: ListChecks },
  { id: "tasks", label: "Все задачи", icon: PanelLeftClose },
  { id: "projects", label: "Проекты", icon: FolderKanban },
  { id: "team", label: "Команда", icon: Users },
  { id: "calendar", label: "Календарь", icon: CalendarDays },
  { id: "analytics", label: "Аналитика", icon: BarChart3 },
  { id: "activity", label: "Активность", icon: Activity },
];

const secondaryItems: {
  id: ViewId;
  label: string;
  icon: typeof LayoutDashboard;
}[] = [
  { id: "favorites", label: "Избранное", icon: Star },
  { id: "settings", label: "Настройки", icon: Settings },
  { id: "help", label: "Помощь", icon: CircleHelp },
];

interface SidebarProps {
  active: ViewId;
  collapsed: boolean;
  mobileOpen: boolean;
  organizationName: string;
  currentUser: Person;
  onNavigate: (view: ViewId) => void;
  onToggle: () => void;
  onMobileClose: () => void;
  onLogout: () => void;
}

export function Sidebar({
  active,
  collapsed,
  mobileOpen,
  organizationName,
  currentUser,
  onNavigate,
  onToggle,
  onMobileClose,
  onLogout,
}: SidebarProps) {
  const navigate = (view: ViewId) => {
    onNavigate(view);
    onMobileClose();
  };

  return (
    <>
      {mobileOpen && (
        <button
          className="mobile-backdrop"
          aria-label="Закрыть меню"
          onClick={onMobileClose}
        />
      )}
      <motion.aside
        className={cn(
          "sidebar",
          collapsed && "sidebar-collapsed",
          mobileOpen && "sidebar-mobile-open",
        )}
        animate={{ width: collapsed ? 76 : 248 }}
        transition={{ duration: 0.2 }}
      >
        <div className="sidebar-brand">
          <span className="brand-symbol" aria-hidden="true">
            С
          </span>
          {!collapsed && (
            <div className="brand-name">
              <strong>Север</strong>
              <span>Рабочее пространство</span>
            </div>
          )}
          <button
            className="icon-button mobile-close"
            onClick={onMobileClose}
            aria-label="Закрыть меню"
          >
            <X size={19} />
          </button>
        </div>

        <div className="organization-switcher" title={organizationName}>
          <span className="organization-logo">
            {organizationName.slice(0, 2).toLocaleUpperCase("ru-RU")}
          </span>
          {!collapsed && (
            <>
              <span className="organization-copy">
                <strong>{organizationName}</strong>
                <small>Рабочее пространство</small>
              </span>
              <span className="organization-chevron">⌄</span>
            </>
          )}
        </div>

        <nav className="sidebar-nav" aria-label="Основная навигация">
          {primaryItems.map((item) => (
            <button
              key={item.id}
              className={cn("nav-item", active === item.id && "nav-active")}
              onClick={() => navigate(item.id)}
              title={collapsed ? item.label : undefined}
            >
              <item.icon size={18} strokeWidth={1.9} />
              {!collapsed && <span>{item.label}</span>}
              {!collapsed && item.count && (
                <span className="nav-count">{item.count}</span>
              )}
            </button>
          ))}
        </nav>

        <nav className="sidebar-nav secondary-nav" aria-label="Дополнительно">
          {secondaryItems.map((item) => (
            <button
              key={item.id}
              className={cn("nav-item", active === item.id && "nav-active")}
              onClick={() => navigate(item.id)}
              title={collapsed ? item.label : undefined}
            >
              <item.icon size={18} strokeWidth={1.9} />
              {!collapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-profile">
          <span className="avatar avatar-medium" style={{ background: currentUser.color }}>
            {currentUser.initials}
          </span>
          {!collapsed && (
            <span className="profile-copy">
              <strong>{currentUser.name}</strong>
              <small>Владелец</small>
            </span>
          )}
          {!collapsed && (
            <button className="profile-logout" onClick={onLogout} aria-label="Выйти">
              <LogOut size={15} />
            </button>
          )}
        </div>

        <button
          className="sidebar-collapse"
          onClick={onToggle}
          aria-label={collapsed ? "Развернуть меню" : "Свернуть меню"}
        >
          <ChevronLeft
            size={16}
            className={collapsed ? "rotate-180" : undefined}
          />
        </button>
      </motion.aside>
    </>
  );
}
