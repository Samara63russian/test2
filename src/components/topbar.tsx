"use client";

import {
  Bell,
  Menu,
  Moon,
  Plus,
  Search,
  Sun,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useSyncExternalStore } from "react";

interface TopbarProps {
  onMenu: () => void;
  onSearch: () => void;
  onCreateTask: () => void;
}

export function Topbar({ onMenu, onSearch, onCreateTask }: TopbarProps) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );

  return (
    <header className="topbar">
      <button className="icon-button menu-trigger" onClick={onMenu} aria-label="Меню">
        <Menu size={20} />
      </button>

      <button className="global-search" onClick={onSearch}>
        <Search size={17} />
        <span>Найти задачу, проект или сотрудника...</span>
        <kbd>⌘ K</kbd>
      </button>

      <div className="topbar-actions">
        {mounted && (
          <button
            className="icon-button theme-button"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            aria-label={
              resolvedTheme === "dark"
                ? "Включить светлую тему"
                : "Включить тёмную тему"
            }
            title={
              resolvedTheme === "dark"
                ? "Светлая тема"
                : "Тёмная тема"
            }
          >
            {resolvedTheme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        )}

        <div className="popover-anchor">
          <button
            className="icon-button notification-button"
            onClick={() => setNotificationsOpen((value) => !value)}
            aria-label="Уведомления"
            aria-expanded={notificationsOpen}
          >
            <Bell size={19} />
          </button>
          {notificationsOpen && (
            <div className="popover notification-popover">
              <div className="popover-heading">
                <div>
                  <strong>Уведомления</strong>
                  <span>Нет непрочитанных</span>
                </div>
              </div>
              <div className="notifications-empty">
                <span><Bell size={19} /></span>
                <strong>Новых уведомлений нет</strong>
                <small>Здесь появятся важные события и напоминания.</small>
              </div>
            </div>
          )}
        </div>

        <button className="primary-button create-topbar" onClick={onCreateTask}>
          <Plus size={17} />
          <span>Создать задачу</span>
        </button>
      </div>
    </header>
  );
}
