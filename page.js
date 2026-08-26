'use client';

import React, { useState, useMemo } from 'react';

// ฐานข้อมูลเครื่องจักรทั้งหมดแบบสมบูรณ์ ครบทุกตัวตามที่คุณให้มา
const rawEquipmentData = [
  // --- ระบบไฟฟ้า และสื่อสาร ---
  { id: 'EQ-001', system: 'ระบบไฟฟ้า', category: 'หม้อแปลงไฟฟ้า (Transformer)', name: 'TR-01', status: 'ปกติ' },
  { id: 'EQ-002', system: 'ระบบไฟฟ้า', category: 'หม้อแปลงไฟฟ้า (Transformer)', name: 'TR-02', status: 'ปกติ' },
  { id: 'EQ-003', system: 'ระบบไฟฟ้า', category: 'ระบบไฟฟ้ากำลัง', name: 'MDB-01', status: 'ปกติ' },
  { id: 'EQ-004', system: 'ระบบไฟฟ้า', category: 'ระบบไฟฟ้ากำลัง', name: 'MDB-02', status: 'ปกติ' },
  { id: 'EQ-005', system: 'ระบบไฟฟ้า', category: 'ระบบไฟฟ้ากำลัง', name: 'EMDB-02', status: 'ปกติ' },
  { id: 'EQ-006', system: 'ระบบไฟฟ้า', category: 'Automatic Transfer Switch', name: 'ATS-01 (Normal จาก กฟน. - Emer จาก Gen)', status: 'ปกติ' },
  { id: 'EQ-007', system: 'ระบบไฟฟ้า', category: 'capacitor bank', name: 'Cap Bank-01', status: 'ปกติ' },
  { id: 'EQ-008', system: 'ระบบไฟฟ้า', category: 'capacitor bank', name: 'Cap Bank-02', status: 'ปกติ' },
  { id: 'EQ-009', system: 'ระบบไฟฟ้า', category: 'Ring Main Unit + Switch Gear', name: 'RMU-01', status: 'ปกติ' },
  { id: 'EQ-010', system: 'ระบบไฟฟ้า', category: 'Ring Main Unit + Switch Gear', name: 'RMU-02', status: 'ปกติ' },
  { id: 'EQ-011', system: 'ระบบไฟฟ้า', category: 'ตู้จ่ายไฟฟ้าย่อย', name: 'ตู้จ่ายไฟฟ้าย่อย SHAFT + LCDB-XX', status: 'ปกติ' },
  { id: 'EQ-012', system: 'ระบบไฟฟ้า', category: 'เครื่องกำเนิดไฟฟ้าสำรองฉุกเฉิน', name: 'Generator (เครื่องกำเนิดไฟฟ้า)', status: 'ปกติ' },
  { id: 'EQ-013', system: 'ระบบไฟฟ้า', category: 'ระบบต่อลงดิน', name: 'ระบบต่อลงดิน (LA/Grounding System)', status: 'ปกติ' },
  { id: 'EQ-014', system: 'ระบบไฟฟ้า', category: 'ระบบป้องกันฟ้าผ่า', name: 'ระบบป้องกันฟ้าผ่า (Lightning Protection System)', status: 'ปกติ' },
  { id: 'EQ-015', system: 'ระบบไฟฟ้า', category: 'LIGHTING CONTROL', name: 'Two-wire Remote 01', status: 'ปกติ' },
  { id: 'EQ-016', system: 'ระบบอื่นๆ', category: 'ระบบไฟฟ้าสื่อสาร', name: 'Public Address(PA)', status: 'ปกติ' },
  { id: 'EQ-017', system: 'ระบบอื่นๆ', category: 'ACCESS CONTROL', name: 'ACCESS CONTROL System', status: 'ปกติ' },
  { id: 'EQ-018', system: 'ระบบอื่นๆ', category: 'ระบบ EVEV CHARGER', name: 'EV CHARGER System', status: 'ปกติ' },

  // --- ระบบปรับอากาศและระบายอากาศ ---
  ...Array.from({ length: 6 }, (_, i) => ({ id: `HVAC-CTW-${i+1}`, system: 'ระบบปรับอากาศและระบายอากาศ', category: 'Cooling Tower (CTW)', name: `Cooling Tower-RF-0${i+1}`, status: 'ปกติ' })),
  ...Array.from({ length: 3 }, (_, i) => ({ id: `HVAC-CDP-${i+1}`, system: 'ระบบปรับอากาศและระบายอากาศ', category: 'Condenser Pump (CDP)', name: `Condenser Pump-RF-0${i+1}`, status: 'ปกติ' })),
  { id: 'HVAC-PCWP-1', system: 'ระบบปรับอากาศและระบายอากาศ', category: 'Primary Chiller Water Pump (PCWP)', name: 'Primary Chiller Water Pump 01', status: 'ปกติ' },
  ...Array.from({ length: 3 }, (_, i) => ({ id: `HVAC-CH-${i+1}`, system: 'ระบบปรับอากาศและระบายอากาศ', category: 'Chiller', name: `Chiller 0${i+1}`, status: 'ปกติ' })),
  { id: 'HVAC-SPLIT-1', system: 'ระบบปรับอากาศและระบายอากาศ', category: 'Split type Air Unit', name: 'Split type Air Unit Main', status: 'ปกติ' },
  { id: 'HVAC-AHU-1', system: 'ระบบปรับอากาศและระบายอากาศ', category: 'Air Handling Unit', name: 'Air Handling Unit 01', status: 'ปกติ' },
  { id: 'HVAC-OAU-1', system: 'ระบบปรับอากาศและระบายอากาศ', category: 'OAU. Fresh AIR', name: 'OAU. Fresh AIR System', status: 'ปกติ' },
  { id: 'HVAC-FCU-1', system: 'ระบบปรับอากาศและระบายอากาศ', category: 'Fan Coil Unit', name: 'Fan Coil Unit 01', status: 'ปกติ' },
  ...Array.from({ length: 3 }, (_, i) => ({ id: `HVAC-EXH-${i+1}`, system: 'ระบบปรับอากาศและระบายอากาศ', category: 'พัดลมอัดอากาศ (EXHAUST FAN)', name: `Exhaust Air Fan 0${i+1}`, status: 'ปกติ' })),
  { id: 'HVAC-VENT-1', system: 'ระบบปรับอากาศและระบายอากาศ', category: 'Ventilation Fan', name: 'Ventilation Fan System', status: 'ปกติ' },
  { id: 'HVAC-PRESS-1', system: 'ระบบปรับอากาศและระบายอากาศ', category: 'พัดลมอัดอากาศ (PRESSURIZED FAN)', name: 'Pressurized fan-RF-01', status: 'ปกติ' },

  // --- ระบบสุขาภิบาล และสถานีแก๊ส ---
  { id: 'SAN-CWP-1', system: 'ระบบสุขาภิบาล', category: 'เครื่องสูบน้ำประปา (Cold Water Pump)', name: 'Cold Water Pump/Transfer Pump # 1', status: 'ปกติ' },
  { id: 'SAN-CWP-2', system: 'ระบบสุขาภิบาล', category: 'เครื่องสูบน้ำประปา (Cold Water Pump)', name: 'Cold Water Pump/Transfer Pump # 2', status: 'ปกติ' },
  ...Array.from({ length: 7 }, (_, i) => ({ id: `SAN-BST-${i+1}`, system: 'ระบบสุขาภิบาล', category: 'เครื่องสูบน้ำเพิ่มแรงดัน (Booster Pump)', name: `Booster Pump # ${i+1}`, status: 'ปกติ' })),
  { id: 'SAN-SOFT-1', system: 'ระบบสุขาภิบาล', category: 'ปั๊มกรองน้ำอุตสาหกรรม', name: 'Softener', status: 'ปกติ' },
  { id: 'SAN-TANK-1', system: 'ระบบสุขาภิบาล', category: 'ถังเก็บน้ำประปา (UG/Roof Water Tank)', name: 'Under Ground Water Tank', status: 'ปกติ' },
  { id: 'SAN-TANK-2', system: 'ระบบสุขาภิบาล', category: 'ถังเก็บน้ำประปา (UG/Roof Water Tank)', name: 'Roof Water Tank', status: 'ปกติ' },
  ...Array.from({ length: 14 }, (_, i) => ({ id: `SAN-DP-${i+1}`, system: 'ระบบสุขาภิบาล', category: 'ระบบระบายน้ำทิ้ง ( Drainage Pump )', name: `Drainage Pump-B-${(i+1).toString().padStart(2, '0')}`, status: 'ปกติ' })),
  { id: 'SAN-BLW-1', system: 'ระบบสุขาภิบาล', category: 'ระบบบำบัดน้ำเสีย', name: 'Blower Pump 01', status: 'ปกติ' },
  { id: 'SAN-SLG-1', system: 'ระบบสุขาภิบาล', category: 'ระบบบำบัดน้ำเสีย', name: 'Sludge Return Pump 01', status: 'ปกติ' },
  { id: 'GAS-01', system: 'ระบบอื่นๆ', category: 'ระบบสถานีแก๊ส', name: 'GAS STATION 01', status: 'ปกติ' },

  // --- ระบบดับเพลิง (ครบถ้วนทุกรายการ) ---
  ...Array.from({ length: 54 }, (_, i) => ({ id: `FIRE-FHC-${i+1}`, system: 'ระบบดับเพลิง', category: 'ตู้เก็บสายส่งน้ำดับเพลิง (Fire Hose Cabinet)', name: `Fire Hose Cabinet No.${i+1}`, status: 'ปกติ' })),
  ...Array.from({ length: 154 }, (_, i) => ({ id: `FIRE-EXT-${i+1}`, system: 'ระบบดับเพลิง', category: 'ถังฉีดดับเพลิง (Fire Extinguisher)', name: `Fire Extinguisher No.${i+1}`, status: 'ปกติ' })),
  { id: 'FIRE-ALARM-1', system: 'ระบบดับเพลิง', category: 'ระบบสัญญาณแจ้งเหตุเพลิงไหม้ (Fire alarm)', name: 'Fire alarm System Main', status: 'ปกติ' },
  { id: 'FIRE-PUMP-1', system: 'ระบบดับเพลิง', category: 'ระบบเครื่องยนต์สูบน้ำดับเพลิง', name: 'Diesel Engine Fire Pump-B-01', status: 'ปกติ' },
  { id: 'FIRE-JOCKEY-1', system: 'ระบบดับเพลิง', category: 'ระบบเครื่องยนต์สูบน้ำดับเพลิง', name: 'Jockey Pump-B-01', status: 'ปกติ' },

  // --- ระบบลิฟต์ (ครบทั้ง 5 ตัว) ---
  { id: 'LIFT-01', system: 'ระบบลิฟต์ และบันไดเลื่อน', category: 'ลิฟต์ตัวที่ 1 ( ลิฟต์ VIP )', name: 'ลิฟต์ตัวที่ 1 ( ลิฟต์ VIP )', status: 'ปกติ' },
  { id: 'LIFT-02', system: 'ระบบลิฟต์ และบันไดเลื่อน', category: 'ลิฟต์ตัวที่ 2 ( ลิฟต์โดยสารฝั่งซ้าย )', name: 'ลิฟต์ตัวที่ 2 ( ลิฟต์โดยสารฝั่งซ้าย )', status: 'ปกติ' },
  { id: 'LIFT-03', system: 'ระบบลิฟต์ และบันไดเลื่อน', category: 'ลิฟต์ตัวที่ 3 ( ลิฟต์โดยสารฝั่งขวา )', name: 'ลิฟต์ตัวที่ 3 ( ลิฟต์โดยสารฝั่งขวา )', status: 'ปกติ' },
  { id: 'LIFT-04', system: 'ระบบลิฟต์ และบันไดเลื่อน', category: 'ลิฟต์ตัวที่ 4 ( ลิฟต์ขนของ )', name: 'ลิฟต์ตัวที่ 4 ( ลิฟต์ขนของ )', status: 'ปกติ' },
  { id: 'LIFT-05', system: 'ระบบลิฟต์ และบันไดเลื่อน', category: 'ลิฟต์ตัวที่ 5 ( ลิฟต์ Fire Man )', name: 'ลิฟต์ตัวที่ 5 ( ลิฟต์ Fire Man )', status: 'ปกติ' },
];

export default function FacilityHub() {
  const [activeTab, setActiveTab] = useState('database'); // dashboard, database, form
  const [selectedSystem, setSelectedSystem] = useState('ระบบลิฟต์ และบันไดเลื่อน');
  const [equipmentList] = useState(rawEquipmentData);

  // กรองข้อมูลตามระบบที่เลือก
  const filteredEquipment = useMemo(() => {
    if (selectedSystem === 'แสดงทั้งหมด') return equipmentList;
    return equipmentList.filter(item => item.system === selectedSystem);
  }, [equipmentList, selectedSystem]);

  // จัดกลุ่มเครื่องจักรย่อย (Category Grouping)
  const groupedEquipment = useMemo(() => {
    return filteredEquipment.reduce((acc, curr) => {
      if (!acc[curr.category]) acc[curr.category] = [];
      acc[curr.category].push(curr);
      return acc;
    }, {});
  }, [filteredEquipment]);

  const systemsList = [
    `แสดงทั้งหมด (${equipmentList.length})`,
    'ระบบไฟฟ้า',
    'ระบบอื่นๆ',
    'ระบบปรับอากาศและระบายอากาศ',
    'ระบบสุขาภิบาล',
    'ระบบดับเพลิง',
    'ระบบลิฟต์ และบันไดเลื่อน'
  ];

  return (
    <div style={{ backgroundColor: '#050b14', minHeight: '100vh', color: '#e2e8f0', fontFamily: 'Sarabun, sans-serif', padding: '20px' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <div style={{ fontSize: '11px', color: '#00f2fe', letterSpacing: '1px', fontWeight: 'bold' }}>THAILAND INSTITUTE OF JUSTICE (TIJ) - BSM DIVISION</div>
          <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#ffffff', margin: '4px 0 0 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#00f2fe' }}>⚡</span> Facility Asset & Maintenance Intelligence Hub
          </h1>
        </div>
        <button style={{ backgroundColor: '#0284c7', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
          🔄 ซิงค์ข้อมูลล่าสุด
        </button>
      </div>

      {/* Nav Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button onClick={() => setActiveTab('dashboard')} style={{ backgroundColor: activeTab === 'dashboard' ? '#00f2fe' : '#0f172a', color: activeTab === 'dashboard' ? '#000' : '#94a3b8', border: '1px solid #1e293b', padding: '10px 18px', borderRadius: '6px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}>
          📊 1. Dashboard สถานะเครื่องจักร
        </button>
        <button onClick={() => setActiveTab('database')} style={{ backgroundColor: activeTab === 'database' ? '#00f2fe' : '#0f172a', color: activeTab === 'database' ? '#000' : '#94a3b8', border: '1px solid #1e293b', padding: '10px 18px', borderRadius: '6px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}>
          📂 2. รายการเครื่องจักรทั้งหมด (Database)
        </button>
        <button onClick={() => setActiveTab('form')} style={{ backgroundColor: activeTab === 'form' ? '#00f2fe' : '#0f172a', color: activeTab === 'form' ? '#000' : '#94a3b8', border: '1px solid #1e293b', padding: '10px 18px', borderRadius: '6px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}>
          📝 3. ฟอร์มใบงานเจ้าหน้าที่ปฏิบัติงาน
        </button>
      </div>

      {/* System Filter Buttons */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {systemsList.map((sys) => {
          const sysNameOnly = sys.split(' (')[0];
          const isSelected = selectedSystem === sysNameOnly || (selectedSystem === 'แสดงทั้งหมด' && sys.startsWith('แสดงทั้งหมด'));
          return (
            <button
              key={sys}
              onClick={() => setSelectedSystem(sysNameOnly)}
              style={{
                backgroundColor: isSelected ? '#00f2fe' : '#0f172a',
                color: isSelected ? '#000' : '#94a3b8',
                border: isSelected ? '1px solid #00f2fe' : '1px solid #1e293b',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: isSelected ? 'bold' : 'normal',
                cursor: 'pointer'
              }}
            >
              {sys}
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div style={{ backgroundColor: '#09111e', border: '1px solid #1e293b', borderRadius: '10px', padding: '20px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#ffffff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#00f2fe' }}>🔹</span> {selectedSystem}
        </h2>

        {/* Group Render */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {Object.entries(groupedEquipment).map(([categoryName, items]) => (
            <div key={categoryName} style={{ borderBottom: '1px solid #1e293b', paddingBottom: '20px' }}>
              
              {/* Folder Header */}
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#00f2fe', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                📁 {categoryName}
              </div>

              {/* Grid of Equipment Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
                {items.map((item, idx) => (
                  <div
                    key={item.id}
                    style={{
                      backgroundColor: '#0c1626',
                      border: '1px solid #00f2fe',
                      borderRadius: '8px',
                      padding: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      justify: 'space-between',
                      minHeight: '80px'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#ffffff', marginBottom: '8px' }}>
                        {item.name}
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                      <span style={{ fontSize: '11px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        ● {item.status}
                      </span>
                      <a
                        href="#"
                        onClick={(e) => { e.preventDefault(); alert(`เลือกทำใบงานสำหรับ: ${item.name}`); }}
                        style={{ fontSize: '11px', color: '#00f2fe', textDecoration: 'none' }}
                      >
                        เลือกทำใบงาน ↗
                      </a>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
      )}
    </div>
  );
}
