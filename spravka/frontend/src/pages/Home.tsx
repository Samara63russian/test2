import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, downloadDocument, formatDate, statusLabel, type Institution, type Report } from "../api";

export default function Home() {
  const nav = useNavigate();
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [institutionId, setInstitutionId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  async function load() {
    setError("");
    try {
      const [inst, rows] = await Promise.all([
        api.institutions(),
        api.reports({
          institution_id: institutionId || undefined,
          date_from: dateFrom || undefined,
          date_to: dateTo || undefined,
          status: status || undefined,
        }),
      ]);
      setInstitutions(inst);
      setReports(rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка загрузки");
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitted = reports.filter((r) => r.status === "submitted").length;

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Справки по учреждениям</h1>
          <p>Выберите учреждение и период, откройте справку или сформируйте новую.</p>
        </div>
        <button className="btn teal" onClick={() => nav("/reports/new")}>
          Новая справка
        </button>
      </div>

      <div className="stats">
        <div className="card stat">
          <div className="n">{reports.length}</div>
          <div className="k">справки в выборке</div>
        </div>
        <div className="card stat">
          <div className="n">{submitted}</div>
          <div className="k">утверждены</div>
        </div>
        <div className="card stat">
          <div className="n">{reports.length - submitted}</div>
          <div className="k">черновики</div>
        </div>
        <div className="card stat">
          <div className="n">{institutions.length}</div>
          <div className="k">учреждений</div>
        </div>
      </div>

      <div className="card pad" style={{ marginBottom: 16 }}>
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
            <label>Статус</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Все</option>
              <option value="submitted">Утверждена</option>
              <option value="draft">Черновик</option>
            </select>
          </div>
          <button className="btn" onClick={load}>
            Показать
          </button>
        </div>
        {error && <p className="error">{error}</p>}
      </div>

      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Дата</th>
              <th>Учреждение</th>
              <th>Составил</th>
              <th>Статус</th>
              <th>Документ</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => (
              <tr key={r.id}>
                <td>
                  <Link to={`/reports/${r.id}`}>{formatDate(r.report_date)}</Link>
                </td>
                <td>{r.institution_name}</td>
                <td>{r.user_name}</td>
                <td>
                  <span className={`badge ${r.status === "submitted" ? "ok" : "draft"}`}>{statusLabel(r.status)}</span>
                </td>
                <td>
                  <div className="btn-row">
                    <button className="btn small ghost" onClick={() => downloadDocument(r.id, "pdf")}>
                      PDF
                    </button>
                    <button className="btn small ghost" onClick={() => downloadDocument(r.id, "docx")}>
                      Word
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {reports.length === 0 && (
              <tr>
                <td colSpan={5} className="muted">
                  Справки не найдены. Измените фильтр или создайте новую.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
