'use client';

import React, { useState, useEffect, useMemo } from 'react';

// ⚠️ ใส่ URL Web App จาก Apps Script ของคุณที่นี่
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzrfogs14H_DYFZsY9EiYTCGzmntRL-ciqlbvnZ10udpnMi7gIvORkf8qJ2ETJ5ZPzK7g/exec';

export default function SmartAssetMonitor() {
  const [sheetData, setSheetData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [selectedMainSysIndex, setSelectedMainSysIndex] = useState(0);
  const [selectedParentIndex, setSelectedParentIndex] = useState(0);
  const [selectedSubNodeIndex, setSelectedSubNodeIndex] = useState(0);

  // ดึงข้อมูล Real-Time จาก Google Sheet
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.includes('YOUR_APPS_SCRIPT')) {
        throw new Error('กรุณาระบุ APPS_SCRIPT_URL ให้ถูกต้อง');
      }
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

  // จัดกลุ่มข้อมูลจริงตามโครงสร้าง 3 ระดับ: ระบบเครื่องจักร -> เครื่องจักร -> เครื่องจักรย่อย
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
        part: row["การเปลี่ยนอะไหล่เครื่องจักร"] || row["รายการอะไหล่"] || "ไม่มีการบันทึกการเปลี่ยนอะไหล่",
        price: price,
        status: row["สถานะ"] || (price > 50000 ? 'Critical' : price > 10000 ? 'Warning' : 'Online'),
        rawRow: row
      });
    });

    // แปลง Map เป็น Array เพื่อนำไป Render
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

  // ตัวแปรสำหรับตำแหน่งข้อมูลที่เลือกปัจจุบัน
  const currentMainSystem = structuredData[selectedMainSysIndex] || structuredData[0];
  const currentParent = currentMainSystem?.parents[selectedParentIndex] || currentMainSystem?.parents[0];
  const currentSubNode = currentParent?.subNodes[selectedSubNodeIndex] || currentParent?.subNodes[0];

  return (
    <div style={{ backgroundColor: '#090d16', minHeight: '100vh', color: '#f3f4f6', fontFamily: 'monospace', padding: '20px' }}>
      
      {/* 🟢 TOP HEADER */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '12px', marginBottom: '20px' }}>
        <div>
          <div style={{ color: '#00f2ff', fontSize: '11px', letterSpacing: '2px', fontWeight: 'bold' }}>
            BSM-TIJ SMART ASSET & HARDWARE TOPOLOGY
          </div>
          <h1 style={{ margin: '2px 0 0 0', fontSize: '20px', color: '#ffffff', fontWeight: 'bold' }}>
            ⚡ REAL-TIME BUILDING ASSET MONITOR
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            onClick={loadData} 
            style={{ backgroundColor: '#0f172a', color: '#00f2ff', border: '1px solid #00f2ff', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px' }}
          >
            🔄 Sync Sheet Data
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#0f172a', padding: '6px 14px', borderRadius: '20px', border: '1px solid #1e293b' }}>
            <span style={{ width: '8px', height: '8px', backgroundColor: loading ? '#f59e0b' : error ? '#ef4444' : '#10b981', borderRadius: '50%', boxShadow: `0 0 8px ${loading ? '#f59e0b' : error ? '#ef4444' : '#10b981'}` }}></span>
            <span style={{ fontSize: '11px', color: loading ? '#f59e0b' : error ? '#ef4444' : '#10b981', fontWeight: 'bold' }}>
              {loading ? 'SYNCING...' : error ? 'ERROR' : 'LIVE CONNECTED'}
            </span>
          </div>
        </div>
      </header>

      {/* 🟢 STATE HANDLERS */}
      {loading ? (
        <div style={{ height: 'calc(100vh - 150px)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00f2ff', fontSize: '14px' }}>
          ⚡ กำลังดึงข้อมูล Real-Time จาก Google Sheet TIJ...
        </div>
      ) : error ? (
        <div style={{ height: 'calc(100vh - 150px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#ef4444', backgroundColor: '#0f172a', borderRadius: '10px', border: '1px solid #ef444440' }}>
          <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>⚠️ เชื่อมต่อ Database ไม่สำเร็จ</div>
          <div style={{ fontSize: '12px', color: '#94a3b8' }}>{error}</div>
        </div>
      ) : structuredData.length === 0 ? (
        <div style={{ height: 'calc(100vh - 150px)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', backgroundColor: '#0f172a', borderRadius: '10px' }}>
          ไม่พบรายการข้อมูลใน Google Sheet
        </div>
      ) : (
        /* 🟢 MAIN 3-COLUMN DASHBOARD LAYOUT */
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr 320px', gap: '20px', height: 'calc(100vh - 110px)' }}>
          
          {/* ================= COLUMN 1: MAIN MACHINES (ระบบเครื่องจักร) ================= */}
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '10px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto' }}>
            <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '4px' }}>
              SYSTEM CATEGORIES ({structuredData.length})
            </div>

            {structuredData.map((sys, idx) => {
              const isSelected = selectedMainSysIndex === idx;
              const totalItems = sys.parents.reduce((acc, p) => acc + p.subNodes.length, 0);

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
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: isSelected ? '0 0 10px rgba(0, 242, 255, 0.15)' : 'none'
                  }}
                >
                  <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#fff', marginBottom: '6px' }}>{sys.name}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px' }}>
                    <span style={{ color: '#00f2ff' }}>{sys.parents.length} เครื่องจักรหลัก</span>
                    <span style={{ color: '#64748b' }}>{totalItems} รายการย่อย</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ================= COLUMN 2: DATA STREAM TOPOLOGY (CABLE VISUALIZER) ================= */}
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '10px', padding: '20px', position: 'relative', display: 'flex', flexDirection: 'column' }}>
            
            {/* TAB เลือกเครื่องจักรหลัก (PARENT MACHINE) */}
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

            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', padding: '0 10px' }}>
              
              {/* LEFT PARENT NODE */}
              <div style={{ 
                backgroundColor: '#090d16', 
                border: '2px solid #00f2ff', 
                borderRadius: '10px', 
                padding: '16px', 
                width: '210px', 
                boxShadow: '0 0 20px rgba(0, 242, 255, 0.2)',
                zIndex: 2 
              }}>
                <div style={{ fontSize: '9px', color: '#00f2ff', letterSpacing: '1px', marginBottom: '4px' }}>PARENT EQUIPMENT</div>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff' }}>{currentParent?.name}</div>
                <div style={{ fontSize: '10px', color: '#64748b', marginTop: '6px' }}>ระบบ: {currentMainSystem?.name}</div>
              </div>

              {/* SVG CABLE CONNECTIONS */}
              <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
                <defs>
                  <linearGradient id="cableGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#00f2ff" />
                    <stop offset="100%" stopColor="#ef4444" />
                  </linearGradient>
                </defs>
                {currentParent?.subNodes.slice(0, 10).map((_, idx) => {
                  const total = Math.min(currentParent.subNodes.length, 10);
                  const startY = 50;
                  const endY = ((idx + 1) * (100 / (total + 1)));
                  return (
                    <path
                      key={idx}
                      d={`M 220,${startY}% C 320,${startY}% 320,${endY}% 420,${endY}%`}
                      fill="none"
                      stroke="url(#cableGrad)"
                      strokeWidth="2.5"
                      style={{ filter: 'drop-shadow(0px 0px 5px #00f2ff)' }}
                    />
                  );
                })}
              </svg>

              {/* RIGHT SUB-NODES (รายการเครื่องจักรย่อย) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '240px', zIndex: 2, maxHeight: '100%', overflowY: 'auto', paddingRight: '4px' }}>
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
                        cursor: 'pointer',
                        boxShadow: isSubSelected ? '0 0 12px rgba(239, 68, 68, 0.3)' : 'none',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#64748b', marginBottom: '2px' }}>
                        <span style={{ color: '#00f2ff' }}>{sub.code}</span>
                        <span style={{ color: sub.status === 'Critical' ? '#ef4444' : sub.status === 'Warning' ? '#f59e0b' : '#10b981' }}>
                          ● {sub.status}
                        </span>
                      </div>
                      <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {sub.name}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>

          {/* ================= COLUMN 3: FINANCIAL & DETAILS ANALYTICS ================= */}
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '10px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 'bold', letterSpacing: '1px' }}>
              FINANCIAL & ITEM DETAILS
            </div>

            {currentSubNode && (
              <div style={{ backgroundColor: '#090d16', border: '1px solid #1e293b', borderRadius: '8px', padding: '14px' }}>
                <div style={{ fontSize: '10px', color: '#64748b' }}>อุปกรณ์ย่อยที่เลือก</div>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#00f2ff', marginTop: '2px' }}>
                  {currentSubNode.name}
                </div>

                <div style={{ marginTop: '14px', padding: '10px', backgroundColor: '#0f172a', borderRadius: '6px', border: '1px solid #1e293b' }}>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>🔧 รายการเปลี่ยนอะไหล่</div>
                  <div style={{ fontSize: '12px', color: '#f59e0b', fontWeight: 'bold', marginTop: '4px' }}>
                    {currentSubNode.part}
                  </div>
                </div>
                
                <div style={{ marginTop: '16px' }}>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>ราคาซ่อมบำรุง / เปลี่ยนอะไหล่</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: currentSubNode.price > 0 ? '#ef4444' : '#10b981', marginTop: '2px' }}>
                    {currentSubNode.price > 0 ? `฿${currentSubNode.price.toLocaleString()}` : 'ไม่มีค่าใช้จ่าย'}
                  </div>
                </div>

                {/* แสดง Raw Data เพิ่มเติมจาก Google Sheet */}
                <div style={{ marginTop: '16px', borderTop: '1px dashed #1e293b', paddingTop: '12px' }}>
                  <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '6px' }}>📌 ข้อมูลในบันทึก (Sheet Row)</div>
                  {Object.entries(currentSubNode.rawRow).map(([key, val], idx) => {
                    if (["ระบบเครื่องจักร", "เครื่องจักร", "เครื่องจักรย่อย", "ราคา"].includes(key)) return null;
                    return (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', margin: '3px 0' }}>
                        <span style={{ color: '#64748b' }}>{key}:</span>
                        <span style={{ color: '#e2e8f0' }}>{String(val)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div style={{ backgroundColor: '#090d16', border: '1px solid #1e293b', borderRadius: '8px', padding: '12px', marginTop: 'auto' }}>
              <div style={{ fontSize: '10px', color: '#10b981', fontWeight: 'bold' }}>
                🌐 REAL SHEET SYNCHRONIZED
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                จัดกลุ่มโครงสร้างจากรายชื่ออุปกรณ์จริงของ TIJ 100%
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
    </div>
  );
}
