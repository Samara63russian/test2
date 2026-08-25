"use client";

import {
  Bell,
  CheckCheck,
  Menu,
  Moon,
  Plus,
  Search,
  Sun,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useSyncExternalStore } from "react";
import { Avatar } from "./ui-elements";
import { people } from "@/lib/demo-data";

interface TopbarProps {
  onMenu: () => void;
  onSearch: () => void;
  onCreateTask: () => void;
}

export function Topbar({ onMenu, onSearch, onCreateTask }: TopbarProps) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [read, setRead] = useState(false);
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
            {!read && <span className="notification-dot" />}
          </button>
          {notificationsOpen && (
            <div className="popover notification-popover">
              <div className="popover-heading">
                <div>
                  <strong>Уведомления</strong>
                  <span>{read ? "Нет непрочитанных" : "3 новых"}</span>
                </div>
                <button onClick={() => setRead(true)}>
                  <CheckCheck size={15} />
                  Отметить все
                </button>
              </div>
              <div className="notification-list">
                <button className={read ? "" : "notification-unread"}>
                  <span className="notification-icon warning">!</span>
                  <span>
                    <strong>Срок задачи скоро истекает</strong>
                    <small>«Подготовить материалы к запуску» — завтра</small>
                    <time>15 минут назад</time>
                  </span>
                </button>
                <button className={read ? "" : "notification-unread"}>
                  <Avatar person={people[1]} size="small" />
                  <span>
                    <strong>Мария упомянула вас</strong>
                    <small>«Обновить коммерческое предложение»</small>
                    <time>1 час назад</time>
                  </span>
                </button>
                <button className={read ? "" : "notification-unread"}>
                  <span className="notification-icon danger">!</span>
                  <span>
                    <strong>Задача заблокирована</strong>
                    <small>«Настроить синхронизацию с CRM»</small>
                    <time>2 часа назад</time>
                  </span>
                </button>
              </div>
              <button className="popover-footer">Показать все уведомления</button>
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
