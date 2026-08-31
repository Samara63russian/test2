import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  MapPin, 
  Phone, 
  Mail, 
  User, 
  HelpCircle, 
  Users, 
  FolderPlus,
  CheckCircle,
  Shield,
  Key,
  Layers,
  Settings as SettingsIcon,
  Check,
  X
} from 'lucide-react';
import { institutionService, questionService, userService } from '../services/api';

export default function SettingsDirectory() {
  const [subTab, setSubTab] = useState('institutions'); // institutions | questions | users

  // Data states
  const [institutions, setInstitutions] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Institution Modal
  const [instModalOpen, setInstModalOpen] = useState(false);
  const [instForm, setInstForm] = useState({
    id: null,
    name: '',
    category: 'Здравоохранение',
    code: '',
    address: '',
    head_name: '',
    phone: '',
    email: '',
    is_active: true
  });

  // Question Modal
  const [qModalOpen, setQModalOpen] = useState(false);
  const [qForm, setQForm] = useState({
    id: null,
    category_id: '',
    code: '',
    text: '',
    description: '',
    question_type: 'boolean',
    options: '',
    weight: 1.0,
    is_required: true,
    is_active: true,
    order: 0
  });

  // Category Modal
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [catForm, setCatForm] = useState({ name: '', code: '', order: 0 });

  // User Modal
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [userForm, setUserForm] = useState({
    id: null,
    username: '',
    password: '',
    full_name: '',
    role: 'inspector',
    position: '',
    is_active: true
  });

  const [searchFilter, setSearchFilter] = useState('');

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [instData, catData, qData, userData] = await Promise.all([
        institutionService.getAll(),
        questionService.getCategories(),
        questionService.getAll(),
        userService.getAll()
      ]);
      setInstitutions(instData);
      setCategories(catData);
      setQuestions(qData);
      setUsers(userData);
    } catch (err) {
      console.error('Error loading settings', err);
    } finally {
      setLoading(false);
    }
  };

  // --- INSTITUTION HANDLERS ---
  const handleOpenInstModal = (inst = null) => {
    if (inst) {
      setInstForm({ ...inst });
    } else {
      setInstForm({
        id: null,
        name: '',
        category: 'Здравоохранение',
        code: '',
        address: '',
        head_name: '',
        phone: '',
        email: '',
        is_active: true
      });
    }
    setInstModalOpen(true);
  };

  const handleSaveInstitution = async (e) => {
    e.preventDefault();
    try {
      if (instForm.id) {
        await institutionService.update(instForm.id, instForm);
      } else {
        await institutionService.create(instForm);
      }
      setInstModalOpen(false);
      const updated = await institutionService.getAll();
      setInstitutions(updated);
    } catch (err) {
      alert(err.response?.data?.detail || 'Ошибка при сохранении учреждения');
    }
  };

  const handleDeleteInstitution = async (id) => {
    if (window.confirm('Удалить учреждение из справочника? Все связанные справки также будут удалены.')) {
      try {
        await institutionService.delete(id);
        setInstitutions(institutions.filter(i => i.id !== id));
      } catch (err) {
        alert('Ошибка при удалении учреждения');
      }
    }
  };

  // --- QUESTION HANDLERS ---
  const handleOpenQModal = (q = null) => {
    if (q) {
      setQForm({
        id: q.id,
        category_id: q.category_id || (categories[0]?.id || ''),
        code: q.code || '',
        text: q.text,
        description: q.description || '',
        question_type: q.question_type,
        options: Array.isArray(q.options) ? q.options.join('\n') : '',
        weight: q.weight || 1.0,
        is_required: q.is_required,
        is_active: q.is_active,
        order: q.order || 0
      });
    } else {
      setQForm({
        id: null,
        category_id: categories[0]?.id || '',
        code: '',
        text: '',
        description: '',
        question_type: 'boolean',
        options: 'Вариант 1\nВариант 2\nВариант 3',
        weight: 1.0,
        is_required: true,
        is_active: true,
        order: questions.length + 1
      });
    }
    setQModalOpen(true);
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        category_id: qForm.category_id ? Number(qForm.category_id) : null,
        code: qForm.code || null,
        text: qForm.text,
        description: qForm.description || null,
        question_type: qForm.question_type,
        options: qForm.question_type === 'choice' || qForm.question_type === 'scale'
          ? qForm.options.split('\n').map(s => s.trim()).filter(Boolean)
          : null,
        weight: Number(qForm.weight) || 1.0,
        is_required: Boolean(qForm.is_required),
        is_active: Boolean(qForm.is_active),
        order: Number(qForm.order) || 0
      };

      if (qForm.id) {
        await questionService.update(qForm.id, payload);
      } else {
        await questionService.create(payload);
      }
      setQModalOpen(false);
      const updated = await questionService.getAll();
      setQuestions(updated);
    } catch (err) {
      alert(err.response?.data?.detail || 'Ошибка при сохранении вопроса');
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (window.confirm('Удалить данный вопрос из шаблона опросного листа?')) {
      try {
        await questionService.delete(id);
        setQuestions(questions.filter(q => q.id !== id));
      } catch (err) {
        alert('Ошибка при удалении вопроса');
      }
    }
  };

  // --- CATEGORY HANDLER ---
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    try {
      await questionService.createCategory(catForm);
      setCatModalOpen(false);
      setCatForm({ name: '', code: '', order: 0 });
      const updatedCats = await questionService.getCategories();
      setCategories(updatedCats);
    } catch (err) {
      alert('Ошибка при создании категории');
    }
  };

  // --- USER HANDLERS ---
  const handleOpenUserModal = (user = null) => {
    if (user) {
      setUserForm({
        id: user.id,
        username: user.username,
        password: '',
        full_name: user.full_name,
        role: user.role,
        position: user.position || '',
        is_active: user.is_active
      });
    } else {
      setUserForm({
        id: null,
        username: '',
        password: '',
        full_name: '',
        role: 'inspector',
        position: '',
        is_active: true
      });
    }
    setUserModalOpen(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      if (userForm.id) {
        const payload = { ...userForm };
        if (!payload.password) delete payload.password;
        await userService.update(userForm.id, payload);
      } else {
        if (!userForm.password) {
          alert('Пароль обязателен для нового пользователя');
          return;
        }
        await userService.create(userForm);
      }
      setUserModalOpen(false);
      const updated = await userService.getAll();
      setUsers(updated);
    } catch (err) {
      alert(err.response?.data?.detail || 'Ошибка при сохранении пользователя');
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Удалить пользователя из системы?')) {
      try {
        await userService.delete(id);
        setUsers(users.filter(u => u.id !== id));
      } catch (err) {
        alert(err.response?.data?.detail || 'Ошибка при удалении пользователя');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub-navigation Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200/80 shadow-sm flex flex-wrap gap-2">
        <button
          onClick={() => setSubTab('institutions')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-bold transition ${
            subTab === 'institutions'
              ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Справочник учреждений ({institutions.length})</span>
        </button>

        <button
          onClick={() => setSubTab('questions')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-bold transition ${
            subTab === 'questions'
              ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Настройка вопросов и опросников ({questions.length})</span>
        </button>

        <button
          onClick={() => setSubTab('users')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-bold transition ${
            subTab === 'users'
              ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Учетные записи и доступ ({users.length})</span>
        </button>
      </div>

      {/* ---------------- 1. INSTITUTIONS TAB ---------------- */}
      {subTab === 'institutions' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <h2 className="font-bold text-slate-900 text-base">
                Реестр поднадзорных и обследуемых учреждений
              </h2>
              <p className="text-xs text-slate-500">
                Добавление новых организаций, актуализация контактных лиц, адресов и удаление устаревших.
              </p>
            </div>
            <button
              onClick={() => handleOpenInstModal()}
              className="flex items-center space-x-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Добавить учреждение</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {institutions.map((inst) => (
              <div
                key={inst.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                      {inst.category || 'Общее'}
                    </span>
                    {inst.code && (
                      <span className="text-[10px] font-bold text-slate-400">
                        КОД: {inst.code}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm leading-snug">
                    {inst.name}
                  </h3>
                  <div className="space-y-1 text-xs text-slate-500 pt-1">
                    {inst.address && (
                      <div className="flex items-start space-x-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span>{inst.address}</span>
                      </div>
                    )}
                    {inst.head_name && (
                      <div className="flex items-center space-x-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Рук.: <b>{inst.head_name}</b></span>
                      </div>
                    )}
                    {inst.phone && (
                      <div className="flex items-center space-x-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{inst.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">
                    Проверок: <b className="text-slate-700">{inst.reports_count || 0}</b>
                  </span>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleOpenInstModal(inst)}
                      className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition"
                      title="Редактировать"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteInstitution(inst.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Удалить"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------------- 2. QUESTIONS & CATEGORIES TAB ---------------- */}
      {subTab === 'questions' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <h2 className="font-bold text-slate-900 text-base">
                Конструктор вопросов и критериев опросного листа
              </h2>
              <p className="text-xs text-slate-500">
                Настройка формулировок, типов ответов (Да/Нет, шкала 1-5, варианты выбора, число), весовых коэффициентов и разделов.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCatModalOpen(true)}
                className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2.5 rounded-xl text-xs font-bold transition"
              >
                <FolderPlus className="w-4 h-4" />
                <span>Создать раздел</span>
              </button>
              <button
                onClick={() => handleOpenQModal()}
                className="flex items-center space-x-1.5 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition"
              >
                <Plus className="w-4 h-4" />
                <span>Добавить вопрос</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-100">
              {questions.map((q, idx) => (
                <div key={q.id} className="p-4 hover:bg-slate-50 flex items-start justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      {q.code && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                          {q.code}
                        </span>
                      )}
                      <span className="text-xs font-semibold text-slate-500">
                        [{q.category_name || 'Общий раздел'}]
                      </span>
                      <span className="text-xs font-medium text-slate-400">
                        Тип: <b>{q.question_type}</b> (вес: {q.weight})
                      </span>
                    </div>
                    <div className="font-bold text-slate-900 text-sm">
                      {q.text}
                    </div>
                    {q.description && (
                      <p className="text-xs text-slate-500">{q.description}</p>
                    )}
                    {q.options && q.options.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {q.options.map((opt, oIdx) => (
                          <span key={oIdx} className="px-2 py-0.5 rounded bg-slate-100 text-[10px] text-slate-600 font-medium">
                            • {opt}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      onClick={() => handleOpenQModal(q)}
                      className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition"
                      title="Редактировать"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Удалить"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ---------------- 3. USERS MANAGEMENT TAB ---------------- */}
      {subTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <h2 className="font-bold text-slate-900 text-base">
                Управление учетными записями инспекторов и аналитиков
              </h2>
              <p className="text-xs text-slate-500">
                Создание логинов и паролей, назначение прав доступа (Администратор, Инспектор, Наблюдатель) и редактирование профилей.
              </p>
            </div>
            <button
              onClick={() => handleOpenUserModal()}
              className="flex items-center space-x-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Создать пользователя</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-50 font-bold text-slate-700">
                <tr>
                  <th className="px-4 py-3">ФИО сотрудника</th>
                  <th className="px-4 py-3">Логин</th>
                  <th className="px-4 py-3">Должность</th>
                  <th className="px-4 py-3">Роль в системе</th>
                  <th className="px-4 py-3">Статус</th>
                  <th className="px-4 py-3 text-right">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3 font-bold text-slate-900">
                      {u.full_name}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-600">
                      {u.username}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {u.position || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.role === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : u.role === 'inspector'
                          ? 'bg-teal-100 text-teal-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {u.role === 'admin' ? 'Администратор' : u.role === 'inspector' ? 'Инспектор' : 'Аналитик'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center text-emerald-600 font-bold">
                        <Check className="w-3.5 h-3.5 mr-1" /> Активен
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => handleOpenUserModal(u)}
                          className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition"
                          title="Изменить пароль/роль"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {u.username !== 'admin' && (
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Удалить пользователя"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---------------- MODALS ---------------- */}

      {/* Institution Modal */}
      {instModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSaveInstitution} className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-lg text-slate-900 border-b border-slate-100 pb-2">
              {instForm.id ? 'Редактирование учреждения' : 'Новое учреждение'}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700">Наименование организации *</label>
                <input
                  type="text"
                  required
                  value={instForm.name}
                  onChange={(e) => setInstForm({ ...instForm, name: e.target.value })}
                  placeholder="ГБУЗ ГКБ №1..."
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700">Отрасль / Категория</label>
                  <select
                    value={instForm.category}
                    onChange={(e) => setInstForm({ ...instForm, category: e.target.value })}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  >
                    <option value="Здравоохранение">Здравоохранение</option>
                    <option value="Образование">Образование</option>
                    <option value="Социальная защита">Социальная защита</option>
                    <option value="Культура и спорт">Культура и спорт</option>
                    <option value="Государственные услуги">Государственные услуги</option>
                    <option value="Прочее">Прочее</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700">Внутренний код</label>
                  <input
                    type="text"
                    value={instForm.code}
                    onChange={(e) => setInstForm({ ...instForm, code: e.target.value })}
                    placeholder="ГКБ-1"
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700">Адрес местонахождения</label>
                <input
                  type="text"
                  value={instForm.address}
                  onChange={(e) => setInstForm({ ...instForm, address: e.target.value })}
                  placeholder="г. Москва, ул..."
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700">ФИО руководителя</label>
                <input
                  type="text"
                  value={instForm.head_name}
                  onChange={(e) => setInstForm({ ...instForm, head_name: e.target.value })}
                  placeholder="Иванов Иван Иванович"
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700">Телефон</label>
                  <input
                    type="text"
                    value={instForm.phone}
                    onChange={(e) => setInstForm({ ...instForm, phone: e.target.value })}
                    placeholder="+7 (495)..."
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">Email</label>
                  <input
                    type="email"
                    value={instForm.email}
                    onChange={(e) => setInstForm({ ...instForm, email: e.target.value })}
                    placeholder="org@gov.ru"
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setInstModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold hover:bg-slate-50"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold"
              >
                Сохранить
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Question Modal */}
      {qModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSaveQuestion} className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-lg text-slate-900 border-b border-slate-100 pb-2">
              {qForm.id ? 'Редактирование вопроса' : 'Новый вопрос в опросник'}
            </h3>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700">Раздел / Категория</label>
                  <select
                    value={qForm.category_id}
                    onChange={(e) => setQForm({ ...qForm, category_id: e.target.value })}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700">Код вопроса</label>
                  <input
                    type="text"
                    value={qForm.code}
                    onChange={(e) => setQForm({ ...qForm, code: e.target.value })}
                    placeholder="ПБ-01"
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700">Формулировка вопроса *</label>
                <textarea
                  required
                  rows={2}
                  value={qForm.text}
                  onChange={(e) => setQForm({ ...qForm, text: e.target.value })}
                  placeholder="Наличие и исправность..."
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                ></textarea>
              </div>

              <div>
                <label className="font-bold text-slate-700">Подсказка / Описание для инспектора</label>
                <input
                  type="text"
                  value={qForm.description}
                  onChange={(e) => setQForm({ ...qForm, description: e.target.value })}
                  placeholder="Что именно проверять..."
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700">Тип поля ответа</label>
                  <select
                    value={qForm.question_type}
                    onChange={(e) => setQForm({ ...qForm, question_type: e.target.value })}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  >
                    <option value="boolean">Да / Нет (Флаг)</option>
                    <option value="choice">Выбор из вариантов</option>
                    <option value="scale">Шкала оценки (1-5)</option>
                    <option value="number">Числовое поле</option>
                    <option value="text">Текстовое поле</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700">Весовой коэффициент</label>
                  <input
                    type="number"
                    step="0.1"
                    value={qForm.weight}
                    onChange={(e) => setQForm({ ...qForm, weight: e.target.value })}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  />
                </div>
              </div>

              {qForm.question_type === 'choice' && (
                <div>
                  <label className="font-bold text-slate-700">Варианты ответа (по одному на строке)</label>
                  <textarea
                    rows={3}
                    value={qForm.options}
                    onChange={(e) => setQForm({ ...qForm, options: e.target.value })}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  ></textarea>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setQModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold hover:bg-slate-50"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold"
              >
                Сохранить
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Category Modal */}
      {catModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSaveCategory} className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-base text-slate-900 border-b border-slate-100 pb-2">
              Новый раздел вопросов
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700">Название раздела *</label>
                <input
                  type="text"
                  required
                  value={catForm.name}
                  onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                  placeholder="Пожарная безопасность..."
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCatModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold hover:bg-slate-50"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold"
              >
                Создать
              </button>
            </div>
          </form>
        </div>
      )}

      {/* User Modal */}
      {userModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSaveUser} className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-lg text-slate-900 border-b border-slate-100 pb-2">
              {userForm.id ? 'Редактирование пользователя' : 'Новый пользователь'}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700">ФИО сотрудника *</label>
                <input
                  type="text"
                  required
                  value={userForm.full_name}
                  onChange={(e) => setUserForm({ ...userForm, full_name: e.target.value })}
                  placeholder="Смирнова Елена Сергеевна"
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700">Логин (для входа в веб и APK) *</label>
                <input
                  type="text"
                  required
                  value={userForm.username}
                  onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                  placeholder="inspector2"
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700">
                  Пароль {userForm.id ? '(оставьте пустым, если не меняется)' : '*'}
                </label>
                <input
                  type="password"
                  required={!userForm.id}
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700">Роль</label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  >
                    <option value="inspector">Инспектор</option>
                    <option value="admin">Администратор</option>
                    <option value="viewer">Аналитик (Просмотр)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700">Должность</label>
                  <input
                    type="text"
                    value={userForm.position}
                    onChange={(e) => setUserForm({ ...userForm, position: e.target.value })}
                    placeholder="Инспектор..."
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setUserModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold hover:bg-slate-50"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold"
              >
                Сохранить
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
