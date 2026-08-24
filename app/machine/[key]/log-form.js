"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const CYCLES = [
  "รายวัน ( Daily )",
  "รายสัปดาห์ ( Weekly )",
  "รายเดือน ( Monthly )",
  "ราย 3 เดือน",
  "ราย 6 เดือน",
  "รายปี",
  "Call Service ( รายครั้ง )",
];

const WORKER_TYPES = ["ฝ่ายวิศวกรรมอาคาร", "ผู้รับเหมาสัญญาจ้าง ( MA )", "ผู้รับเหมาจ้างพิเศษ ( รายครั้ง )"];

export default function LogForm({ defaultSystem, defaultMachine, defaultCode }) {
  const router = useRouter();
  const [form, setForm] = useState({
    cycle: CYCLES[0],
    workerType: WORKER_TYPES[0],
    workerName: "",
    startDate: "",
    startTime: "",
    endTime: "",
    details: "",
    partsOrCause: "",
    price: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.details.trim()) {
      setError("กรุณากรอกรายละเอียดการปฏิบัติงาน");
      return;
    }
    if (!form.workerName.trim()) {
      setError("กรุณากรอกชื่อผู้กรอกข้อมูล");
      return;
    }
    setSaving(true);
    const res = await fetch("/api/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        system: defaultSystem,
        machine: defaultMachine,
        code: defaultCode,
      }),
    });
    setSaving(false);
    if (res.ok) {
      setForm({ ...form, details: "", partsOrCause: "", price: "", startDate: "", startTime: "", endTime: "" });
      setOpen(false);
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "บันทึกไม่สำเร็จ");
    }
  }

  if (!open) {
    return (
      <button className="btn" onClick={() => setOpen(true)}>
        + บันทึกประวัติใหม่
      </button>
    );
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <p style={{ fontWeight: 500, marginTop: 0 }}>บันทึกประวัติใหม่</p>

      <div className="field">
        <label>รอบการตรวจ</label>
        <select value={form.cycle} onChange={(e) => update("cycle", e.target.value)}>
          {CYCLES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="field">
        <label>ประเภทผู้ปฏิบัติ</label>
        <select value={form.workerType} onChange={(e) => update("workerType", e.target.value)}>
          {WORKER_TYPES.map((w) => (
            <option key={w} value={w}>{w}</option>
          ))}
        </select>
      </div>

      <div className="field">
        <label>ผู้กรอกข้อมูล</label>
        <input value={form.workerName} onChange={(e) => update("workerName", e.target.value)} placeholder="ชื่อ-นามสกุล" />
      </div>

      <div className="field">
        <label>วันที่ปฏิบัติงาน</label>
        <input type="date" value={form.startDate} onChange={(e) => update("startDate", e.target.value)} />
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <div className="field" style={{ flex: 1 }}>
          <label>เวลาเริ่ม</label>
          <input type="time" value={form.startTime} onChange={(e) => update("startTime", e.target.value)} />
        </div>
        <div className="field" style={{ flex: 1 }}>
          <label>เวลาเสร็จ</label>
          <input type="time" value={form.endTime} onChange={(e) => update("endTime", e.target.value)} />
        </div>
      </div>

      <div className="field">
        <label>รายละเอียดการปฏิบัติงาน</label>
        <textarea value={form.details} onChange={(e) => update("details", e.target.value)} placeholder="เช่น PM ประจำเดือน / อาการเสีย / งานที่ทำ" />
      </div>

      <div className="field">
        <label>อะไหล่ที่เปลี่ยน / สาเหตุ</label>
        <input value={form.partsOrCause} onChange={(e) => update("partsOrCause", e.target.value)} placeholder="ถ้าไม่มีใส่ -" />
      </div>

      <div className="field">
        <label>ราคา (ถ้ามี)</label>
        <input value={form.price} onChange={(e) => update("price", e.target.value)} placeholder="0" />
      </div>

      {error && <p className="error-text">{error}</p>}

      <div style={{ display: "flex", gap: 10 }}>
        <button className="btn" type="submit" disabled={saving}>
          {saving ? "กำลังบันทึก..." : "บันทึก"}
        </button>
        <button type="button" className="btn btn-outline" style={{ color: "var(--ink)", borderColor: "var(--border)" }} onClick={() => setOpen(false)}>
          ยกเลิก
        </button>
      </div>
    </form>
  );
}
