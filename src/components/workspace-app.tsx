"use client";

import { useCallback, useEffect, useState } from "react";
import { Toaster, toast } from "sonner";
import { initialTasks, people, projects } from "@/lib/demo-data";
import type { Task, TaskStatus, ViewId } from "@/lib/types";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { OverviewView } from "./overview-view";
import { TasksView } from "./tasks-view";
import {
  ActivityView,
  AnalyticsView,
  CalendarView,
  PlaceholderView,
  ProjectsView,
  SettingsView,
  TeamView,
} from "./secondary-views";
import {
  CommandPalette,
  CreateProjectDialog,
  CreateTaskDialog,
  TaskDetailSheet,
} from "./overlays";

export function WorkspaceApp() {
  const [view, setView] = useState<ViewId>("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);

  const navigate = useCallback((nextView: ViewId) => {
    setView(nextView);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const handleKeyboard = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen((current) => !current);
      }
      if (event.key === "Escape") {
        setCommandOpen(false);
        setCreateTaskOpen(false);
        setCreateProjectOpen(false);
        setSelectedTask(null);
      }
    };
    window.addEventListener("keydown", handleKeyboard);
    return () => window.removeEventListener("keydown", handleKeyboard);
  }, []);

  const updateStatus = (id: string, status: TaskStatus) => {
    setTasks((current) =>
      current.map((task) =>
        task.id === id
          ? {
              ...task,
              status,
              state:
                status === "DONE"
                  ? "DONE"
                  : status === "BLOCKED"
                    ? "BLOCKED"
                    : task.state === "DONE" || task.state === "BLOCKED"
                      ? "ON_TRACK"
                      : task.state,
              progress: status === "DONE" ? 100 : task.progress,
              updatedAt: "только что",
            }
          : task,
      ),
    );
    setSelectedTask((current) =>
      current?.id === id
        ? {
            ...current,
            status,
            state:
              status === "DONE"
                ? "DONE"
                : status === "BLOCKED"
                  ? "BLOCKED"
                  : current.state === "DONE" || current.state === "BLOCKED"
                    ? "ON_TRACK"
                    : current.state,
            progress: status === "DONE" ? 100 : current.progress,
          }
        : current,
    );
    toast.success(
      status === "DONE" ? "Задача выполнена" : "Статус задачи изменён",
      { description: "Изменения сохранены в рабочем пространстве." },
    );
  };

  const renderView = () => {
    switch (view) {
      case "overview":
        return (
          <OverviewView
            onOpenTask={setSelectedTask}
            onNavigate={navigate}
            onCreateTask={() => setCreateTaskOpen(true)}
          />
        );
      case "my-tasks":
        return (
          <TasksView
            tasks={tasks}
            mode="mine"
            onOpenTask={setSelectedTask}
            onCreateTask={() => setCreateTaskOpen(true)}
            onStatusChange={updateStatus}
          />
        );
      case "tasks":
        return (
          <TasksView
            tasks={tasks}
            onOpenTask={setSelectedTask}
            onCreateTask={() => setCreateTaskOpen(true)}
            onStatusChange={updateStatus}
          />
        );
      case "projects":
        return <ProjectsView onCreate={() => setCreateProjectOpen(true)} />;
      case "team":
        return <TeamView />;
      case "calendar":
        return <CalendarView tasks={tasks} onOpenTask={setSelectedTask} />;
      case "analytics":
        return <AnalyticsView />;
      case "activity":
        return <ActivityView />;
      case "settings":
        return <SettingsView />;
      case "favorites":
      case "help":
        return <PlaceholderView view={view} onNavigate={navigate} />;
    }
  };

  return (
    <div className="app-shell">
      <Sidebar
        active={view}
        collapsed={sidebarCollapsed}
        mobileOpen={mobileMenuOpen}
        onNavigate={navigate}
        onToggle={() => setSidebarCollapsed((current) => !current)}
        onMobileClose={() => setMobileMenuOpen(false)}
      />
      <div className="app-main">
        <Topbar
          onMenu={() => setMobileMenuOpen(true)}
          onSearch={() => setCommandOpen(true)}
          onCreateTask={() => setCreateTaskOpen(true)}
        />
        <main>{renderView()}</main>
      </div>

      <CreateTaskDialog
        open={createTaskOpen}
        onClose={() => setCreateTaskOpen(false)}
        onCreate={(values) => {
          const project =
            projects.find((item) => item.name === values.project) || projects[0];
          const assignee =
            people.find((person) => person.id === values.assignee) || people[0];
          const newTask: Task = {
            id: `TSK-${270 + tasks.length}`,
            title: values.title,
            description: values.description,
            project: values.project,
            projectColor: project.color,
            assignee,
            status: values.status,
            priority: values.priority,
            state:
              values.status === "DONE"
                ? "DONE"
                : values.status === "BLOCKED"
                  ? "BLOCKED"
                  : "ON_TRACK",
            progress: values.status === "DONE" ? 100 : 0,
            startDate: values.startDate || "2026-08-25",
            dueDate: values.dueDate || null,
            updatedAt: "только что",
            category: values.category || "Без категории",
            comments: 0,
            nextStep: values.nextStep,
          };
          setTasks((current) => [newTask, ...current]);
          setCreateTaskOpen(false);
          toast.success("Задача успешно создана", {
            description: "Она добавлена в рабочее пространство.",
            action: {
              label: "Открыть",
              onClick: () => setSelectedTask(newTask),
            },
          });
        }}
      />
      <CreateProjectDialog
        open={createProjectOpen}
        onClose={() => {
          setCreateProjectOpen(false);
          toast.success("Проект создан", {
            description: "Новый проект добавлен в портфель.",
          });
        }}
      />
      <TaskDetailSheet
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onStatusChange={updateStatus}
      />
      <CommandPalette
        open={commandOpen}
        tasks={tasks}
        onClose={() => setCommandOpen(false)}
        onOpenTask={setSelectedTask}
        onNavigate={navigate}
        onCreateTask={() => setCreateTaskOpen(true)}
      />
      <Toaster
        position="bottom-right"
        closeButton
        toastOptions={{
          classNames: {
            toast: "app-toast",
            title: "toast-title",
            description: "toast-description",
          },
        }}
      />
    </div>
  );
}
