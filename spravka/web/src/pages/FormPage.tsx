import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api, downloadWithAuth } from "../api";
import {
  loadOfflineQueue,
  removeOfflineDraft,
  upsertOfflineDraft,
  uuid,
} from "../offline";
import type { Answer, Institution, Question, Report } from "../types";

function emptyAnswers(questions: Question[]): Answer[] {
  return questions.map((q) => ({ question_id: q.id, value_text: "", option_ids: [] }));
}

export function FormPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const editId = params.get("id");

  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [institutionId, setInstitutionId] = useState("");
  const [reportDate, setReportDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [reportId, setReportId] = useState<number | null>(editId ? Number(editId) : null);
  const [clientUuid, setClientUuid] = useState(uuid());
  const [online, setOnline] = useState(navigator.onLine);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [offlinePending, setOfflinePending] = useState(0);

  const answerMap = useMemo(() => {
    const m = new Map<number, Answer>();
    answers.forEach((a) => m.set(a.question_id, a));
    return m;
  }, [answers]);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    setOfflinePending(loadOfflineQueue().filter((d) => !d.synced).length);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  useEffect(() => {
    async function init() {
      try {
        const [inst, qs] = await Promise.all([
          api.institutions.list(),
          api.questions.list(),
        ]);
        setInstitutions(inst);
        setQuestions(qs);
        if (editId) {
          const report = await api.reports.get(Number(editId));
          fillFromReport(report, qs);
        } else {
          setAnswers(emptyAnswers(qs));
          if (inst[0]) setInstitutionId(String(inst[0].id));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ошибка загрузки формы");
        const cachedQ = localStorage.getItem("spravka_questions_cache");
        const cachedI = localStorage.getItem("spravka_institutions_cache");
        if (cachedQ && cachedI) {
          const qs = JSON.parse(cachedQ) as Question[];
          const inst = JSON.parse(cachedI) as Institution[];
          setQuestions(qs);
          setInstitutions(inst);
          setAnswers(emptyAnswers(qs));
          if (inst[0]) setInstitutionId(String(inst[0].id));
        }
      }
    }
    void init();
  }, [editId]);

  useEffect(() => {
    if (questions.length) localStorage.setItem("spravka_questions_cache", JSON.stringify(questions));
    if (institutions.length)
      localStorage.setItem("spravka_institutions_cache", JSON.stringify(institutions));
  }, [questions, institutions]);

  function fillFromReport(report: Report, qs: Question[]) {
    setReportId(report.id);
    setInstitutionId(String(report.institution_id));
    setReportDate(report.report_date);
    setNotes(report.notes || "");
    setClientUuid(report.client_uuid || uuid());
    const base = emptyAnswers(qs);
    const merged = base.map((a) => {
      const found = report.answers.find((x) => x.question_id === a.question_id);
      return found
        ? { question_id: a.question_id, value_text: found.value_text, option_ids: found.option_ids }
        : a;
    });
    setAnswers(merged);
  }

  function updateAnswer(questionId: number, patch: Partial<Answer>) {
    setAnswers((prev) =>
      prev.map((a) => (a.question_id === questionId ? { ...a, ...patch } : a)),
    );
  }

  function validate(): string | null {
    if (!institutionId) return "Выберите учреждение";
    if (!reportDate) return "Укажите дату";
    for (const q of questions) {
      if (!q.required) continue;
      const a = answerMap.get(q.id);
      if (!a) return `Заполните: ${q.text}`;
      if (["single", "multi", "yesno"].includes(q.question_type)) {
        if (!a.option_ids.length) return `Выберите ответ: ${q.text}`;
      } else if (!a.value_text.trim()) {
        return `Заполните: ${q.text}`;
      }
    }
    return null;
  }

  async function save(status: "draft" | "submitted") {
    const v = validate();
    if (v && status === "submitted") {
      setError(v);
      return;
    }
    setBusy(true);
    setError("");
    setMessage("");
    const payload = {
      institution_id: Number(institutionId),
      report_date: reportDate,
      notes,
      status,
      answers,
      client_uuid: clientUuid,
    };

    if (!navigator.onLine) {
      upsertOfflineDraft({
        ...payload,
        client_uuid: clientUuid,
        saved_at: new Date().toISOString(),
        synced: false,
      });
      setOfflinePending(loadOfflineQueue().filter((d) => !d.synced).length);
      setMessage("Сохранено локально. Будет выгружено при подключении к интернету.");
      setBusy(false);
      return;
    }

    try {
      let report: Report;
      if (reportId) {
        report = await api.reports.update(reportId, payload);
      } else {
        report = await api.reports.create(payload);
        setReportId(report.id);
      }
      removeOfflineDraft(clientUuid);
      setOfflinePending(loadOfflineQueue().filter((d) => !d.synced).length);
      setMessage(status === "submitted" ? "Справка отправлена на сервер" : "Черновик сохранён");
      navigate(`/form?id=${report.id}`, { replace: true });
    } catch (err) {
      upsertOfflineDraft({
        ...payload,
        client_uuid: clientUuid,
        saved_at: new Date().toISOString(),
        synced: false,
      });
      setOfflinePending(loadOfflineQueue().filter((d) => !d.synced).length);
      setError(
        `${err instanceof Error ? err.message : "Ошибка"} — форма сохранена офлайн`,
      );
    } finally {
      setBusy(false);
    }
  }

  async function syncOffline() {
    const pending = loadOfflineQueue().filter((d) => !d.synced);
    if (!pending.length) {
      setMessage("Нет локальных форм для выгрузки");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const result = await api.reports.sync(
        pending.map((d) => ({
          institution_id: d.institution_id,
          report_date: d.report_date,
          notes: d.notes,
          status: d.status,
          answers: d.answers,
          client_uuid: d.client_uuid,
        })),
      );
      pending.forEach((d) => removeOfflineDraft(d.client_uuid));
      setOfflinePending(0);
      setMessage(
        `Выгружено: создано ${result.created.length}, обновлено ${result.updated.length}`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка синхронизации");
    } finally {
      setBusy(false);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    await save("submitted");
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h2>Заполнение формы</h2>
          <p>Быстрый ввод ответов и выгрузка на сервер</p>
        </div>
        {reportId && (
          <button
            className="btn secondary"
            onClick={() =>
              void downloadWithAuth(
                api.reports.downloadUrl(reportId, "docx"),
                `spravka_${reportId}.docx`,
              )
            }
          >
            Скачать документ
          </button>
        )}
      </div>

      {(!online || offlinePending > 0) && (
        <div className="offline-banner">
          <div>
            {!online
              ? "Нет сети — ответы сохраняются на устройстве"
              : `Локальных форм к выгрузке: ${offlinePending}`}
          </div>
          <button className="btn accent" disabled={!online || busy} onClick={() => void syncOffline()}>
            Выгрузить на сервер
          </button>
        </div>
      )}

      <form className="panel stack" onSubmit={onSubmit}>
        {error && <div className="error">{error}</div>}
        {message && <div className="success">{message}</div>}

        <div className="grid-2">
          <div className="field">
            <label>Учреждение</label>
            <select
              value={institutionId}
              onChange={(e) => setInstitutionId(e.target.value)}
              required
            >
              <option value="">Выберите…</option>
              {institutions.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Дата справки</label>
            <input
              type="date"
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
              required
            />
          </div>
        </div>

        {questions.map((q, idx) => {
          const a = answerMap.get(q.id) || {
            question_id: q.id,
            value_text: "",
            option_ids: [],
          };
          return (
            <div className="question-block" key={q.id}>
              <h4>
                {idx + 1}. {q.text}
                {q.required ? " *" : ""}
              </h4>
              {q.help_text && <div className="help">{q.help_text}</div>}

              {(q.question_type === "single" || q.question_type === "yesno") && (
                <div className="options">
                  {q.options.map((opt) => (
                    <label key={opt.id}>
                      <input
                        type="radio"
                        name={`q-${q.id}`}
                        checked={a.option_ids.includes(opt.id)}
                        onChange={() => updateAnswer(q.id, { option_ids: [opt.id] })}
                      />
                      {opt.text}
                    </label>
                  ))}
                </div>
              )}

              {q.question_type === "multi" && (
                <div className="options">
                  {q.options.map((opt) => {
                    const checked = a.option_ids.includes(opt.id);
                    return (
                      <label key={opt.id}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            const next = checked
                              ? a.option_ids.filter((id) => id !== opt.id)
                              : [...a.option_ids, opt.id];
                            updateAnswer(q.id, { option_ids: next });
                          }}
                        />
                        {opt.text}
                      </label>
                    );
                  })}
                </div>
              )}

              {q.question_type === "text" && (
                <div className="field">
                  <textarea
                    rows={3}
                    value={a.value_text}
                    onChange={(e) => updateAnswer(q.id, { value_text: e.target.value })}
                  />
                </div>
              )}

              {q.question_type === "number" && (
                <div className="field">
                  <input
                    type="number"
                    value={a.value_text}
                    onChange={(e) => updateAnswer(q.id, { value_text: e.target.value })}
                  />
                </div>
              )}

              {q.question_type === "date" && (
                <div className="field">
                  <input
                    type="date"
                    value={a.value_text}
                    onChange={(e) => updateAnswer(q.id, { value_text: e.target.value })}
                  />
                </div>
              )}
            </div>
          );
        })}

        <div className="field">
          <label>Примечание</label>
          <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        <div className="row-actions">
          <button type="button" className="btn secondary" disabled={busy} onClick={() => void save("draft")}>
            Сохранить черновик
          </button>
          <button className="btn" disabled={busy}>
            {busy ? "Сохранение…" : "Отправить на сервер"}
          </button>
        </div>
      </form>
    </div>
  );
}
