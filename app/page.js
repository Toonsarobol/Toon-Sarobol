'use client';

import React, { useState, useEffect } from 'react';

// ⚠️ วาง URL Web App ที่ได้จาก Apps Script ของคุณที่นี่
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyIXsOfZPC0UIdlA4Vaop0Lqd_yI3QmskSio5YY05z9T05kEx3S8S-rCaKmGYrmwwlZvw/exec';

export default function TIJNetworkDashboard() {
  const [activeTab, setActiveTab] = useState('HVAC');
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [form, setForm] = useState({
    system: 'ระบบปรับอากาศ',
    machine: '',
    subMachine: '',
    systemComponent: '',
    partReplacement: '',
    price: ''
  });

  // โหลดข้อมูลจาก Google Sheet
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

  // ส่งข้อมูลบันทึกลง Sheet
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
        system: 'ระบบปรับอากาศ',
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

  // รายการแท็บเมนูด้านซ้าย
  const menuTabs = [
    { id: 'HVAC', label: 'ระบบปรับอากาศ', icon: '❄️', keyword: 'ปรับอากาศ' },
    { id: 'ELECTRICAL', label: 'ระบบไฟฟ้า', icon: '⚡', keyword: 'ไฟฟ้า' },
    { id: 'PLUMBING', label: 'สุขาภิบาล/ประปา', icon: '💧', keyword: 'ประปา' },
    { id: 'FIRE', label: 'ระบบดับเพลิง', icon: '🔥', keyword: 'ดับเพลิง' },
    { id: 'ELEVATOR', label: 'ระบบลิฟต์', icon: '🛗', keyword: 'ลิฟต์' },
    { id: 'ALL', label: 'รายการทั้งหมด', icon: '🌐', keyword: '' }
  ];

  // กรองข้อมูลตามแท็บที่เลือกด้านซ้าย
  const currentTabObj = menuTabs.find(t => t.id === activeTab);
  const filteredData = activeTab === 'ALL'
    ? dataList
    : dataList.filter(item => item["ระบบ"] && item["ระบบ"].includes(currentTabObj.keyword));

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#030712', color: '#f3f4f6', fontFamily: 'monospace' }}>
      
      {/* 🔴 1. SIDEBAR LEFT TAB (เมนูแท็บรายการด้านซ้าย) */}
      <aside style={{ width: '260px', backgroundColor: '#0b0f19', borderRight: '1px solid #1f2937', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ borderBottom: '1px solid #1f2937', paddingBottom: '15px', marginBottom: '10px' }}>
          <div style={{ color: '#00f2ff', fontSize: '10px', letterSpacing: '2px', fontWeight: 'bold' }}>BSM-TIJ CONTROL</div>
          <div style={{ color: '#fff', fontSize: '16px', fontWeight: 'bold', marginTop: '4px' }}>⚙️ งานระบบตึก</div>
        </div>

        <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '5px', textTransform: 'uppercase' }}>เลือกหมวดงานระบบ</div>

        {menuTabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '8px',
                backgroundColor: isActive ? '#00f2ff15' : 'transparent',
                border: isActive ? '1px solid #00f2ff' : '1px solid transparent',
                color: isActive ? '#00f2ff' : '#9ca3af',
                cursor: 'pointer',
                textAlign: 'left',
                fontWeight: isActive ? 'bold' : 'normal',
                transition: 'all 0.2s'
              }}
            >
              <span style={{ fontSize: '18px' }}>{tab.icon}</span>
              <span style={{ fontSize: '13px' }}>{tab.label}</span>
            </button>
          );
        })}

        <div style={{ marginTop: 'auto', borderTop: '1px solid #1f2937', paddingTop: '15px' }}>
          <div style={{ fontSize: '10px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%', boxShadow: '0 0 8px #10b981' }}></span> Live Google Sheet API
          </div>
        </div>
      </aside>

      {/* 🔴 2. MAIN CONTENT AREA (พื้นที่แสดงผลหลัก + สายเคเบิล) */}
      <main style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
        
        {/* Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1f2937', paddingBottom: '16px' }}>
          <div>
            <div style={{ color: '#00f2ff', fontSize: '11px', letterSpacing: '2px' }}>TIJ BUILDING MAINTENANCE MATRIX</div>
            <h1 style={{ margin: '4px 0 0 0', fontSize: '22px', color: '#ffffff', fontWeight: 'bold' }}>
              {currentTabObj.icon} {currentTabObj.label}
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={loadData} style={{ backgroundColor: '#111827', color: '#00f2ff', border: '1px solid #00f2ff', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
              🔄 Sync Sheet
            </button>
            <button
              onClick={() => setShowForm(!showForm)}
              style={{ backgroundColor: '#00f2ff', color: '#000', border: 'none', padding: '8px 18px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px', boxShadow: '0 0 15px rgba(0,242,255,0.3)' }}
            >
              {showForm ? '❌ ปิดฟอร์ม' : '➕ บันทึกข้อมูลอะไหล่'}
            </button>
          </div>
        </header>

        {/* ฟอร์มกรอกข้อมูล */}
        {showForm && (
          <form onSubmit={handleSubmit} style={{ backgroundColor: '#0b0f19', border: '1px solid #00f2ff', borderRadius: '10px', padding: '20px', marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
            <div style={{ gridColumn: '1 / -1', color: '#00f2ff', fontWeight: 'bold', fontSize: '14px', borderBottom: '1px solid #1f2937', paddingBottom: '8px' }}>
              📝 กรอกข้อมูลอุปกรณ์บันทึกลง Google Sheet
            </div>
            
            <div>
              <label style={{ fontSize: '11px', color: '#9ca3af' }}>ระบบงาน</label>
              <input required placeholder="เช่น ระบบปรับอากาศ, ระบบไฟฟ้า" value={form.system} onChange={e => setForm({...form, system: e.target.value})} style={{ width: '100%', padding: '8px', backgroundColor: '#111827', border: '1px solid #1f2937', color: '#fff', borderRadius: '4px', marginTop: '4px' }} />
            </div>

            <div>
              <label style={{ fontSize: '11px', color: '#9ca3af' }}>เครื่องจักรหลัก</label>
              <input required placeholder="เช่น Chiller Unit 1" value={form.machine} onChange={e => setForm({...form, machine: e.target.value})} style={{ width: '100%', padding: '8px', backgroundColor: '#111827', border: '1px solid #1f2937', color: '#fff', borderRadius: '4px', marginTop: '4px' }} />
            </div>

            <div>
              <label style={{ fontSize: '11px', color: '#9ca3af' }}>เครื่องจักร์ย่อย / อุปกรณ์</label>
              <input required placeholder="เช่น Motor Blower 15HP" value={form.subMachine} onChange={e => setForm({...form, subMachine: e.target.value})} style={{ width: '100%', padding: '8px', backgroundColor: '#111827', border: '1px solid #1f2937', color: '#fff', borderRadius: '4px', marginTop: '4px' }} />
            </div>

            <div>
              <label style={{ fontSize: '11px', color: '#9ca3af' }}>ระบบประกอบเครื่องจักร (รหัส)</label>
              <input required placeholder="เช่น TR-01, CH-01" value={form.systemComponent} onChange={e => setForm({...form, systemComponent: e.target.value})} style={{ width: '100%', padding: '8px', backgroundColor: '#111827', border: '1px solid #1f2937', color: '#fff', borderRadius: '4px', marginTop: '4px' }} />
            </div>

            <div>
              <label style={{ fontSize: '11px', color: '#9ca3af' }}>รายการเปลี่ยนอะไหล่</label>
              <input placeholder="เช่น เปลี่ยน Bearing, เติมน้ำยา" value={form.partReplacement} onChange={e => setForm({...form, partReplacement: e.target.value})} style={{ width: '100%', padding: '8px', backgroundColor: '#111827', border: '1px solid #1f2937', color: '#fff', borderRadius: '4px', marginTop: '4px' }} />
            </div>

            <div>
              <label style={{ fontSize: '11px', color: '#9ca3af' }}>ราคา (บาท)</label>
              <input type="number" placeholder="0" value={form.price} onChange={e => setForm({...form, price: e.target.value})} style={{ width: '100%', padding: '8px', backgroundColor: '#111827', border: '1px solid #1f2937', color: '#fff', borderRadius: '4px', marginTop: '4px' }} />
            </div>

            <div style={{ gridColumn: '1 / -1', textAlign: 'right' }}>
              <button type="submit" disabled={submitting} style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
                {submitting ? 'กำลังบันทึก...' : '💾 บันทึกข้อมูลลง Sheet'}
              </button>
            </div>
          </form>
        )}

        {/* 🔴 3. CABLE NODE NETWORK VISUALIZATION (ดีไซน์สายเคเบิลเชื่อมโยง Node) */}
        <div style={{ marginTop: '24px' }}>
          <div style={{ color: '#00f2ff', fontSize: '12px', fontWeight: 'bold', marginBottom: '16px', letterSpacing: '1px' }}>
            🔌 CABLE NETWORK DIAGRAM & EQUIPMENT TREE
          </div>

          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#00f2ff' }}>⚡ กำลังเชื่อมต่อสายเคเบิลข้อมูลจาก Google Sheet...</div>
          ) : filteredData.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280', backgroundColor: '#0b0f19', borderRadius: '10px', border: '1px solid #1f2937' }}>ไม่พบข้อมูลเครื่องจักรในหมวดนี้</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {filteredData.map((item, idx) => (
                <div key={idx} style={{ backgroundColor: '#0b0f19', border: '1px solid #1f2937', borderRadius: '12px', padding: '20px', position: 'relative' }}>
                  
                  {/* สายเคเบิลหลักด้านบน */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    
                    {/* NODE 1: รหัสเครื่อง */}
                    <div style={{ backgroundColor: '#00f2ff15', border: '2px solid #00f2ff', padding: '8px 16px', borderRadius: '8px', color: '#00f2ff', fontWeight: 'bold', fontSize: '14px', boxShadow: '0 0 10px rgba(0,242,255,0.2)' }}>
                      {item["ระบบประกอบเครื่องจักร"] || `EQ-${idx+1}`}
                    </div>

                    {/* สายเคเบิลเรืองแสง เส้นที่ 1 */}
                    <div style={{ flex: 1, height: '2px', background: 'linear-gradient(90deg, #00f2ff 0%, #10b981 100%)', boxShadow: '0 0 8px #00f2ff' }}></div>

                    {/* NODE 2: ชื่อเครื่องจักร์ย่อย */}
                    <div style={{ backgroundColor: '#111827', border: '1px solid #10b981', padding: '8px 16px', borderRadius: '8px', color: '#ffffff', fontWeight: 'bold', fontSize: '13px' }}>
                      {item["เครื่องจักร์ย่อย"] || item["เครื่องจักร"] || 'เครื่องจักร'}
                    </div>

                    {/* สายเคเบิลเรืองแสง เส้นที่ 2 */}
                    <div style={{ flex: 1, height: '2px', background: 'linear-gradient(90deg, #10b981 0%, #f59e0b 100%)', boxShadow: '0 0 8px #10b981' }}></div>

                    {/* NODE 3: อะไหล่ / ประวัติการซ่อม */}
                    <div style={{ backgroundColor: '#111827', border: '1px solid #f59e0b', padding: '8px 16px', borderRadius: '8px', color: '#f59e0b', fontSize: '12px', maxWidth: '300px' }}>
                      🔧 {item["การเปลี่ยนอะไหล่เครื่องจักร"] || 'ไม่มีการเปลี่ยนอะไหล่'}
                    </div>
                  </div>

                  {/* รายละเอียดเพิ่มเติมด้านล่างของ Node */}
                  <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px dashed #1f2937', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#9ca3af' }}>
                    <div>หมวดงาน: <span style={{ color: '#fff' }}>{item["ระบบ"] || '-'}</span></div>
                    <div>เครื่องหลัก: <span style={{ color: '#fff' }}>{item["เครื่องจักร"] || '-'}</span></div>
                    <div>ผู้รับผิดชอบ: <span style={{ color: '#fff' }}>{item["ฝ่ายวิศวกรรม LPP"] || item["ผู้ปฏิบัติงาน/ผู้รับผิดชอบ"] || '-'}</span></div>
                    <div>ราคา: <span style={{ color: '#10b981', fontWeight: 'bold' }}>{item["ราคา"] ? `฿${Number(item["ราคา"]).toLocaleString()}` : '-'}</span></div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

      </main>

    </div>
  );
}
