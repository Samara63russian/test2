import { BookOpen, ChevronDown, FileQuestion, Search, Smartphone, Wrench } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { KnowledgeArticle } from '../types'

interface DirectoryPageProps {
  articles: KnowledgeArticle[]
}

const categoryIcons = {
  'Работа со справками': FileQuestion,
  'Мобильное приложение': Smartphone,
  'Администрирование': Wrench,
}

export function DirectoryPage({ articles }: DirectoryPageProps) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('Все разделы')
  const [openId, setOpenId] = useState<number | null>(articles[0]?.id || null)
  const categories = ['Все разделы', ...new Set(articles.map((article) => article.category))]
  const filtered = useMemo(
    () =>
      articles.filter((article) => {
        const matchesCategory = category === 'Все разделы' || article.category === category
        const haystack = `${article.title} ${article.content}`.toLowerCase()
        return matchesCategory && haystack.includes(query.trim().toLowerCase())
      }),
    [articles, category, query],
  )

  return (
    <>
      <div className="page-heading">
        <span className="eyebrow">База знаний</span>
        <h1>Справочник</h1>
        <p>Инструкции по работе с системой и ответы на частые вопросы.</p>
      </div>
      <section className="directory-hero">
        <div>
          <span><BookOpen size={26} /></span>
          <div><h2>Чем мы можем помочь?</h2><p>Найдите нужную инструкцию по ключевым словам</p></div>
        </div>
        <label className="directory-search">
          <Search size={19} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Например, «офлайн-режим»"
          />
        </label>
      </section>
      <div className="directory-layout">
        <aside className="category-list panel">
          <strong>Разделы</strong>
          {categories.map((item) => (
            <button
              key={item}
              className={category === item ? 'active' : ''}
              onClick={() => setCategory(item)}
            >
              {item}
              <span>{item === 'Все разделы' ? articles.length : articles.filter((a) => a.category === item).length}</span>
            </button>
          ))}
        </aside>
        <section className="articles-list">
          <div className="articles-caption">
            <strong>{category}</strong>
            <span>{filtered.length} материалов</span>
          </div>
          {filtered.map((article) => {
            const Icon = categoryIcons[article.category as keyof typeof categoryIcons] || BookOpen
            const isOpen = openId === article.id
            return (
              <article className={`knowledge-card panel ${isOpen ? 'open' : ''}`} key={article.id}>
                <button onClick={() => setOpenId(isOpen ? null : article.id)}>
                  <span className="article-icon"><Icon size={20} /></span>
                  <span><small>{article.category}</small><strong>{article.title}</strong></span>
                  <ChevronDown size={20} />
                </button>
                {isOpen && <p>{article.content}</p>}
              </article>
            )
          })}
          {!filtered.length && (
            <div className="empty-state panel">
              <Search size={30} />
              <strong>Ничего не найдено</strong>
              <span>Попробуйте изменить поисковый запрос.</span>
            </div>
          )}
        </section>
      </div>
    </>
  )
}
