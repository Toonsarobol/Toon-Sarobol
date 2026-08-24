'use client';

import React, { useState, useEffect, useMemo } from 'react';

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzrfogs14H_DYFZsY9EiYTCGzmntRL-ciqlbvnZ10udpnMi7gIvORkf8qJ2ETJ5ZPzK7g/exec';

export default function SmartAssetMonitorTIJ() {
  const [sheetData, setSheetData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedSystem, setSelectedSystem] = useState('all');
  const [activeAsset, setActiveAsset] = useState(null);

  const [formData, setFormData] = useState({
    actionType: 'PM (บำรุงรักษาเชิงป้องกัน)',
    jobDetails: '',
    sparePart: '-',
    cost: '',
    technician: 'ทีม BSM-TIJ',
    status: 'ปกติ',
    note: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(APPS_SCRIPT_URL);
      if (!res.ok) throw new Error('เชื่อมต่อ Google Sheet API ไม่สำเร็จ');
      const json = await res.json();
      setSheetData(Array.isArray(json) ? json : []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const assetTree = useMemo(() => {
    if (!sheetData.length) return [];
    const sysMap = new Map();

    sheetData.forEach((row, rowIndex) => {
      const mainSys = row["ระบบเครื่องจักร"] || row["ระบบ"] || "ระบบอื่นๆ";
      const parentDev = row["เครื่องจักรย่อย"] || row["เครื่องจักร"] || "อุปกรณ์ทั่วไป";
      const itemDev = row["ระบบประกอบเครื่องจักร"] || row["ชื่ออุปกรณ์"] || `รายการที่ ${rowIndex + 1}`;

      if (!sysMap.has(mainSys)) sysMap.set(mainSys, new Map());
      const parentMap = sysMap.get(mainSys);
      if (!parentMap.has(parentDev)) parentMap.set(parentDev, []);

      const price = Number(row["ราคา"] || row["ราคาซ่อม"] || 0);
      const status = row["สถานะ"] || 'ปกติ';

      parentMap.get(parentDev).push({
        id: rowIndex,
        name: itemDev,
        price: price,
        status: status,
        rawRow: row
      });
    });

    const result = [];
    sysMap.forEach((parentMap, mainSysName) => {
      const parentList = [];
      parentMap.forEach((itemList, parentName) => {
        parentList.push({ name: parentName, items: itemList });
      });
      result.push({ name: mainSysName, parents: parentList });
    });

    return result;
  }, [sheetData]);

  const stats = useMemo(() => {
    let totalItems = sheetData.length;
    let normal = 0;
    let warning = 0;
    let critical = 0;

    sheetData.forEach(row => {
      const st = row["สถานะ"] || "ปกติ";
      if (st.includes('ปกติ')) normal++;
      else if (st.includes('เฝ้าระวัง')) warning++;
      else if (st.includes('ชำรุด') || st.includes('Critical')) critical++;
      else normal++;
    });

    return { totalItems, normal, warning, critical };
  }, [sheetData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!activeAsset) {
      alert('กรุณาเลือกเครื่องจักร/อุปกรณ์ที่ต้องการปฏิบัติงานก่อน');
      setActiveTab('assets');
      return;
    }

    setIsSubmitting(true);
    setSuccessMsg(false);

    const payload = {
      timestamp: new Date().toLocaleString('th-TH'),
      rowIndex: activeAsset.id,
      mainSystem: activeAsset.mainSys,
      parentMachine: activeAsset.parentName,
      subMachine: activeAsset.name,
      ...formData
    };

    try {
      await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        mode: 'no-cors'
      });
      setSuccessMsg(true);
      setFormData({ actionType: 'PM (บำรุงรักษาเชิงป้องกัน)', jobDetails: '', sparePart: '-', cost: '', technician: 'ทีม BSM-TIJ', status: 'ปกติ', note: '' });
      setTimeout(() => setSuccessMsg(false), 4000);
      loadData();
    } catch (err) {
      alert('บันทึกไม่สำเร็จ: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#070b14', minHeight: '100vh', color: '#e2e8f0', fontFamily: 'system-ui, -apple-system, sans-serif', padding: '16px', boxSizing: 'border-box' }}>
      
      <header style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '14px', marginBottom: '16px', gap: '12px' }}>
        <div>
          <div style={{ color: '#00f2ff', fontSize: '10px', letterSpacing: '2px', fontWeight: 'bold', textTransform: 'uppercase' }}>Thailand Institute of Justice (TIJ) - BSM Division</div>
          <h1 style={{ margin: '4px 0 0 0', fontSize: '18px', color: '#fff', fontWeight: '700' }}>⚡ Facility Asset & Maintenance Intelligence Hub</h1>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={loadData} style={{ background: '#0f172a', color: '#00f2ff', border: '1px solid #00f2ff', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: '600' }}>
            🔄 ซิงค์ข้อมูลล่าสุด
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid #1e293b', paddingBottom: '10px' }}>
        <button 
          onClick={() => setActiveTab('dashboard')}
          style={{ background: activeTab === 'dashboard' ? '#00f2ff' : '#0f172a', color: activeTab === 'dashboard' ? '#070b14' : '#94a3b8', border: '1px solid #1e293b', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          📊 1. Dashboard สถานะเครื่องจักร
        </button>
        <button 
          onClick={() => setActiveTab('assets')}
          style={{ background: activeTab === 'assets' ? '#00f2ff' : '#0f172a', color: activeTab === 'assets' ? '#070b14' : '#94a3b8', border: '1px solid #1e293b', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          🗂️ 2. รายการเครื่องจักรทั้งหมด (Database)
        </button>
        <button 
          onClick={() => setActiveTab('form')}
          style={{ background: activeTab === 'form' ? '#00f2ff' : '#0f172a', color: activeTab === 'form' ? '#070b14' : '#94a3b8', border: '1px solid #1e293b', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          📝 3. ฟอร์มใบงานเจ้าหน้าที่ปฏิบัติงาน
        </button>
      </div>

      {loading ? (
        <div style={{ height: '40vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00f2ff', fontSize: '14px' }}>กำลังโหลดข้อมูลโครงสร้างอาคารจาก Google Sheets...</div>
      ) : error ? (
        <div style={{ height: '40vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', fontSize: '14px' }}>เกิดข้อผิดพลาด: {error}</div>
      ) : (
        <div>

          {activeTab === 'dashboard' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '24px' }}>
                <div style={{ background: '#090d16', border: '1px solid #1e293b', borderRadius: '10px', padding: '16px' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>📦 อุปกรณ์/เครื่องจักรทั้งหมด</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff', marginTop: '6px' }}>{stats.totalItems} <span style={{ fontSize: '12px', color: '#64748b' }}>รายการ</span></div>
                </div>
                <div style={{ background: '#090d16', border: '1px solid #10b981', borderRadius: '10px', padding: '16px' }}>
                  <div style={{ fontSize: '11px', color: '#10b981' }}>🟢 สถานะปกติ</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981', marginTop: '6px' }}>{stats.normal} <span style={{ fontSize: '12px', color: '#64748b' }}>รายการ</span></div>
                </div>
                <div style={{ background: '#090d16', border: '1px solid #f59e0b', borderRadius: '10px', padding: '16px' }}>
                  <div style={{ fontSize: '11px', color: '#f59e0b' }}>🟡 เฝ้าระวัง</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b', marginTop: '6px' }}>{stats.warning} <span style={{ fontSize: '12px', color: '#64748b' }}>รายการ</span></div>
                </div>
                <div style={{ background: '#090d16', border: '1px solid #ef4444', borderRadius: '10px', padding: '16px' }}>
                  <div style={{ fontSize: '11px', color: '#ef4444' }}>🔴 ชำรุดรอซ่อม</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef4444', marginTop: '6px' }}>{stats.critical} <span style={{ fontSize: '12px', color: '#64748b' }}>รายการ</span></div>
                </div>
              </div>

              <div style={{ background: '#090d16', border: '1px solid #1e293b', borderRadius: '10px', padding: '16px' }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#fff' }}>📋 สรุปสถานะแยกตามระบบหลัก</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {assetTree.map((sys, idx) => {
                    let sysTotal = 0;
                    let sysCritical = 0;
                    sys.parents.forEach(p => p.items.forEach(i => {
                      sysTotal++;
                      if(i.status.includes('ชำรุด') || i.status.includes('Critical')) sysCritical++;
                    }));
                    return (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f172a', padding: '10px 14px', borderRadius: '8px', border: '1px solid #1e293b' }}>
                        <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#38bdf8' }}>{sys.name}</span>
                        <div style={{ display: 'flex', gap: '12px', fontSize: '11px' }}>
                          <span style={{ color: '#94a3b8' }}>ทั้งหมด: {sysTotal}</span>
                          <span style={{ color: sysCritical > 0 ? '#ef4444' : '#10b981', fontWeight: 'bold' }}>ปัญหา: {sysCritical}</span>
                          <button 
                            onClick={() => { setSelectedSystem(sys.name); setActiveTab('assets'); }}
                            style={{ background: 'transparent', border: 'none', color: '#00f2ff', cursor: 'pointer', fontSize: '11px', textDecoration: 'underline' }}
                          >
                            ดูรายละเอียด →
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'assets' && (
            <div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                <button
                  onClick={() => setSelectedSystem('all')}
                  style={{ background: selectedSystem === 'all' ? '#00f2ff' : '#0f172a', color: selectedSystem === 'all' ? '#070b14' : '#94a3b8', border: '1px solid #1e293b', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  🌐 แสดงทั้งหมด ({sheetData.length})
                </button>
                {assetTree.map((sys, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedSystem(sys.name)}
                    style={{ background: selectedSystem === sys.name ? '#00f2ff' : '#0f172a', color: selectedSystem === sys.name ? '#070b14' : '#94a3b8', border: '1px solid #1e293b', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    {sys.name}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {(selectedSystem === 'all' ? assetTree : assetTree.filter(s => s.name === selectedSystem)).map((sys, sIdx) => (
                  <div key={sIdx} style={{ background: '#090d16', border: '1px solid #1e293b', borderRadius: '10px', padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', borderBottom: '1px solid #1e293b', paddingBottom: '8px' }}>
                      <div style={{ width: '8px', height: '8px', backgroundColor: '#00f2ff', borderRadius: '50%' }}></div>
                      <h2 style={{ margin: 0, fontSize: '14px', color: '#fff', fontWeight: 'bold' }}>{sys.name}</h2>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingLeft: '10px', borderLeft: '2px dashed #1e293b' }}>
                      {sys.parents.map((parent, pIdx) => (
                        <div key={pIdx} style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', padding: '10px' }}>
                          <div style={{ fontSize: '12px', color: '#38bdf8', fontWeight: 'bold', marginBottom: '8px' }}>📂 {parent.name}</div>
                          
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '8px' }}>
                            {parent.items.map((item) => {
                              const isSelected = activeAsset?.id === item.id;
                              return (
                                <div
                                  key={item.id}
                                  onClick={() => {
                                    setActiveAsset({ ...item, mainSys: sys.name, parentName: parent.name });
                                    setActiveTab('form');
                                  }}
                                  style={{
                                    background: isSelected ? '#1e293b' : '#070b14',
                                    border: isSelected ? '1px solid #00f2ff' : '1px solid #1e293b',
                                    borderRadius: '6px', padding: '10px', cursor: 'pointer', transition: 'all 0.2s'
                                  }}
                                >
                                  <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#fff', marginBottom: '4px' }}>{item.name}</div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '9px' }}>
                                    <span style={{ color: item.status.includes('ชำรุด') ? '#ef4444' : item.status.includes('เฝ้าระวัง') ? '#f59e0b' : '#10b981', fontWeight: 'bold' }}>
                                      ● {item.status}
                                    </span>
                                    <span style={{ color: '#00f2ff', textDecoration: 'underline' }}>เลือกทำใบงาน ↗</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'form' && (
            <div style={{ background: '#090d16', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #1e293b', paddingBottom: '10px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '14px', color: '#fff' }}>📝 ฟอร์มบันทึกใบงานเจ้าหน้าที่ปฏิบัติงาน (BSM-TIJ)</h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#94a3b8' }}>ข้อมูลจะถูกบันทึกส่งตรงเข้า Google Sheets ทันที</p>
                </div>
                <button 
                  onClick={() => setActiveTab('assets')}
                  style={{ background: '#0f172a', border: '1px solid #00f2ff', color: '#00f2ff', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}
                >
                  🔍 เปลี่ยนเลือกเครื่องจักรอื่น
                </button>
              </div>

              {activeAsset ? (
                <div style={{ background: '#0f172a', border: '1px solid #00f2ff', borderRadius: '8px', padding: '12px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '10px', color: '#00f2ff', fontWeight: 'bold' }}>อุปกรณ์ที่เลือกปฏิบัติงาน:</div>
                  <div style={{ fontSize: '13px', color: '#fff', fontWeight: 'bold' }}>{activeAsset.name} <span style={{ fontSize: '11px', color: '#94a3b8' }}>({activeAsset.parentName} / {activeAsset.mainSys})</span></div>
                </div>
              ) : (
                <div style={{ background: '#7f1d1d', border: '1px solid #ef4444', borderRadius: '8px', padding: '10px', marginBottom: '16px', fontSize: '11px', color: '#fca5a5' }}>
                  ⚠️ ยังไม่ได้เลือกเครื่องจักร กรุณาไปเลือกที่แท็บ "รายการเครื่องจักรทั้งหมด" หรือเลือกจากระบบ
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>ประเภทกิจกรรม</label>
                    <select 
                      value={formData.actionType} 
                      onChange={(e) => setFormData({...formData, actionType: e.target.value})}
                      style={{ width: '100%', background: '#070b14', color: '#fff', border: '1px solid #1e293b', padding: '8px', borderRadius: '6px', fontSize: '11px' }}
                    >
                      <option value="PM (บำรุงรักษาเชิงป้องกัน)">🛠️ PM (บำรุงรักษาเชิงป้องกัน)</option>
                      <option value="Repair (ซ่อมแซมแก้ไข)">🔧 Repair (ซ่อมแซมแก้ไข)</option>
                      <option value="Replace Spare Part (เปลี่ยนอะไหล่)">⚙️ Replace Spare Part (เปลี่ยนอะไหล่)</option>
                      <option value="Inspect (ตรวจสอบสภาพ)">🔍 Inspect (ตรวจสอบสภาพ)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>สถานะเครื่องหลังทำเสร็จ</label>
                    <select 
                      value={formData.status} 
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      style={{ width: '100%', background: '#070b14', color: '#fff', border: '1px solid #1e293b', padding: '8px', borderRadius: '6px', fontSize: '11px' }}
                    >
                      <option value="ปกติ">🟢 ปกติ</option>
                      <option value="เฝ้าระวัง">🟡 เฝ้าระวัง</option>
                      <option value="ชำรุดรอซ่อม">🔴 ชำรุดรอซ่อม</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>รายละเอียดการทำงาน / อาการเสีย</label>
                  <textarea 
                    rows="3"
                    placeholder="เช่น ตรวจเช็คระบบตู้ MDB, ทำความสะอาดหน้าสัมผัส หรือเปลี่ยนเบรกเกอร์..." 
                    value={formData.jobDetails}
                    onChange={(e) => setFormData({...formData, jobDetails: e.target.value})}
                    required
                    style={{ width: '100%', background: '#070b14', color: '#fff', border: '1px solid #1e293b', padding: '8px', borderRadius: '6px', fontSize: '11px', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>อะไหล่ที่ใช้ (- ถ้าไม่มี)</label>
                    <input 
                      type="text" 
                      value={formData.sparePart}
                      onChange={(e) => setFormData({...formData, sparePart: e.target.value})}
                      style={{ width: '100%', background: '#070b14', color: '#fff', border: '1px solid #1e293b', padding: '8px', borderRadius: '6px', fontSize: '11px', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>ค่าใช้จ่าย (บาท)</label>
                    <input 
                      type="number" 
                      placeholder="0" 
                      value={formData.cost}
                      onChange={(e) => setFormData({...formData, cost: e.target.value})}
                      style={{ width: '100%', background: '#070b14', color: '#fff', border: '1px solid #1e293b', padding: '8px', borderRadius: '6px', fontSize: '11px', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>ชื่อผู้ปฏิบัติงาน</label>
                    <input 
                      type="text" 
                      value={formData.technician}
                      onChange={(e) => setFormData({...formData, technician: e.target.value})}
                      required
                      style={{ width: '100%', background: '#070b14', color: '#fff', border: '1px solid #1e293b', padding: '8px', borderRadius: '6px', fontSize: '11px', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting || !activeAsset}
                  style={{ background: '#00f2ff', color: '#070b14', fontWeight: 'bold', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', marginTop: '8px', fontSize: '12px' }}
                >
                  {isSubmitting ? 'กำลังบันทึกข้อมูลเข้า Google Sheets...' : '💾 บันทึกใบงานลง Google Sheets'}
                </button>

                {successMsg && (
                  <div style={{ color: '#10b981', fontSize: '12px', textAlign: 'center', marginTop: '4px', fontWeight: 'bold' }}>
                    ✅ บันทึกใบงานเรียบร้อยแล้ว! ข้อมูลถูกส่งเข้า Google Sheets สำเร็จ
                  </div>
                )}
              </form>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
