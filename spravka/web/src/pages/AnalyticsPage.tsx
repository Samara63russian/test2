import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { api } from "../api";
import type { AnalyticsSummary } from "../types";

export function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .analytics()
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : "Ошибка"));
  }, []);

  return (
    <div>
      <div className="page-head">
        <div>
          <h2>Аналитика</h2>
          <p>Сводка по справкам, учреждениям и динамике заполнения</p>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      {!data ? (
        <div className="panel empty">Загрузка аналитики…</div>
      ) : (
        <>
          <div className="grid-3" style={{ marginBottom: 18 }}>
            <div className="stat">
              <span>Всего справок</span>
              <strong>{data.total_reports}</strong>
            </div>
            <div className="stat">
              <span>Отправлено</span>
              <strong>{data.submitted_reports}</strong>
            </div>
            <div className="stat">
              <span>Черновики</span>
              <strong>{data.draft_reports}</strong>
            </div>
            <div className="stat">
              <span>Учреждения</span>
              <strong>{data.institutions_count}</strong>
            </div>
            <div className="stat">
              <span>Активные вопросы</span>
              <strong>{data.questions_count}</strong>
            </div>
          </div>

          <div className="grid-2">
            <div className="panel">
              <h3 style={{ marginTop: 0, fontFamily: "var(--font-display)" }}>По учреждениям</h3>
              <div style={{ width: "100%", height: 280 }}>
                <ResponsiveContainer>
                  <BarChart data={data.by_institution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(20,32,26,0.08)" />
                    <XAxis dataKey="name" hide />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#0f5c45" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Учреждение</th>
                      <th>Справок</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.by_institution.map((row) => (
                      <tr key={row.name}>
                        <td>{row.name}</td>
                        <td>{row.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="panel">
              <h3 style={{ marginTop: 0, fontFamily: "var(--font-display)" }}>По месяцам</h3>
              <div style={{ width: "100%", height: 280 }}>
                <ResponsiveContainer>
                  <BarChart data={data.by_month}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(20,32,26,0.08)" />
                    <XAxis dataKey="month" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#c46b2d" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <h3 style={{ fontFamily: "var(--font-display)" }}>Недавние</h3>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Дата</th>
                      <th>Учреждение</th>
                      <th>Статус</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recent_reports.map((r) => (
                      <tr key={r.id}>
                        <td>{r.report_date}</td>
                        <td>{r.institution_name}</td>
                        <td>
                          <span className={`badge ${r.status}`}>
                            {r.status === "submitted" ? "Отправлена" : "Черновик"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
