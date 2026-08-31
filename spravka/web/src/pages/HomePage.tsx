import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, downloadWithAuth } from "../api";
import type { Institution, Report } from "../types";

export function HomePage() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [institutionId, setInstitutionId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [inst, reps] = await Promise.all([
        api.institutions.list(),
        api.reports.list({
          institution_id: institutionId || undefined,
          date_from: dateFrom || undefined,
          date_to: dateTo || undefined,
        }),
      ]);
      setInstitutions(inst);
      setReports(reps);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <div className="page-head">
        <div>
          <h2>Главная</h2>
          <p>Выбор учреждения и просмотр справок по датам</p>
        </div>
        <Link className="btn" to="/form">
          Новая справка
        </Link>
      </div>

      <div className="panel">
        <div className="filters">
          <div className="field">
            <label>Учреждение</label>
            <select value={institutionId} onChange={(e) => setInstitutionId(e.target.value)}>
              <option value="">Все учреждения</option>
              {institutions.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Дата с</label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </div>
          <div className="field">
            <label>Дата по</label>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
          <div className="field">
            <label>&nbsp;</label>
            <button className="btn secondary" onClick={() => void load()}>
              Показать
            </button>
          </div>
          <div className="field">
            <label>&nbsp;</label>
            <button
              className="btn ghost"
              onClick={() =>
                void downloadWithAuth(
                  api.reports.exportBulkUrl({
                    institution_id: institutionId || undefined,
                    date_from: dateFrom || undefined,
                    date_to: dateTo || undefined,
                  }),
                  "spravki_export.xlsx",
                )
              }
            >
              Excel
            </button>
          </div>
        </div>
      </div>

      <div className="panel">
        {error && <div className="error">{error}</div>}
        {loading ? (
          <div className="empty">Загрузка…</div>
        ) : reports.length === 0 ? (
          <div className="empty">Справки не найдены. Создайте первую на вкладке «Заполнение».</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Дата</th>
                  <th>Учреждение</th>
                  <th>Статус</th>
                  <th>Автор</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r.id}>
                    <td>{r.report_date}</td>
                    <td>{r.institution_name}</td>
                    <td>
                      <span className={`badge ${r.status}`}>
                        {r.status === "submitted" ? "Отправлена" : "Черновик"}
                      </span>
                    </td>
                    <td>{r.author_name || "—"}</td>
                    <td>
                      <div className="row-actions">
                        <Link className="btn ghost" to={`/form?id=${r.id}`}>
                          Открыть
                        </Link>
                        <button
                          className="btn secondary"
                          onClick={() =>
                            void downloadWithAuth(
                              api.reports.downloadUrl(r.id, "docx"),
                              `spravka_${r.id}.docx`,
                            )
                          }
                        >
                          DOCX
                        </button>
                        <button
                          className="btn secondary"
                          onClick={() =>
                            void downloadWithAuth(
                              api.reports.downloadUrl(r.id, "xlsx"),
                              `spravka_${r.id}.xlsx`,
                            )
                          }
                        >
                          XLSX
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
