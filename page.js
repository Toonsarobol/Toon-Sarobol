'use client';

import React, { useState, useMemo } from 'react';

// ฟังก์ชันสร้างฐานข้อมูล จัดกลุ่มย่อยตามที่คุณระบุมา
const generateInitialData = () => {
  const data = [];
  
  const addParent = (id, name) => {
    data.push({ id, name, category: 'Main', parentId: null, status: 'Normal', purchasePrice: 0, installYear: 2018, lifespanYears: 15, totalMaintenanceCost: 0, maintenanceHistory: [] });
  };

  const addSub = (id, name, parentId, groupName, price, lifespan = 10) => {
    data.push({ id, name, category: 'Sub', parentId, groupName, status: 'Normal', purchasePrice: price, installYear: 2018, lifespanYears: lifespan, totalMaintenanceCost: 0, maintenanceHistory: [] });
  };

  // 1. ระบบไฟฟ้า
  addParent('SYS-ELEC', 'ระบบไฟฟ้า');
  ['TR-01', 'TR-02'].forEach(id => addSub(id, id, 'SYS-ELEC', 'หม้อแปลงไฟฟ้า (Transformer)', 1500000, 20));
  ['MDB-01', 'MDB-02', 'EMDB-02'].forEach(id => addSub(id, id, 'SYS-ELEC', 'ระบบไฟฟ้ากำลัง', 800000, 20));
  addSub('ATS-01', 'ATS-01 (Normal จาก กฟน. - Emer จาก Gen)', 'SYS-ELEC', 'Automatic Transfer Switch', 250000);
  ['Cap Bank-01', 'Cap Bank-02'].forEach(id => addSub(id, id, 'SYS-ELEC', 'Capacitor Bank', 150000));
  ['RMU-01', 'RMU-02'].forEach(id => addSub(id, id, 'SYS-ELEC', 'Ring Main Unit + Switch Gear', 450000));
  addSub('LCDB-XX', 'ตู้จ่ายไฟฟ้าย่อย SHAFT + LCDB-XX', 'SYS-ELEC', 'ตู้จ่ายไฟฟ้าย่อย', 80000);
  addSub('GEN-01', 'เครื่องกำเนิดไฟฟ้าสำรองฉุกเฉิน (Generator)', 'SYS-ELEC', 'เครื่องกำเนิดไฟฟ้า', 2500000, 20);
  addSub('GND-01', 'ระบบต่อลงดิน (LA/Grounding System)', 'SYS-ELEC', 'ระบบต่อลงดิน', 100000);
  addSub('LPN-01', 'ระบบป้องกันฟ้าผ่า (Lightning Protection)', 'SYS-ELEC', 'ระบบป้องกันฟ้าผ่า', 150000);
  
  // ไฟแสงสว่างฉุกเฉิน (Emergency Light)
  const emLights = [
    { prefix: 'B1-', max: 11 }, { prefix: 'B1-1-', max: 40 }, { prefix: 'B1-2-', max: 19 },
    { prefix: 'B1-3-', max: 19 }, { prefix: 'B1-4-', max: 17 }, { prefix: '5-', max: 16 },
    { prefix: 'R-', max: 4 }, { prefix: 'ST1-', max: 7 }, { prefix: 'ST2-', max: 7 },
    { prefix: 'ST3-', max: 7 }, { prefix: 'S1-', max: 13 }
  ];
  emLights.forEach(zone => {
    for(let i=1; i<=zone.max; i++) {
      const num = i < 10 ? `0${i}` : i;
      addSub(`EM-${zone.prefix}${num}`, `Emergency Light No. ${zone.prefix}${num}`, 'SYS-ELEC', 'ไฟแสงสว่างฉุกเฉิน (Emergency Light)', 3500);
    }
  });

  // ไฟป้ายบอกทางหนีไฟ (Exit Light)
  const exitLights = [
    { prefix: 'B1-', max: 16 }, { prefix: '1-', max: 14 }, { prefix: '2-', max: 19 },
    { prefix: '3-', max: 12 }, { prefix: '4-', max: 11 }, { prefix: '5-', max: 7 }, { prefix: 'S-', max: 5 }
  ];
  exitLights.forEach(zone => {
    for(let i=1; i<=zone.max; i++) {
      const num = i < 10 ? `0${i}` : i;
      addSub(`EXIT-${zone.prefix}${num}`, `Exit Light No. ${zone.prefix}${num}`, 'SYS-ELEC', 'ไฟป้ายบอกทางหนีไฟ (Fire Exit Stair)', 4500);
    }
  });
  addSub('LIGHT-CTRL', 'Two-wire Remote 01', 'SYS-ELEC', 'LIGHTING CONTROL', 120000);

  // 2. ระบบไฟฟ้าสื่อสาร
  addParent('SYS-COM', 'ระบบไฟฟ้าสื่อสาร');
  addSub('PA-01', 'Public Address (PA)', 'SYS-COM', 'ระบบเสียงตามสาย', 120000);
  addSub('ACC-01', 'ACCESS CONTROL', 'SYS-COM', 'ระบบควบคุมการเข้าออก', 200000);
  addSub('EV-01', 'ระบบ EVEV CHARGER', 'SYS-COM', 'EV Charger', 350000);

  // 3. ระบบปรับอากาศและระบายอากาศ
  addParent('SYS-HVAC', 'ระบบปรับอากาศและระบายอากาศ');
  for(let i=1; i<=6; i++) addSub(`CTW-RF-0${i}`, `Cooling Tower-RF-0${i}`, 'SYS-HVAC', 'Cooling Tower', 300000);
  for(let i=1; i<=3; i++) addSub(`CDP-RF-0${i}`, `Condenser Pump-RF-0${i}`, 'SYS-HVAC', 'Condenser Pump', 85000);
  addSub('PCWP-01', 'Primary Chiller Water Pump 01', 'SYS-HVAC', 'Primary Pump', 120000);
  for(let i=1; i<=3; i++) addSub(`CH-0${i}`, `Chiller 0${i}`, 'SYS-HVAC', 'Chiller', 2800000, 15);
  addSub('SPLIT-01', 'Split type Air Unit', 'SYS-HVAC', 'Split type', 35000);
  addSub('AHU-01', 'Air Handling Unit 01', 'SYS-HVAC', 'Air Handling Unit', 450000);
  addSub('OAU-01', 'OAU. Fresh AIR', 'SYS-HVAC', 'OAU', 150000);
  addSub('FCU-01', 'Fan Coil Unit 01', 'SYS-HVAC', 'Fan Coil Unit', 35000);
  for(let i=1; i<=3; i++) addSub(`EXH-0${i}`, `Exhaust Air Fan 0${i}`, 'SYS-HVAC', 'พัดลมอัดอากาศ (EXHAUST FAN)', 45000);
  addSub('VENT-01', 'Ventilation Fan', 'SYS-HVAC', 'พัดลมระบายอากาศ', 30000);
  addSub('PRESS-RF-01', 'Pressurized fan-RF-01', 'SYS-HVAC', 'พัดลมอัดอากาศ (PRESSURIZED FAN)', 120000);

  // 4. ระบบสุขาภิบาล
  addParent('SYS-SAN', 'ระบบสุขาภิบาล');
  for(let i=1; i<=2; i++) addSub(`CWP-0${i}`, `Cold Water Pump/Transfer Pump # ${i}`, 'SYS-SAN', 'เครื่องสูบน้ำประปา', 95000);
  for(let i=1; i<=7; i++) addSub(`BST-0${i}`, `Booster Pump # ${i}`, 'SYS-SAN', 'เครื่องสูบน้ำเพิ่มแรงดัน', 65000);
  addSub('SOFT-01', 'Softener', 'SYS-SAN', 'ปั๊มกรองน้ำอุตสาหกรรม', 120000);
  addSub('UG-TANK', 'Under Ground Water Tank', 'SYS-SAN', 'ถังเก็บน้ำประปา', 500000, 30);
  addSub('RF-TANK', 'Roof Water Tank', 'SYS-SAN', 'ถังเก็บน้ำประปา', 300000, 30);
  for(let i=1; i<=14; i++) addSub(`DP-B-${i < 10 ? '0'+i : i}`, `Drainage Pump-B-${i < 10 ? '0'+i : i}`, 'SYS-SAN', 'ระบบระบายน้ำทิ้ง', 45000);
  addSub('BLW-01', 'Blower Pump 01', 'SYS-SAN', 'ระบบบำบัดน้ำเสีย', 55000);
  addSub('SLG-01', 'Sludge Return Pump 01', 'SYS-SAN', 'ระบบบำบัดน้ำเสีย', 48000);

  // 5. ระบบสถานีแก๊ส
  addParent('SYS-GAS', 'ระบบสถานีแก๊ส');
  addSub('GAS-01', 'GAS STATION 01', 'SYS-GAS', 'สถานีแก๊ส', 250000);

  // 6. ระบบดับเพลิง (จัดกลุ่มตามที่ผู้ใช้ระบุอย่างละเอียด)
  addParent('SYS-FIRE', 'ระบบดับเพลิง');
  for(let i=1; i<=54; i++) addSub(`FHC-${i}`, `Fire Hose Cabinet No.${i}`, 'SYS-FIRE', 'ตู้เก็บสายส่งน้ำดับเพลิง (Fire Hose Cabinet)', 18000);
  for(let i=1; i<=154; i++) addSub(`EXT-${i}`, `Fire Extinguisher No.${i}`, 'SYS-FIRE', 'ถังฉีดดับเพลิง (Fire Extinguisher)', 1500, 5);
  addSub('F-ALARM', 'Fire alarm System', 'SYS-FIRE', 'ระบบสัญญาณแจ้งเหตุเพลิงไหม้', 850000);
  addSub('F-PUMP-01', 'Diesel Enging Fire Pump-B-01', 'SYS-FIRE', 'เครื่องยนต์สูบน้ำดับเพลิง', 750000);
  addSub('J-PUMP-01', 'Jockey Pump-B-01', 'SYS-FIRE', 'เครื่องสูบน้ำรักษาแรงดัน', 85000);

  // 7. ระบบลิฟต์
  addParent('SYS-LIFT', 'ระบบลิฟต์ และบันไดเลื่อน');
  const liftDetails = [
    { id: 'LIFT-01', name: 'ลิฟต์ตัวที่ 1 ( ลิฟต์ VIP )' },
    { id: 'LIFT-02', name: 'ลิฟต์ตัวที่ 2 ( ลิฟต์โดยสารฝั่งซ้าย )' },
    { id: 'LIFT-03', name: 'ลิฟต์ตัวที่ 3 ( ลิฟต์โดยสารฝั่งขวา )' },
    { id: 'LIFT-04', name: 'ลิฟต์ตัวที่ 4 ( ลิฟต์ขนของ )' },
    { id: 'LIFT-05', name: 'ลิฟต์ตัวที่ 5 ( ลิฟต์ Fire Man )' }
  ];
  liftDetails.forEach(lift => addSub(lift.id, lift.name, 'SYS-LIFT', 'ระบบลิฟต์ (LIFT)', 2500000, 20));

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
  const [selectedParentId, setSelectedParentId] = useState('SYS-FIRE');
  const [activeSubMachineId, setActiveSubMachineId] = useState('FHC-1');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetMachineId, setTargetMachineId] = useState('');
  const [newLog, setNewLog] = useState({ date: new Date().toISOString().split('T')[0], type: 'Routine', description: '', cost: '', partsChanged: '' });

  const parentMachines = useMemo(() => machines.filter(m => !m.parentId), [machines]);
  
  // จัดกลุ่มเครื่องจักรย่อยตาม groupName 
  const groupedSubMachines = useMemo(() => {
    let subs = machines.filter(m => m.parentId === selectedParentId);
    if (searchTerm) {
      subs = subs.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.id.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    
    // แบ่งกลุ่ม (Group by)
    return subs.reduce((acc, curr) => {
      if (!acc[curr.groupName]) acc[curr.groupName] = [];
      acc[curr.groupName].push(curr);
      return acc;
    }, {});
  }, [machines, selectedParentId, searchTerm]);

  const activeSubMachine = useMemo(() => {
    return machines.find(m => m.id === activeSubMachineId) || null;
  }, [machines, activeSubMachineId]);

  const handleAddMaintenance = (e) => {
    e.preventDefault();
    if (!targetMachineId || !newLog.description) return;

    const costNum = parseFloat(newLog.cost) || 0;
    const partsArray = newLog.partsChanged ? newLog.partsChanged.split(',').map(p => p.trim()) : [];

    const updatedMachines = machines.map(m => {
      if (m.id === targetMachineId) {
        const updatedHistory = [{ id: `LOG-${Date.now()}`, date: newLog.date, type: newLog.type, description: newLog.description, cost: costNum, partsChanged: partsArray }, ...(m.maintenanceHistory || [])];
        return { ...m, totalMaintenanceCost: m.totalMaintenanceCost + costNum, maintenanceHistory: updatedHistory };
      }
      return m;
    });

    setMachines(updatedMachines);
    setIsModalOpen(false);
    setNewLog({ date: new Date().toISOString().split('T')[0], type: 'Routine', description: '', cost: '', partsChanged: '' });
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0b0f19', color: '#f8fafc', padding: '24px', fontFamily: 'sans-serif' }}>
      
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '16px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#38bdf8' }}>⚙️ BSM-TIJ Enterprise Asset Management</h1>
          <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '6px' }}>แยกระบบ 7 หมวดหมู่หลัก และจัดกลุ่มเครื่องจักรย่อย (Sub-Category) ชัดเจน</p>
        </div>
      </header>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '24px' }}>
        
        {/* Left: 7 Main Categories */}
        <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', padding: '16px', border: '1px solid #334155', height: 'fit-content' }}>
          <h2 style={{ fontSize: '14px', color: '#38bdf8', marginBottom: '16px' }}>📦 หมวดหมู่ระบบอาคาร (7 หมวด)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {parentMachines.map((m) => {
              const isSelected = m.id === selectedParentId;
              const subCount = machines.filter(sub => sub.parentId === m.id).length;
              return (
                <div key={m.id} onClick={() => { setSelectedParentId(m.id); setSearchTerm(''); }}
                  style={{ padding: '12px 14px', borderRadius: '8px', cursor: 'pointer', backgroundColor: isSelected ? '#0369a1' : '#0f172a', border: isSelected ? '2px solid #38bdf8' : '1px solid #334155' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{m.name}</div>
                  <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '4px' }}>{subCount} รายการ</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Sub-Machines grouped by category & History */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', padding: '20px', border: '1px solid #334155' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', color: '#38bdf8', margin: 0 }}>
                🔗 รายการอุปกรณ์ใน {parentMachines.find(m => m.id === selectedParentId)?.name}
              </h3>
              <input 
                type="text" 
                placeholder="🔍 ค้นหา (เช่น 154, Fire, ลิฟต์)..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #475569', background: '#0f172a', color: '#fff', width: '250px', fontSize: '13px' }}
              />
            </div>

            {/* Render items grouped by GroupName */}
            <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '12px', marginBottom: '24px' }}>
              {Object.keys(groupedSubMachines).length === 0 ? (
                <div style={{ color: '#94a3b8', textAlign: 'center', padding: '20px' }}>ไม่พบรายการที่ค้นหา</div>
              ) : (
                Object.entries(groupedSubMachines).map(([groupName, items]) => (
                  <div key={groupName} style={{ marginBottom: '20px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#fbbf24', marginBottom: '10px', borderBottom: '1px solid #334155', paddingBottom: '4px' }}>
                      📁 {groupName} ({items.length})
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                      {items.map((sub) => {
                        const isSelected = sub.id === activeSubMachineId;
                        return (
                          <div key={sub.id} onClick={() => setActiveSubMachineId(sub.id)}
                            style={{ backgroundColor: isSelected ? '#0284c7' : '#0f172a', border: isSelected ? '1px solid #38bdf8' : '1px solid #334155', borderRadius: '6px', padding: '10px', cursor: 'pointer' }}>
                            <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>{sub.name}</div>
                            <div style={{ fontSize: '11px', color: '#cbd5e1' }}>รหัส: {sub.id}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
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

      {/* Modal เพิ่มประวัติ */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '12px', width: '450px', border: '1px solid #334155' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#38bdf8' }}>📝 บันทึกประวัติซ่อมบำรุง ({targetMachineId})</h3>
            <form onSubmit={handleAddMaintenance} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input type="date" value={newLog.date} onChange={(e) => setNewLog({ ...newLog, date: e.target.value })} style={{ padding: '8px', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '6px' }} required />
              <select value={newLog.type} onChange={(e) => setNewLog({ ...newLog, type: e.target.value })} style={{ padding: '8px', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '6px' }}>
                <option value="Routine">Routine (ตามรอบ/PM)</option>
                <option value="Repair">Repair (ซ่อมแซมทั่วไป)</option>
                <option value="Emergency">Emergency (ฉุกเฉิน/พัง)</option>
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
}
