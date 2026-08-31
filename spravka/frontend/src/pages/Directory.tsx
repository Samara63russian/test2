import { useEffect, useMemo, useState } from "react";
import { api, type DictionaryItem, type Institution } from "../api";

const TYPE_NAMES: Record<string, string> = {
  school: "Общеобразовательная школа",
  gymnasium: "Гимназия",
  lyceum: "Лицей",
  kindergarten: "Детский сад",
  extra: "Доп. образование",
  college: "Колледж",
};

export default function Directory() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [dictionary, setDictionary] = useState<DictionaryItem[]>([]);
  const [group, setGroup] = useState("institution_type");
  const [error, setError] = useState("");

  async function load() {
    try {
      const [inst, dict] = await Promise.all([api.institutions(), api.dictionary()]);
      setInstitutions(inst);
      setDictionary(dict);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка справочника");
    }
  }

  useEffect(() => {
    load();
  }, []);

  const groups = useMemo(() => {
    const names: Record<string, string> = {
      institution_type: "Типы учреждений",
      district: "Районы",
      position: "Должности",
    };
    const codes = Array.from(new Set(dictionary.map((d) => d.group_code)));
    return codes.map((code) => ({ code, name: names[code] || code }));
  }, [dictionary]);

  const typeName = (code: string) =>
    TYPE_NAMES[code] || dictionary.find((d) => d.group_code === "institution_type" && d.code === code)?.name || code || "—";

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Справочник</h1>
          <p>Учреждения, типы, районы и должности, которые используются в формах и документах.</p>
        </div>
      </div>
      {error && <p className="error">{error}</p>}
      <div className="split">
        <div>
          {institutions.map((i) => (
            <div className="card dir-card" key={i.id} style={{ marginBottom: 12 }}>
              <h3>{i.name}</h3>
              <div className="kv">
                <span>Код</span>
                <b>{i.code || "—"}</b>
                <span>Тип</span>
                <b>{typeName(i.type_code)}</b>
                <span>Район</span>
                <b>{i.district || "—"}</b>
                <span>Адрес</span>
                <b>{i.address || "—"}</b>
                <span>Телефон</span>
                <b>{i.phone || "—"}</b>
                <span>Руководитель</span>
                <b>{i.head_name || "—"}</b>
              </div>
            </div>
          ))}
        </div>
        <div className="card pad">
          <div className="tabs">
            {groups.map((g) => (
              <button key={g.code} className={`btn tab ${group === g.code ? "on" : ""}`} onClick={() => setGroup(g.code)}>
                {g.name}
              </button>
            ))}
          </div>
          <table>
            <thead>
              <tr>
                <th>Наименование</th>
                <th>Код</th>
              </tr>
            </thead>
            <tbody>
              {dictionary
                .filter((d) => d.group_code === group && d.is_active)
                .map((d) => (
                  <tr key={d.id}>
                    <td>{d.name}</td>
                    <td>{d.code}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
