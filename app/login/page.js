"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!password.trim()) {
      setError("กรุณากรอกรหัสผ่าน");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "เข้าสู่ระบบไม่สำเร็จ");
    }
  }

  return (
    <div className="page" style={{ maxWidth: 380, paddingTop: "4rem" }}>
      <p className="eyebrow">ระบบบันทึกประวัติเครื่องจักร</p>
      <h1>เข้าสู่ระบบทีมงาน</h1>
      <form className="card" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="password">รหัสผ่านทีมงาน</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="กรอกรหัสผ่าน"
            autoFocus
          />
          {error && <p className="error-text">{error}</p>}
        </div>
        <button className="btn" type="submit" disabled={loading} style={{ width: "100%", justifyContent: "center" }}>
          {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
        </button>
      </form>
    </div>
  );
}
