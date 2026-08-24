'use client';

import React, { useState, useEffect, useMemo } from 'react';

// 🌐 Web App URL จาก Apps Script
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzrfogs14H_DYFZsY9EiYTCGzmntRL-ciqlbvnZ10udpnMi7gIvORkf8qJ2ETJ5ZPzK7g/exec';

export default function SmartAssetMonitor() {
  const [sheetData, setSheetData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [selectedMainSysIndex, setSelectedMainSysIndex] = useState(0);
  const [selectedParentIndex, setSelectedParentIndex] = useState(0);
  const [selectedSubNodeIndex, setSelectedSubNodeIndex] = useState(0);

  // 📝 State สำหรับฟอร์มบันทึกการทำงาน
  const [actionType, setActionType] = useState('PM'); // PM, Repair, Inspect
  const [partName, setPartName] = useState('');
  const [cost, setCost] = useState('');
  const [technician, setTechnician] = useState('');
  const [remark, setRemark] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // ดึงข้อมูล Real-Time จาก Google Sheet
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(APPS_SCRIPT_URL);
      if (!res.ok) throw new Error('ไม่สามารถเชื่อมต่อ Google Sheet API ได้');
      const json = await res.json();
      
      if (Array.isArray(json)) {
        setSheetData(json);
      } else {
        setSheetData([]);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // จัดกลุ่มข้อมูลตามโครงสร้าง 3 ระดับ
  const structuredData = useMemo(() => {
    if (!sheetData || sheetData.length === 0) return [];

    const sysMap = new Map();

    sheetData.forEach((row) => {
      const mainSys = row["ระบบเครื่องจักร"] || row["ระบบ"] || "ระบบอื่นๆ";
      const parentDev = row["เครื่องจักร"] || "อุปกรณ์ทั่วไป";
      const subDev = row["เครื่องจักรย่อย"] || row["เครื่องจักร์ย่อย"] || row["ระบบประกอบเครื่องจักร"] || "รายการย่อย";

      if (!sysMap.has(mainSys)) {
        sysMap.set(mainSys, new Map());
      }

      const parentMap = sysMap.get(mainSys);
      if (!parentMap.has(parentDev)) {
        parentMap.set(parentDev, []);
      }

      const price = Number(row["ราคา"]) || Number(row["ราคาซ่อม"]) || 0;
      
      parentMap.get(parentDev).push({
        name: subDev,
        code: row["ระบบประกอบเครื่องจักร"] || subDev,
        part: row["การเปลี่ยนอะไหล่เครื่องจักร"] || row["รายการอะไหล่"] || "ไม่มีการบันทึก",
        price: price,
        status: row["สถานะ"] || (price > 50000 ? 'Critical' : price > 10000 ? 'Warning' : 'Online'),
        rawRow: row
      });
    });

    const result = [];
    sysMap.forEach((parentMap, mainSysName) => {
      const parentList = [];
      parentMap.forEach((subList, parentName) => {
        parentList.push({
          name: parentName,
          subNodes: subList
        });
      });
      result.push({
        name: mainSysName,
        parents: parentList
      });
    });

    return result;
  }, [sheetData]);

  const currentMainSystem = structuredData[selectedMainSysIndex] || structuredData[0];
  const currentParent = currentMainSystem?.parents[selectedParentIndex] || currentMainSystem?.parents[0];
  const currentSubNode = currentParent?.subNodes[selectedSubNodeIndex] || currentParent?.subNodes[0];

  // 📤 ฟังก์ชั่นส่งข้อมูลบันทึกไปยัง Google Sheet
  const handleSubmitLog = async (e) => {
    e.preventDefault();
    if (!currentSubNode) return;

    setIsSubmitting(true);
    setSubmitSuccess(false);

    const payload = {
      timestamp: new Date().toLocaleString('th-TH'),
      mainSystem: currentMainSystem?.name,
      parentMachine: currentParent?.name,
      subMachine: currentSubNode?.name,
      actionType: actionType,
      partName: partName,
      cost: cost,
      technician: technician,
      remark: remark
    };

    try {
      await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        mode: 'no-cors' // Google Apps Script POST ต้องใช้ no-cors
      });

      setSubmitSuccess(true);
      setPartName('');
      setCost('');
      setRemark('');
      setTimeout(() => setSubmitSuccess(false), 3000);
      loadData(); // โหลดข้อมูลใหม่
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#090d16', minHeight: '100vh', color: '#f3f4f6', fontFamily: 'monospace', padding: '20px' }}>
      
      {/* 🟢 TOP HEADER */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '12px', marginBottom: '20px' }}>
        <div>
          <div style={{ color: '#00f2ff', fontSize: '11px', letterSpacing: '2px', fontWeight: 'bold' }}>
            BSM-TIJ SMART ASSET & WORK LOG SYSTEM
          </div>
          <h1 style={{ margin: '2px 0 0 0', fontSize: '20px', color: '#ffffff', fontWeight: 'bold' }}>
            ⚡ REAL-TIME BUILDING ASSET MONITOR & LOG
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            onClick={loadData} 
            style={{ backgroundColor: '#0f172a', color: '#00f2ff', border: '1px solid #00f2ff', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px' }}
          >
            🔄 Sync Data
          </button>
        </div>
      </header>

      {/* 🟢 STATE HANDLERS */}
      {loading ? (
        <div style={{ height: 'calc(100vh - 150px)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00f2ff', fontSize: '14px' }}>
          ⚡ กำลังดึงข้อมูล Real-Time จาก Google Sheet...
        </div>
      ) : error ? (
        <div style={{ height: 'calc(100vh - 150px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#ef4444', backgroundColor: '#0f172a', borderRadius: '10px' }}>
          ⚠️ เชื่อมต่อ Database ไม่สำเร็จ: {error}
        </div>
      ) : structuredData.length === 0 ? (
        <div style={{ height: 'calc(100vh - 150px)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
          ไม่พบรายการข้อมูลใน Google Sheet
        </div>
      ) : (
        /* 🟢 MAIN 3-COLUMN DASHBOARD LAYOUT */
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr 340px', gap: '20px', minHeight: 'calc(100vh - 110px)' }}>
          
          {/* ================= COLUMN 1: MAIN MACHINES ================= */}
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '10px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto' }}>
            <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 'bold', letterSpacing: '1px' }}>
              SYSTEM CATEGORIES ({structuredData.length})
            </div>

            {structuredData.map((sys, idx) => {
              const isSelected = selectedMainSysIndex === idx;
              return (
                <div
                  key={idx}
                  onClick={() => {
                    setSelectedMainSysIndex(idx);
                    setSelectedParentIndex(0);
                    setSelectedSubNodeIndex(0);
                  }}
                  style={{
                    backgroundColor: isSelected ? '#1e293b' : '#090d16',
                    border: isSelected ? '1px solid #00f2ff' : '1px solid #1e293b',
                    borderRadius: '8px',
                    padding: '12px',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#fff' }}>{sys.name}</div>
                  <div style={{ fontSize: '10px', color: '#00f2ff', marginTop: '4px' }}>{sys.parents.length} เครื่องจักรหลัก</div>
                </div>
              );
            })}
          </div>

          {/* ================= COLUMN 2: TOPOLOGY & SUB-NODES ================= */}
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '10px', padding: '20px', display: 'flex', flexDirection: 'column' }}>
            
            {/* TAB เครื่องจักรหลัก */}
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '15px', borderBottom: '1px solid #1e293b' }}>
              {currentMainSystem?.parents.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedParentIndex(idx);
                    setSelectedSubNodeIndex(0);
                  }}
                  style={{
                    backgroundColor: selectedParentIndex === idx ? '#00f2ff' : '#090d16',
                    color: selectedParentIndex === idx ? '#090d16' : '#94a3b8',
                    border: '1px solid #1e293b',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {p.name}
                </button>
              ))}
            </div>

            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
              
              {/* PARENT NODE */}
              <div style={{ backgroundColor: '#090d16', border: '2px solid #00f2ff', borderRadius: '10px', padding: '16px', width: '200px', zIndex: 2 }}>
                <div style={{ fontSize: '9px', color: '#00f2ff' }}>PARENT EQUIPMENT</div>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff', marginTop: '4px' }}>{currentParent?.name}</div>
              </div>

              {/* SVG CABLE */}
              <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
                {currentParent?.subNodes.slice(0, 8).map((_, idx) => {
                  const total = Math.min(currentParent.subNodes.length, 8);
                  const startY = 50;
                  const endY = ((idx + 1) * (100 / (total + 1)));
                  return (
                    <path
                      key={idx}
                      d={`M 200,${startY}% C 300,${startY}% 300,${endY}% 400,${endY}%`}
                      fill="none"
                      stroke="#00f2ff"
                      strokeWidth="2"
                    />
                  );
                })}
              </svg>

              {/* SUB NODES */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '230px', zIndex: 2, maxHeight: '100%', overflowY: 'auto' }}>
                {currentParent?.subNodes.map((sub, idx) => {
                  const isSubSelected = selectedSubNodeIndex === idx;
                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedSubNodeIndex(idx)}
                      style={{
                        backgroundColor: '#090d16',
                        border: isSubSelected ? '2px solid #ef4444' : '1px solid #1e293b',
                        borderRadius: '8px',
                        padding: '10px',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#fff' }}>{sub.name}</div>
                      <div style={{ fontSize: '9px', color: '#94a3b8', marginTop: '2px' }}>อะไหล่: {sub.part}</div>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>

          {/* ================= COLUMN 3: WORK LOG ENTRY FORM (ฟอร์มบันทึกการทำงาน) ================= */}
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '10px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto' }}>
            <div style={{ fontSize: '12px', color: '#00f2ff', fontWeight: 'bold', letterSpacing: '1px', borderBottom: '1px solid #1e293b', paddingBottom: '8px' }}>
              📝 บันทึกการทำงาน / ซ่อมบำรุง
            </div>

            {currentSubNode ? (
              <form onSubmit={handleSubmitLog} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                
                {/* ข้อมูลอุปกรณ์ที่เลือก */}
                <div style={{ backgroundColor: '#090d16', padding: '10px', borderRadius: '6px', border: '1px solid #1e293b' }}>
                  <div style={{ fontSize: '9px', color: '#64748b' }}>อุปกรณ์ที่กำลังบันทึก:</div>
                  <div style={{ fontSize: '12px', color: '#10b981', fontWeight: 'bold' }}>{currentSubNode.name}</div>
                  <div style={{ fontSize: '10px', color: '#94a3b8' }}>({currentParent?.name})</div>
                </div>

                {/* ประเภทการทำงาน */}
                <div>
                  <label style={{ fontSize: '10px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>ประเภทงาน (Action Type)</label>
                  <select 
                    value={actionType} 
                    onChange={(e) => setActionType(e.target.value)}
                    style={{ width: '100%', backgroundColor: '#090d16', color: '#fff', border: '1px solid #1e293b', padding: '6px', borderRadius: '4px', fontSize: '11px' }}
                  >
                    <option value="PM">🛠️ บำรุงรักษาเชิงป้องกัน (PM)</option>
                    <option value="Repair">🔧 ซ่อมแซม / เปลี่ยนอะไหล่ (Repair)</option>
                    <option value="Inspect">🔍 ตรวจสอบปกติ (Inspect)</option>
                  </select>
                </div>

                {/* อะไหล่ที่เปลี่ยน */}
                <div>
                  <label style={{ fontSize: '10px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>รายการอะไหล่ / งานที่ทำ</label>
                  <input 
                    type="text" 
                    placeholder="เช่น เปลี่ยนน้ำมันเครื่อง, เปลี่ยน Filter" 
                    value={partName} 
                    onChange={(e) => setPartName(e.target.value)}
                    required
                    style={{ width: '100%', backgroundColor: '#090d16', color: '#fff', border: '1px solid #1e293b', padding: '6px', borderRadius: '4px', fontSize: '11px', boxSizing: 'border-box' }}
                  />
                </div>

                {/* ค่าใช้จ่าย */}
                <div>
                  <label style={{ fontSize: '10px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>ค่าใช้จ่าย (บาท)</label>
                  <input 
                    type="number" 
                    placeholder="0" 
                    value={cost} 
                    onChange={(e) => setCost(e.target.value)}
                    style={{ width: '100%', backgroundColor: '#090d16', color: '#fff', border: '1px solid #1e293b', padding: '6px', borderRadius: '4px', fontSize: '11px', boxSizing: 'border-box' }}
                  />
                </div>

                {/* ช่างผู้บันทึก */}
                <div>
                  <label style={{ fontSize: '10px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>ผู้บันทึก / ทีมช่าง (BSM-TIJ)</label>
                  <input 
                    type="text" 
                    placeholder="ระบุชื่อช่าง" 
                    value={technician} 
                    onChange={(e) => setTechnician(e.target.value)}
                    required
                    style={{ width: '100%', backgroundColor: '#090d16', color: '#fff', border: '1px solid #1e293b', padding: '6px', borderRadius: '4px', fontSize: '11px', boxSizing: 'border-box' }}
                  />
                </div>

                {/* หมายเหตุ */}
                <div>
                  <label style={{ fontSize: '10px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>หมายเหตุเพิ่มเติม</label>
                  <textarea 
                    rows="2" 
                    placeholder="รายละเอียดเพิ่มเติม..." 
                    value={remark} 
                    onChange={(e) => setRemark(e.target.value)}
                    style={{ width: '100%', backgroundColor: '#090d16', color: '#fff', border: '1px solid #1e293b', padding: '6px', borderRadius: '4px', fontSize: '11px', boxSizing: 'border-box' }}
                  />
                </div>

                {/* ปุ่ม Submit */}
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  style={{ 
                    backgroundColor: isSubmitting ? '#64748b' : '#00f2ff', 
                    color: '#090d16', 
                    fontWeight: 'bold', 
                    border: 'none', 
                    padding: '8px', 
                    borderRadius: '6px', 
                    cursor: 'pointer',
                    marginTop: '6px',
                    fontSize: '12px'
                  }}
                >
                  {isSubmitting ? '⏳ กำลังบันทึก...' : '💾 บันทึกข้อมูลลง Google Sheet'}
                </button>

                {submitSuccess && (
                  <div style={{ color: '#10b981', fontSize: '10px', textAlign: 'center', marginTop: '4px' }}>
                    ✅ บันทึกข้อมูลเข้า Google Sheet เรียบร้อยแล้ว!
                  </div>
                )}
              </form>
            ) : (
              <div style={{ color: '#64748b', fontSize: '11px' }}>โปรดเลือกอุปกรณ์เพื่อบันทึกงาน</div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}

 
