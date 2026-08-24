'use client';

import React, { useState, useEffect } from 'react';

// ⚠️ ใส่ URL Web App จาก Apps Script ของคุณตรงนี้
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxQc50YGia3np6jE2_V4PgrDBoaMTczXHGd-wf9yRqp/dev';

// 🔴 ข้อมูลตัวอย่าง (เพื่อให้เห็นกราฟฟิกสายเคเบิลทันที ก่อนเชื่อม Sheet จริง)
const DUMMY_DATA = [
  {
    "ระบบ": "ระบบปรับอากาศ (HVAC)",
    "เครื่องจักร": "Chiller Plant Master",
    "เครื่องจักรย่อย": "Chiller Unit 01",
    "ระบบประกอบเครื่องจักร": "CH-01",
    "การเปลี่ยนอะไหล่เครื่องจักร": "เปลี่ยน Magnetic Contactor & Overload Relay",
    "ราคา": 12500
  },
  {
    "ระบบ": "ระบบปรับอากาศ (HVAC)",
    "เครื่องจักร": "Chiller Plant Master",
    "เครื่องจักรย่อย": "Cooling Tower 02",
    "ระบบประกอบเครื่องจักร": "CT-02",
    "การเปลี่ยนอะไหล่เครื่องจักร": "อัดจาระบีลูกปืนพัดลม + เปลี่ยนสายพาน V-Belt",
    "ราคา": 4500
  },
  {
    "ระบบ": "ระบบไฟฟ้า",
    "เครื่องจักร": "Main Distribution Board",
    "เครื่องจักรย่อย": "MDB Floor 1",
    "ระบบประกอบเครื่องจักร": "MDB-01",
    "การเปลี่ยนอะไหล่เครื่องจักร": "เช็คสภาพ Digital Power Meter & Tighten Lug",
    "ราคา": 3200
  },
  {
    "ระบบ": "ระบบสุขาภิบาล/ประปา",
    "เครื่องจักร": "Booster Pump Set",
    "เครื่องจักรย่อย": "Pump Unit A",
    "ระบบประกอบเครื่องจักร": "BP-A",
    "การเปลี่ยนอะไหล่เครื่องจักร": "เปลี่ยน Mechanical Seal กันน้ำรั่วซึม",
    "ราคา": 6800
  }
];

export default function TIJNetworkDashboard() {
  const [activeTab, setActiveTab] = useState('HVAC');
  const [dataList, setDataList] = useState(DUMMY_DATA);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [form, setForm] = useState({
    system: 'ระบบปรับอากาศ (HVAC)',
    machine: '',
    subMachine: '',
    systemComponent: '',
    partReplacement: '',
    price: ''
  });

  // โหลดข้อมูลจาก Google Sheet
  const loadData = async () => {
    if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.includes('YOUR_APPS_SCRIPT')) {
      console.log("ใช้ข้อมูลสำรองเพื่อแสดงผลกราฟฟิก");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(APPS_SCRIPT_URL);
      const json = await res.json();
      if (Array.isArray(json) && json.length > 0) {
        setDataList(json);
      }
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (APPS_SCRIPT_URL && !APPS_SCRIPT_URL.includes('YOUR_APPS_SCRIPT')) {
        await fetch(APPS_SCRIPT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
          mode: 'no-cors'
        });
      }
      
      // เพิ่มลงรายการทันทีบนหน้าจอ
      const newItem = {
        "ระบบ": form.system,
        "เครื่องจักร": form.machine,
        "เครื่องจักรย่อย": form.subMachine,
        "ระบบประกอบเครื่องจักร": form.systemComponent,
        "การเปลี่ยนอะไหล่เครื่องจักร": form.partReplacement,
        "ราคา": form.price
      };
      setDataList([newItem, ...dataList]);

      alert('✅ บันทึกรายการใหม่และเชื่อมต่อสายเคเบิลเรียบร้อย!');
      setShowForm(false);
      setForm({
        system: 'ระบบปรับอากาศ (HVAC)',
        machine: '',
        subMachine: '',
        systemComponent: '',
        partReplacement: '',
        price: ''
      });
    } catch (err) {
      alert('❌ เกิดข้อผิดพลาด');
    } finally {
      setSubmitting(false);
    }
  };

  const menuTabs = [
    { id: 'HVAC', label: 'ระบบปรับอากาศ', icon: '❄️', keyword: 'ปรับอากาศ' },
    { id: 'ELECTRICAL', label: 'ระบบไฟฟ้า', icon: '⚡', keyword: 'ไฟฟ้า' },
    { id: 'PLUMBING', label: 'สุขาภิบาล/ประปา', icon: '💧', keyword: 'ประปา' },
    { id: 'FIRE', label: 'ระบบดับเพลิง', icon: '🔥', keyword: 'ดับเพลิง' },
    { id: 'ELEVATOR', label: 'ระบบลิฟต์', icon: '🛗', keyword: 'ลิฟต์' },
    { id: 'ALL', label: 'รายการทั้งหมด', icon: '🌐', keyword: '' }
  ];

  const currentTabObj = menuTabs.find(t => t.id === activeTab);
  const filteredData = activeTab === 'ALL'
    ? dataList
    : dataList.filter(item => item["ระบบ"] && item["ระบบ"].includes(currentTabObj.keyword));

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#030712', color: '#f3f4f6', fontFamily: 'monospace' }}>
      
      {/* 🟢 1. แท็บเมนูด้านซ้าย (LEFT SIDEBAR) */}
      <aside style={{ width: '260px', backgroundColor: '#0b0f19', borderRight: '1px solid #1f2937', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ borderBottom: '1px solid #1f2937', paddingBottom: '15px', marginBottom: '10px' }}>
          <div style={{ color: '#00f2ff', fontSize: '10px', letterSpacing: '2px', fontWeight: 'bold' }}>BSM-TIJ SYSTEM</div>
          <div style={{ color: '#fff', fontSize: '16px', fontWeight: 'bold', marginTop: '4px' }}>⚙️ แดชบอร์ดวิศวกรรม</div>
        </div>

        <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '5px' }}>หมวดหมู่ระบบงาน</div>

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
                backgroundColor: isActive ? 'rgba(0, 242, 255, 0.1)' : 'transparent',
                border: isActive ? '1px solid #00f2ff' : '1px solid transparent',
                color: isActive ? '#00f2ff' : '#9ca3af',
                cursor: 'pointer',
                textAlign: 'left',
                fontWeight: isActive ? 'bold' : 'normal',
                boxShadow: isActive ? '0 0 12px rgba(0, 242, 255, 0.2)' : 'none',
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
            <span style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%', boxShadow: '0 0 8px #10b981' }}></span> Live System Ready
          </div>
        </div>
      </aside>

      {/* 🟢 2. พื้นที่แสดงผลหลัก + สายเคเบิลเรืองแสง */}
      <main style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
        
        {/* Header Bar */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1f2937', paddingBottom: '16px' }}>
          <div>
            <div style={{ color: '#00f2ff', fontSize: '11px', letterSpacing: '2px' }}>TIJ BUILDING MAINTENANCE MATRIX</div>
            <h1 style={{ margin: '4px 0 0 0', fontSize: '22px', color: '#ffffff', fontWeight: 'bold' }}>
              {currentTabObj.icon} {currentTabObj.label}
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={loadData} style={{ backgroundColor: '#111827', color: '#00f2ff', border: '1px solid #00f2ff', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
              🔄 Refresh Data
            </button>
            <button
              onClick={() => setShowForm(!showForm)}
              style={{ backgroundColor: '#00f2ff', color: '#000', border: 'none', padding: '8px 18px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px', boxShadow: '0 0 15px rgba(0,242,255,0.4)' }}
            >
              {showForm ? '❌ ปิดฟอร์ม' : '➕ เพิ่มอะไหล่ใหม่'}
            </button>
          </div>
        </header>

        {/* ฟอร์มกรอกข้อมูล */}
        {showForm && (
          <form onSubmit={handleSubmit} style={{ backgroundColor: '#0b0f19', border: '1px solid #00f2ff', borderRadius: '10px', padding: '20px', marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', boxShadow: '0 0 20px rgba(0,242,255,0.15)' }}>
            <div style={{ gridColumn: '1 / -1', color: '#00f2ff', fontWeight: 'bold', fontSize: '14px', borderBottom: '1px solid #1f2937', paddingBottom: '8px' }}>
              📝 กรอกข้อมูลอุปกรณ์สำหรับบันทึกลงระบบ
            </div>
            
            <div>
              <label style={{ fontSize: '11px', color: '#9ca3af' }}>ระบบงาน</label>
              <input required placeholder="เช่น ระบบปรับอากาศ (HVAC)" value={form.system} onChange={e => setForm({...form, system: e.target.value})} style={{ width: '100%', padding: '8px', backgroundColor: '#111827', border: '1px solid #1f2937', color: '#fff', borderRadius: '4px', marginTop: '4px' }} />
            </div>

            <div>
              <label style={{ fontSize: '11px', color: '#9ca3af' }}>เครื่องจักรหลัก</label>
              <input required placeholder="เช่น Chiller Plant" value={form.machine} onChange={e => setForm({...form, machine: e.target.value})} style={{ width: '100%', padding: '8px', backgroundColor: '#111827', border: '1px solid #1f2937', color: '#fff', borderRadius: '4px', marginTop: '4px' }} />
            </div>

            <div>
              <label style={{ fontSize: '11px', color: '#9ca3af' }}>เครื่องจักรย่อย / อุปกรณ์</label>
              <input required placeholder="เช่น Motor Blower 15HP" value={form.subMachine} onChange={e => setForm({...form, subMachine: e.target.value})} style={{ width: '100%', padding: '8px', backgroundColor: '#111827', border: '1px solid #1f2937', color: '#fff', borderRadius: '4px', marginTop: '4px' }} />
            </div>

            <div>
              <label style={{ fontSize: '11px', color: '#9ca3af' }}>ระบบประกอบเครื่องจักร (รหัส)</label>
              <input required placeholder="เช่น CH-01, MDB-02" value={form.systemComponent} onChange={e => setForm({...form, systemComponent: e.target.value})} style={{ width: '100%', padding: '8px', backgroundColor: '#111827', border: '1px solid #1f2937', color: '#fff', borderRadius: '4px', marginTop: '4px' }} />
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
              <button type="submit" disabled={submitting} style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 0 10px rgba(16,185,129,0.3)' }}>
                {submitting ? 'กำลังบันทึก...' : '💾 บันทึกข้อมูลเข้า Node'}
              </button>
            </div>
          </form>
        )}

        {/* 🟢 3. สายเคเบิลลากโยงเน็ตเวิร์ก (CABLE NODE NETWORK DIAGRAM) */}
        <div style={{ marginTop: '24px' }}>
          <div style={{ color: '#00f2ff', fontSize: '12px', fontWeight: 'bold', marginBottom: '16px', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', backgroundColor: '#00f2ff', borderRadius: '50%', boxShadow: '0 0 10px #00f2ff' }}></span>
            CABLE NETWORK & EQUIPMENT CONNECTIONS
          </div>

          {filteredData.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280', backgroundColor: '#0b0f19', borderRadius: '10px', border: '1px solid #1f2937' }}>
              ไม่พบรายการอุปกรณ์ในหมวดนี้
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {filteredData.map((item, idx) => (
                <div key={idx} style={{ backgroundColor: '#0b0f19', border: '1px solid #1f2937', borderRadius: '12px', padding: '22px', position: 'relative', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
                  
                  {/* ⚡ สายเคเบิลหลักลากโยงจากซ้ายไปขวา ⚡ */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    
                    {/* NODE 1: รหัสเครื่อง (ฟ้าเรืองแสง) */}
                    <div style={{ backgroundColor: 'rgba(0, 242, 255, 0.1)', border: '2px solid #00f2ff', padding: '10px 18px', borderRadius: '8px', color: '#00f2ff', fontWeight: 'bold', fontSize: '13px', boxShadow: '0 0 15px rgba(0, 242, 255, 0.25)', minWidth: '90px', textAlign: 'center' }}>
                      {item["ระบบประกอบเครื่องจักร"] || `EQ-${idx+1}`}
                    </div>

                    {/* สายเคเบิลเส้นที่ 1 (ฟ้า -> เขียว) */}
                    <div style={{ flex: 1, height: '3px', background: 'linear-gradient(90deg, #00f2ff 0%, #10b981 100%)', boxShadow: '0 0 8px #00f2ff', borderRadius: '2px' }}></div>

                    {/* NODE 2: ชื่อเครื่องย่อย (เขียวเรืองแสง) */}
                    <div style={{ backgroundColor: '#111827', border: '1px solid #10b981', padding: '10px 18px', borderRadius: '8px', color: '#ffffff', fontWeight: 'bold', fontSize: '13px', boxShadow: '0 0 10px rgba(16, 185, 129, 0.15)' }}>
                      {item["เครื่องจักรย่อย"] || item["เครื่องจักร์ย่อย"] || item["เครื่องจักร"] || 'อุปกรณ์ย่อย'}
                    </div>

                    {/* สายเคเบิลเส้นที่ 2 (เขียว -> ส้ม) */}
                    <div style={{ flex: 1, height: '3px', background: 'linear-gradient(90deg, #10b981 0%, #f59e0b 100%)', boxShadow: '0 0 8px #10b981', borderRadius: '2px' }}></div>

                    {/* NODE 3: รายการเปลี่ยนอะไหล่ (ส้มเรืองแสง) */}
                    <div style={{ backgroundColor: '#111827', border: '1px solid #f59e0b', padding: '10px 18px', borderRadius: '8px', color: '#f59e0b', fontSize: '12px', maxWidth: '320px', boxShadow: '0 0 10px rgba(245, 158, 11, 0.15)' }}>
                      🔧 {item["การเปลี่ยนอะไหล่เครื่องจักร"] || 'ไม่มีการเปลี่ยนอะไหล่'}
                    </div>

                  </div>

                  {/* รายละเอียดเพิ่มเติมใต้เส้น Node */}
                  <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px dashed #1f2937', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#9ca3af' }}>
                    <div>ระบบ: <span style={{ color: '#00f2ff' }}>{item["ระบบ"] || '-'}</span></div>
                    <div>เครื่องจักรหลัก: <span style={{ color: '#fff' }}>{item["เครื่องจักร"] || '-'}</span></div>
                    <div>ราคาอะไหล่: <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '12px' }}>{item["ราคา"] ? `฿${Number(item["ราคา"]).toLocaleString()}` : '฿0'}</span></div>
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

    </div>
  );
}
