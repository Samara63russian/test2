import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  api,
  downloadDocument,
  type Category,
  type Institution,
  type Question,
  type Report,
} from "../api";

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function FormPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const reportId = id ? Number(id) : undefined;
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [institutionId, setInstitutionId] = useState<number | "">("");
  const [reportDate, setReportDate] = useState(today());
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [status, setStatus] = useState("draft");
  const [savedId, setSavedId] = useState<number | undefined>(reportId);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [inst, cats, qs] = await Promise.all([api.institutions(), api.categories(), api.questions()]);
        setInstitutions(inst.filter((i) => i.is_active));
        setCategories(cats.filter((c) => c.is_active).sort((a, b) => a.sort_order - b.sort_order));
        setQuestions(qs.filter((q) => q.is_active));
        if (!reportId && inst.length === 1) setInstitutionId(inst[0].id);
        if (reportId) {
          const report: Report = await api.report(reportId);
          setInstitutionId(report.institution_id);
          setReportDate(report.report_date);
          setStatus(report.status);
          const map: Record<number, string> = {};
          report.answers.forEach((a) => {
            map[a.question_id] = a.value;
          });
          setAnswers(map);
          setSavedId(report.id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ошибка загрузки формы");
      } finally {
        setLoading(false);
      }
    })();
  }, [reportId]);

  const required = questions.filter((q) => q.required);
  const filled = required.filter((q) => (answers[q.id] || "").trim()).length;
  const progress = required.length ? Math.round((filled / required.length) * 100) : 100;

  const grouped = useMemo(() => {
    return categories
      .map((c) => ({
        category: c,
        questions: questions.filter((q) => q.category_id === c.id).sort((a, b) => a.sort_order - b.sort_order),
      }))
      .filter((g) => g.questions.length);
  }, [categories, questions]);

  function setAnswer(qid: number, value: string) {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  }

  async function save(nextStatus: string) {
    setError("");
    setInfo("");
    if (!institutionId) {
      setError("Выберите учреждение");
      return;
    }
    if (nextStatus === "submitted") {
      const missing = required.filter((q) => !(answers[q.id] || "").trim());
      if (missing.length) {
        setError("Заполните обязательные вопросы перед утверждением");
        return;
      }
    }
    try {
      const payload = {
        institution_id: institutionId,
        report_date: reportDate,
        status: nextStatus,
        answers: questions.map((q) => ({ question_id: q.id, value: answers[q.id] || "" })),
      };
      const saved = await api.saveReport(payload, savedId);
      setSavedId(saved.id);
      setStatus(saved.status);
      setInfo(nextStatus === "submitted" ? "Справка утверждена" : "Черновик сохранён");
      if (!reportId) nav(`/reports/${saved.id}`, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось сохранить");
    }
  }

  if (loading) return <p className="muted">Загрузка формы...</p>;

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>{savedId ? "Справка" : "Новая справка"}</h1>
          <p>Ответьте на вопросы по разделам. Итоговый документ можно скачать после сохранения.</p>
        </div>
        <div className="btn-row">
          {savedId && (
            <>
              <button className="btn ghost" onClick={() => downloadDocument(savedId, "pdf")}>
                Скачать PDF
              </button>
              <button className="btn ghost" onClick={() => downloadDocument(savedId, "docx")}>
                Скачать Word
              </button>
            </>
          )}
        </div>
      </div>

      <div className="card pad" style={{ marginBottom: 16 }}>
        <div className="filters" style={{ gridTemplateColumns: "1.6fr 1fr 1fr" }}>
          <div className="field">
            <label>Учреждение</label>
            <select value={institutionId} onChange={(e) => setInstitutionId(Number(e.target.value))}>
              <option value="">Выберите учреждение</option>
              {institutions.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Дата справки</label>
            <input type="date" value={reportDate} onChange={(e) => setReportDate(e.target.value)} />
          </div>
          <div className="field">
            <label>Заполнено обязательных</label>
            <div>
              <div className="progress">
                <div style={{ width: `${progress}%` }} />
              </div>
              <div className="muted" style={{ marginTop: 6 }}>
                {filled} из {required.length} · {status === "submitted" ? "утверждена" : "черновик"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {grouped.map((g) => (
        <div className="card pad q-block" key={g.category.id}>
          <h3>{g.category.name}</h3>
          <div className="q-grid">
            {g.questions.map((q) => {
              const wide = q.answer_type === "textarea";
              const options = q.options.split("\n").map((s) => s.trim()).filter(Boolean);
              return (
                <div className={`field ${wide ? "wide" : ""}`} key={q.id}>
                  <label>
                    {q.text}
                    {q.required ? " *" : ""}
                  </label>
                  {q.hint && <span className="muted">{q.hint}</span>}
                  {q.answer_type === "textarea" && (
                    <textarea value={answers[q.id] || ""} onChange={(e) => setAnswer(q.id, e.target.value)} />
                  )}
                  {q.answer_type === "number" && (
                    <input type="number" value={answers[q.id] || ""} onChange={(e) => setAnswer(q.id, e.target.value)} />
                  )}
                  {q.answer_type === "date" && (
                    <input type="date" value={answers[q.id] || ""} onChange={(e) => setAnswer(q.id, e.target.value)} />
                  )}
                  {q.answer_type === "select" && (
                    <select value={answers[q.id] || ""} onChange={(e) => setAnswer(q.id, e.target.value)}>
                      <option value="">Не выбрано</option>
                      {options.map((o) => (
                        <option key={o}>{o}</option>
                      ))}
                    </select>
                  )}
                  {q.answer_type === "yesno" && (
                    <div className="yesno">
                      {["Да", "Нет"].map((v) => (
                        <button
                          type="button"
                          key={v}
                          className={`btn ghost ${answers[q.id] === v ? "on" : ""}`}
                          onClick={() => setAnswer(q.id, v)}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  )}
                  {["text", ""].includes(q.answer_type) && (
                    <input value={answers[q.id] || ""} onChange={(e) => setAnswer(q.id, e.target.value)} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {error && <p className="error">{error}</p>}
      {info && <p className="muted">{info}</p>}
      <div className="btn-row">
        <button className="btn ghost" onClick={() => save("draft")}>
          Сохранить черновик
        </button>
        <button className="btn teal" onClick={() => save("submitted")}>
          Утвердить справку
        </button>
      </div>
    </div>
  );
}
