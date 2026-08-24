'use client';

import React, { useState, useMemo } from 'react';

// ข้อมูลจำลองสำหรับ BSM-TIJ Dashboard (สามารถเชื่อม Google Sheet ต่อได้)
const initialMachines = [
  {
    id: 'AHU-01',
    name: 'AHU-01 (ระบบปรับอากาศชั้น 3)',
    category: 'HVAC',
    parentId: null,
    status: 'Normal',
    purchasePrice: 450000,
    installYear: 2018,
    lifespanYears: 10,
    totalMaintenanceCost: 120000,
  },
  {
    id: 'SUB-01',
    name: 'Motor Blower 15HP',
    category: 'Motor',
    parentId: 'AHU-01',
    status: 'Warning',
    purchasePrice: 45000,
    installYear: 2018,
    lifespanYears: 5,
    totalMaintenanceCost: 28000, // ค่าซ่อมเกิน 50% -> เตือนซื้อใหม่
  },
  {
    id: 'SUB-02',
    name: 'Filter V-Bank AHU-01',
    category: 'Filter',
    parentId: 'AHU-01',
    status: 'Normal',
    purchasePrice: 12000,
    installYear: 2024,
    lifespanYears: 2,
    totalMaintenanceCost: 3500,
  },
  {
    id: 'CHILLER-02',
    name: 'Chiller Plant #2 (150 Tons)',
    category: 'Chiller',
    parentId: null,
    status: 'Critical',
    purchasePrice: 2800000,
    installYear: 2015,
    lifespanYears: 15,
    totalMaintenanceCost: 1650000,
  },
  {
    id: 'SUB-03',
    name: 'Compressor Screw #1',
    category: 'Compressor',
    parentId: 'CHILLER-02',
    status: 'Critical',
    purchasePrice: 650000,
    installYear: 2015,
    lifespanYears: 10,
    totalMaintenanceCost: 420000,
  }
];

export default function Dashboard() {
  const [selectedParentId, setSelectedParentId] = useState('AHU-01');

  // คำนวณค่าเสื่อมและจุดคุ้มทุน
  const calculateFinancials = (m) => {
    const currentYear = 2026;
    const age = Math.max(1, currentYear - m.installYear);
    const annualDepreciation = m.purchasePrice / m.lifespanYears;
    const accumulatedDepreciation = Math.min(m.purchasePrice, annualDepreciation * age);
    const currentBookValue = Math.max(0, m.purchasePrice - accumulatedDepreciation);
    const repairRatio = (m.totalMaintenanceCost / m.purchasePrice) * 100;
    const isWorthRepairing = repairRatio < 50;

    return { age, currentBookValue, repairRatio, isWorthRepairing };
  };

  const parentMachines = useMemo(() => initialMachines.filter(m => !m.parentId), []);
  const activeParent = useMemo(() => initialMachines.find(m => m.id === selectedParentId), [selectedParentId]);
  const activeSubMachines = useMemo(() => initialMachines.filter(m => m.parentId === selectedParentId), [selectedParentId]);
  const activeParentFin = activeParent ? calculateFinancials(activeParent) : null;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: '#f8fafc', padding: '24px', fontFamily: 'sans-serif' }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 'bold', margin: 0, color: '#38bdf8' }}>
            ⚙️ BSM-TIJ Engineering Analytics & Machine Topology
          </h1>
          <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>
            วิเคราะห์จุดคุ้มทุนซ่อมบำรุง คำนวณค่าเสื่อมราคา และแผนผังกราฟิกเชื่อมโยงเครื่องจักร
          </p>
        </div>
      </header>

      {/* Content Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', marginTop: '20px' }}>
        
        {/* Left Side: เครื่องจักรหลัก */}
        <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', padding: '16px', border: '1px solid #334155' }}>
          <h2 style={{ fontSize: '14px', color: '#38bdf8', textTransform: 'uppercase', marginBottom: '12px' }}>
            📦 เครื่องจักรหลัก (Main Systems)
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {parentMachines.map((m) => {
              const isSelected = m.id === selectedParentId;
              const fin = calculateFinancials(m);
              return (
                <div
                  key={m.id}
                  onClick={() => setSelectedParentId(m.id)}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? '#0369a1' : '#0f172a',
                    border: isSelected ? '2px solid #38bdf8' : '1px solid #334155',
                    transition: '0.2s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                    <span>{m.name}</span>
                    <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', backgroundColor: m.status === 'Normal' ? '#059669' : '#dc2626' }}>
                      {m.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>มูลค่าคงเหลือ: ฿{fin.currentBookValue.toLocaleString()}</span>
                    <span style={{ color: fin.repairRatio > 50 ? '#f87171' : '#4ade80', fontWeight: 'bold' }}>
                      ค่าซ่อมสะสม: {fin.repairRatio.toFixed(0)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Analytics & Topology */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Executive Summary Card */}
          {activeParent && activeParentFin && (
            <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', padding: '20px', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', paddingBottom: '12px' }}>
                <div>
                  <span style={{ fontSize: '12px', color: '#38bdf8' }}>CODE: {activeParent.id}</span>
                  <h2 style={{ margin: '4px 0 0 0', fontSize: '18px' }}>{activeParent.name}</h2>
                </div>
                <div style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  backgroundColor: activeParentFin.isWorthRepairing ? '#064e3b' : '#7f1d1d',
                  border: activeParentFin.isWorthRepairing ? '1px solid #10b981' : '1px solid #f43f5e',
                  fontWeight: 'bold',
                  fontSize: '13px'
                }}>
                  {activeParentFin.isWorthRepairing ? '✅ คุ้มค่าซ่อมเปลี่ยนอะไหล่' : '⚠️ ไม่คุ้มซ่อม! แนะนำเสนอจัดซื้อใหม่'}
                </div>
              </div>

              {/* Stats Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginTop: '16px' }}>
                <div style={{ backgroundColor: '#0f172a', padding: '10px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>ราคาซื้อเดิม</div>
                  <div style={{ fontWeight: 'bold', marginTop: '4px' }}>฿{activeParent.purchasePrice.toLocaleString()}</div>
                </div>
                <div style={{ backgroundColor: '#0f172a', padding: '10px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>มูลค่าคงเหลือปัจจุบัน</div>
                  <div style={{ fontWeight: 'bold', marginTop: '4px', color: '#38bdf8' }}>฿{activeParentFin.currentBookValue.toLocaleString()}</div>
                </div>
                <div style={{ backgroundColor: '#0f172a', padding: '10px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>ค่าซ่อมสะสม</div>
                  <div style={{ fontWeight: 'bold', marginTop: '4px', color: '#fbbf24' }}>฿{activeParent.totalMaintenanceCost.toLocaleString()}</div>
                </div>
                <div style={{ backgroundColor: '#0f172a', padding: '10px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>สัดส่วนค่าซ่อม/ราคาซื้อ</div>
                  <div style={{ fontWeight: 'bold', marginTop: '4px', color: activeParentFin.repairRatio > 50 ? '#f87171' : '#4ade80' }}>
                    {activeParentFin.repairRatio.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Graphical Topology Network */}
          <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', padding: '20px', border: '1px solid #334155' }}>
            <h3 style={{ fontSize: '14px', color: '#38bdf8', textTransform: 'uppercase', marginBottom: '16px' }}>
              🔗 แผนผังกราฟิกเชื่อมโยงหมวดย่อย (Machine Topology Network)
            </h3>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#0f172a',
              padding: '24px',
              borderRadius: '12px',
              border: '1px solid #334155'
            }}>
              {/* Parent Node */}
              <div style={{
                backgroundColor: '#0369a1',
                padding: '16px',
                borderRadius: '10px',
                border: '2px solid #38bdf8',
                textAlign: 'center',
                width: '35%'
              }}>
                <div style={{ fontSize: '10px', color: '#e0f2fe' }}>SYSTEM PARENT</div>
                <div style={{ fontWeight: 'bold', fontSize: '15px', margin: '4px 0' }}>{activeParent?.name}</div>
                <div style={{ fontSize: '11px', color: '#bae6fd' }}>อายุใช้งาน {activeParentFin?.age} ปี</div>
              </div>

              {/* Connecting Graphic Arrow Line */}
              <div style={{ textAlign: 'center', color: '#38bdf8', fontWeight: 'bold', fontSize: '20px' }}>
                ⎯⎯⎯⎯⎯ 🪛 ⎯⎯⎯⎯⎯▶
              </div>

              {/* Sub Nodes */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '45%' }}>
                {activeSubMachines.length > 0 ? (
                  activeSubMachines.map((sub) => {
                    const subFin = calculateFinancials(sub);
                    return (
                      <div key={sub.id} style={{
                        padding: '12px',
                        borderRadius: '8px',
                        backgroundColor: subFin.isWorthRepairing ? '#1e293b' : '#450a0a',
                        border: subFin.isWorthRepairing ? '1px solid #334155' : '1px solid #f43f5e',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div>
                          <div style={{ fontSize: '10px', color: '#94a3b8' }}>{sub.id}</div>
                          <div style={{ fontSize: '13px', fontWeight: 'bold' }}>{sub.name}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{
                            fontSize: '10px',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            backgroundColor: subFin.isWorthRepairing ? '#064e3b' : '#991b1b',
                            color: '#fff'
                          }}>
                            {subFin.isWorthRepairing ? 'คุ้มซ่อม' : 'ควรเปลี่ยนใหม่'}
                          </span>
                          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                            ฿{sub.totalMaintenanceCost.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ color: '#64748b', fontSize: '12px' }}>ไม่มีชิ้นส่วนย่อย</div>
                )}
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

      </div>
    </div>
  );
}
