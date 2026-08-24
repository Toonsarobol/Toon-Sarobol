'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';

// โครงสร้างข้อมูล 5 หมวดงานระบบวิศวกรรมอาคาร BSM-TIJ
const buildingSystemsData = {
  HVAC: [
    {
      id: 'CH-01',
      name: 'Chiller Plant #1 (200 Tons)',
      purchasePrice: 3200000,
      installYear: 2016,
      lifespanYears: 15,
      totalMaintenanceCost: 1850000,
      status: 'Critical',
      children: [
        { id: 'CMP-01', name: 'Screw Compressor A', purchasePrice: 850000, installYear: 2016, lifespanYears: 10, totalMaintenanceCost: 520000, status: 'Critical' },
        { id: 'CND-01', name: 'Condenser Water Pump', purchasePrice: 120000, installYear: 2018, lifespanYears: 8, totalMaintenanceCost: 35000, status: 'Normal' },
        { id: 'VAL-01', name: 'Motorized Butterfly Valve 6"', purchasePrice: 45000, installYear: 2016, lifespanYears: 8, totalMaintenanceCost: 28000, status: 'Warning' }
      ]
    },
    {
      id: 'AHU-03',
      name: 'AHU-03 (ระบบปรับอากาศ หอประชุม)',
      purchasePrice: 520000,
      installYear: 2018,
      lifespanYears: 10,
      totalMaintenanceCost: 140000,
      status: 'Normal',
      children: [
        { id: 'MOT-03', name: 'Blower Motor 20HP', purchasePrice: 65000, installYear: 2018, lifespanYears: 5, totalMaintenanceCost: 38000, status: 'Warning' },
        { id: 'FLT-03', name: 'V-Bank HEPA Filter', purchasePrice: 22000, installYear: 2024, lifespanYears: 2, totalMaintenanceCost: 5000, status: 'Normal' }
      ]
    }
  ],
  ELECTRICAL: [
    {
      id: 'GEN-01',
      name: 'Emergency Generator 500kVA',
      purchasePrice: 1800000,
      installYear: 2015,
      lifespanYears: 20,
      totalMaintenanceCost: 420000,
      status: 'Normal',
      children: [
        { id: 'BAT-01', name: 'Battery Starter Pack 24V', purchasePrice: 18000, installYear: 2023, lifespanYears: 3, totalMaintenanceCost: 12000, status: 'Warning' },
        { id: 'ATS-01', name: 'Automatic Transfer Switch (ATS)', purchasePrice: 150000, installYear: 2015, lifespanYears: 12, totalMaintenanceCost: 32000, status: 'Normal' },
        { id: 'AVR-01', name: 'Automatic Voltage Regulator', purchasePrice: 45000, installYear: 2019, lifespanYears: 8, totalMaintenanceCost: 29000, status: 'Warning' }
      ]
    },
    {
      id: 'MDB-01',
      name: 'Main Distribution Board (MDB)',
      purchasePrice: 2400000,
      installYear: 2015,
      lifespanYears: 25,
      totalMaintenanceCost: 210000,
      status: 'Normal',
      children: [
        { id: 'ACB-01', name: 'Air Circuit Breaker 2000A', purchasePrice: 280000, installYear: 2015, lifespanYears: 15, totalMaintenanceCost: 95000, status: 'Normal' },
        { id: 'CAP-01', name: 'Capacitor Bank 50kVAr x 6', purchasePrice: 85000, installYear: 2019, lifespanYears: 5, totalMaintenanceCost: 55000, status: 'Critical' }
      ]
    }
  ],
  PLUMBING: [
    {
      id: 'BSP-01',
      name: 'Booster Pump Set (น้ำประปาอาคาร)',
      purchasePrice: 280000,
      installYear: 2019,
      lifespanYears: 10,
      totalMaintenanceCost: 95000,
      status: 'Warning',
      children: [
        { id: 'PMP-A', name: 'Vertical Multistage Pump A', purchasePrice: 85000, installYear: 2019, lifespanYears: 7, totalMaintenanceCost: 48000, status: 'Warning' },
        { id: 'INV-01', name: 'VFD Inverter Drive 7.5kW', purchasePrice: 38000, installYear: 2019, lifespanYears: 5, totalMaintenanceCost: 22000, status: 'Critical' },
        { id: 'PRT-01', name: 'Pressure Tank 300L', purchasePrice: 42000, installYear: 2019, lifespanYears: 8, totalMaintenanceCost: 12000, status: 'Normal' }
      ]
    }
  ],
  FIRE: [
    {
      id: 'FRP-01',
      name: 'Diesel Engine Fire Pump 1000GPM',
      purchasePrice: 1500000,
      installYear: 2015,
      lifespanYears: 20,
      totalMaintenanceCost: 310000,
      status: 'Normal',
      children: [
        { id: 'JKP-01', name: 'Jockey Pump 5HP', purchasePrice: 65000, installYear: 2018, lifespanYears: 8, totalMaintenanceCost: 35000, status: 'Warning' },
        { id: 'FACP-01', name: 'Fire Alarm Control Panel Main', purchasePrice: 350000, installYear: 2015, lifespanYears: 12, totalMaintenanceCost: 185000, status: 'Critical' }
      ]
    }
  ],
  ELEVATOR: [
    {
      id: 'ELV-01',
      name: 'Passenger Elevator #1 (1000kg)',
      purchasePrice: 2200000,
      installYear: 2016,
      lifespanYears: 20,
      totalMaintenanceCost: 890000,
      status: 'Warning',
      children: [
        { id: 'ROP-01', name: 'Main Traction Steel Ropes Set', purchasePrice: 120000, installYear: 2021, lifespanYears: 5, totalMaintenanceCost: 75000, status: 'Critical' },
        { id: 'DRV-01', name: 'VVVF Door Drive Unit', purchasePrice: 95000, installYear: 2016, lifespanYears: 10, totalMaintenanceCost: 52000, status: 'Warning' },
        { id: 'ARD-01', name: 'Automatic Rescue Device (ARD)', purchasePrice: 45000, installYear: 2018, lifespanYears: 5, totalMaintenanceCost: 28000, status: 'Warning' }
      ]
    }
  ]
};

export default function CompleteBuildingDashboard() {
  const [activeTab, setActiveTab] = useState('HVAC');
  const [selectedMain, setSelectedMain] = useState(buildingSystemsData.HVAC[0]);
  const [selectedSub, setSelectedSub] = useState(buildingSystemsData.HVAC[0].children[0]);
  const canvasRef = useRef(null);

  // เปลี่ยนระบบหลักตาม Tab
  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    const firstMain = buildingSystemsData[tabKey][0];
    setSelectedMain(firstMain);
    setSelectedSub(firstMain ? firstMain.children[0] : null);
  };

  // เปลี่ยนเครื่องหลัก
  const handleMainChange = (mainItem) => {
    setSelectedMain(mainItem);
    setSelectedSub(mainItem.children ? mainItem.children[0] : null);
  };

  // วิเคราะห์ทางการเงิน
  const analyzeFinance = (item) => {
    if (!item) return null;
    const currentYear = 2026;
    const age = Math.max(1, currentYear - item.installYear);
    const annualDep = item.purchasePrice / item.lifespanYears;
    const accumulatedDep = Math.min(item.purchasePrice, annualDep * age);
    const bookValue = Math.max(0, item.purchasePrice - accumulatedDep);
    const repairRatio = (item.totalMaintenanceCost / item.purchasePrice) * 100;
    const isWorthRepairing = repairRatio < 50;

    return { age, bookValue, repairRatio, isWorthRepairing };
  };

  const mainFin = analyzeFinance(selectedMain);
  const subFin = analyzeFinance(selectedSub);

  // วาดเส้น Dynamic Node Streams
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !selectedMain || !selectedMain.children) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let offset = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const startX = 20;
      const startY = canvas.height / 2;
      const endX = canvas.width - 20;
      const subCount = selectedMain.children.length;

      selectedMain.children.forEach((sub, idx) => {
        const endY = (canvas.height / (subCount + 1)) * (idx + 1);
        const isSelected = sub.id === selectedSub?.id;

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.bezierCurveTo(startX + 80, startY, endX - 80, endY, endX, endY);
        ctx.strokeStyle = isSelected ? '#00f2ff' : '#1e293b';
        ctx.lineWidth = isSelected ? 3 : 1.5;
        ctx.shadowColor = isSelected ? '#00f2ff' : 'transparent';
        ctx.shadowBlur = 10;
        ctx.stroke();

        if (isSelected) {
          ctx.beginPath();
          const t = (offset % 100) / 100;
          const cx = Math.pow(1 - t, 2) * startX + 2 * (1 - t) * t * (startX + 80) + Math.pow(t, 2) * endX;
          const cy = Math.pow(1 - t, 2) * startY + 2 * (1 - t) * t * endY + Math.pow(t, 2) * endY;
          ctx.arc(cx, cy, 4, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = '#00f2ff';
          ctx.shadowBlur = 12;
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
      
      {/* Header Bar */}
      <header style={{ borderBottom: '1px solid #1f2937', paddingBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ color: '#00f2ff', fontSize: '11px', letterSpacing: '2px' }}>BSM-TIJ BUILDING MANAGEMENT SYSTEM</div>
          <h1 style={{ margin: '4px 0 0 0', fontSize: '20px', color: '#ffffff', fontWeight: 'bold' }}>⚙️ COMPLETE ENGINEERING TOPOLOGY & ANALYTICS</h1>
        </div>
        <div style={{ fontSize: '11px', color: '#10b981', border: '1px solid #10b98144', padding: '6px 12px', borderRadius: '4px', backgroundColor: '#064e3b22' }}>
          ● SYSTEM NORMAL | 2026 AUDIT READY
        </div>
      </header>

      {/* Navigation Tabs (สลับ 5 งานระบบหลัก) */}
      <div style={{ display: 'flex', gap: '10px', marginTop: '20px', borderBottom: '1px solid #1f2937', paddingBottom: '10px' }}>
        {[
          { key: 'HVAC', label: '❄️ ระบบปรับอากาศ (HVAC)' },
          { key: 'ELECTRICAL', label: '⚡ ระบบไฟฟ้า (Electrical)' },
          { key: 'PLUMBING', label: '🚰 สุขาภิบาล (Plumbing)' },
          { key: 'FIRE', label: '🔥 ระบบดับเพลิง (Fire System)' },
          { key: 'ELEVATOR', label: '🛗 ลิฟต์/เคลื่อนย้าย (Elevator)' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            style={{
              padding: '8px 16px',
              backgroundColor: activeTab === tab.key ? '#00f2ff15' : '#111827',
              border: activeTab === tab.key ? '1px solid #00f2ff' : '1px solid #1f2937',
              color: activeTab === tab.key ? '#00f2ff' : '#9ca3af',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '12px'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Grid Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr 340px', gap: '20px', marginTop: '20px' }}>
        
        {/* คอลัมน์ซ้าย: รายชื่อเครื่องจักรหลักในระบบที่เลือก */}
        <div style={{ backgroundColor: '#0b0f19', border: '1px solid #1f2937', borderRadius: '8px', padding: '15px' }}>
          <div style={{ color: '#9ca3af', fontSize: '11px', marginBottom: '12px', letterSpacing: '1px' }}>
            MACHINES IN [{activeTab}]
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {buildingSystemsData[activeTab].map((m) => {
              const isSelected = m.id === selectedMain?.id;
              return (
                <div
                  key={m.id}
                  onClick={() => handleMainChange(m)}
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
                    <span>{m.children.length} SUB-ITEMS</span>
                    <span style={{ color: m.status === 'Normal' ? '#10b981' : m.status === 'Warning' ? '#f59e0b' : '#ef4444' }}>
                      ● {m.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* คอลัมน์กลาง: Dynamic Cyber Node Topology */}
        <div style={{ backgroundColor: '#0b0f19', border: '1px solid #1f2937', borderRadius: '8px', padding: '15px' }}>
          <div style={{ color: '#00f2ff', fontSize: '11px', letterSpacing: '1px', marginBottom: '10px' }}>
            TOPOLOGY STREAM: <span style={{ color: '#fff' }}>{selectedMain?.name}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', height: '400px' }}>
            {/* Main Node */}
            <div style={{
              width: '180px',
              padding: '15px',
              backgroundColor: '#111827',
              border: '2px solid #00f2ff',
              borderRadius: '8px',
              boxShadow: '0 0 15px #00f2ff44'
            }}>
              <div style={{ fontSize: '10px', color: '#00f2ff' }}>MAIN EQUIPMENT</div>
              <div style={{ fontSize: '13px', fontWeight: 'bold', margin: '6px 0' }}>{selectedMain?.name}</div>
              <div style={{ fontSize: '10px', color: '#9ca3af' }}>ราคาจัดซื้อ: ฿{selectedMain?.purchasePrice.toLocaleString()}</div>
            </div>

            {/* Canvas สายสัญญาณข้อมูล */}
            <canvas ref={canvasRef} width={180} height={380} />

            {/* Sub Extension Nodes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '220px' }}>
              {selectedMain?.children.map((sub) => {
                const isSubSelected = sub.id === selectedSub?.id;
                const fin = analyzeFinance(sub);
                return (
                  <div
                    key={sub.id}
                    onClick={() => setSelectedSub(sub)}
                    style={{
                      padding: '10px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      backgroundColor: isSubSelected ? '#00f2ff22' : '#111827',
                      border: isSubSelected ? '1px solid #00f2ff' : '1px solid #1f2937',
                      boxShadow: isSubSelected ? '0 0 10px #00f2ff44' : 'none',
                      transition: '0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                      <span style={{ color: '#00f2ff' }}>{sub.id}</span>
                      <span style={{ color: fin.isWorthRepairing ? '#10b981' : '#f43f5e', fontWeight: 'bold' }}>
                        {fin.isWorthRepairing ? 'คุ้มซ่อม' : 'เสนอซื้อใหม่'}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', marginTop: '4px' }}>{sub.name}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* คอลัมน์ขวา: Analytics & Break-Even Panel */}
        <div style={{ backgroundColor: '#0b0f19', border: '1px solid #1f2937', borderRadius: '8px', padding: '15px' }}>
          <div style={{ color: '#f59e0b', fontSize: '11px', letterSpacing: '1px', marginBottom: '15px' }}>
            BREAK-EVEN & ROI ANALYTICS
          </div>

          {selectedSub && subFin && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{
                padding: '12px',
                borderRadius: '6px',
                backgroundColor: subFin.isWorthRepairing ? '#064e3b33' : '#88133733',
                border: subFin.isWorthRepairing ? '1px solid #10b981' : '1px solid #f43f5e',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '10px', color: '#9ca3af' }}>ผลวิเคราะห์การซ่อมบำรุง</div>
                <div style={{ fontSize: '13px', fontWeight: 'bold', color: subFin.isWorthRepairing ? '#34d399' : '#fb7185', marginTop: '4px' }}>
                  {subFin.isWorthRepairing ? '✅ ซ่อมเปลี่ยนอะไหล่คุ้มค่า' : '🚨 ไม่คุ้มซ่อม! แนะนำเสนอจัดซื้อใหม่'}
                </div>
              </div>

              <div style={{ backgroundColor: '#111827', padding: '10px', borderRadius: '6px' }}>
                <div style={{ fontSize: '10px', color: '#9ca3af' }}>อะไหล่ที่เลือก (Sub Component)</div>
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#00f2ff', marginTop: '2px' }}>{selectedSub.name}</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div style={{ backgroundColor: '#111827', padding: '10px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '10px', color: '#9ca3af' }}>ราคาจัดซื้อเดิม</div>
                  <div style={{ fontSize: '11px', fontWeight: 'bold', marginTop: '2px' }}>฿{selectedSub.purchasePrice.toLocaleString()}</div>
                </div>
                <div style={{ backgroundColor: '#111827', padding: '10px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '10px', color: '#9ca3af' }}>มูลค่าคงเหลือทางบัญชี</div>
                  <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#38bdf8', marginTop: '2px' }}>฿{subFin.bookValue.toLocaleString()}</div>
                </div>
              </div>

              <div style={{ backgroundColor: '#111827', padding: '10px', borderRadius: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#9ca3af' }}>
                  <span>ค่าซ่อมสะสม: ฿{selectedSub.totalMaintenanceCost.toLocaleString()}</span>
                  <span style={{ color: subFin.repairRatio > 50 ? '#f43f5e' : '#34d399', fontWeight: 'bold' }}>
                    {subFin.repairRatio.toFixed(1)}%
                  </span>
                </div>
                <div style={{ width: '100%', height: '6px', backgroundColor: '#1f2937', borderRadius: '3px', marginTop: '8px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${Math.min(100, subFin.repairRatio)}%`,
                    height: '100%',
                    backgroundColor: subFin.repairRatio > 50 ? '#f43f5e' : '#34d399'
                  }} />
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
