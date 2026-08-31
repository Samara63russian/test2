import { useEffect, useState } from 'react'
import { api } from '../api'
import type { ReferenceItem } from '../types'

export default function ReferencePage() {
  const [items, setItems] = useState<ReferenceItem[]>([])
  const [category, setCategory] = useState('')
  const [categories, setCategories] = useState<string[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.getReferenceCategories().then(setCategories).catch(console.error)
    api.getReference().then(setItems).catch(console.error)
  }, [])

  const filtered = items.filter((i) => {
    if (category && i.category !== category) return false
    if (search) {
      const s = search.toLowerCase()
      return i.title.toLowerCase().includes(s) || i.content.toLowerCase().includes(s)
    }
    return true
  })

  const grouped = filtered.reduce<Record<string, ReferenceItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {})

  return (
    <div>
      <h1 className="page-title">Справочник</h1>

      <div className="card">
        <div className="filters">
          <div className="form-group">
            <label>Категория</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">Все</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Поиск</label>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Поиск по названию или тексту..." />
          </div>
        </div>
      </div>

      {Object.entries(grouped).map(([cat, catItems]) => (
        <div key={cat} className="card">
          <h3 style={{ margin: '0 0 1rem', color: '#1e3a5f' }}>{cat}</h3>
          {catItems.map((item) => (
            <div key={item.id} style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0' }}>
              <strong>{item.title}</strong>
              <p style={{ margin: '0.5rem 0 0', color: '#475569', whiteSpace: 'pre-wrap' }}>{item.content}</p>
            </div>
          ))}
        </div>
      ))}

      {filtered.length === 0 && (
        <div className="card"><p style={{ color: '#64748b' }}>Записи не найдены</p></div>
      )}
    </div>
  )
}
