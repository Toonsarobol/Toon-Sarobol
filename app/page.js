'use client';

import React, { useState, useEffect, useMemo } from 'react';

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzrfogs14H_DYFZsY9EiYTCGzmntRL-ciqlbvnZ10udpnMi7gIvORkf8qJ2ETJ5ZPzK7g/exec';

export default function SmartAssetMonitorTIJ() {
  const [sheetData, setSheetData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // สถานะการเลือกดูและบันทึก
  const [selectedSystem, setSelectedSystem] = useState('all');
  const [activeItem, setActiveItem] = useState(null);

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

  // จัดกลุ่มข้อมูลแบบโครงสร้างต้นไม้ (Tree / Cable Node Structure)
  const assetTree = useMemo(() => {
    if (!sheetData.length) return [];
    const sysMap = new Map();

    sheetData.forEach((row, rowIndex) => {
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

  const filteredSystems = selectedSystem === 'all' 
    ? assetTree 
    : assetTree.filter(sys => sys.name === selectedSystem);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!activeItem) return;

    setIsSubmitting(true);
    setSuccessMsg(false);

    const payload = {
      timestamp: new Date().toLocaleString('th-TH'),
      rowIndex: activeItem.id,
      mainSystem: activeItem.mainSys,
      parentMachine: activeItem.parentName,
      subMachine: activeItem.name,
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
    <div style={{ backgroundColor: '#070b14', minHeight: '100vh', color: '#e2e8f0', fontFamily: 'system-ui, -apple-system, sans-serif', padding: '20px', boxSizing: 'border-box', overflowX: 'hidden' }}>
      
      {/* Header โครงสร้างองค์กร */}
      <header style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '16px', marginBottom: '20px', gap: '12px' }}>
        <div>
          <div style={{ color: '#00f2ff', fontSize: '11px', letterSpacing: '2px', fontWeight: 'bold', textTransform: 'uppercase' }}>Thailand Institute of Justice (TIJ) - BSM Division</div>
          <h1 style={{ margin: '4px 0 0 0', fontSize: '20px', color: '#fff', fontWeight: '700' }}>⚡ Facility Asset Cable & Node Intelligence Hub</h1>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={loadData} style={{ background: '#0f172a', color: '#00f2ff', border: '1px solid #00f2ff', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
            🔄 ซิงค์ข้อมูลใหม่
          </button>
        </div>
      </header>

      {loading ? (
        <div style={{ height: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00f2ff', fontSize: '14px' }}>กำลังโหลดโครงสร้างระบบอาคาร...</div>
      ) : error ? (
        <div style={{ height: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', fontSize: '14px' }}>เกิดข้อผิดพลาด: {error}</div>
      ) : (
        <div>
          {/* ตัวกรองระบบหลัก (System Filters) */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px' }}>
            <button
              onClick={() => setSelectedSystem('all')}
              style={{
                background: selectedSystem === 'all' ? '#00f2ff' : '#0f172a',
                color: selectedSystem === 'all' ? '#070b14' : '#94a3b8',
                border: '1px solid #1e293b', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer'
              }}
            >
              🌐 แสดงทั้งหมด ({assetTree.length})
            </button>
            {assetTree.map((sys, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedSystem(sys.name)}
                style={{
                  background: selectedSystem === sys.name ? '#00f2ff' : '#0f172a',
                  color: selectedSystem === sys.name ? '#070b14' : '#94a3b8',
                  border: '1px solid #1e293b', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer'
                }}
              >
                {sys.name}
              </button>
            ))}
          </div>

          {/* ผังโครงสร้างแบบ Node & Cable Tree View */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {filteredSystems.map((sys, sIdx) => (
              <div key={sIdx} style={{ background: '#090d16', border: '1px solid #1e293b', borderRadius: '10px', padding: '16px', position: 'relative' }}>
                
                {/* หัวข้อระบบหลัก */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', borderBottom: '1px solid #1e293b', paddingBottom: '10px' }}>
                  <div style={{ width: '8px', height: '8px', backgroundColor: '#00f2ff', borderRadius: '50%', boxShadow: '0 0 8px #00f2ff' }}></div>
                  <h2 style={{ margin: 0, fontSize: '14px', color: '#fff', fontWeight: 'bold' }}>{sys.name}</h2>
                </div>

                {/* สาขาอุปกรณ์ย่อย (Cable Branches) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingLeft: '12px', borderLeft: '2px dashed #1e293b', marginLeft: '4px' }}>
                  {sys.parents.map((parent, pIdx) => (
                    <div key={pIdx} style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', padding: '12px' }}>
                      <div style={{ fontSize: '12px', color: '#38bdf8', fontWeight: 'bold', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>📂</span> {parent.name}
                      </div>

                      {/* รายการโหนดอุปกรณ์ย่อย (Nodes) */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '8px' }}>
                        {parent.items.map((item) => {
                          const isSelected = activeItem?.id === item.id;
                          return (
                            <div
                              key={item.id}
                              onClick={() => setActiveItem({ ...item, mainSys: sys.name, parentName: parent.name })}
                              style={{
                                background: isSelected ? '#1e293b' : '#070b14',
                                border: isSelected ? '1px solid #00f2ff' : '1px solid #1e293b',
                                borderRadius: '6px', padding: '10px', cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                boxShadow: isSelected ? '0 0 10px rgba(0, 242, 255, 0.2)' : 'none'
                              }}
                            >
                              <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#fff', marginBottom: '4px' }}>{item.name}</div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '9px' }}>
                                <span style={{ color: item.status === 'Critical' ? '#ef4444' : item.status === 'Warning' ? '#f59e0b' : '#10b981', fontWeight: 'bold' }}>
                                  ● {item.status}
                                </span>
                                <span style={{ color: '#64748b' }}>Row #{item.id + 1}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            ))}
          </div>

          {/* ส่วนฟอร์มบันทึกการปฏิบัติงานและดูข้อมูลดิบ (แสดงขึ้นมาเมื่อเลือกโหนด) */}
          {activeItem && (
            <div style={{ marginTop: '24px', background: '#0f172a', border: '2px solid #00f2ff', borderRadius: '12px', padding: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #1e293b', paddingBottom: '10px' }}>
                <div>
                  <span style={{ fontSize: '10px', color: '#00f2ff', textTransform: 'uppercase' }}>Selected Node Target</span>
                  <h3 style={{ margin: '2px 0 0 0', fontSize: '14px', color: '#fff' }}>{activeItem.name} <span style={{ fontSize: '11px', color: '#94a3b8' }}>({activeItem.parentName})</span></h3>
                </div>
                <button onClick={() => setActiveItem(null)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '16px' }}>✕</button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>
                
                {/* ข้อมูลดิบจากชีต */}
                <div style={{ background: '#070b14', padding: '12px', borderRadius: '8px', border: '1px solid #1e293b' }}>
                  <div style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 'bold', marginBottom: '8px' }}>📋 ข้อมูลแถวปัจจุบันใน Google Sheet</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', maxHeight: '220px', overflowY: 'auto' }}>
                    {Object.entries(activeItem.rawRow).map(([key, val], idx) => (
                      <div key={idx} style={{ fontSize: '10px', background: '#0f172a', padding: '6px', borderRadius: '4px' }}>
                        <span style={{ color: '#64748b', display: 'block' }}>{key}:</span>
                        <span style={{ color: '#fff', fontWeight: '600' }}>{String(val || '-')}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ฟอร์มบันทึกงาน */}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ fontSize: '11px', color: '#10b981', fontWeight: 'bold' }}>✍️ บันทึกประวัติการบำรุงรักษา / ซ่อมแซม</div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '10px', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>ประเภทกิจกรรม</label>
                      <select 
                        value={formData.actionType} 
                        onChange={(e) => setFormData({...formData, actionType: e.target.value})}
                        style={{ width: '100%', background: '#070b14', color: '#fff', border: '1px solid #1e293b', padding: '6px', borderRadius: '4px', fontSize: '11px' }}
                      >
                        <option value="PM (บำรุงรักษาเชิงป้องกัน)">🛠️ PM</option>
                        <option value="Repair (ซ่อมแซมแก้ไข)">🔧 Repair</option>
                        <option value="Replace Spare Part (เปลี่ยนอะไหล่)">⚙️ เปลี่ยนอะไหล่</option>
                        <option value="Inspect (ตรวจสอบสภาพ)">🔍 ตรวจสอบ</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '10px', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>สถานะเครื่อง</label>
                      <select 
                        value={formData.status} 
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                        style={{ width: '100%', background: '#070b14', color: '#fff', border: '1px solid #1e293b', padding: '6px', borderRadius: '4px', fontSize: '11px' }}
                      >
                        <option value="ปกติ">🟢 ปกติ</option>
                        <option value="เฝ้าระวัง">🟡 เฝ้าระวัง</option>
                        <option value="ชำรุดรอซ่อม">🔴 ชำรุดรอซ่อม</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '10px', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>รายละเอียดการทำงาน</label>
                    <input 
                      type="text" 
                      placeholder="เช่น ตรวจเช็คระบบตู้ MDB, ทำความสะอาดหน้าสัมผัส" 
                      value={formData.jobDetails}
                      onChange={(e) => setFormData({...formData, jobDetails: e.target.value})}
                      required
                      style={{ width: '100%', background: '#070b14', color: '#fff', border: '1px solid #1e293b', padding: '6px', borderRadius: '4px', fontSize: '11px', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '10px', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>ค่าใช้จ่าย (บาท)</label>
                      <input 
                        type="number" 
                        placeholder="0" 
                        value={formData.cost}
                        onChange={(e) => setFormData({...formData, cost: e.target.value})}
                        style={{ width: '100%', background: '#070b14', color: '#fff', border: '1px solid #1e293b', padding: '6px', borderRadius: '4px', fontSize: '11px', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '10px', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>ผู้ปฏิบัติงาน</label>
                      <input 
                        type="text" 
                        value={formData.technician}
                        onChange={(e) => setFormData({...formData, technician: e.target.value})}
                        required
                        style={{ width: '100%', background: '#070b14', color: '#fff', border: '1px solid #1e293b', padding: '6px', borderRadius: '4px', fontSize: '11px', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    style={{ background: '#00f2ff', color: '#070b14', fontWeight: 'bold', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer', marginTop: '4px', fontSize: '11px' }}
                  >
                    {isSubmitting ? 'กำลังบันทึกข้อมูล...' : '💾 บันทึกข้อมูลลง Google Sheet'}
                  </button>

                  {successMsg && (
                    <div style={{ color: '#10b981', fontSize: '11px', textAlign: 'center', marginTop: '2px' }}>
                      ✅ บันทึกข้อมูลเรียบร้อยแล้ว!
                    </div>
                  )}
                </form>

              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
