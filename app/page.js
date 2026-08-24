'use client';

import React, { useState, useEffect, useMemo } from 'react';

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzrfogs14H_DYFZsY9EiYTCGzmntRL-ciqlbvnZ10udpnMi7gIvORkf8qJ2ETJ5ZPzK7g/exec';

export default function SmartAssetMonitorTIJ() {
  const [sheetData, setSheetData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [selectedSysIndex, setSelectedSysIndex] = useState(0);
  const [selectedParentIndex, setSelectedParentIndex] = useState(0);
  const [selectedItemIndex, setSelectedItemIndex] = useState(0);

  // ฟอร์มบันทึกการทำงาน
  const [formData, setFormData] = useState({
    actionType: 'PM (บำรุงรักษาเชิงป้องกัน)',
    jobDetails: '',
    sparePart: '-',
    cost: '',
    technician: 'ทีม BSM-TIJ',
    status: 'ปกติ',
    note: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(APPS_SCRIPT_URL);
      if (!res.ok) throw new Error('เชื่อมต่อ Google Sheet API ไม่สำเร็จ');
      const json = await res.json();
      setSheetData(Array.isArray(json) ? json : []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 🛠️ Mapping โครงสร้างข้อมูลตามที่คุณระบุมา (แยกทุกแถวอิสระด้วย rowIndex)
  const structuredData = useMemo(() => {
    if (!sheetData.length) return [];
    const sysMap = new Map();

    sheetData.forEach((row, rowIndex) => {
      // ดึงค่าตามคอลัมน์โครงสร้างจริง
      const mainSys = row["ระบบเครื่องจักร"] || row["ระบบ"] || "ระบบอื่นๆ";
      const parentDev = row["เครื่องจักรย่อย"] || row["เครื่องจักร"] || "อุปกรณ์ทั่วไป";
      const itemDev = row["ระบบประกอบเครื่องจักร"] || `รายการที่ ${rowIndex + 1}`;

      if (!sysMap.has(mainSys)) sysMap.set(mainSys, new Map());
      const parentMap = sysMap.get(mainSys);
      if (!parentMap.has(parentDev)) parentMap.set(parentDev, []);

      const price = Number(row["ราคา"] || row["ราคาซ่อม"] || 0);

      parentMap.get(parentDev).push({
        id: rowIndex,
        name: itemDev,
        price: price,
        status: row["สถานะ"] || (price > 50000 ? 'Critical' : price > 10000 ? 'Warning' : 'Normal'),
        rawRow: row
      });
    });

    const result = [];
    sysMap.forEach((parentMap, mainSysName) => {
      const parentList = [];
      parentMap.forEach((itemList, parentName) => {
        parentList.push({ name: parentName, items: itemList });
      });
      result.push({ name: mainSysName, parents: parentList });
    });

    return result;
  }, [sheetData]);

  const currentSys = structuredData[selectedSysIndex] || structuredData[0];
  const currentParent = currentSys?.parents[selectedParentIndex] || currentSys?.parents[0];
  const currentItem = currentParent?.items[selectedItemIndex] || currentParent?.items[0];

  // ส่งข้อมูลบันทึกกลับไปที่ Google Sheet
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentItem) return;

    setIsSubmitting(true);
    setSuccessMsg(false);

    const payload = {
      timestamp: new Date().toLocaleString('th-TH'),
      rowIndex: currentItem.id,
      mainSystem: currentSys?.name,
      parentMachine: currentParent?.name,
      subMachine: currentItem.name,
      ...formData
    };

    try {
      await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        mode: 'no-cors'
      });
      setSuccessMsg(true);
      setFormData({ actionType: 'PM (บำรุงรักษาเชิงป้องกัน)', jobDetails: '', sparePart: '-', cost: '', technician: 'ทีม BSM-TIJ', status: 'ปกติ', note: '' });
      setTimeout(() => setSuccessMsg(false), 4000);
      loadData();
    } catch (err) {
      alert('บันทึกไม่สำเร็จ: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#070b14', minHeight: '100vh', color: '#e2e8f0', fontFamily: 'monospace', padding: '16px' }}>
      
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '12px', marginBottom: '16px' }}>
        <div>
          <span style={{ color: '#00f2ff', fontSize: '10px', letterSpacing: '2px', fontWeight: 'bold' }}>BSM-TIJ FACILITY MANAGEMENT HUB</span>
          <h1 style={{ margin: '2px 0 0 0', fontSize: '18px', color: '#fff' }}>⚡ ASSET MONITOR & WORK LOG SYSTEM</h1>
        </div>
        <button onClick={loadData} style={{ background: '#0f172a', color: '#00f2ff', border: '1px solid #00f2ff', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px' }}>
          🔄 โหลดข้อมูลใหม่ (Sync)
        </button>
      </header>

      {loading ? (
        <div style={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00f2ff' }}>กำลังเชื่อมต่อฐานข้อมูล Google Sheet...</div>
      ) : error ? (
        <div style={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>เกิดข้อผิดพลาด: {error}</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr 340px', gap: '16px', alignItems: 'start' }}>
          
          {/* คอลัมน์ที่ 1: ระบบหลัก */}
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', padding: '12px' }}>
            <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'bold', marginBottom: '10px' }}>ระบบหลักทั้งหมด ({structuredData.length})</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '75vh', overflowY: 'auto' }}>
              {structuredData.map((sys, idx) => (
                <div 
                  key={idx}
                  onClick={() => { setSelectedSysIndex(idx); setSelectedParentIndex(0); setSelectedItemIndex(0); }}
                  style={{
                    background: selectedSysIndex === idx ? '#1e293b' : '#090d16',
                    border: selectedSysIndex === idx ? '1px solid #00f2ff' : '1px solid #1e293b',
                    padding: '10px', borderRadius: '6px', cursor: 'pointer'
                  }}
                >
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#fff' }}>{sys.name}</div>
                  <div style={{ fontSize: '10px', color: '#00f2ff', marginTop: '2px' }}>{sys.parents.length} หมวดอุปกรณ์</div>
                </div>
              ))}
            </div>
          </div>

          {/* คอลัมน์ที่ 2: รายการอุปกรณ์และรายละเอียด */}
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* แท็บหมวดอุปกรณ์ย่อย */}
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '6px', borderBottom: '1px solid #1e293b' }}>
              {currentSys?.parents.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => { setSelectedParentIndex(idx); setSelectedItemIndex(0); }}
                  style={{
                    background: selectedParentIndex === idx ? '#00f2ff' : '#090d16',
                    color: selectedParentIndex === idx ? '#070b14' : '#94a3b8',
                    border: '1px solid #1e293b', padding: '6px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap'
                  }}
                >
                  {p.name} ({p.items.length})
                </button>
              ))}
            </div>

            {/* รายการชิ้นย่อยภายในหมวด (เช่น ลิฟต์ตัวที่ 1-5 จะแสดงครบถ้วนแยกการคลิก) */}
            <div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '8px' }}>รายการย่อยภายใต้: <span style={{ color: '#fff' }}>{currentParent?.name}</span></div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px', maxHeight: '25vh', overflowY: 'auto' }}>
                {currentParent?.items.map((item, idx) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItemIndex(idx)}
                    style={{
                      background: '#090d16',
                      border: selectedItemIndex === idx ? '2px solid #00f2ff' : '1px solid #1e293b',
                      padding: '8px', borderRadius: '6px', cursor: 'pointer'
                    }}
                  >
                    <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#fff' }}>{item.name}</div>
                    <div style={{ fontSize: '9px', color: '#00f2ff', marginTop: '2px' }}>สถานะ: {item.status}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* แสดงข้อมูลดิบ (Raw Data) ของแถวที่เลือก */}
            {currentItem && (
              <div style={{ background: '#090d16', border: '1px solid #1e293b', borderRadius: '6px', padding: '12px' }}>
                <div style={{ fontSize: '11px', color: '#00f2ff', fontWeight: 'bold', marginBottom: '8px' }}>📋 ข้อมูลจาก Google Sheet (Row #{currentItem.id + 1})</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', maxHeight: '200px', overflowY: 'auto' }}>
                  {Object.entries(currentItem.rawRow).map(([key, val], idx) => (
                    <div key={idx} style={{ fontSize: '10px', background: '#0f172a', padding: '6px', borderRadius: '4px', border: '1px solid #1e293b' }}>
                      <span style={{ color: '#94a3b8', display: 'block' }}>{key}:</span>
                      <span style={{ color: '#fff', fontWeight: 'bold' }}>{String(val || '-')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* คอลัมน์ที่ 3: ฟอร์มบันทึกการทำงาน */}
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', padding: '16px' }}>
            <div style={{ fontSize: '12px', color: '#00f2ff', fontWeight: 'bold', borderBottom: '1px solid #1e293b', paddingBottom: '8px', marginBottom: '12px' }}>
              📝 บันทึกประวัติการปฏิบัติงาน
            </div>

            {currentItem ? (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ background: '#090d16', padding: '8px', borderRadius: '4px', border: '1px solid #1e293b' }}>
                  <div style={{ fontSize: '9px', color: '#94a3b8' }}>เป้าหมาย:</div>
                  <div style={{ fontSize: '11px', color: '#10b981', fontWeight: 'bold' }}>{currentItem.name}</div>
                </div>

                <div>
                  <label style={{ fontSize: '10px', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>ประเภทกิจกรรม</label>
                  <select 
                    value={formData.actionType} 
                    onChange={(e) => setFormData({...formData, actionType: e.target.value})}
                    style={{ width: '100%', background: '#090d16', color: '#fff', border: '1px solid #1e293b', padding: '6px', borderRadius: '4px', fontSize: '11px' }}
                  >
                    <option value="PM (บำรุงรักษาเชิงป้องกัน)">🛠️ PM (บำรุงรักษาเชิงป้องกัน)</option>
                    <option value="Repair (ซ่อมแซมแก้ไข)">🔧 Repair (ซ่อมแซมแก้ไข)</option>
                    <option value="Replace Spare Part (เปลี่ยนอะไหล่)">⚙️ เปลี่ยนอะไหล่</option>
                    <option value="Inspect (ตรวจสอบสภาพ)">🔍 ตรวจสอบสภาพ</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '10px', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>รายละเอียดงาน</label>
                  <input 
                    type="text" 
                    placeholder="เช่น ตรวจสอบสลิง, เช็คระบบประตู" 
                    value={formData.jobDetails}
                    onChange={(e) => setFormData({...formData, jobDetails: e.target.value})}
                    required
                    style={{ width: '100%', background: '#090d16', color: '#fff', border: '1px solid #1e293b', padding: '6px', borderRadius: '4px', fontSize: '11px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '10px', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>ค่าใช้จ่าย (บาท)</label>
                  <input 
                    type="number" 
                    placeholder="0" 
                    value={formData.cost}
                    onChange={(e) => setFormData({...formData, cost: e.target.value})}
                    style={{ width: '100%', background: '#090d16', color: '#fff', border: '1px solid #1e293b', padding: '6px', borderRadius: '4px', fontSize: '11px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '10px', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>สถานะเครื่องหลังทำ</label>
                  <select 
                    value={formData.status} 
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    style={{ width: '100%', background: '#090d16', color: '#fff', border: '1px solid #1e293b', padding: '6px', borderRadius: '4px', fontSize: '11px' }}
                  >
                    <option value="ปกติ">🟢 ปกติ (Normal)</option>
                    <option value="เฝ้าระวัง">🟡 เฝ้าระวัง (Warning)</option>
                    <option value="ชำรุดรอซ่อม">🔴 ชำรุดรอซ่อม (Critical)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '10px', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>ผู้ปฏิบัติงาน / ทีมช่าง</label>
                  <input 
                    type="text" 
                    value={formData.technician}
                    onChange={(e) => setFormData({...formData, technician: e.target.value})}
                    required
                    style={{ width: '100%', background: '#090d16', color: '#fff', border: '1px solid #1e293b', padding: '6px', borderRadius: '4px', fontSize: '11px', boxSizing: 'border-box' }}
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  style={{ background: '#00f2ff', color: '#070b14', fontWeight: 'bold', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer', marginTop: '6px', fontSize: '11px' }}
                >
                  {isSubmitting ? 'กำลังบันทึก...' : '💾 บันทึกข้อมูลลงชีต'}
                </button>

                {successMsg && (
                  <div style={{ color: '#10b981', fontSize: '10px', textAlign: 'center', marginTop: '4px' }}>
                    ✅ บันทึกสำเร็จเรียบร้อย!
                  </div>
                )}
              </form>
            ) : (
              <div style={{ color: '#94a3b8', fontSize: '11px' }}>กรุณาเลือกอุปกรณ์ก่อนบันทึก</div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
