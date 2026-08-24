'use client';

import React, { useState, useEffect } from 'react';

// ⚠️ ใส่ URL Web App ที่ได้จาก Apps Script ของคุณที่นี่
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxQc50YGia3np6jE2_V4PgrDBoaMTczXHGd-wf9yRqp/dev';

export default function SmartAssetMonitor() {
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMachineIndex, setSelectedMachineIndex] = useState(0);
  const [selectedSubNodeIndex, setSelectedSubNodeIndex] = useState(0);

  // ดึงข้อมูลจาก Google Sheet
  const loadData = async () => {
    setLoading(true);
    try {
      if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.includes('YOUR_APPS_SCRIPT')) {
        setLoading(false);
        return;
      }
      const res = await fetch(APPS_SCRIPT_URL);
      const json = await res.json();
      if (Array.isArray(json) && json.length > 0) {
        setDataList(json);
      }
    } catch (err) {
      console.error("Error loading data from Google Sheet:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // จัดกลุ่มข้อมูลจาก Sheet ตาม "ระบบประกอบเครื่องจักร" หรือ "เครื่องจักร"
  const groupedData = React.useMemo(() => {
    if (!dataList || dataList.length === 0) return [];

    const map = new Map();
    dataList.forEach((item) => {
      const mainKey = item["เครื่องจักร"] || item["ระบบ"] || 'เครื่องจักรหลัก';
      if (!map.has(mainKey)) {
        map.set(mainKey, {
          name: mainKey,
          code: item["ระบบประกอบเครื่องจักร"] || 'EQ-MAIN',
          status: 'Normal',
          statusColor: '#10b981',
          subNodes: []
        });
      }
      map.get(mainKey).subNodes.push({
        id: item["ระบบประกอบเครื่องจักร"] || 'SUB-01',
        name: item["เครื่องจักรย่อย"] || item["เครื่องจักร์ย่อย"] || 'อุปกรณ์ย่อย',
        part: item["การเปลี่ยนอะไหล่เครื่องจักร"] || 'ไม่มีการบันทึกอะไหล่',
        price: Number(item["ราคา"]) || 0,
        bookValue: Math.round((Number(item["ราคา"]) || 0) * 0.75), // ประมาณการ Book Value
        status: item["ราคา"] > 50000 ? 'Critical' : item["ราคา"] > 10000 ? 'Warning' : 'Online'
      });
    });

    return Array.from(map.values());
  }, [dataList]);

  const currentMachine = groupedData[selectedMachineIndex] || groupedData[0];
  const currentSubNode = currentMachine?.subNodes[selectedSubNodeIndex] || currentMachine?.subNodes[0];

  return (
    <div style={{ backgroundColor: '#090d16', minHeight: '100vh', color: '#f3f4f6', fontFamily: 'monospace', padding: '20px' }}>
      
      {/* 🟢 TOP HEADER */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '12px', marginBottom: '20px' }}>
        <div>
          <div style={{ color: '#00f2ff', fontSize: '11px', letterSpacing: '2px', fontWeight: 'bold' }}>
            SYSTEM HARDWARE TOPOLOGY & FINANCIAL ANALYTICS
          </div>
          <h1 style={{ margin: '2px 0 0 0', fontSize: '20px', color: '#ffffff', fontWeight: 'bold' }}>
            ⚡ BSM-TIJ SMART ASSET MONITOR
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={loadData} style={{ backgroundColor: '#0f172a', color: '#00f2ff', border: '1px solid #00f2ff', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px' }}>
            🔄 Sync Sheet Data
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#0f172a', padding: '6px 14px', borderRadius: '20px', border: '1px solid #1e293b' }}>
            <span style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%', boxShadow: '0 0 8px #10b981' }}></span>
            <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 'bold' }}>LIVE CONNECTED</span>
          </div>
        </div>
      </header>

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#00f2ff' }}>
          ⚡ กำลังโหลดข้อมูลจาก Google Sheet...
        </div>
      ) : groupedData.length === 0 ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#ef4444', backgroundColor: '#0f172a', borderRadius: '10px' }}>
          ⚠️ ไม่พบข้อมูล! โปรดตรวจสอบว่าได้วาง Web App URL ของ Apps Script ในบรรทัดที่ 6 เรียบร้อยแล้ว
        </div>
      ) : (
        /* 🟢 MAIN 3-COLUMN LAYOUT */
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr 320px', gap: '20px', height: 'calc(100vh - 110px)' }}>
          
          {/* ================= COLUMN 1: MAIN MACHINES ================= */}
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '10px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto' }}>
            <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '4px' }}>
              MAIN MACHINES ({groupedData.length})
            </div>

            {groupedData.map((m, idx) => {
              const isSelected = selectedMachineIndex === idx;
              return (
                <div
                  key={idx}
                  onClick={() => {
                    setSelectedMachineIndex(idx);
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
                  <div style={{ fontSize: '10px', color: '#00f2ff', marginBottom: '2px' }}>{m.code}</div>
                  <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#fff', marginBottom: '8px' }}>{m.name}</div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px' }}>
                    <span style={{ color: '#64748b' }}>▶ {m.subNodes.length} SUB-NODES</span>
                    <span style={{ backgroundColor: 'rgba(16,185,129,0.2)', color: '#10b981', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                      ● Normal
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ================= COLUMN 2: DATA STREAM TOPOLOGY (CABLE VISUALIZER) ================= */}
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '10px', padding: '20px', position: 'relative', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '20px' }}>
              DATA STREAM TOPOLOGY: <span style={{ color: '#00f2ff' }}>{currentMachine?.name}</span>
            </div>

            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', padding: '0 20px' }}>
              
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
                <div style={{ fontSize: '9px', color: '#00f2ff', letterSpacing: '1px', marginBottom: '4px' }}>PARENT MACHINE</div>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff' }}>{currentMachine?.name}</div>
                <div style={{ fontSize: '10px', color: '#64748b', marginTop: '6px' }}>รหัส: {currentMachine?.code}</div>
              </div>

              {/* SVG CABLE CONNECTIONS */}
              <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
                <defs>
                  <linearGradient id="cableGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#00f2ff" />
                    <stop offset="100%" stopColor="#ef4444" />
                  </linearGradient>
                </defs>
                {currentMachine?.subNodes.map((_, idx) => {
                  const total = currentMachine.subNodes.length;
                  const startY = 50;
                  const endY = ((idx + 1) * (100 / (total + 1)));
                  return (
                    <path
                      key={idx}
                      d={`M 230,${startY}% C 330,${startY}% 330,${endY}% 430,${endY}%`}
                      fill="none"
                      stroke="url(#cableGrad)"
                      strokeWidth="3"
                      style={{ filter: 'drop-shadow(0px 0px 6px #00f2ff)' }}
                    />
                  );
                })}
              </svg>

              {/* RIGHT SUB-NODES */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '230px', zIndex: 2, maxHeight: '100%', overflowY: 'auto' }}>
                {currentMachine?.subNodes.map((sub, idx) => {
                  const isSubSelected = selectedSubNodeIndex === idx;
                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedSubNodeIndex(idx)}
                      style={{
                        backgroundColor: '#090d16',
                        border: isSubSelected ? '2px solid #ef4444' : '1px solid #1e293b',
                        borderRadius: '8px',
                        padding: '12px',
                        cursor: 'pointer',
                        boxShadow: isSubSelected ? '0 0 15px rgba(239, 68, 68, 0.3)' : 'none',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b', marginBottom: '2px' }}>
                        <span>{sub.id}</span>
                        <span style={{ color: sub.status === 'Critical' ? '#ef4444' : sub.status === 'Warning' ? '#f59e0b' : '#10b981' }}>
                          ● {sub.status}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#fff' }}>{sub.name}</div>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>

          {/* ================= COLUMN 3: FINANCIAL & ROI ANALYTICS ================= */}
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '10px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 'bold', letterSpacing: '1px' }}>
              FINANCIAL & ROI ANALYTICS
            </div>

            {currentSubNode && (
              <div style={{ backgroundColor: '#090d16', border: '1px solid #1e293b', borderRadius: '8px', padding: '14px' }}>
                <div style={{ fontSize: '10px', color: '#64748b' }}>รายการ / Component</div>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#00f2ff', marginTop: '2px' }}>
                  {currentSubNode.name}
                </div>

                <div style={{ fontSize: '11px', color: '#f59e0b', marginTop: '8px' }}>
                  🔧 {currentSubNode.part}
                </div>
                
                <div style={{ marginTop: '16px' }}>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>ราคาเปลี่ยนอะไหล่ (Cost)</div>
                  <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#ef4444' }}>
                    ฿{currentSubNode.price.toLocaleString()}
                  </div>
                </div>

                <div style={{ marginTop: '12px' }}>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>ประเมิน Book Value</div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#10b981' }}>
                    ฿{currentSubNode.bookValue.toLocaleString()}
                  </div>
                </div>

                <div style={{ marginTop: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94a3b8', marginBottom: '4px' }}>
                    <span>สัดส่วนต้นทุน</span>
                    <span>57%</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', backgroundColor: '#1e293b', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: '57%', height: '100%', backgroundColor: '#ef4444', boxShadow: '0 0 8px #ef4444' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div style={{ backgroundColor: '#090d16', border: '1px solid #1e293b', borderRadius: '8px', padding: '12px', marginTop: 'auto' }}>
              <div style={{ fontSize: '10px', color: '#10b981', fontWeight: 'bold' }}>
                📊 ข้อมูลซิงก์ตรงจาก Sheet TIJ 2026
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                เมื่อคุณเลือกคลิกอุปกรณ์ทางซ้ายหรือตรงกลาง ข้อมูลด้านขวาจะเปลี่ยนตามข้อมูลจริงใน Sheet ทันที
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
