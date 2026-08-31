import { useEffect, useState } from "react";
import { api, type Analytics } from "../api";

export default function AnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .analytics()
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : "Ошибка аналитики"));
  }, []);

  if (error) return <p className="error">{error}</p>;
  if (!data) return <p className="muted">Сбор показателей...</p>;

  const maxInst = Math.max(1, ...data.by_institution.map((x) => x.count));
  const maxMonth = Math.max(1, ...data.by_month.map((x) => x.count));

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Аналитика</h1>
          <p>Сводка по заполненным справкам, учреждениям и периодам.</p>
        </div>
      </div>
      <div className="stats">
        <div className="card stat">
          <div className="n">{data.total_reports}</div>
          <div className="k">всего справок</div>
        </div>
        <div className="card stat">
          <div className="n">{data.submitted}</div>
          <div className="k">утверждено</div>
        </div>
        <div className="card stat">
          <div className="n">{data.institutions}</div>
          <div className="k">учреждений</div>
        </div>
        <div className="card stat">
          <div className="n">{data.questions}</div>
          <div className="k">вопросов в форме</div>
        </div>
      </div>
      <div className="split">
        <div className="card pad">
          <h3>По учреждениям</h3>
          {data.by_institution.map((row) => (
            <div className="bar-row" key={row.institution_id}>
              <div>{row.name}</div>
              <div className="bar">
                <span style={{ width: `${(row.count / maxInst) * 100}%` }} />
              </div>
              <b>{row.count}</b>
            </div>
          ))}
          {data.by_institution.length === 0 && <p className="muted">Пока нет данных.</p>}
        </div>
        <div className="card pad">
          <h3>По месяцам</h3>
          {data.by_month.map((row) => (
            <div className="bar-row" key={row.month}>
              <div>{row.month}</div>
              <div className="bar">
                <span style={{ width: `${(row.count / maxMonth) * 100}%` }} />
              </div>
              <b>{row.count}</b>
            </div>
          ))}
          {data.by_month.length === 0 && <p className="muted">Пока нет данных.</p>}
        </div>
      </div>
    </div>
  );
}
