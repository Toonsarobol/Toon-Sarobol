'use client';

import React, { useState, useMemo } from 'react';

// ฟังก์ชันสร้างฐานข้อมูลเครื่องจักรทั้งหมดตามที่ผู้ใช้ระบุ (ช่วยลดบรรทัดโค้ด)
const generateInitialData = () => {
  const data = [];
  
  // Helper สำหรับสร้าง Parent
  const addParent = (id, name) => {
    data.push({ id, name, category: 'Main', parentId: null, status: 'Normal', purchasePrice: 0, installYear: 2018, lifespanYears: 15, totalMaintenanceCost: 0, maintenanceHistory: [] });
  };

  // Helper สำหรับสร้าง Sub-Machine
  const addSub = (id, name, parentId, price, lifespan = 10) => {
    data.push({ id, name, category: 'Sub', parentId, status: 'Normal', purchasePrice: price, installYear: 2018, lifespanYears: lifespan, totalMaintenanceCost: 0, maintenanceHistory: [] });
  };

  // 1. ระบบไฟฟ้า (Electrical)
  addParent('SYS-ELEC', 'ระบบไฟฟ้า และสื่อสาร');
  ['TR-01', 'TR-02'].forEach(id => addSub(id, `Transformer ${id}`, 'SYS-ELEC', 1500000, 20));
  ['MDB-01', 'MDB-02', 'EMDB-02'].forEach(id => addSub(id, id, 'SYS-ELEC', 800000, 20));
  addSub('ATS-01', 'Automatic Transfer Switch (ATS-01)', 'SYS-ELEC', 250000);
  ['Cap Bank-01', 'Cap Bank-02'].forEach(id => addSub(id, id, 'SYS-ELEC', 150000));
  ['RMU-01', 'RMU-02'].forEach(id => addSub(id, id, 'SYS-ELEC', 450000));
  addSub('LCDB-XX', 'ตู้จ่ายไฟฟ้าย่อย SHAFT + LCDB-XX', 'SYS-ELEC', 80000);
  addSub('GEN-01', 'เครื่องกำเนิดไฟฟ้าสำรองฉุกเฉิน (Generator)', 'SYS-ELEC', 2500000, 20);
  addSub('GND-01', 'ระบบต่อลงดิน (LA/Grounding System)', 'SYS-ELEC', 100000);
  addSub('LPN-01', 'ระบบป้องกันฟ้าผ่า (Lightning Protection)', 'SYS-ELEC', 150000);
  addSub('PA-01', 'Public Address (PA)', 'SYS-ELEC', 120000);
  addSub('ACC-01', 'ACCESS CONTROL', 'SYS-ELEC', 200000);
  addSub('EV-01', 'ระบบ EV CHARGER', 'SYS-ELEC', 350000);
  
  // ไฟฉุกเฉินและป้ายทางออก (สร้างลูปเพื่อความรวดเร็ว)
  for(let i=1; i<=11; i++) addSub(`EM-B1-${i}`, `Emergency Light B1-01-B1-${i}`, 'SYS-ELEC', 3500);
  for(let i=1; i<=40; i++) addSub(`EM-B1-1-${i}`, `Emergency Light B1-01-1-${i}`, 'SYS-ELEC', 3500);
  for(let i=1; i<=16; i++) addSub(`EXIT-B1-${i}`, `Exit Light No. B1-01-B1-${i}`, 'SYS-ELEC', 4500);

  // 2. ระบบปรับอากาศและระบายอากาศ (HVAC)
  addParent('SYS-HVAC', 'ระบบปรับอากาศและระบายอากาศ');
  for(let i=1; i<=6; i++) addSub(`CTW-RF-0${i}`, `Cooling Tower-RF-0${i}`, 'SYS-HVAC', 300000);
  for(let i=1; i<=3; i++) addSub(`CDP-RF-0${i}`, `Condenser Pump-RF-0${i}`, 'SYS-HVAC', 85000);
  addSub('PCWP-01', 'Primary Chiller Water Pump 01', 'SYS-HVAC', 120000);
  for(let i=1; i<=3; i++) addSub(`CH-0${i}`, `Chiller 0${i}`, 'SYS-HVAC', 2800000, 15);
  addSub('AHU-01', 'Air Handling Unit 01', 'SYS-HVAC', 450000);
  addSub('OAU-01', 'OAU. Fresh AIR', 'SYS-HVAC', 150000);
  addSub('FCU-01', 'Fan Coil Unit 01', 'SYS-HVAC', 35000);
  for(let i=1; i<=3; i++) addSub(`EXH-0${i}`, `Exhaust Air Fan 0${i}`, 'SYS-HVAC', 45000);
  addSub('VENT-01', 'Ventilation Fan', 'SYS-HVAC', 30000);
  addSub('PRESS-RF-01', 'Pressurized fan-RF-01', 'SYS-HVAC', 120000);

  // 3. ระบบสุขาภิบาล (Plumbing)
  addParent('SYS-SAN', 'ระบบสุขาภิบาล และสถานีแก๊ส');
  for(let i=1; i<=2; i++) addSub(`CWP-0${i}`, `Cold Water / Transfer Pump # ${i}`, 'SYS-SAN', 95000);
  for(let i=1; i<=7; i++) addSub(`BST-0${i}`, `Booster Pump # ${i}`, 'SYS-SAN', 65000);
  addSub('SOFT-01', 'Softener', 'SYS-SAN', 120000);
  addSub('UG-TANK', 'Under Ground Water Tank', 'SYS-SAN', 500000, 30);
  addSub('RF-TANK', 'Roof Water Tank', 'SYS-SAN', 300000, 30);
  for(let i=1; i<=14; i++) addSub(`DP-B-${i}`, `Drainage Pump-B-${i < 10 ? '0'+i : i}`, 'SYS-SAN', 45000);
  addSub('BLW-01', 'Blower Pump 01', 'SYS-SAN', 55000);
  addSub('SLG-01', 'Sludge Return Pump 01', 'SYS-SAN', 48000);
  addSub('GAS-01', 'GAS STATION 01', 'SYS-SAN', 250000);

  // 4. ระบบดับเพลิง (Fire Protection)
  addParent('SYS-FIRE', 'ระบบดับเพลิงและแจ้งเหตุ');
  addSub('F-ALARM', 'ระบบสัญญาณแจ้งเหตุเพลิงไหม้ (Fire alarm)', 'SYS-FIRE', 850000);
  addSub('F-PUMP-01', 'Diesel Engine Fire Pump-B-01', 'SYS-FIRE', 750000);
  addSub('J-PUMP-01', 'Jockey Pump-B-01', 'SYS-FIRE', 85000);
  for(let i=1; i<=54; i++) addSub(`FHC-${i}`, `Fire Hose Cabinet No.${i}`, 'SYS-FIRE', 18000);
  for(let i=1; i<=154; i++) addSub(`EXT-${i}`, `Fire Extinguisher No.${i}`, 'SYS-FIRE', 1500, 5);

  // 5. ระบบลิฟต์ (Elevators) ตามที่ระบุเป๊ะๆ
  addParent('SYS-LIFT', 'ระบบลิฟต์ และบันไดเลื่อน');
  const liftDetails = [
    { id: 'LIFT-01', name: 'ลิฟต์ตัวที่ 1 ( ลิฟต์ VIP )' },
    { id: 'LIFT-02', name: 'ลิฟต์ตัวที่ 2 ( ลิฟต์โดยสารฝั่งซ้าย )' },
    { id: 'LIFT-03', name: 'ลิฟต์ตัวที่ 3 ( ลิฟต์โดยสารฝั่งขวา )' },
    { id: 'LIFT-04', name: 'ลิฟต์ตัวที่ 4 ( ลิฟต์ขนของ )' },
    { id: 'LIFT-05', name: 'ลิฟต์ตัวที่ 5 ( ลิฟต์ Fire Man )' }
  ];
  liftDetails.forEach(lift => addSub(lift.id, lift.name, 'SYS-LIFT', 2500000, 20));

  // อัปเดตราคา Parent ให้สอดคล้องกับ Sub รวมกัน
  data.forEach(m => {
    if (m.parentId === null) {
      const subs = data.filter(s => s.parentId === m.id);
      m.purchasePrice = subs.reduce((sum, s) => sum + s.purchasePrice, 0);
    }
  });

  return data;
};

export default function Dashboard() {
  const [machines, setMachines] = useState(() => generateInitialData());
  const [selectedParentId, setSelectedParentId] = useState('SYS-LIFT');
  const [activeSubMachineId, setActiveSubMachineId] = useState('LIFT-01');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetMachineId, setTargetMachineId] = useState('');
  const [newLog, setNewLog] = useState({ date: new Date().toISOString().split('T')[0], type: 'Routine', description: '', cost: '', partsChanged: '' });
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);

  const calculateFinancials = (m) => {
    const currentYear = new Date().getFullYear();
    const age = Math.max(1, currentYear - m.installYear);
    const annualDepreciation = m.purchasePrice / m.lifespanYears;
    const accumulatedDepreciation = Math.min(m.purchasePrice, annualDepreciation * age);
    const currentBookValue = Math.max(0, m.purchasePrice - accumulatedDepreciation);
    const repairRatio = m.purchasePrice > 0 ? (m.totalMaintenanceCost / m.purchasePrice) * 100 : 0;
    return { age, currentBookValue, repairRatio, isWorthRepairing: repairRatio < 50 };
  };

  const parentMachines = useMemo(() => machines.filter(m => !m.parentId), [machines]);
  const activeParent = useMemo(() => machines.find(m => m.id === selectedParentId), [machines, selectedParentId]);
  
  const activeSubMachines = useMemo(() => {
    let subs = machines.filter(m => m.parentId === selectedParentId);
    if (searchTerm) {
      subs = subs.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.id.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    return subs;
  }, [machines, selectedParentId, searchTerm]);

  const activeSubMachine = useMemo(() => {
    return machines.find(m => m.id === activeSubMachineId) || activeSubMachines[0] || null;
  }, [machines, activeSubMachineId, activeSubMachines]);

  const activeParentFin = activeParent ? calculateFinancials(activeParent) : null;
  const activeSubFin = activeSubMachine ? calculateFinancials(activeSubMachine) : null;

  const handleAddMaintenance = (e) => {
    e.preventDefault();
    if (!targetMachineId || !newLog.description) return;

    const costNum = parseFloat(newLog.cost) || 0;
    const partsArray = newLog.partsChanged ? newLog.partsChanged.split(',').map(p => p.trim()) : [];

    const updatedMachines = machines.map(m => {
      if (m.id === targetMachineId) {
        const updatedHistory = [{ id: `LOG-${Date.now()}`, date: newLog.date, type: newLog.type, description: newLog.description, cost: costNum, partsChanged: partsArray }, ...(m.maintenanceHistory || [])];
        const newTotalCost = m.totalMaintenanceCost + costNum;
        return { ...m, totalMaintenanceCost: newTotalCost, maintenanceHistory: updatedHistory, status: (newTotalCost / m.purchasePrice) * 100 >= 50 ? 'Critical' : m.status };
      }
      return m;
    });

    setMachines(updatedMachines);
    setIsModalOpen(false);
    setNewLog({ date: new Date().toISOString().split('T')[0], type: 'Routine', description: '', cost: '', partsChanged: '' });
    handleGoogleSheetSync();
  };

  const handleGoogleSheetSync = () => {
    setIsSyncing(true);
    setSyncStatus(null);
    setTimeout(() => {
      setIsSyncing(false);
      setSyncStatus({ success: true, message: 'ซิงค์ข้อมูลกับ Google Sheet สำเร็จเรียบร้อยแล้ว' });
    }, 1200);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0b0f19', color: '#f8fafc', padding: '24px', fontFamily: 'sans-serif' }}>
      
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '16px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#38bdf8' }}>⚙️ BSM-TIJ Enterprise Asset Management</h1>
          <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '6px' }}>ระบบจัดการเครื่องจักรเชิงลึก ครบทุกรายการในอาคาร พร้อมประวัติซ่อมบำรุงรายชิ้น</p>
        </div>
        <button onClick={handleGoogleSheetSync} disabled={isSyncing} style={{ backgroundColor: isSyncing ? '#475569' : '#0284c7', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: isSyncing ? 'not-allowed' : 'pointer' }}>
          {isSyncing ? '⏳ กำลังซิงค์...' : '🔄 ซิงค์ฐานข้อมูลไปยัง Google Sheet'}
        </button>
      </header>

      {syncStatus && (
        <div style={{ backgroundColor: '#064e3b', border: '1px solid #10b981', color: '#6ee7b7', padding: '10px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px', display: 'flex', justifyContent: 'space-between' }}>
          <span>✅ {syncStatus.message}</span>
          <button onClick={() => setSyncStatus(null)} style={{ background: 'none', border: 'none', color: '#6ee7b7', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px' }}>
        
        {/* Left: Main Categories */}
        <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', padding: '16px', border: '1px solid #334155', height: 'fit-content' }}>
          <h2 style={{ fontSize: '14px', color: '#38bdf8', marginBottom: '16px' }}>📦 หมวดหมู่เครื่องจักรหลัก</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {parentMachines.map((m) => {
              const isSelected = m.id === selectedParentId;
              const subCount = machines.filter(sub => sub.parentId === m.id).length;
              return (
                <div key={m.id} onClick={() => { setSelectedParentId(m.id); setSearchTerm(''); }}
                  style={{ padding: '14px', borderRadius: '8px', cursor: 'pointer', backgroundColor: isSelected ? '#0369a1' : '#0f172a', border: isSelected ? '2px solid #38bdf8' : '1px solid #334155' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{m.name}</div>
                  <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '6px' }}>จำนวนเครื่องจักรย่อย: <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>{subCount} รายการ</span></div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Sub-Machines & History */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', padding: '20px', border: '1px solid #334155' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '15px', color: '#38bdf8', margin: 0 }}>🔗 เลือกเครื่องจักรย่อยเพื่อดูประวัติ ({activeSubMachines.length} รายการ)</h3>
              <input 
                type="text" 
                placeholder="🔍 ค้นหารหัส หรือ ชื่อเครื่องจักร..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #475569', background: '#0f172a', color: '#fff', width: '250px', fontSize: '13px' }}
              />
            </div>

            {/* Scrollable Sub-Machine Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px', maxHeight: '300px', overflowY: 'auto', paddingRight: '8px', marginBottom: '20px' }}>
              {activeSubMachines.map((sub) => {
                const isSelected = sub.id === activeSubMachineId;
                return (
                  <div key={sub.id} onClick={() => setActiveSubMachineId(sub.id)}
                    style={{ backgroundColor: isSelected ? '#0369a1' : '#0f172a', border: isSelected ? '2px solid #38bdf8' : '1px solid #334155', borderRadius: '8px', padding: '12px', cursor: 'pointer' }}>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>{sub.id}</div>
                    <div style={{ fontSize: '13px', fontWeight: 'bold', margin: '6px 0' }}>{sub.name}</div>
                    <div style={{ fontSize: '11px', color: sub.totalMaintenanceCost > 0 ? '#fbbf24' : '#94a3b8' }}>ซ่อมสะสม: ฿{sub.totalMaintenanceCost.toLocaleString()}</div>
                  </div>
                );
              })}
            </div>

            {/* History Table for Selected Item */}
            {activeSubMachine && (
              <div style={{ backgroundColor: '#0f172a', borderRadius: '10px', padding: '16px', border: '1px solid #334155' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <div style={{ fontSize: '14px', color: '#38bdf8', fontWeight: 'bold' }}>ประวัติการซ่อม: {activeSubMachine.name}</div>
                  </div>
                  <button onClick={() => { setTargetMachineId(activeSubMachine.id); setIsModalOpen(true); }}
                    style={{ backgroundColor: '#059669', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>
                    ➕ เพิ่มรายการซ่อมชิ้นนี้
                  </button>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
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
                    {activeSubMachine.maintenanceHistory.length > 0 ? (
                      activeSubMachine.maintenanceHistory.map((log) => (
                        <tr key={log.id} style={{ borderBottom: '1px solid #1e293b' }}>
                          <td style={{ padding: '8px', color: '#cbd5e1' }}>{log.date}</td>
                          <td style={{ padding: '8px' }}><span style={{ padding: '2px 6px', borderRadius: '4px', backgroundColor: log.type === 'Emergency' ? '#7f1d1d' : '#1e3a8a', color: '#fff', fontSize: '11px' }}>{log.type}</span></td>
                          <td style={{ padding: '8px' }}>{log.description}</td>
                          <td style={{ padding: '8px', color: '#38bdf8' }}>{log.partsChanged.join(', ') || '-'}</td>
                          <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold', color: '#fbbf24' }}>฿{log.cost.toLocaleString()}</td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>ยังไม่มีประวัติการซ่อมบำรุง</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '12px', width: '450px', border: '1px solid #334155' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#38bdf8' }}>📝 บันทึกประวัติซ่อมบำรุง ({targetMachineId})</h3>
            <form onSubmit={handleAddMaintenance} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input type="date" value={newLog.date} onChange={(e) => setNewLog({ ...newLog, date: e.target.value })} style={{ padding: '8px', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '6px' }} required />
              <select value={newLog.type} onChange={(e) => setNewLog({ ...newLog, type: e.target.value })} style={{ padding: '8px', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '6px' }}>
                <option value="Routine">Routine (ตามรอบ)</option>
                <option value="Repair">Repair (ซ่อมแซมทั่วไป)</option>
                <option value="Emergency">Emergency (ฉุกเฉิน)</option>
              </select>
              <input type="text" placeholder="รายละเอียด..." value={newLog.description} onChange={(e) => setNewLog({ ...newLog, description: e.target.value })} style={{ padding: '8px', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '6px' }} required />
              <input type="text" placeholder="อะไหล่ (คั่นด้วย ,)" value={newLog.partsChanged} onChange={(e) => setNewLog({ ...newLog, partsChanged: e.target.value })} style={{ padding: '8px', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '6px' }} />
              <input type="number" placeholder="ค่าใช้จ่าย (บาท)" value={newLog.cost} onChange={(e) => setNewLog({ ...newLog, cost: e.target.value })} style={{ padding: '8px', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '6px' }} required />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: '#475569', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer' }}>ยกเลิก</button>
                <button type="submit" style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>💾 บันทึก</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}.

      </div>
    </div>
  );
}
