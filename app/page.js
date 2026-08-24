'use client';

import React, { useState, useEffect } from 'react';

// ⚠️ วาง URL เว็บแอปจาก Apps Script ของคุณที่นี่
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyIXsOfZPC0UIdlA4Vaop0Lqd_yI3QmskSio5YY05z9T05kEx3S8S-rCaKmGYrmwwlZvw/exec';

export default function TIJMaintenanceApp() {
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('HVAC');
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [form, setForm] = useState({
    systemCategory: 'HVAC',
    mainId: '',
    mainName: '',
    subId: '',
    subName: '',
    purchasePrice: '',
    maintenanceCost: '',
    installYear: '2020',
    lifespanYears: '10'
  });

  // 1. ดึงข้อมูลเรียลไทม์จาก Google Sheet
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

  // 2. ส่งข้อมูลฟอร์มไปบันทึกลง Google Sheet
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
        mode: 'no-cors' // เพื่อข้าม CORS Policy ของ Apps Script
      });

      alert('✅ บันทึกข้อมูลลง Google Sheet เรียบร้อยแล้ว!');
      setShowForm(false);
      // รีเซ็ตฟอร์ม
      setForm({
        systemCategory: activeTab,
        mainId: '',
        mainName: '',
        subId: '',
        subName: '',
        purchasePrice: '',
        maintenanceCost: '',
        installYear: '2020',
        lifespanYears: '10'
      });
      // โหลดข้อมูลใหม่
      setTimeout(() => loadData(), 1500);
    } catch (err) {
      alert('❌ เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#030712', color: '#f3f4f6', fontFamily: 'monospace', padding: '20px' }}>
      
      {/* Header */}
      <header style={{ borderBottom: '1px solid #1f2937', paddingBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ color: '#00f2ff', fontSize: '11px', letterSpacing: '2px' }}>BSM-TIJ SYSTEM MANAGEMENT</div>
          <h1 style={{ margin: '4px 0 0 0', fontSize: '20px', color: '#ffffff', fontWeight: 'bold' }}>⚙️ GOOGLE SHEETS LIVE CONNECT & ENTRY</h1>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{ backgroundColor: '#00f2ff', color: '#000', border: 'none', padding: '10px 18px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          {showForm ? '❌ ปิดฟอร์ม' : '➕ บันทึกอะไหล่/เครื่องจักรใหม่'}
        </button>
      </header>

      {/* Form กรอกข้อมูล */}
      {showForm && (
        <form onSubmit={handleSubmit} style={{ backgroundColor: '#0b0f19', border: '1px solid #00f2ff', borderRadius: '8px', padding: '20px', marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
          <div style={{ gridColumn: '1 / -1', color: '#00f2ff', fontWeight: 'bold', fontSize: '14px' }}>📝 กรอกข้อมูลอุปกรณ์เพื่อบันทึกลง Google Sheet</div>
          
          <div>
            <label style={{ fontSize: '11px', color: '#9ca3af' }}>หมวดงานระบบ</label>
            <select value={form.systemCategory} onChange={e => setForm({...form, systemCategory: e.target.value})} style={{ width: '100%', padding: '8px', backgroundColor: '#111827', border: '1px solid #1f2937', color: '#fff', borderRadius: '4px', marginTop: '4px' }}>
              <option value="HVAC">ระบบปรับอากาศ (HVAC)</option>
              <option value="ELECTRICAL">ระบบไฟฟ้า (Electrical)</option>
              <option value="PLUMBING">สุขาภิบาล (Plumbing)</option>
              <option value="FIRE">ระบบดับเพลิง (Fire)</option>
              <option value="ELEVATOR">ลิฟต์ (Elevator)</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '11px', color: '#9ca3af' }}>รหัสเครื่องหลัก (Main ID)</label>
            <input required placeholder="เช่น CH-01" value={form.mainId} onChange={e => setForm({...form, mainId: e.target.value})} style={{ width: '100%', padding: '8px', backgroundColor: '#111827', border: '1px solid #1f2937', color: '#fff', borderRadius: '4px', marginTop: '4px' }} />
          </div>

          <div>
            <label style={{ fontSize: '11px', color: '#9ca3af' }}>ชื่อเครื่องหลัก</label>
            <input required placeholder="เช่น Chiller Unit #1" value={form.mainName} onChange={e => setForm({...form, mainName: e.target.value})} style={{ width: '100%', padding: '8px', backgroundColor: '#111827', border: '1px solid #1f2937', color: '#fff', borderRadius: '4px', marginTop: '4px' }} />
          </div>

          <div>
            <label style={{ fontSize: '11px', color: '#9ca3af' }}>รหัสอะไหล่ (Sub ID)</label>
            <input required placeholder="เช่น CMP-01" value={form.subId} onChange={e => setForm({...form, subId: e.target.value})} style={{ width: '100%', padding: '8px', backgroundColor: '#111827', border: '1px solid #1f2937', color: '#fff', borderRadius: '4px', marginTop: '4px' }} />
          </div>

          <div>
            <label style={{ fontSize: '11px', color: '#9ca3af' }}>ชื่อรายการอะไหล่ / การซ่อม</label>
            <input required placeholder="เช่น Screw Compressor A" value={form.subName} onChange={e => setForm({...form, subName: e.target.value})} style={{ width: '100%', padding: '8px', backgroundColor: '#111827', border: '1px solid #1f2937', color: '#fff', borderRadius: '4px', marginTop: '4px' }} />
          </div>

          <div>
            <label style={{ fontSize: '11px', color: '#9ca3af' }}>ราคาซื้อ/เปลี่ยนอะไหล่ (บาท)</label>
            <input type="number" required placeholder="850000" value={form.purchasePrice} onChange={e => setForm({...form, purchasePrice: e.target.value})} style={{ width: '100%', padding: '8px', backgroundColor: '#111827', border: '1px solid #1f2937', color: '#fff', borderRadius: '4px', marginTop: '4px' }} />
          </div>

          <div>
            <label style={{ fontSize: '11px', color: '#9ca3af' }}>ค่าซ่อมสะสมทั้งหมด (บาท)</label>
            <input type="number" required placeholder="520000" value={form.maintenanceCost} onChange={e => setForm({...form, maintenanceCost: e.target.value})} style={{ width: '100%', padding: '8px', backgroundColor: '#111827', border: '1px solid #1f2937', color: '#fff', borderRadius: '4px', marginTop: '4px' }} />
          </div>

          <div>
            <label style={{ fontSize: '11px', color: '#9ca3af' }}>ปีที่ติดตั้ง (ค.ศ.)</label>
            <input type="number" required value={form.installYear} onChange={e => setForm({...form, installYear: e.target.value})} style={{ width: '100%', padding: '8px', backgroundColor: '#111827', border: '1px solid #1f2937', color: '#fff', borderRadius: '4px', marginTop: '4px' }} />
          </div>

          <div>
            <label style={{ fontSize: '11px', color: '#9ca3af' }}>อายุการใช้งาน (ปี)</label>
            <input type="number" required value={form.lifespanYears} onChange={e => setForm({...form, lifespanYears: e.target.value})} style={{ width: '100%', padding: '8px', backgroundColor: '#111827', border: '1px solid #1f2937', color: '#fff', borderRadius: '4px', marginTop: '4px' }} />
          </div>

          <div style={{ gridColumn: '1 / -1', textAlign: 'right' }}>
            <button type="submit" disabled={submitting} style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
              {submitting ? 'กำลังส่งข้อมูล...' : '💾 บันทึกข้อมูลลง Google Sheet'}
            </button>
          </div>
        </form>
      )}

      {/* Tabs สลับ 5 งานระบบ */}
      <div style={{ display: 'flex', gap: '10px', marginTop: '20px', borderBottom: '1px solid #1f2937', paddingBottom: '10px' }}>
        {['HVAC', 'ELECTRICAL', 'PLUMBING', 'FIRE', 'ELEVATOR'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '8px 16px',
              backgroundColor: activeTab === tab ? '#00f2ff15' : '#111827',
              border: activeTab === tab ? '1px solid #00f2ff' : '1px solid #1f2937',
              color: activeTab === tab ? '#00f2ff' : '#9ca3af',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* แสดงตารางข้อมูลเรียลไทม์จาก Google Sheet */}
      <div style={{ marginTop: '20px', backgroundColor: '#0b0f19', border: '1px solid #1f2937', borderRadius: '8px', padding: '15px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ color: '#00f2ff', fontSize: '12px' }}>REAL-TIME RECORDS FROM GOOGLE SHEET</div>
          <button onClick={loadData} style={{ backgroundColor: '#111827', color: '#9ca3af', border: '1px solid #1f2937', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>🔄 Refresh</button>
        </div>

        {loading ? (
          <div style={{ padding: '30px', textAlign: 'center', color: '#9ca3af' }}>⚡ กำลังเชื่อมต่อข้อมูลกับ Google Sheet...</div>
        ) : dataList.length === 0 ? (
          <div style={{ padding: '30px', textAlign: 'center', color: '#6b7280' }}>ยังไม่มีข้อมูล หรือยังไม่ได้ใส่ Apps Script URL</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1f2937', color: '#9ca3af' }}>
                <th style={{ padding: '8px' }}>หมวดระบบ</th>
                <th style={{ padding: '8px' }}>เครื่องหลัก</th>
                <th style={{ padding: '8px' }}>รายการอะไหล่/ซ่อม</th>
                <th style={{ padding: '8px' }}>ราคาจัดซื้อ</th>
                <th style={{ padding: '8px' }}>ค่าซ่อมสะสม</th>
                <th style={{ padding: '8px' }}>% ค่าซ่อม/ราคาซื้อ</th>
                <th style={{ padding: '8px' }}>วิเคราะห์การคุ้มทุน</th>
              </tr>
            </thead>
            <tbody>
              {dataList.filter(row => !row.systemCategory || row.systemCategory === activeTab).map((row, idx) => {
                const price = Number(row.purchasePrice || 0);
                const cost = Number(row.maintenanceCost || 0);
                const ratio = price > 0 ? (cost / price) * 100 : 0;
                const isWorth = ratio < 50;

                return (
                  <tr key={idx} style={{ borderBottom: '1px solid #111827' }}>
                    <td style={{ padding: '8px', color: '#00f2ff' }}>{row.systemCategory || activeTab}</td>
                    <td style={{ padding: '8px' }}>{row.mainName || row.mainId}</td>
                    <td style={{ padding: '8px', fontWeight: 'bold' }}>{row.subName || row.subId}</td>
                    <td style={{ padding: '8px' }}>฿{price.toLocaleString()}</td>
                    <td style={{ padding: '8px' }}>฿{cost.toLocaleString()}</td>
                    <td style={{ padding: '8px', color: ratio > 50 ? '#ef4444' : '#34d399', fontWeight: 'bold' }}>
                      {ratio.toFixed(1)}%
                    </td>
                    <td style={{ padding: '8px' }}>
                      <span style={{ backgroundColor: isWorth ? '#064e3b' : '#881337', color: isWorth ? '#34d399' : '#fb7185', padding: '3px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>
                        {isWorth ? '✅ คุ้มซ่อม' : '🚨 ควรซื้อใหม่'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}
