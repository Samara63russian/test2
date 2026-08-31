import { useState, type FormEvent } from 'react'
import { BarChart3, Building2, CheckCircle2, Eye, EyeOff, FileCheck2, ShieldCheck, WifiOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export function LoginPage() {
  const { login } = useAuth()
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('admin123')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login(username, password)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Не удалось войти')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-showcase">
        <div className="login-showcase-content">
          <div className="login-logo">
            <span className="brand-mark large"><Building2 size={29} /></span>
            <div>
              <strong>Форма Сводки</strong>
              <small>Информационная система</small>
            </div>
          </div>
          <div className="showcase-copy">
            <span className="eyebrow light">Единое рабочее пространство</span>
            <h1>Собирайте сведения.<br />Принимайте решения.</h1>
            <p>Заполнение, контроль и анализ сводных справок учреждений в одной защищённой системе.</p>
          </div>
          <div className="showcase-features">
            <div><FileCheck2 size={20} /><span><strong>Удобные формы</strong><small>Единый формат данных</small></span></div>
            <div><WifiOff size={20} /><span><strong>Работа без интернета</strong><small>Автоматическая синхронизация</small></span></div>
            <div><BarChart3 size={20} /><span><strong>Наглядная аналитика</strong><small>Показатели в реальном времени</small></span></div>
          </div>
          <div className="showcase-security"><ShieldCheck size={16} /> Данные защищены и доступны только авторизованным пользователям</div>
        </div>
        <div className="showcase-orb orb-one" />
        <div className="showcase-orb orb-two" />
      </section>

      <section className="login-panel">
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-form-heading">
            <span className="mobile-login-logo brand-mark"><Building2 size={22} /></span>
            <h2>Добро пожаловать</h2>
            <p>Введите данные учётной записи для входа</p>
          </div>
          {error && <div className="form-alert">{error}</div>}
          <label className="field">
            <span>Логин</span>
            <input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" placeholder="Ваш логин" required />
          </label>
          <label className="field">
            <span>Пароль</span>
            <span className="password-field">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                placeholder="Ваш пароль"
                required
              />
              <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </span>
          </label>
          <button className="button primary login-button" type="submit" disabled={loading}>
            {loading ? 'Выполняется вход…' : 'Войти в систему'}
          </button>
          <div className="demo-access">
            <span>Демонстрационный доступ</span>
            <button type="button" onClick={() => { setUsername('admin'); setPassword('admin123') }}>
              <CheckCircle2 size={14} /> Администратор
            </button>
            <button type="button" onClick={() => { setUsername('specialist'); setPassword('demo123') }}>
              Специалист
            </button>
          </div>
        </form>
        <footer>© 2026 Форма Сводки · Версия 1.0</footer>
      </section>
    </main>
  )
}
