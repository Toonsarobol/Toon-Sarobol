import { getEquipmentList } from "../lib/sheets";
import LogoutButton from "./logout-button";
import Link from "next/link";

export const dynamic = "force-dynamic";

function groupBySystem(equipment) {
  const groups = {};
  for (const item of equipment) {
    if (!groups[item.system]) groups[item.system] = [];
    groups[item.system].push(item);
  }
  return groups;
}

export default async function HomePage() {
  let equipment = [];
  let loadError = "";
  try {
    equipment = await getEquipmentList();
  } catch (err) {
    loadError = "ดึงข้อมูลจาก Google Sheet ไม่สำเร็จ ตรวจสอบการตั้งค่า Service Account อีกครั้ง";
  }

  const grouped = groupBySystem(equipment);

  return (
    <div className="page">
      <div className="top-bar">
        <div>
          <p className="eyebrow">ระบบบันทึกประวัติเครื่องจักร</p>
          <h1 style={{ margin: 0 }}>รายการเครื่องจักรในอาคาร</h1>
        </div>
        <LogoutButton />
      </div>

      {loadError && (
        <div className="card" style={{ background: "#f3e2df", color: "#9c3b2e" }}>
          {loadError}
        </div>
      )}

      {!loadError && equipment.length === 0 && (
        <div className="card">ยังไม่พบรายการเครื่องจักรในชีต1</div>
      )}

      {Object.entries(grouped).map(([system, items]) => (
        <div className="system-group" key={system || "ไม่ระบุระบบ"}>
          <p className="system-title">{system || "ไม่ระบุระบบ"}</p>
          <div className="grid">
            {items.map((item) => (
              <Link key={item.key} href={`/machine/${encodeURIComponent(item.key)}`} className="machine-tile">
                <div className="card">
                  <p style={{ fontWeight: 500, margin: "0 0 4px", fontSize: 14 }}>
                    {item.subMachine || item.machine || "เครื่องจักร"}
                  </p>
                  <p className="mono" style={{ fontSize: 12, color: "var(--ink-soft)", margin: 0 }}>
                    {item.code || "ไม่มีรหัส"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
