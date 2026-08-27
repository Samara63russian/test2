"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import {
  loginAction,
  registerOwnerAction,
  type AuthActionState,
} from "@/app/actions/auth";

const initialState: AuthActionState = { success: false };

export function AuthScreen({ setupAvailable }: { setupAvailable: boolean }) {
  const [mode, setMode] = useState<"login" | "setup">(
    setupAvailable ? "setup" : "login",
  );
  const [showPassword, setShowPassword] = useState(false);
  const [loginState, loginFormAction, loginPending] = useActionState(
    loginAction,
    initialState,
  );
  const [setupState, setupFormAction, setupPending] = useActionState(
    registerOwnerAction,
    initialState,
  );
  const router = useRouter();
  const activeState = mode === "login" ? loginState : setupState;

  useEffect(() => {
    if (activeState.success) {
      router.refresh();
    }
  }, [activeState.success, router]);

  return (
    <main className="auth-page">
      <section className="auth-brand-panel">
        <div className="auth-brand">
          <span className="brand-symbol">С</span>
          <span>
            <strong>Север</strong>
            <small>Рабочее пространство</small>
          </span>
        </div>
        <div className="auth-presentation">
          <span className="auth-kicker">Операционный центр команды</span>
          <h1>Работа организации — в едином пространстве</h1>
          <p>
            Контролируйте задачи, сроки, проекты и загрузку команды без
            лишних переключений.
          </p>
          <div className="auth-benefits">
            <span><CheckCircle2 size={16} /> Единая картина по задачам и срокам</span>
            <span><CheckCircle2 size={16} /> Защищённое пространство организации</span>
            <span><CheckCircle2 size={16} /> Аналитика и загрузка команды</span>
          </div>
        </div>
        <div className="auth-security-note">
          <ShieldCheck size={18} />
          <span>
            <strong>Безопасность данных</strong>
            <small>Изоляция организаций и проверка прав на сервере</small>
          </span>
        </div>
      </section>

      <section className="auth-form-panel">
        <div className="auth-mobile-brand">
          <span className="brand-symbol">С</span>
          <strong>Север</strong>
        </div>
        <div className="auth-form-card">
          <span className="auth-form-icon">
            {mode === "login" ? <LockKeyhole size={21} /> : <KeyRound size={21} />}
          </span>
          <h2>
            {mode === "login"
              ? "Вход в рабочее пространство"
              : "Первичная настройка"}
          </h2>
          <p>
            {mode === "login"
              ? "Введите данные вашей учётной записи"
              : "Создайте организацию и первую учётную запись владельца"}
          </p>

          {mode === "login" ? (
            <form action={loginFormAction} className="auth-form">
              <label>
                <span>Электронная почта</span>
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@company.ru"
                  required
                />
              </label>
              <label>
                <span>Пароль</span>
                <span className="password-input">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Введите пароль"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </span>
              </label>
              {activeState.error && (
                <div className="auth-error" role="alert">{activeState.error}</div>
              )}
              <button className="auth-submit" disabled={loginPending}>
                {loginPending ? "Выполняется вход..." : "Войти"}
                {!loginPending && <ArrowRight size={16} />}
              </button>
            </form>
          ) : (
            <form action={setupFormAction} className="auth-form">
              <label>
                <span>Код первичной настройки</span>
                <input
                  name="setupToken"
                  type="password"
                  autoComplete="off"
                  placeholder="Код предоставлен администратором"
                  required
                />
              </label>
              <label>
                <span>Название организации</span>
                <input
                  name="organizationName"
                  placeholder="Например: Север Групп"
                  autoComplete="organization"
                  required
                />
              </label>
              <label>
                <span>Ваше имя</span>
                <input
                  name="name"
                  placeholder="Имя и фамилия"
                  autoComplete="name"
                  required
                />
              </label>
              <label>
                <span>Электронная почта</span>
                <input
                  name="email"
                  type="email"
                  placeholder="name@company.ru"
                  autoComplete="email"
                  required
                />
              </label>
              <div className="auth-form-grid">
                <label>
                  <span>Пароль</span>
                  <input
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Не менее 10 символов"
                    required
                  />
                </label>
                <label>
                  <span>Повторите пароль</span>
                  <input
                    name="passwordConfirm"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Повторите пароль"
                    required
                  />
                </label>
              </div>
              {activeState.error && (
                <div className="auth-error" role="alert">{activeState.error}</div>
              )}
              <button className="auth-submit" disabled={setupPending}>
                {setupPending ? "Создаём пространство..." : "Создать пространство"}
                {!setupPending && <ArrowRight size={16} />}
              </button>
            </form>
          )}

          {setupAvailable && (
            <button
              className="auth-mode-switch"
              onClick={() =>
                setMode((value) => (value === "login" ? "setup" : "login"))
              }
            >
              {mode === "login"
                ? "Настроить новое пространство"
                : "Уже есть учётная запись? Войти"}
            </button>
          )}
          <small className="auth-legal">
            Продолжая, вы подтверждаете право доступа к рабочему пространству.
          </small>
        </div>
      </section>
    </main>
  );
}
