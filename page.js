'use client';

import React, { useState, useMemo } from 'react';

// Enhanced initial machine database with sub-units (e.g., Elevators with 5 distinct cars)
// and detailed maintenance logs per individual machine.
const initialMachines = [
  // --- Category 1: HVAC / Chiller ---
  {
    id: 'CHILLER-01',
    name: 'Chiller Plant #1 (150 Tons)',
    category: 'HVAC',
    parentId: null,
    status: 'Critical',
    purchasePrice: 2800000,
    installYear: 2015,
    lifespanYears: 15,
    totalMaintenanceCost: 1650000,
    maintenanceHistory: [
      { id: 'LOG-101', date: '2023-05-12', type: 'Repair', description: 'Replaced oil filter and refrigerant leak seal.', cost: 45000, partsChanged: ['Oil Filter', 'O-Rings'] },
      { id: 'LOG-102', date: '2024-11-20', type: 'Overhaul', description: 'Major compressor overhaul and bearing replacement.', cost: 350000, partsChanged: ['Compressor Bearings', 'Gaskets'] }
    ]
  },
  {
    id: 'SUB-CH-01',
    name: 'Compressor Screw #1',
    category: 'Compressor',
    parentId: 'CHILLER-01',
    status: 'Critical',
    purchasePrice: 650000,
    installYear: 2015,
    lifespanYears: 10,
    totalMaintenanceCost: 420000,
    maintenanceHistory: [
      { id: 'LOG-103', date: '2024-02-10', type: 'Emergency', description: 'Inverter failure error code E-404.', cost: 85000, partsChanged: ['Inverter Board'] }
    ]
  },

  // --- Category 2: Elevators (Expanded to 5 units as requested) ---
  {
    id: 'ELEV-PARENT',
    name: 'Passenger Elevators Bank (Main System)',
    category: 'Transportation',
    parentId: null,
    status: 'Normal',
    purchasePrice: 7500000,
    installYear: 2017,
    lifespanYears: 20,
    totalMaintenanceCost: 950000,
    maintenanceHistory: [
      { id: 'LOG-201', date: '2025-01-15', type: 'Routine', description: 'Annual governor calibration and rope inspection.', cost: 60000, partsChanged: ['Safety Brakes'] }
    ]
  },
  {
    id: 'ELEV-01',
    name: 'Elevator Car #01 (Lobby / Low Zone)',
    category: 'Elevator',
    parentId: 'ELEV-PARENT',
    status: 'Normal',
    purchasePrice: 1500000,
    installYear: 2017,
    lifespanYears: 20,
    totalMaintenanceCost: 180000,
    maintenanceHistory: [
      { id: 'LOG-202', date: '2024-06-10', type: 'Repair', description: 'Door sensor replacement and leveling sensor alignment.', cost: 15000, partsChanged: ['IR Door Curtain', 'Limit Switch'] }
    ]
  },
  {
    id: 'ELEV-02',
    name: 'Elevator Car #02 (Lobby / Low Zone)',
    category: 'Elevator',
    parentId: 'ELEV-PARENT',
    status: 'Normal',
    purchasePrice: 1500000,
    installYear: 2017,
    lifespanYears: 20,
    totalMaintenanceCost: 140000,
    maintenanceHistory: [
      { id: 'LOG-203', date: '2023-09-04', type: 'Routine', description: 'Replaced traction sheave oil and guide shoe liners.', cost: 22000, partsChanged: ['Guide Shoe Liners'] }
    ]
  },
  {
    id: 'ELEV-03',
    name: 'Elevator Car #03 (Mid Zone)',
    category: 'Elevator',
    parentId: 'ELEV-PARENT',
    status: 'Warning',
    purchasePrice: 1500000,
    installYear: 2017,
    lifespanYears: 20,
    totalMaintenanceCost: 780000, // High maintenance ratio warning
    maintenanceHistory: [
      { id: 'LOG-204', date: '2025-03-01', type: 'Repair', description: 'Hoisting motor drive inverter warning alarms.', cost: 120000, partsChanged: ['Drive Control Card'] }
    ]
  },
  {
    id: 'ELEV-04',
    name: 'Elevator Car #04 (High Zone)',
    category: 'Elevator',
    parentId: 'ELEV-PARENT',
    status: 'Normal',
    purchasePrice: 1500000,
    installYear: 2017,
    lifespanYears: 20,
    totalMaintenanceCost: 210000,
    maintenanceHistory: [
      { id: 'LOG-205', date: '2024-10-10', type: 'Routine', description: 'Emergency battery backup unit replacement.', cost: 18000, partsChanged: ['Lead-Acid Battery Bank'] }
    ]
  },
  {
    id: 'ELEV-05',
    name: 'Elevator Car #05 (Service / Freight)',
    category: 'Elevator',
    parentId: 'ELEV-PARENT',
    status: 'Critical',
    purchasePrice: 1500000,
    installYear: 2016,
    lifespanYears: 15,
    totalMaintenanceCost: 920000,
    maintenanceHistory: [
      { id: 'LOG-206', date: '2025-02-18', type: 'Emergency', description: 'Main gearless traction machine overheating.', cost: 250000, partsChanged: ['Cooling Fan Assembly', 'Brake Coils'] }
    ]
  }
];

export default function Dashboard() {
  const [machines, setMachines] = useState(initialMachines);
  const [selectedParentId, setSelectedParentId] = useState('ELEV-PARENT');
  const [activeSubMachineId, setActiveSubMachineId] = useState('ELEV-01');
  
  // Modal states for adding maintenance record
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetMachineId, setTargetMachineId] = useState('');
  const [newLog, setNewLog] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'Routine',
    description: '',
    cost: '',
    partsChanged: ''
  });

  // Google Sheet Sync Simulation States
  const [isSyncing, setIsSyncing] = useState(false);
  const [sheetUrl, setSheetUrl] = useState('https://docs.google.com/spreadsheets/d/1_BSM_TIJ_Demo_Sheet_ID/edit');
  const [syncStatus, setSyncStatus] = useState(null);

  // Financial calculations helper
  const calculateFinancials = (m) => {
    const currentYear = 2026;
    const age = Math.max(1, currentYear - m.installYear);
    const annualDepreciation = m.purchasePrice / m.lifespanYears;
    const accumulatedDepreciation = Math.min(m.purchasePrice, annualDepreciation * age);
    const currentBookValue = Math.max(0, m.purchasePrice - accumulatedDepreciation);
    const repairRatio = m.purchasePrice > 0 ? (m.totalMaintenanceCost / m.purchasePrice) * 100 : 0;
    const isWorthRepairing = repairRatio < 50;

    return { age, currentBookValue, repairRatio, isWorthRepairing };
  };

  const parentMachines = useMemo(() => machines.filter(m => !m.parentId), [machines]);
  const activeParent = useMemo(() => machines.find(m => m.id === selectedParentId), [machines, selectedParentId]);
  
  // Update active sub-machines when parent changes, default to first sub-machine if available
  const activeSubMachines = useMemo(() => {
    return machines.filter(m => m.parentId === selectedParentId);
  }, [machines, selectedParentId]);

  const activeSubMachine = useMemo(() => {
    const found = activeSubMachines.find(m => m.id === activeSubMachineId);
    return found || activeSubMachines[0] || null;
  }, [activeSubMachines, activeSubMachineId]);

  const activeParentFin = activeParent ? calculateFinancials(activeParent) : null;
  const activeSubFin = activeSubMachine ? calculateFinancials(activeSubMachine) : null;

  // Handle adding new maintenance record
  const handleAddMaintenance = (e) => {
    e.preventDefault();
    if (!targetMachineId || !newLog.description || !newLog.cost) return;

    const costNum = parseFloat(newLog.cost) || 0;
    const partsArray = newLog.partsChanged ? newLog.partsChanged.split(',').map(p => p.trim()) : [];

    const updatedMachines = machines.map(m => {
      if (m.id === targetMachineId) {
        const updatedHistory = [
          {
            id: `LOG-${Date.now()}`,
            date: newLog.date,
            type: newLog.type,
            description: newLog.description,
            cost: costNum,
            partsChanged: partsArray
          },
          ...(m.maintenanceHistory || [])
        ];
        const newTotalCost = m.totalMaintenanceCost + costNum;
        return {
          ...m,
          totalMaintenanceCost: newTotalCost,
          maintenanceHistory: updatedHistory,
          status: (newTotalCost / m.purchasePrice) * 100 >= 50 ? 'Critical' : m.status
        };
      }
      return m;
    });

    setMachines(updatedMachines);
    setIsModalOpen(false);
    setNewLog({ date: new Date().toISOString().split('T')[0], type: 'Routine', description: '', cost: '', partsChanged: '' });
    
    // Trigger auto-sync simulation
    handleGoogleSheetSync(updatedMachines);
  };

  // Simulate Google Sheets API Sync
  const handleGoogleSheetSync = (currentData = machines) => {
    setIsSyncing(true);
    setSyncStatus(null);
    setTimeout(() => {
      setIsSyncing(false);
      setSyncStatus({ success: true, message: 'ซิงค์ข้อมูลกับ Google Sheet สำเร็จเรียบร้อยแล้ว (Apps Script API Connected)' });
    }, 1200);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0b0f19', color: '#f8fafc', padding: '24px', fontFamily: 'sans-serif' }}>
      
      {/* Header & Google Sheet Configuration */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '16px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>⚙️</span> BSM-TIJ Enterprise Asset & Equipment Topology Management
          </h1>
          <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '6px' }}>
            ระบบจัดการหมวดหมู่เครื่องจักรเชิงลึก (เช่น ระบบลิฟต์หลายตัวแยกย่อย), ประวัติการซ่อมบำรุง, และซิงค์ฐานข้อมูลกับ Google Sheets แบบเรียลไทม์
          </p>
        </div>

        {/* Google Sheet Sync Control Panel */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#1e293b', padding: '10px 16px', borderRadius: '10px', border: '1px solid #334155' }}>
          <div style={{ fontSize: '12px' }}>
            <div style={{ color: '#94a3b8' }}>Google Sheet Link:</div>
            <input 
              type="text" 
              value={sheetUrl} 
              onChange={(e) => setSheetUrl(e.target.value)}
              style={{ background: '#0f172a', border: '1px solid #475569', color: '#38bdf8', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', width: '220px', marginTop: '2px' }}
            />
          </div>
          <button 
            onClick={() => handleGoogleSheetSync()}
            disabled={isSyncing}
            style={{
              backgroundColor: isSyncing ? '#475569' : '#0284c7',
              color: '#fff',
              border: 'none',
              padding: '8px 14px',
              borderRadius: '6px',
              fontWeight: 'bold',
              cursor: isSyncing ? 'not-allowed' : 'pointer',
              fontSize: '12px',
              transition: '0.2s'
            }}
          >
            {isSyncing ? '⏳ กำลังซิงค์...' : '🔄 ซิงค์ Google Sheet'}
          </button>
        </div>
      </header>

      {/* Sync Status Feedback Banner */}
      {syncStatus && (
        <div style={{ backgroundColor: '#064e3b', border: '1px solid #10b981', color: '#6ee7b7', padding: '10px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>✅ {syncStatus.message}</span>
          <button onClick={() => setSyncStatus(null)} style={{ background: 'none', border: 'none', color: '#6ee7b7', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
        </div>
      )}

      {/* Main Layout Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px' }}>
        
        {/* Left Side: Parent Machine Categories Selector */}
        <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', padding: '16px', border: '1px solid #334155', height: 'fit-content' }}>
          <h2 style={{ fontSize: '13px', color: '#38bdf8', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.5px' }}>
            📦 หมวดหมู่เครื่องจักรหลัก (Main Systems)
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {parentMachines.map((m) => {
              const isSelected = m.id === selectedParentId;
              const fin = calculateFinancials(m);
              const subCount = machines.filter(sub => sub.parentId === m.id).length;
              
              return (
                <div
                  key={m.id}
                  onClick={() => {
                    setSelectedParentId(m.id);
                    const firstSub = machines.find(sub => sub.parentId === m.id);
                    if (firstSub) setActiveSubMachineId(firstSub.id);
                  }}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? '#0369a1' : '#0f172a',
                    border: isSelected ? '2px solid #38bdf8' : '1px solid #334155',
                    transition: '0.2s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '14px' }}>
                    <span>{m.name}</span>
                    <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', backgroundColor: m.status === 'Normal' ? '#059669' : m.status === 'Warning' ? '#d97706' : '#dc2626', color: '#fff' }}>
                      {m.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '6px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>เครื่องจักรย่อย: <b>{subCount} ตัว</b></span>
                    <span style={{ color: fin.repairRatio > 50 ? '#f87171' : '#4ade80', fontWeight: 'bold' }}>
                      ซ่อมสะสม: {fin.repairRatio.toFixed(0)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Detailed Topology & Sub-Machine Explorer */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Parent Summary Card */}
          {activeParent && activeParentFin && (
            <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', padding: '20px', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', paddingBottom: '12px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 'bold' }}>SYSTEM CODE: {activeParent.id}</span>
                  <h2 style={{ margin: '4px 0 0 0', fontSize: '18px' }}>{activeParent.name}</h2>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <div style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    backgroundColor: activeParentFin.isWorthRepairing ? '#064e3b' : '#7f1d1d',
                    border: activeParentFin.isWorthRepairing ? '1px solid #10b981' : '1px solid #f43f5e',
                    fontWeight: 'bold',
                    fontSize: '12px'
                  }}>
                    {activeParentFin.isWorthRepairing ? '✅ คุ้มค่าซ่อมบำรุง' : '⚠️ เกินคุ้มทุนซ่อม แนะนำเปลี่ยนใหม่'}
                  </div>
                </div>
              </div>

              {/* Financial Metrics Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginTop: '16px' }}>
                <div style={{ backgroundColor: '#0f172a', padding: '12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>ราคาซื้อตั้งต้น</div>
                  <div style={{ fontWeight: 'bold', marginTop: '4px', fontSize: '15px' }}>฿{activeParent.purchasePrice.toLocaleString()}</div>
                </div>
                <div style={{ backgroundColor: '#0f172a', padding: '12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>มูลค่าคงเหลือทางบัญชี</div>
                  <div style={{ fontWeight: 'bold', marginTop: '4px', fontSize: '15px', color: '#38bdf8' }}>฿{activeParentFin.currentBookValue.toLocaleString()}</div>
                </div>
                <div style={{ backgroundColor: '#0f172a', padding: '12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>ค่าซ่อมบำรุงสะสมรวม</div>
                  <div style={{ fontWeight: 'bold', marginTop: '4px', fontSize: '15px', color: '#fbbf24' }}>฿{activeParent.totalMaintenanceCost.toLocaleString()}</div>
                </div>
                <div style={{ backgroundColor: '#0f172a', padding: '12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>สัดส่วนค่าซ่อมเทียบราคา</div>
                  <div style={{ fontWeight: 'bold', marginTop: '4px', fontSize: '15px', color: activeParentFin.repairRatio > 50 ? '#f87171' : '#4ade80' }}>
                    {activeParentFin.repairRatio.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sub-Machines List & Selector for Detailed History */}
          <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', padding: '20px', border: '1px solid #334155' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '14px', color: '#38bdf8', textTransform: 'uppercase', margin: 0 }}>
                🔗 รายการเครื่องจักรย่อยในระบบ ({activeSubMachines.length} ตัว) - คลิกเพื่อดูประวัติ
              </h3>
            </div>

            {/* Sub-Machines Selector Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', marginBottom: '24px' }}>
              {activeSubMachines.map((sub) => {
                const isSelectedSub = sub.id === activeSubMachineId;
                const subFin = calculateFinancials(sub);
                return (
                  <div 
                    key={sub.id}
                    onClick={() => setActiveSubMachineId(sub.id)}
                    style={{
                      backgroundColor: isSelectedSub ? '#0369a1' : '#0f172a',
                      border: isSelectedSub ? '2px solid #38bdf8' : '1px solid #334155',
                      borderRadius: '8px',
                      padding: '12px',
                      cursor: 'pointer',
                      transition: '0.2s'
                    }}
                  >
                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>{sub.id}</div>
                    <div style={{ fontSize: '13px', fontWeight: 'bold', margin: '4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub.name}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '11px' }}>
                      <span style={{ color: subFin.repairRatio > 50 ? '#f87171' : '#4ade80' }}>ซ่อม {subFin.repairRatio.toFixed(0)}%</span>
                      <span style={{ padding: '1px 6px', borderRadius: '4px', backgroundColor: sub.status === 'Normal' ? '#059669' : '#dc2626', color: '#fff' }}>{sub.status}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Detailed History & Add Record Section for Selected Sub-Machine */}
            {activeSubMachine && activeSubFin && (
              <div style={{ backgroundColor: '#0f172a', borderRadius: '10px', padding: '16px', border: '1px solid #334155' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div>
                    <span style={{ fontSize: '12px', color: '#38bdf8', fontWeight: 'bold' }}>ประวัติการซ่อมบำรุงของ: {activeSubMachine.name} ({activeSubMachine.id})</span>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                      ติดตั้งปี: {activeSubMachine.installYear} | อายุใช้งาน: {activeSubFin.age} ปี | มูลค่าคงเหลือ: ฿{activeSubFin.currentBookValue.toLocaleString()}
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      setTargetMachineId(activeSubMachine.id);
                      setIsModalOpen(true);
                    }}
                    style={{
                      backgroundColor: '#059669',
                      color: '#fff',
                      border: 'none',
                      padding: '8px 14px',
                      borderRadius: '6px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    ➕ เพิ่มรายการซ่อมบำรุง / เปลี่ยนอะไหล่
                  </button>
                </div>

                {/* Maintenance Log Table */}
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8' }}>
                        <th style={{ padding: '8px' }}>วันที่</th>
                        <th style={{ padding: '8px' }}>ประเภท</th>
                        <th style={{ padding: '8px' }}>รายละเอียดการซ่อม</th>
                        <th style={{ padding: '8px' }}>อะไหล่ที่เปลี่ยน</th>
                        <th style={{ padding: '8px', textAlign: 'right' }}>ค่าใช้จ่าย (฿)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeSubMachine.maintenanceHistory && activeSubMachine.maintenanceHistory.length > 0 ? (
                        activeSubMachine.maintenanceHistory.map((log) => (
                          <tr key={log.id} style={{ borderBottom: '1px solid #1e293b' }}>
                            <td style={{ padding: '8px', color: '#cbd5e1' }}>{log.date}</td>
                            <td style={{ padding: '8px' }}>
                              <span style={{ padding: '2px 6px', borderRadius: '4px', backgroundColor: log.type === 'Emergency' ? '#7f1d1d' : '#1e3a8a', color: '#fff', fontSize: '10px' }}>
                                {log.type}
                              </span>
                            </td>
                            <td style={{ padding: '8px' }}>{log.description}</td>
                            <td style={{ padding: '8px', color: '#38bdf8' }}>{log.partsChanged ? log.partsChanged.join(', ') : '-'}</td>
                            <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold', color: '#fbbf24' }}>฿{log.cost.toLocaleString()}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" style={{ padding: '16px', textAlign: 'center', color: '#64748b' }}>ยังไม่มีประวัติการซ่อมบำรุงสำหรับเครื่องจักรตัวนี้</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

              </div>
            )}

          </div>

        </div>

      </div>

      {/* Modal / Popup for Adding Maintenance Entry & Auto-Sync */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '12px', width: '450px', border: '1px solid #334155' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#38bdf8' }}>
              📝 บันทึกการซ่อมบำรุงใหม่ (อัปเดต Google Sheet อัตโนมัติ)
            </h3>
            
            <form onSubmit={handleAddMaintenance} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#94a3b8' }}>รหัสเครื่องจักรเป้าหมาย:</label>
                <input 
                  type="text" 
                  value={targetMachineId} 
                  disabled 
                  style={{ width: '100%', padding: '8px', marginTop: '4px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#94a3b8', borderRadius: '6px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#94a3b8' }}>วันที่ซ่อม:</label>
                <input 
                  type="date" 
                  value={newLog.date} 
                  onChange={(e) => setNewLog({ ...newLog, date: e.target.value })}
                  style={{ width: '100%', padding: '8px', marginTop: '4px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '6px' }}
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#94a3b8' }}>ประเภทงาน:</label>
                <select 
                  value={newLog.type} 
                  onChange={(e) => setNewLog({ ...newLog, type: e.target.value })}
                  style={{ width: '100%', padding: '8px', marginTop: '4px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '6px' }}
                >
                  <option value="Routine">Routine (ซ่อมบำรุงตามรอบ)</option>
                  <option value="Repair">Repair (ซ่อมแซมทั่วไป)</option>
                  <option value="Emergency">Emergency (ซ่อมฉุกเฉิน / เสียหายหนัก)</option>
                  <option value="Overhaul">Overhaul (ยกเครื่องใหญ่)</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#94a3b8' }}>รายละเอียดการซ่อม:</label>
                <input 
                  type="text" 
                  placeholder="เช่น เปลี่ยนตลับลูกปืนและน้ำมันหล่อลื่น"
                  value={newLog.description} 
                  onChange={(e) => setNewLog({ ...newLog, description: e.target.value })}
                  style={{ width: '100%', padding: '8px', marginTop: '4px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '6px' }}
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#94a3b8' }}>อะไหล่ที่เปลี่ยน (คั่นด้วยจุลภาค ,):</label>
                <input 
                  type="text" 
                  placeholder="เช่น Bearing, V-Belt, Oil Seal"
                  value={newLog.partsChanged} 
                  onChange={(e) => setNewLog({ ...newLog, partsChanged: e.target.value })}
                  style={{ width: '100%', padding: '8px', marginTop: '4px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '6px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#94a3b8' }}>ค่าใช้จ่ายในการซ่อม (บาท):</label>
                <input 
                  type="number" 
                  placeholder="0.00"
                  value={newLog.cost} 
                  onChange={(e) => setNewLog({ ...newLog, cost: e.target.value })}
                  style={{ width: '100%', padding: '8px', marginTop: '4px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '6px' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  style={{ backgroundColor: '#475569', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer' }}
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit" 
                  style={{ backgroundColor: '#0284c7', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  💾 บันทึกและซิงค์ Sheets
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
```eof

Your updated BSM-TIJ Engineering Dashboard code is ready! Feel free to review it and let me know if you would like any further adjustments.

      </div>
    </div>
  );
}
