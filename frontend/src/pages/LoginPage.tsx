import { ArrowRight, CheckCircle2, ClipboardList, Eye, EyeOff, LockKeyhole } from 'lucide-react'
import { useState, type FormEvent } from 'react'

interface LoginPageProps {
  onLogin: (username: string, password: string) => Promise<void>
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('admin123')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      await onLogin(username, password)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Не удалось войти')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-presentation">
        <div className="login-brand">
          <span><ClipboardList size={26} /></span>
          <strong>Сводка</strong>
        </div>
        <div className="presentation-copy">
          <span className="eyebrow light">Оперативная отчётность</span>
          <h1>Все данные учреждений в едином пространстве</h1>
          <p>
            Собирайте сведения, отслеживайте показатели и формируйте итоговые
            справки — на компьютере или телефоне.
          </p>
          <ul>
            <li><CheckCircle2 size={19} /> Работа без подключения к интернету</li>
            <li><CheckCircle2 size={19} /> Автоматическая сводная аналитика</li>
            <li><CheckCircle2 size={19} /> Готовые документы одним нажатием</li>
          </ul>
        </div>
        <div className="presentation-pattern" aria-hidden="true" />
        <p className="login-copyright">© 2026 Информационная система «Сводка»</p>
      </section>
      <section className="login-panel">
        <form className="login-form" onSubmit={submit}>
          <span className="login-lock"><LockKeyhole size={23} /></span>
          <h2>Добро пожаловать</h2>
          <p className="login-subtitle">Войдите в свою учётную запись</p>
          <label className="field-label" htmlFor="username">Логин</label>
          <input
            id="username"
            className="text-input"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="username"
            required
          />
          <label className="field-label" htmlFor="password">Пароль</label>
          <div className="password-field">
            <input
              id="password"
              className="text-input"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
            >
              {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
            </button>
          </div>
          {error && <div className="form-error">{error}</div>}
          <button className="primary-button login-submit" disabled={loading}>
            {loading ? 'Выполняется вход…' : 'Войти в систему'}
            {!loading && <ArrowRight size={18} />}
          </button>
          <div className="demo-hint">
            <strong>Демонстрационный доступ</strong>
            <span>Администратор: admin / admin123</span>
            <span>Оператор: operator / operator123</span>
          </div>
        </form>
      </section>
    </main>
  )
}
