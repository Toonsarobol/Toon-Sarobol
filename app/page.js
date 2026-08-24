'use client';

import React, { useState, useEffect } from 'react';

// ⚠️ วาง URL Web App ที่ได้จาก Apps Script ของคุณที่นี่
const APPS_SCRIPT_URL = 'YOUR_APPS_SCRIPT_URL_HERE';

export default function TIJFullDashboard() {
  const [activeTab, setActiveTab] = useState('ALL');
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State ตามคอลัมน์ Sheet จริง
  const [form, setForm] = useState({
    system: 'ระบบไฟฟ้า',
    machine: '',
    subMachine: '',
    systemComponent: '',
    partReplacement: '',
    price: ''
  });

  // โหลดข้อมูลเรียลไทม์จาก Google Sheet
  const loadData = async () => {
    setLoading(true);
    try {
      if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.includes('YOUR_APPS_SCRIPT')) {
        setLoading(false);
        return;
      }
      const res = await fetch(APPS_SCRIPT_URL);
      const json = await res.json();
      setDataList(json);
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // บันทึกข้อมูลลง Google Sheet
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
        mode: 'no-cors'
      });

      alert('✅ บันทึกข้อมูลลง Google Sheet เรียบร้อยแล้ว!');
      setShowForm(false);
      setForm({
        system: 'ระบบไฟฟ้า',
        machine: '',
        subMachine: '',
        systemComponent: '',
        partReplacement: '',
        price: ''
      });
      setTimeout(() => loadData(), 1500);
    } catch (err) {
      alert('❌ เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setSubmitting(false);
    }
  };

  // คำนวณค่าสถิติสำหรับกราฟิกการ์ดสรุป
  const totalItems = dataList.length;
  const totalCost = dataList.reduce((acc, item) => acc + (Number(item["ราคา"]) || 0), 0);
  const activeSystems = [...new Set(dataList.map(item => item["ระบบ"]))].filter(Boolean).length;

  // กรองข้อมูลตามแท็บ
  const filteredData = activeTab === 'ALL' 
    ? dataList 
    : dataList.filter(item => item["ระบบ"] && item["ระบบ"].includes(activeTab));

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#030712', color: '#f3f4f6', fontFamily: 'monospace', padding: '24px' }}>
      
      {/* 🟢 HEADER GRAPHICS */}
      <header style={{ borderBottom: '1px solid #1f2937', paddingBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ color: '#00f2ff', fontSize: '11px', letterSpacing: '2px', fontWeight: 'bold' }}>BSM-TIJ MAINTENANCE ANALYTICS</div>
          <h1 style={{ margin: '6px 0 0 0', fontSize: '24px', color: '#ffffff', fontWeight: 'bold' }}>⚙️ REAL-TIME EQUIPMENT & PM DASHBOARD</h1>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={loadData} style={{ backgroundColor: '#111827', color: '#00f2ff', border: '1px solid #00f2ff', padding: '10px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
            🔄 โหลดข้อมูลใหม่
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{ backgroundColor: '#00f2ff', color: '#000', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 0 15px rgba(0,242,255,0.4)' }}
          >
            {showForm ? '❌ ปิดฟอร์ม' : '➕ กรอกบันทึกงานซ่อม/อะไหล่'}
          </button>
        </div>
      </header>

      {/* 🟢 SUMMARY CARDS (การ์ดแสดงผลสถิติแบบกราฟิก) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginTop: '24px' }}>
        <div style={{ backgroundColor: '#0b0f19', border: '1px solid #1f2937', borderRadius: '12px', padding: '20px' }}>
          <div style={{ color: '#9ca3af', fontSize: '12px' }}>รายการอุปกรณ์/เครื่องจักรทั้งหมด</div>
          <div style={{ fontSize: '28px', color: '#00f2ff', fontWeight: 'bold', marginTop: '8px' }}>{loading ? '...' : totalItems} <span style={{ fontSize: '14px', color: '#9ca3af' }}>รายการ</span></div>
        </div>

        <div style={{ backgroundColor: '#0b0f19', border: '1px solid #1f2937', borderRadius: '12px', padding: '20px' }}>
          <div style={{ color: '#9ca3af', fontSize: '12px' }}>มูลค่าซ่อม/เปลี่ยนอะไหล่รวม</div>
          <div style={{ fontSize: '28px', color: '#10b981', fontWeight: 'bold', marginTop: '8px' }}>{loading ? '...' : `฿${totalCost.toLocaleString()}`}</div>
        </div>

        <div style={{ backgroundColor: '#0b0f19', border: '1px solid #1f2937', borderRadius: '12px', padding: '20px' }}>
          <div style={{ color: '#9ca3af', fontSize: '12px' }}>จำนวนระบบงานที่ติดตาม</div>
          <div style={{ fontSize: '28px', color: '#f59e0b', fontWeight: 'bold', marginTop: '8px' }}>{loading ? '...' : activeSystems} <span style={{ fontSize: '14px', color: '#9ca3af' }}>ระบบ</span></div>
        </div>

        <div style={{ backgroundColor: '#0b0f19', border: '1px solid #1f2937', borderRadius: '12px', padding: '20px' }}>
          <div style={{ color: '#9ca3af', fontSize: '12px' }}>สถานะการเชื่อมต่อ Database</div>
          <div style={{ fontSize: '16px', color: '#10b981', fontWeight: 'bold', marginTop: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '10px', height: '10px', backgroundColor: '#10b981', borderRadius: '50%', display: 'inline-block', boxShadow: '0 0 10px #10b981' }}></span> Google Sheets Live
          </div>
        </div>
      </div>

      {/* 🟢 POPUP FORM (ฟอร์มบันทึกข้อมูล) */}
      {showForm && (
        <form onSubmit={handleSubmit} style={{ backgroundColor: '#0b0f19', border: '1px solid #00f2ff', borderRadius: '12px', padding: '24px', marginTop: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', boxShadow: '0 0 25px rgba(0,242,255,0.15)' }}>
          <div style={{ gridColumn: '1 / -1', color: '#00f2ff', fontWeight: 'bold', fontSize: '16px', borderBottom: '1px solid #1f2937', paddingBottom: '10px' }}>
            📝 บันทึกประวัติการบำรุงรักษา / เปลี่ยนอะไหล่ ลง Google Sheet
          </div>
          
          <div>
            <label style={{ fontSize: '12px', color: '#9ca3af' }}>ระบบงาน</label>
            <input required placeholder="เช่น ระบบไฟฟ้า, ระบบปรับอากาศ" value={form.system} onChange={e => setForm({...form, system: e.target.value})} style={{ width: '100%', padding: '10px', backgroundColor: '#111827', border: '1px solid #1f2937', color: '#fff', borderRadius: '6px', marginTop: '4px' }} />
          </div>

          <div>
            <label style={{ fontSize: '12px', color: '#9ca3af' }}>เครื่องจักรหลัก</label>
            <input required placeholder="เช่น ระบบไฟฟ้ากำลัง" value={form.machine} onChange={e => setForm({...form, machine: e.target.value})} style={{ width: '100%', padding: '10px', backgroundColor: '#111827', border: '1px solid #1f2937', color: '#fff', borderRadius: '6px', marginTop: '4px' }} />
          </div>

          <div>
            <label style={{ fontSize: '12px', color: '#9ca3af' }}>เครื่องจักร์ย่อย</label>
            <input required placeholder="เช่น หม้อแปลงไฟฟ้า (Transformer)" value={form.subMachine} onChange={e => setForm({...form, subMachine: e.target.value})} style={{ width: '100%', padding: '10px', backgroundColor: '#111827', border: '1px solid #1f2937', color: '#fff', borderRadius: '6px', marginTop: '4px' }} />
          </div>

          <div>
            <label style={{ fontSize: '12px', color: '#9ca3af' }}>ระบบประกอบเครื่องจักร (รหัส)</label>
            <input required placeholder="เช่น TR-01, MDB-01" value={form.systemComponent} onChange={e => setForm({...form, systemComponent: e.target.value})} style={{ width: '100%', padding: '10px', backgroundColor: '#111827', border: '1px solid #1f2937', color: '#fff', borderRadius: '6px', marginTop: '4px' }} />
          </div>

          <div>
            <label style={{ fontSize: '12px', color: '#9ca3af' }}>รายการเปลี่ยนอะไหล่เครื่องจักร</label>
            <input placeholder="เช่น เปลี่ยนน้ำมันหม้อแปลง, เปลี่ยนซีล" value={form.partReplacement} onChange={e => setForm({...form, partReplacement: e.target.value})} style={{ width: '100%', padding: '10px', backgroundColor: '#111827', border: '1px solid #1f2937', color: '#fff', borderRadius: '6px', marginTop: '4px' }} />
          </div>

          <div>
            <label style={{ fontSize: '12px', color: '#9ca3af' }}>ราคา (บาท)</label>
            <input type="number" placeholder="0" value={form.price} onChange={e => setForm({...form, price: e.target.value})} style={{ width: '100%', padding: '10px', backgroundColor: '#111827', border: '1px solid #1f2937', color: '#fff', borderRadius: '6px', marginTop: '4px' }} />
          </div>

          <div style={{ gridColumn: '1 / -1', textAlign: 'right', marginTop: '10px' }}>
            <button type="submit" disabled={submitting} style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '12px 28px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>
              {submitting ? '⏳ กำลังบันทึก...' : '💾 บันทึกข้อมูลลง Google Sheet'}
            </button>
          </div>
        </form>
      )}

      {/* 🟢 TAB FILTERS (ปุ่มสลับแยกตามระบบ) */}
      <div style={{ display: 'flex', gap: '10px', marginTop: '30px', borderBottom: '1px solid #1f2937', paddingBottom: '12px', overflowX: 'auto' }}>
        {[
          { id: 'ALL', label: '🌐 แสดงทั้งหมด' },
          { id: 'ไฟฟ้า', label: '⚡ ระบบไฟฟ้า' },
          { id: 'ปรับอากาศ', label: '❄️ ระบบปรับอากาศ' },
          { id: 'ประปา', label: '💧 สุขาภิบาล/ประปา' },
          { id: 'ดับเพลิง', label: '🔥 ระบบดับเพลิง' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 20px',
              backgroundColor: activeTab === tab.id ? '#00f2ff15' : '#0b0f19',
              border: activeTab === tab.id ? '1px solid #00f2ff' : '1px solid #1f2937',
              color: activeTab === tab.id ? '#00f2ff' : '#9ca3af',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              whiteSpace: 'nowrap'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 🟢 DATA TABLE (ตารางข้อมูลจริงสไตล์ High-Tech) */}
      <div style={{ marginTop: '20px', backgroundColor: '#0b0f19', border: '1px solid #1f2937', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#00f2ff' }}>⚡ กำลังโหลดและซิงค์ข้อมูลเรียลไทม์จาก Google Sheet...</div>
        ) : filteredData.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>ไม่พบข้อมูลในหมวดนี้</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #1f2937', color: '#9ca3af', backgroundColor: '#111827' }}>
                  <th style={{ padding: '12px' }}>รหัสอุปกรณ์</th>
                  <th style={{ padding: '12px' }}>เครื่องจักร์ย่อย</th>
                  <th style={{ padding: '12px' }}>ระบบ / เครื่องจักร</th>
                  <th style={{ padding: '12px' }}>รายการเปลี่ยนอะไหล่</th>
                  <th style={{ padding: '12px' }}>ผู้รับผิดชอบ</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>ราคา (บาท)</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #111827', transition: '0.2s' }}>
                    <td style={{ padding: '12px', color: '#00f2ff', fontWeight: 'bold' }}>
                      <span style={{ backgroundColor: '#00f2ff10', border: '1px solid #00f2ff40', padding: '4px 8px', borderRadius: '4px' }}>
                        {row["ระบบประกอบเครื่องจักร"] || 'N/A'}
                      </span>
                    </td>
                    <td style={{ padding: '12px', fontWeight: 'bold', color: '#ffffff' }}>{row["เครื่องจักร์ย่อย"] || '-'}</td>
                    <td style={{ padding: '12px', color: '#9ca3af' }}>{row["ระบบ"]} {row["เครื่องจักร"] ? `(${row["เครื่องจักร"]})` : ''}</td>
                    <td style={{ padding: '12px', color: row["การเปลี่ยนอะไหล่เครื่องจักร"] ? '#f59e0b' : '#6b7280' }}>
                      {row["การเปลี่ยนอะไหล่เครื่องจักร"] || 'ไม่มีการเปลี่ยนอะไหล่'}
                    </td>
                    <td style={{ padding: '12px', color: '#9ca3af' }}>{row["ฝ่ายวิศวกรรม LPP"] || row["ผู้ปฏิบัติงาน/ผู้รับผิดชอบ"] || '-'}</td>
                    <td style={{ padding: '12px', color: '#10b981', fontWeight: 'bold', textAlign: 'right' }}>
                      {row["ราคา"] ? `฿${Number(row["ราคา"]).toLocaleString()}` : '-'}
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
