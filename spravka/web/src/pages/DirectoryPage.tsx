import { useEffect, useState } from "react";
import { api } from "../api";
import type { Institution, Question } from "../types";

export function DirectoryPage() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [tab, setTab] = useState<"institutions" | "questions">("institutions");
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [inst, qs] = await Promise.all([
          api.institutions.list(true),
          api.questions.list(true),
        ]);
        setInstitutions(inst);
        setQuestions(qs);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ошибка загрузки справочника");
      }
    }
    void load();
  }, []);

  return (
    <div>
      <div className="page-head">
        <div>
          <h2>Справочник</h2>
          <p>Учреждения и перечень вопросов формы</p>
        </div>
      </div>

      <div className="panel">
        <div className="tabs">
          <button
            className={tab === "institutions" ? "active" : ""}
            onClick={() => setTab("institutions")}
          >
            Учреждения
          </button>
          <button
            className={tab === "questions" ? "active" : ""}
            onClick={() => setTab("questions")}
          >
            Вопросы и ответы
          </button>
        </div>

        {error && <div className="error">{error}</div>}

        {tab === "institutions" && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Код</th>
                  <th>Название</th>
                  <th>Адрес</th>
                  <th>Описание</th>
                  <th>Статус</th>
                </tr>
              </thead>
              <tbody>
                {institutions.map((i) => (
                  <tr key={i.id}>
                    <td>{i.code || "—"}</td>
                    <td>{i.name}</td>
                    <td>{i.address || "—"}</td>
                    <td>{i.description || "—"}</td>
                    <td>{i.is_active ? "Активно" : "Архив"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "questions" && (
          <div>
            {questions.map((q, idx) => (
              <div className="question-block" key={q.id}>
                <h4>
                  {idx + 1}. {q.text}
                </h4>
                <div className="help">
                  Тип: {q.question_type}
                  {q.required ? " · обязательный" : " · необязательный"}
                  {!q.is_active ? " · неактивен" : ""}
                </div>
                {q.options.length > 0 && (
                  <ul>
                    {q.options.map((o) => (
                      <li key={o.id}>{o.text}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
