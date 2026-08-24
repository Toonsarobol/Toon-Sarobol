import Link from "next/link";
import { getEquipmentList, getLogsForMachine } from "../../../lib/sheets";
import LogForm from "./log-form";

export const dynamic = "force-dynamic";

export default async function MachinePage({ params }) {
  const key = decodeURIComponent(params.key);
  const equipment = await getEquipmentList();
  const info = equipment.find((e) => e.key === key) || { key, code: key };
  const logs = await getLogsForMachine(key);

  return (
    <div className="page">
      <Link href="/" style={{ fontSize: 13, color: "#a9b3ba", textDecoration: "none" }}>
        ← กลับไปหน้ารายการเครื่องจักร
      </Link>

      <p className="eyebrow" style={{ marginTop: 16 }}>{info.system}</p>
      <h1>{info.subMachine || info.machine || "เครื่องจักร"}</h1>
      <p className="mono" style={{ color: "#a9b3ba", marginTop: -12, marginBottom: 24 }}>
        {info.code}
      </p>

      <LogForm defaultSystem={info.system} defaultMachine={info.machine} defaultCode={info.code || key} />

      <div className="card" style={{ marginTop: 24 }}>
        <p style={{ fontWeight: 500, marginTop: 0 }}>ประวัติที่บันทึกไว้ ({logs.length} รายการ)</p>
        {logs.length === 0 && <p style={{ color: "var(--ink-soft)" }}>ยังไม่มีประวัติของเครื่องนี้</p>}
        {logs.map((log, i) => (
          <div className="log-entry" key={i}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
              <span className="mono" style={{ fontSize: 13, color: "var(--ink-soft)" }}>
                {log.startDate} · {log.cycle}
              </span>
              <span style={{ fontSize: 12, color: "var(--ink-soft)" }}>{log.workerName} ({log.workerType})</span>
            </div>
            <p style={{ margin: "6px 0 0" }}>{log.details}</p>
            {log.partsOrCause && log.partsOrCause !== "-" && (
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--ink-soft)" }}>
                อะไหล่/สาเหตุ: {log.partsOrCause}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
