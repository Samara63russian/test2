"use client";

import { useCallback, useEffect, useState } from "react";
import { Toaster, toast } from "sonner";
import { createTask as createTaskAction, updateTaskStatus } from "@/app/actions/tasks";
import { createProject as createProjectAction } from "@/app/actions/projects";
import { logoutAction } from "@/app/actions/auth";
import type { Project, Task, TaskStatus, ViewId } from "@/lib/types";
import type { WorkspaceData } from "@/lib/workspace-data";
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

export function WorkspaceApp({ initialData }: { initialData: WorkspaceData }) {
  const [view, setView] = useState<ViewId>("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>(initialData.tasks);
  const [projects, setProjects] = useState<Project[]>(initialData.projects);
  const { people, currentUser, organizationName } = initialData;
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

  const updateStatus = async (id: string, status: TaskStatus) => {
    const previous = tasks.find((task) => task.id === id);
    const applyStatus = (task: Task): Task => ({
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
    });
    setTasks((current) =>
      current.map((task) => (task.id === id ? applyStatus(task) : task)),
    );
    setSelectedTask((current) =>
      current?.id === id ? applyStatus(current) : current,
    );
    try {
      await updateTaskStatus({ id, status });
      toast.success(
        status === "DONE" ? "Задача выполнена" : "Статус задачи изменён",
        { description: "Изменения сохранены в рабочем пространстве." },
      );
    } catch {
      if (previous) {
        setTasks((current) =>
          current.map((task) => (task.id === id ? previous : task)),
        );
        setSelectedTask((current) =>
          current?.id === id ? previous : current,
        );
      }
      toast.error("Не удалось изменить статус", {
        description: "Проверьте подключение и попробуйте снова.",
      });
    }
  };

  const renderView = () => {
    switch (view) {
      case "overview":
        return (
          <OverviewView
            tasks={tasks}
            projects={projects}
            people={people}
            currentUser={currentUser}
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
            currentUserId={currentUser.id}
            onOpenTask={setSelectedTask}
            onCreateTask={() => setCreateTaskOpen(true)}
            onStatusChange={updateStatus}
          />
        );
      case "tasks":
        return (
          <TasksView
            tasks={tasks}
            currentUserId={currentUser.id}
            onOpenTask={setSelectedTask}
            onCreateTask={() => setCreateTaskOpen(true)}
            onStatusChange={updateStatus}
          />
        );
      case "projects":
        return (
          <ProjectsView
            projects={projects}
            onCreate={() => setCreateProjectOpen(true)}
          />
        );
      case "team":
        return <TeamView people={people} />;
      case "calendar":
        return <CalendarView tasks={tasks} onOpenTask={setSelectedTask} />;
      case "analytics":
        return (
          <AnalyticsView tasks={tasks} projects={projects} people={people} />
        );
      case "activity":
        return <ActivityView />;
      case "settings":
        return (
          <SettingsView
            organizationName={organizationName}
            currentUser={currentUser}
          />
        );
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
        organizationName={organizationName}
        currentUser={currentUser}
        onNavigate={navigate}
        onToggle={() => setSidebarCollapsed((current) => !current)}
        onMobileClose={() => setMobileMenuOpen(false)}
        onLogout={async () => {
          await logoutAction();
          window.location.assign("/");
        }}
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
        people={people}
        projects={projects}
        onClose={() => setCreateTaskOpen(false)}
        onCreate={async (values) => {
          const project = projects.find(
            (item) => item.id === values.projectId,
          );
          const assignee =
            people.find((person) => person.id === values.assigneeId) ??
            currentUser;
          try {
            const created = await createTaskAction({
              title: values.title,
              description: values.description || undefined,
              projectId: values.projectId || null,
              assigneeId: values.assigneeId || null,
              status: values.status,
              priority: values.priority,
              startDate: values.startDate || null,
              dueDate: values.dueDate || null,
              category: values.category || undefined,
              nextStep: values.nextStep || undefined,
              progress: values.status === "DONE" ? 100 : 0,
            });
            const newTask: Task = {
              id: created.id,
              title: values.title,
              description: values.description,
              project: project?.name ?? "Без проекта",
              projectColor: project?.color ?? "#7a8699",
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
              startDate:
                values.startDate || new Date().toISOString().slice(0, 10),
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
          } catch {
            toast.error("Не удалось создать задачу", {
              description: "Проверьте данные и попробуйте снова.",
            });
            throw new Error("Не удалось создать задачу");
          }
        }}
      />
      <CreateProjectDialog
        open={createProjectOpen}
        people={people}
        onClose={() => setCreateProjectOpen(false)}
        onCreate={async (values) => {
          try {
            const created = await createProjectAction({
              name: values.name,
              description: values.description || undefined,
              ownerId: values.ownerId,
              dueDate: values.dueDate || null,
              status: "ACTIVE",
              progress: 0,
            });
            const owner =
              people.find((person) => person.id === values.ownerId) ??
              currentUser;
            setProjects((current) => [
              {
                id: created.id,
                name: created.name,
                description: created.description ?? "Описание пока не добавлено",
                color: created.color,
                owner,
                members: [owner],
                progress: created.progress,
                tasks: 0,
                overdue: 0,
                dueDate:
                  created.dueDate?.toISOString() ??
                  new Date(Date.now() + 30 * 86400000).toISOString(),
                state: "ON_TRACK",
              },
              ...current,
            ]);
            setCreateProjectOpen(false);
            toast.success("Проект создан", {
              description: "Новый проект добавлен в портфель.",
            });
          } catch {
            toast.error("Не удалось создать проект", {
              description: "Проверьте данные и попробуйте снова.",
            });
            throw new Error("Не удалось создать проект");
          }
        }}
      />
      <TaskDetailSheet
        task={selectedTask}
        currentUser={currentUser}
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
