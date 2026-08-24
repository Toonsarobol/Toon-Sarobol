'use client';

import React, { useState, useMemo } from 'react';
import { 
  Activity, Wrench, AlertTriangle, DollarSign, Cpu, 
  Layers, ArrowRight, CheckCircle2, XCircle, TrendingDown, RefreshCw 
} from 'lucide-react';

// ตัวอย่างข้อมูลเครื่องจักรและชิ้นส่วนย่อย (จะแมปกับ Google Sheet ของคุณ)
const initialMachines = [
  {
    id: 'M001',
    name: 'AHU-01 (ระบบปรับอากาศชั้น 3)',
    category: 'HVAC',
    parentId: null,
    status: 'Normal',
    purchasePrice: 450000,
    installYear: 2018,
    lifespanYears: 10,
    totalMaintenanceCost: 120000,
    lastPM: '2026-03-15',
  },
  {
    id: 'M001-SUB1',
    name: 'Motor Blower 15HP',
    category: 'Motor',
    parentId: 'M001',
    status: 'Warning',
    purchasePrice: 45000,
    installYear: 2018,
    lifespanYears: 5,
    totalMaintenanceCost: 28000, // เกิน 50% ของราคาซื้อ (28k / 45k) -> ไม่คุ้มซ่อม
    lastPM: '2026-02-10',
  },
  {
    id: 'M001-SUB2',
    name: 'Filter V-Bank AHU-01',
    category: 'Filter',
    parentId: 'M001',
    status: 'Normal',
    purchasePrice: 12000,
    installYear: 2024,
    lifespanYears: 2,
    totalMaintenanceCost: 3500,
    lastPM: '2026-04-01',
  },
  {
    id: 'M001-SUB3',
    name: 'Chilled Water Valve 2"',
    category: 'Valve',
    parentId: 'M001',
    status: 'Normal',
    purchasePrice: 35000,
    installYear: 2018,
    lifespanYears: 8,
    totalMaintenanceCost: 8000,
    lastPM: '2025-11-20',
  },
  {
    id: 'M002',
    name: 'Chiller Plant #2 (150 Tons)',
    category: 'Chiller',
    parentId: null,
    status: 'Critical',
    purchasePrice: 2800000,
    installYear: 2015,
    lifespanYears: 15,
    totalMaintenanceCost: 1650000, // ค่าซ่อมสะสมสูงมาก
    lastPM: '2026-01-05',
  },
  {
    id: 'M002-SUB1',
    name: 'Compressor Screw #1',
    category: 'Compressor',
    parentId: 'M002',
    status: 'Critical',
    purchasePrice: 650000,
    installYear: 2015,
    lifespanYears: 10,
    totalMaintenanceCost: 420000, // ไม่คุ้มซ่อม
    lastPM: '2025-12-12',
  }
];

export default function Dashboard() {
  const [selectedParentId, setSelectedParentId] = useState('M001');

  // คำนวณค่าเสื่อมและสถานะจุดคุ้มทุน
  const calculateFinancials = (m) => {
    const currentYear = 2026;
    const age = Math.max(1, currentYear - m.installYear);
    const annualDepreciation = m.purchasePrice / m.lifespanYears;
    const accumulatedDepreciation = Math.min(m.purchasePrice, annualDepreciation * age);
    const currentBookValue = Math.max(0, m.purchasePrice - accumulatedDepreciation);
    
    // คำนวณอัตราส่วนค่าซ่อมต่อราคาซื้อเครื่องใหม่
    const repairRatio = (m.totalMaintenanceCost / m.purchasePrice) * 100;
    const isWorthRepairing = repairRatio < 50; // ถ้าค่าซ่อมสะสมเกิน 50% ให้แนะนำจัดซื้อใหม่

    return { age, currentBookValue, repairRatio, isWorthRepairing };
  };

  const parentMachines = useMemo(() => initialMachines.filter(m => !m.parentId), []);
  const activeParent = useMemo(() => initialMachines.find(m => m.id === selectedParentId), [selectedParentId]);
  const activeSubMachines = useMemo(() => initialMachines.filter(m => m.parentId === selectedParentId), [selectedParentId]);

  const activeParentFin = activeParent ? calculateFinancials(activeParent) : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
      {/* Header Bar */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></span>
            <h1 className="text-2xl font-bold tracking-tight text-white">BSM-TIJ Smart Engineering Analytics</h1>
          </div>
          <p className="text-slate-400 text-sm mt-1">ระบบวิเคราะห์จุดคุ้มทุนซ่อมบำรุง และแผนผังโครงสร้างเครื่องจักร</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl border border-slate-700 text-xs text-slate-200 transition">
            <RefreshCw className="w-3.5 h-3.5" /> ซิงค์ Google Sheet
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        
        {/* Left Sidebar: เครื่องจักรหลัก */}
        <div className="lg:col-span-4 bg-slate-900/80 rounded-2xl border border-slate-800 p-5">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" /> เครื่องจักรหลัก (Main Systems)
          </h2>
          <div className="space-y-3">
            {parentMachines.map((m) => {
              const isSelected = m.id === selectedParentId;
              const fin = calculateFinancials(m);
              return (
                <div
                  key={m.id}
                  onClick={() => setSelectedParentId(m.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-cyan-950/40 border-cyan-500/80 ring-1 ring-cyan-500/50' 
                      : 'bg-slate-800/40 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-mono text-cyan-400">{m.id}</span>
                      <h3 className="font-semibold text-slate-100 mt-0.5">{m.name}</h3>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      m.status === 'Normal' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      m.status === 'Warning' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {m.status}
                    </span>
                  </div>
                  
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-400 pt-2 border-t border-slate-800/60">
                    <div>มูลค่าคงเหลือ: <span className="text-slate-200">฿{fin.currentBookValue.toLocaleString()}</span></div>
                    <div>สัดส่วนค่าซ่อม: <span className={fin.repairRatio > 50 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>{fin.repairRatio.toFixed(1)}%</span></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Center/Right Area: Topology Diagram & Financial Breakdown */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Active System Financial Executive Summary */}
          {activeParent && activeParentFin && (
            <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-mono text-cyan-400">{activeParent.id}</span>
                  <h2 className="text-xl font-bold text-white">{activeParent.name}</h2>
                </div>
                {/* Decision Badge */}
                <div className={`px-4 py-2 rounded-xl flex items-center gap-2 border ${
                  activeParentFin.isWorthRepairing 
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300' 
                    : 'bg-rose-950/40 border-rose-500/50 text-rose-300'
                }`}>
                  {activeParentFin.isWorthRepairing ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5 animate-pulse" />}
                  <div>
                    <div className="text-xs font-semibold">การวิเคราะห์ความคุ้มค่า</div>
                    <div className="text-sm font-bold">
                      {activeParentFin.isWorthRepairing ? 'คุ้มค่าซ่อมบำรุงเปลี่ยนอะไหล่' : 'ไม่คุ้มค่าซ่อม! แนะนำเสนอจัดซื้อใหม่'}
                    </div>
                  </div>
                </div>
              </div>

              {/* KPI Cards Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                  <div className="text-xs text-slate-400">ราคาจัดซื้อเดิม</div>
                  <div className="text-base font-bold text-slate-100 mt-1">฿{activeParent.purchasePrice.toLocaleString()}</div>
                </div>
                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                  <div className="text-xs text-slate-400">มูลค่าทางบัญชีปัจจุบัน</div>
                  <div className="text-base font-bold text-cyan-400 mt-1">฿{activeParentFin.currentBookValue.toLocaleString()}</div>
                </div>
                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                  <div className="text-xs text-slate-400">ค่าซ่อม/อะไหล่สะสม</div>
                  <div className="text-base font-bold text-amber-400 mt-1">฿{activeParent.totalMaintenanceCost.toLocaleString()}</div>
                </div>
                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                  <div className="text-xs text-slate-400">อัตราค่าซ่อม / ราคาเครื่อง</div>
                  <div className={`text-base font-bold mt-1 ${activeParentFin.repairRatio > 50 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {activeParentFin.repairRatio.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Interactive Node Topology (แผนผังกราฟิกเชื่อมโยง) */}
          <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" /> แผนผังการเชื่อมโยงระบบย่อย (Machine Topology Network)
            </h3>

            {/* Graphic Diagram Container */}
            <div className="relative p-6 bg-slate-950/80 rounded-xl border border-slate-800 min-h-[300px] flex flex-col md:flex-row items-center justify-between gap-8">
              
              {/* Main Machine Node */}
              <div className="z-10 w-full md:w-1/3 bg-cyan-950/40 border-2 border-cyan-500/80 rounded-xl p-4 text-center shadow-lg shadow-cyan-500/10">
                <div className="text-xs text-cyan-400 font-mono mb-1">MAIN NODE</div>
                <div className="font-bold text-white text-base">{activeParent?.name}</div>
                <div className="text-xs text-slate-400 mt-2">อายุ {activeParentFin?.age} ปี / {activeParent?.lifespanYears} ปี</div>
              </div>

              {/* Connecting Graphic Lines (สำหรับ Desktop) */}
              <div className="hidden md:flex flex-col items-center justify-center text-cyan-500/60">
                <div className="text-xs font-mono text-slate-500 mb-1">CONNECTIVITY</div>
                <div className="flex items-center gap-1">
                  <div className="w-12 h-0.5 bg-gradient-to-r from-cyan-500 to-indigo-500"></div>
                  <ArrowRight className="w-5 h-5 text-indigo-400 animate-pulse" />
                </div>
              </div>

              {/* Sub Machine / Spare Part Nodes */}
              <div className="w-full md:w-1/2 space-y-3 z-10">
                {activeSubMachines.length > 0 ? (
                  activeSubMachines.map((sub) => {
                    const subFin = calculateFinancials(sub);
                    return (
                      <div 
                        key={sub.id} 
                        className={`p-3.5 rounded-xl border transition-all ${
                          !subFin.isWorthRepairing 
                            ? 'bg-rose-950/20 border-rose-500/50 hover:bg-rose-950/30' 
                            : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="text-xs font-mono text-slate-400">{sub.id}</div>
                            <div className="text-sm font-semibold text-slate-100">{sub.name}</div>
                          </div>
                          <div className="text-right">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              subFin.isWorthRepairing 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold'
                            }`}>
                              {subFin.isWorthRepairing ? 'คุ้มซ่อม' : 'ควรเปลี่ยนใหม่'}
                            </span>
                            <div className="text-xs text-slate-400 mt-1">
                              สะสม: ฿{sub.totalMaintenanceCost.toLocaleString()} ({subFin.repairRatio.toFixed(0)}%)
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-slate-500 text-sm">
                    ไม่มีหมวดย่อยผูกไว้กับเครื่องนี้
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
