import { useMemo, useState } from 'react'
import {
  BookOpen,
  Building2,
  CheckCircle2,
  ClipboardList,
  MapPin,
  Search,
  ShieldCheck,
  Smartphone,
} from 'lucide-react'
import { PageHeader } from '../components/UI'
import { useData } from '../context/DataContext'

type Tab = 'guide' | 'institutions' | 'questions'

export function DirectoryPage() {
  const { institutions, questions } = useData()
  const [tab, setTab] = useState<Tab>('guide')
  const [search, setSearch] = useState('')

  const filteredInstitutions = useMemo(
    () => institutions.filter((item) => `${item.name} ${item.shortName} ${item.address}`.toLowerCase().includes(search.toLowerCase())),
    [institutions, search],
  )
  const filteredQuestions = useMemo(
    () => questions.filter((item) => `${item.text} ${item.category}`.toLowerCase().includes(search.toLowerCase())),
    [questions, search],
  )

  return (
    <div className="page directory-page">
      <PageHeader
        eyebrow="База знаний"
        title="Справочник"
        description="Инструкции, учреждения и перечень вопросов отчётной формы"
      />

      <div className="tabs">
        <button className={tab === 'guide' ? 'active' : ''} onClick={() => setTab('guide')}><BookOpen size={17} /> Как работать</button>
        <button className={tab === 'institutions' ? 'active' : ''} onClick={() => setTab('institutions')}><Building2 size={17} /> Учреждения <span>{institutions.filter((item) => item.active).length}</span></button>
        <button className={tab === 'questions' ? 'active' : ''} onClick={() => setTab('questions')}><ClipboardList size={17} /> Вопросы <span>{questions.filter((item) => item.active).length}</span></button>
      </div>

      {tab === 'guide' ? (
        <>
          <section className="guide-hero">
            <div>
              <span className="eyebrow light">Краткое руководство</span>
              <h2>От заполнения до готового документа — четыре шага</h2>
              <p>Система сохраняет единый порядок работы и помогает не пропустить обязательные сведения.</p>
            </div>
            <span className="guide-hero-icon"><ClipboardList size={46} /></span>
          </section>
          <section className="guide-grid">
            <article className="card guide-card">
              <span className="guide-number">01</span>
              <span className="guide-icon blue"><Building2 size={20} /></span>
              <h3>Выберите учреждение</h3>
              <p>На странице заполнения укажите учреждение и дату, на которую предоставляются сведения.</p>
            </article>
            <article className="card guide-card">
              <span className="guide-number">02</span>
              <span className="guide-icon violet"><ClipboardList size={20} /></span>
              <h3>Ответьте на вопросы</h3>
              <p>Переходите по разделам формы. Обязательные вопросы отмечены звёздочкой.</p>
            </article>
            <article className="card guide-card">
              <span className="guide-number">03</span>
              <span className="guide-icon amber"><Smartphone size={20} /></span>
              <h3>Работайте офлайн</h3>
              <p>На мобильном устройстве форма сохранится локально и отправится при появлении сети.</p>
            </article>
            <article className="card guide-card">
              <span className="guide-number">04</span>
              <span className="guide-icon green"><CheckCircle2 size={20} /></span>
              <h3>Скачайте документ</h3>
              <p>Откройте готовую справку на главной странице и скачайте итоговый файл DOCX.</p>
            </article>
          </section>
          <section className="card info-panel">
            <ShieldCheck size={27} />
            <div><h3>Важно помнить</h3><p>Не передавайте пароль другим сотрудникам. Черновики доступны для редактирования, а отправленные справки сохраняются в общей базе.</p></div>
          </section>
        </>
      ) : (
        <section className="card directory-list-card">
          <div className="directory-toolbar">
            <div>
              <h2>{tab === 'institutions' ? 'Перечень учреждений' : 'Вопросы формы'}</h2>
              <p>{tab === 'institutions' ? 'Действующие организации в системе' : 'Актуальная структура сводной справки'}</p>
            </div>
            <label className="input-with-icon directory-search"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Найти…" /></label>
          </div>
          {tab === 'institutions' ? (
            <div className="institution-directory-grid">
              {filteredInstitutions.map((institution) => (
                <article className={`institution-directory-item ${institution.active ? '' : 'inactive'}`} key={institution.id}>
                  <span className="directory-avatar">{institution.shortName.slice(0, 2).toUpperCase()}</span>
                  <div><h3>{institution.shortName}</h3><p>{institution.name}</p><small><MapPin size={14} /> {institution.address || 'Адрес не указан'}</small></div>
                  <span className={`status ${institution.active ? 'success' : 'draft'}`}>{institution.active ? 'Действует' : 'Отключено'}</span>
                </article>
              ))}
            </div>
          ) : (
            <div className="question-directory">
              {[...new Set(filteredQuestions.map((question) => question.category))].map((category) => (
                <section key={category}>
                  <h3>{category}</h3>
                  {filteredQuestions.filter((question) => question.category === category).map((question, index) => (
                    <div className="question-directory-item" key={question.id}>
                      <span>{index + 1}</span>
                      <div><strong>{question.text} {question.required && <b>*</b>}</strong>{question.helpText && <small>{question.helpText}</small>}</div>
                      <em>{question.type === 'select' ? 'Выбор' : question.type === 'number' ? 'Число' : question.type === 'boolean' ? 'Да / нет' : 'Текст'}</em>
                    </div>
                  ))}
                </section>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  )
}
