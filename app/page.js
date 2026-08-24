'use client';

import React, { useState, useEffect, useRef } from 'react';

// ข้อมูลจำลองเครื่องจักรหลัก และอะไหล่ย่อยเชื่อมโยง (Data Topology Node)
const initialData = [
  {
    id: 'AHU-01',
    name: 'AHU-01 (ระบบปรับอากาศ ชั้น 3)',
    category: 'HVAC',
    parentId: null,
    status: 'Normal',
    purchasePrice: 450000,
    installYear: 2018,
    lifespanYears: 10,
    totalMaintenanceCost: 120000,
    children: [
      { id: 'MOT-01', name: 'Motor Blower 15HP', purchasePrice: 55000, installYear: 2018, lifespanYears: 5, totalMaintenanceCost: 32000, status: 'Warning' },
      { id: 'FLT-01', name: 'HEPA Filter Set', purchasePrice: 18000, installYear: 2024, lifespanYears: 2, totalMaintenanceCost: 4000, status: 'Normal' },
      { id: 'VAL-01', name: 'Chilled Water Valve 2"', purchasePrice: 28000, installYear: 2019, lifespanYears: 8, totalMaintenanceCost: 19500, status: 'Warning' }
    ]
  },
  {
    id: 'CHILLER-02',
    name: 'Chiller Unit #2 (150 Tons)',
    category: 'Chiller',
    parentId: null,
    status: 'Critical',
    purchasePrice: 2800000,
    installYear: 2015,
    lifespanYears: 15,
    totalMaintenanceCost: 1650000,
    children: [
      { id: 'CMP-01', name: 'Screw Compressor A', purchasePrice: 750000, installYear: 2015, lifespanYears: 10, totalMaintenanceCost: 480000, status: 'Critical' },
      { id: 'CND-01', name: 'Condenser Fan Motor', purchasePrice: 42000, installYear: 2017, lifespanYears: 6, totalMaintenanceCost: 15000, status: 'Normal' },
      { id: 'SEN-01', name: 'Temp & Pressure Sensors', purchasePrice: 15000, installYear: 2020, lifespanYears: 4, totalMaintenanceCost: 9500, status: 'Critical' }
    ]
  },
  {
    id: 'PUMP-01',
    name: 'Primary Chilled Water Pump',
    category: 'Pump',
    parentId: null,
    status: 'Normal',
    purchasePrice: 180000,
    installYear: 2020,
    lifespanYears: 12,
    totalMaintenanceCost: 25000,
    children: [
      { id: 'IMP-01', name: 'Bronze Impeller Set', purchasePrice: 35000, installYear: 2020, lifespanYears: 8, totalMaintenanceCost: 8000, status: 'Normal' },
      { id: 'MCH-01', name: 'Mechanical Seal', purchasePrice: 12000, installYear: 2022, lifespanYears: 3, totalMaintenanceCost: 7500, status: 'Warning' }
    ]
  }
];

export default function CyberDashboard() {
  const [selectedMain, setSelectedMain] = useState(initialData[0]);
  const [selectedSub, setSelectedSub] = useState(initialData[0].children[0]);
  const canvasRef = useRef(null);

  // คำนวณค่าเสื่อมราคาและจุดคุ้มทุน
  const analyzeFinance = (item) => {
    if (!item) return null;
    const currentYear = 2026;
    const age = Math.max(1, currentYear - item.installYear);
    const annualDep = item.purchasePrice / item.lifespanYears;
    const accumulatedDep = Math.min(item.purchasePrice, annualDep * age);
    const bookValue = Math.max(0, item.purchasePrice - accumulatedDep);
    const repairRatio = (item.totalMaintenanceCost / item.purchasePrice) * 100;
    const isWorthRepairing = repairRatio < 50; // เกิน 50% แนะนำซื้อใหม่

    return { age, bookValue, repairRatio, isWorthRepairing };
  };

  const mainFin = analyzeFinance(selectedMain);
  const subFin = analyzeFinance(selectedSub);

  // เอฟเฟกต์วาดเส้นกราฟิก Data Stream พลังงานเรืองแสง
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let offset = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // วาดเส้นเชื่อมโยงไฮเทค
      const startX = 50;
      const startY = canvas.height / 2;
      const endX = canvas.width - 50;
      const subCount = selectedMain.children.length;

      selectedMain.children.forEach((sub, idx) => {
        const endY = (canvas.height / (subCount + 1)) * (idx + 1);

        // เส้นพื้นหลัง Glow
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.bezierCurveTo(startX + 100, startY, endX - 100, endY, endX, endY);
        ctx.strokeStyle = sub.id === selectedSub?.id ? '#00f2ff' : '#1e293b';
        ctx.lineWidth = sub.id === selectedSub?.id ? 3 : 1.5;
        ctx.shadowColor = sub.id === selectedSub?.id ? '#00f2ff' : 'transparent';
        ctx.shadowBlur = 10;
        ctx.stroke();

        // จุดพลังงานวิ่งตามเส้น Data Stream
        if (sub.id === selectedSub?.id) {
          ctx.beginPath();
          const t = (offset % 100) / 100;
          const cx = Math.pow(1 - t, 2) * startX + 2 * (1 - t) * t * (startX + 100) + Math.pow(t, 2) * endX;
          const cy = Math.pow(1 - t, 2) * startY + 2 * (1 - t) * t * endY + Math.pow(t, 2) * endY;
          ctx.arc(cx, cy, 5, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = '#00f2ff';
          ctx.shadowBlur = 15;
          ctx.fill();
        }
      });

      offset += 1.5;
      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [selectedMain, selectedSub]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#030712', color: '#f3f4f6', fontFamily: 'monospace', padding: '20px' }}>
      
      {/* Header สไตล์ Sci-Fi Command Center */}
      <header style={{ borderBottom: '1px solid #1f2937', paddingBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ color: '#00f2ff', fontSize: '11px', letterSpacing: '2px' }}>SYSTEM HARDWARE TOPOLOGY & FINANCIAL ANALYTICS</div>
          <h1 style={{ margin: '4px 0 0 0', fontSize: '20px', color: '#ffffff', fontWeight: 'bold' }}>⚡ BSM-TIJ SMART ASSET MONITOR</h1>
        </div>
        <div style={{ backgroundColor: '#111827', border: '1px solid #00f2ff44', padding: '6px 12px', borderRadius: '4px', color: '#00f2ff', fontSize: '12px' }}>
          STATUS: ONLINE
        </div>
      </header>

      {/* Grid Layout หลัก */}
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr 340px', gap: '20px', marginTop: '20px' }}>
        
        {/* คอลัมน์ซ้าย: รายชื่อเครื่องจักรหลัก */}
        <div style={{ backgroundColor: '#0b0f19', border: '1px solid #1f2937', borderRadius: '8px', padding: '15px' }}>
          <div style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '12px', letterSpacing: '1px' }}>MAIN MACHINES</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {initialData.map((m) => {
              const isSelected = m.id === selectedMain.id;
              return (
                <div
                  key={m.id}
                  onClick={() => {
                    setSelectedMain(m);
                    setSelectedSub(m.children[0]);
                  }}
                  style={{
                    padding: '12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? '#00f2ff15' : '#111827',
                    border: isSelected ? '1px solid #00f2ff' : '1px solid #1f2937',
                    boxShadow: isSelected ? '0 0 10px #00f2ff33' : 'none',
                    transition: '0.2s'
                  }}
                >
                  <div style={{ fontSize: '10px', color: '#00f2ff' }}>{m.id}</div>
                  <div style={{ fontSize: '13px', fontWeight: 'bold', margin: '4px 0' }}>{m.name}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#9ca3af' }}>
                    <span>{m.children.length} SUB-NODES</span>
                    <span style={{ color: m.status === 'Normal' ? '#10b981' : '#ef4444' }}>● {m.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* คอลัมน์กลาง: แผนผังกราฟิกเชื่อมโยง (Cyber Canvas & Extension Nodes) */}
        <div style={{ backgroundColor: '#0b0f19', border: '1px solid #1f2937', borderRadius: '8px', padding: '15px', position: 'relative' }}>
          <div style={{ color: '#00f2ff', fontSize: '12px', letterSpacing: '1px', marginBottom: '10px' }}>
            DATA STREAM TOPOLOGY: <span style={{ color: '#fff' }}>{selectedMain.name}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', height: '420px', position: 'relative' }}>
            
            {/* Main Parent Node */}
            <div style={{
              width: '180px',
              padding: '15px',
              backgroundColor: '#111827',
              border: '2px solid #00f2ff',
              borderRadius: '8px',
              boxShadow: '0 0 15px #00f2ff44',
              zIndex: 2
            }}>
              <div style={{ fontSize: '10px', color: '#00f2ff' }}>PARENT MACHINE</div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', margin: '6px 0' }}>{selectedMain.name}</div>
              <div style={{ fontSize: '11px', color: '#9ca3af' }}>ปีติดตั้ง: {selectedMain.installYear}</div>
            </div>

            {/* Canvas เส้นพลังงานเรืองแสง */}
            <canvas
              ref={canvasRef}
              width={220}
              height={400}
              style={{ position: 'relative', zIndex: 1 }}
            />

            {/* Sub Extension Nodes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '220px', zIndex: 2 }}>
              {selectedMain.children.map((sub) => {
                const isSubSelected = sub.id === selectedSub?.id;
                const fin = analyzeFinance(sub);
                return (
                  <div
                    key={sub.id}
                    onClick={() => setSelectedSub(sub)}
                    style={{
                      padding: '12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      backgroundColor: isSubSelected ? '#00f2ff22' : '#111827',
                      border: isSubSelected ? '1px solid #00f2ff' : '1px solid #1f2937',
                      boxShadow: isSubSelected ? '0 0 12px #00f2ff44' : 'none',
                      transition: '0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                      <span style={{ color: '#00f2ff' }}>{sub.id}</span>
                      <span style={{ color: fin.isWorthRepairing ? '#10b981' : '#f43f5e', fontWeight: 'bold' }}>
                        {fin.isWorthRepairing ? 'คุ้มซ่อม' : 'ควรซื้อใหม่'}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', marginTop: '4px' }}>{sub.name}</div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>

        {/* คอลัมน์ขวา: กล่องวิเคราะห์ค่าเสื่อม & จุดคุ้มทุน (ROI Panel) */}
        <div style={{ backgroundColor: '#0b0f19', border: '1px solid #1f2937', borderRadius: '8px', padding: '15px' }}>
          <div style={{ color: '#f59e0b', fontSize: '12px', letterSpacing: '1px', marginBottom: '15px' }}>
            FINANCIAL & ROI ANALYTICS
          </div>

          {selectedSub && subFin && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              
              {/* Decision Status Badge */}
              <div style={{
                padding: '12px',
                borderRadius: '6px',
                backgroundColor: subFin.isWorthRepairing ? '#064e3b33' : '#88133733',
                border: subFin.isWorthRepairing ? '1px solid #10b981' : '1px solid #f43f5e',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '10px', color: '#9ca3af' }}>คำแนะนำการลงทุน (DECISION)</div>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: subFin.isWorthRepairing ? '#34d399' : '#fb7185', marginTop: '4px' }}>
                  {subFin.isWorthRepairing ? '✅ เปลี่ยนอะไหล่คุ้มค่า' : '🚨 ไม่คุ้มซ่อม! เสนอจัดซื้อใหม่'}
                </div>
              </div>

              {/* Stat Grid */}
              <div style={{ backgroundColor: '#111827', padding: '10px', borderRadius: '6px', border: '1px solid #1f2937' }}>
                <div style={{ fontSize: '10px', color: '#9ca3af' }}>รายการอะไหล่ / ชิ้นส่วน</div>
                <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#00f2ff', marginTop: '2px' }}>{selectedSub.name}</div>
              </div>

              <div style={{ gridTemplateColumns: '1fr 1fr', display: 'grid', gap: '8px' }}>
                <div style={{ backgroundColor: '#111827', padding: '10px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '10px', color: '#9ca3af' }}>ราคาเครื่อง/อะไหล่ใหม่</div>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', marginTop: '4px' }}>฿{selectedSub.purchasePrice.toLocaleString()}</div>
                </div>

                <div style={{ backgroundColor: '#111827', padding: '10px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '10px', color: '#9ca3af' }}>มูลค่าคงเหลือ (Book Value)</div>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#38bdf8', marginTop: '4px' }}>฿{subFin.bookValue.toLocaleString()}</div>
                </div>
              </div>

              <div style={{ backgroundColor: '#111827', padding: '10px', borderRadius: '6px', border: '1px solid #1f2937' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#9ca3af' }}>
                  <span>สะสมค่าซ่อม/อะไหล่: ฿{selectedSub.totalMaintenanceCost.toLocaleString()}</span>
                  <span style={{ color: subFin.repairRatio > 50 ? '#f43f5e' : '#34d399' }}>{subFin.repairRatio.toFixed(1)}%</span>
                </div>
                
                {/* Visual Progress Bar */}
                <div style={{ width: '100%', height: '6px', backgroundColor: '#1f2937', borderRadius: '3px', marginTop: '8px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${Math.min(100, subFin.repairRatio)}%`,
                    height: '100%',
                    backgroundColor: subFin.repairRatio > 50 ? '#f43f5e' : '#34d399',
                    boxShadow: subFin.repairRatio > 50 ? '0 0 8px #f43f5e' : '0 0 8px #34d399'
                  }} />
                </div>
              </div>

              <div style={{ fontSize: '10px', color: '#6b7280', lineHeight: '1.4', marginTop: '5px' }}>
                * หมายเหตุ: หากค่าซ่อม/เปลี่ยนอะไหล่สะสมเกิน 50% ของราคาเครื่องใหม่ ระบบจะประเมินว่าไม่คุ้มค่าทางเศรษฐศาสตร์ ควรพิจารณาตั้งงบจัดซื้อเครื่องใหม่
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
}
