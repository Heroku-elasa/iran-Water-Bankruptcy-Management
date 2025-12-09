
import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  AreaChart, Area, ReferenceLine
} from 'recharts';
import { useLanguage } from '../contexts/LanguageContext';

// --- MOCK DATA ---
const EXPERIMENTS_DATA = [
  { id: 'sim-1', name: 'Qazvin-Recharge-Plan-A', date: '2 min ago', rmse: 0.45, status: 'converged', color: '#10b981', user: 'Admin', runtime: '45m' },
  { id: 'sim-2', name: 'Drought-Scenario-2025', date: '1 hour ago', rmse: 1.12, status: 'converged', color: '#3b82f6', user: 'Hydrologist 1', runtime: '20m' },
  { id: 'sim-3', name: 'Tehran-Subsidence-Model', date: '1 day ago', rmse: 3.50, status: 'diverged', color: '#ef4444', user: 'System', runtime: '10m' },
];

const CALIBRATION_DATA = [
    { iter: 1, error: 15.2 },
    { iter: 5, error: 8.4 },
    { iter: 10, error: 5.1 },
    { iter: 15, error: 3.2 },
    { iter: 20, error: 1.8 },
    { iter: 25, error: 0.9 },
    { iter: 30, error: 0.45 },
];

const HYDROGRAPH_DATA = [
    { month: 'Jan', observed: 120.5, simulated: 120.2 },
    { month: 'Feb', observed: 120.8, simulated: 120.9 },
    { month: 'Mar', observed: 121.2, simulated: 121.5 },
    { month: 'Apr', observed: 122.0, simulated: 122.3 },
    { month: 'May', observed: 121.5, simulated: 121.8 },
    { month: 'Jun', observed: 119.8, simulated: 120.1 },
    { month: 'Jul', observed: 118.5, simulated: 118.2 },
    { month: 'Aug', observed: 117.2, simulated: 116.8 }, // Divergence due to pumping
    { month: 'Sep', observed: 116.8, simulated: 116.5 },
    { month: 'Oct', observed: 117.5, simulated: 117.2 },
    { month: 'Nov', observed: 118.2, simulated: 118.5 },
    { month: 'Dec', observed: 119.5, simulated: 119.3 },
];

const SAMPLE_CSV = `Well_ID,Date,Depth_to_Water_m,EC_µS_cm,Abstraction_Rate_Lps
PZ-101,2024-01-01,125.4,2400,12.5
PZ-101,2024-02-01,126.1,2450,10.0
PZ-101,2024-03-01,125.8,2410,0.0
PZ-102,2024-01-01,110.2,1800,15.0
PZ-102,2024-02-01,111.5,1850,15.0`;

const FineTuning: React.FC = () => {
  const { t, direction } = useLanguage();
  const [activeTab, setActiveTab] = useState<'studio' | 'dashboard'>('studio');

  // Studio State
  const [isTraining, setIsTraining] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [showSample, setShowSample] = useState(false);
  
  // Model Parameters
  const [conductivity, setConductivity] = useState('5.2');
  const [yieldVal, setYieldVal] = useState('0.15');
  const [aquiferType, setAquiferType] = useState('unconfined');
  const [criticalDepth, setCriticalDepth] = useState('130');
  const [ecThreshold, setEcThreshold] = useState('2500');

  const runSimulation = () => {
    const sequence = [
        `Initializing AI Hydro-Model (LSTM-PDE)...`,
        `Loading Piezometer Data: Verified 45 wells.`,
        `Setting Boundary Conditions: ${aquiferType.toUpperCase()} Aquifer.`,
        `Param: K=${conductivity} m/day, Sy=${yieldVal}`,
        `Safety Config: Depth Limit > ${criticalDepth}m, EC Limit > ${ecThreshold} µS/cm`,
        `Preprocessing: Removing barometric pressure effects...`,
        `Feature Engineering: Adding 'Precipitation' lag layers...`,
        `Mesh Generation: Creating 50x50 finite difference grid...`,
        `Solving Forward Problem (Darcy's Law)...`,
        `Calibration Epoch 1/30 - RMSE: 15.2m`,
        `Calibration Epoch 10/30 - RMSE: 5.1m`,
        `Calibration Epoch 20/30 - RMSE: 1.8m`,
        `Calibration Epoch 30/30 - RMSE: 0.45m`,
        `Optimization Converged.`,
        `Analyzing Alert Thresholds...`,
        `WARNING: Projected Depth 131.2m exceeds Critical Limit (${criticalDepth}m) in Sector 4.`,
        `Generating Iso-Piezometric Lines (Contours)...`,
        `Simulation Complete: Output generated in /exports/sim-2025.nc`
    ];

    setLogs([]);
    setIsTraining(true);
    setProgress(0);
    
    let step = 0;
    const interval = setInterval(() => {
        if (step >= sequence.length) {
            clearInterval(interval);
            setIsTraining(false);
            return;
        }
        setLogs(prev => [...prev, sequence[step]]);
        setProgress(((step + 1) / sequence.length) * 100);
        step++;
    }, 800);
  };

  const handleDownloadSample = () => {
      // Create a blob and trigger download
      const element = document.createElement("a");
      const file = new Blob([SAMPLE_CSV], {type: 'text/csv'});
      element.href = URL.createObjectURL(file);
      element.download = "sample_piezometer_data.csv";
      document.body.appendChild(element);
      element.click();
  };

  return (
    <div className="p-4 md:p-6 w-full bg-[#f0f9ff] min-h-screen pb-32 font-sans" dir={direction}>
      {/* Header with Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 border-b border-gray-200 pb-4">
        <div>
           <h1 className="text-2xl font-bold text-brand-black mb-1">
               {activeTab === 'studio' ? t('ft_studio_title') : t('ft_dash_title')}
           </h1>
           <p className="text-gray-500 text-sm">
                {activeTab === 'studio' ? t('ft_studio_desc') : t('ft_dash_desc')}
           </p>
        </div>
        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-200">
           <button onClick={() => setActiveTab('studio')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'studio' ? 'bg-sky-600 text-white shadow' : 'text-gray-500 hover:text-gray-800'}`}>{t('ft_tab_studio')}</button>
           <button onClick={() => setActiveTab('dashboard')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'dashboard' ? 'bg-sky-600 text-white shadow' : 'text-gray-500 hover:text-gray-800'}`}>{t('ft_tab_dashboard')}</button>
        </div>
      </div>

      {activeTab === 'studio' ? (
        <div className="grid grid-cols-12 gap-6">
            
            {/* --- LEFT PANEL: CONFIG --- */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
                
                {/* 1. Data Input */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-sky-500"></div>
                    <h3 className="font-bold text-brand-black mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                        1. {t('ft_step_1')}
                    </h3>
                    
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-sky-50 transition-colors cursor-pointer group">
                        <svg className="w-10 h-10 text-gray-400 mx-auto mb-2 group-hover:text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                        <p className="text-sm text-gray-600 font-medium">{t('ft_drop_file')}</p>
                        <p className="text-xs text-gray-400 mt-1">.CSV, .XLSX (Max 50MB)</p>
                    </div>

                    <div className="mt-4 flex gap-2">
                        <button onClick={() => setShowSample(!showSample)} className="flex-1 py-2 text-xs border border-gray-300 rounded hover:bg-gray-50 text-gray-600 transition-colors">
                            {showSample ? 'Hide Sample' : 'View Sample CSV'}
                        </button>
                        <button onClick={handleDownloadSample} className="px-3 py-2 text-xs bg-gray-100 rounded hover:bg-gray-200 text-gray-700 transition-colors" title="Download Template">
                            ⬇
                        </button>
                    </div>

                    {showSample && (
                        <div className="mt-3 bg-gray-900 rounded-lg p-3 overflow-x-auto">
                            <pre className="text-[10px] text-green-400 font-mono leading-relaxed">{SAMPLE_CSV}</pre>
                        </div>
                    )}
                </div>

                {/* 2. Parameters */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
                    <h3 className="font-bold text-brand-black mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                        2. {t('ft_step_2')}
                    </h3>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Aquifer Type</label>
                            <select 
                                value={aquiferType}
                                onChange={(e) => setAquiferType(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded p-2 text-sm outline-none focus:border-purple-500 transition-colors"
                            >
                                <option value="unconfined">Unconfined (Free Surface)</option>
                                <option value="confined">Confined (Pressurized)</option>
                                <option value="leaky">Leaky (Semi-Confined)</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1" title="Hydraulic Conductivity">K (m/day)</label>
                                <input 
                                    type="number" 
                                    value={conductivity}
                                    onChange={(e) => setConductivity(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded p-2 text-sm outline-none focus:border-purple-500 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1" title="Specific Yield / Storativity">Sy / S</label>
                                <input 
                                    type="number" 
                                    value={yieldVal}
                                    onChange={(e) => setYieldVal(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded p-2 text-sm outline-none focus:border-purple-500 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1" title="Critical Depth Threshold">Max Depth (m)</label>
                                <input 
                                    type="number" 
                                    value={criticalDepth}
                                    onChange={(e) => setCriticalDepth(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded p-2 text-sm outline-none focus:border-red-500 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1" title="EC Threshold">Max EC (µS/cm)</label>
                                <input 
                                    type="number" 
                                    value={ecThreshold}
                                    onChange={(e) => setEcThreshold(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded p-2 text-sm outline-none focus:border-red-500 transition-colors"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action */}
                <button onClick={runSimulation} disabled={isTraining} className={`w-full py-4 rounded-xl font-bold text-white shadow-lg shadow-sky-900/20 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2 ${isTraining ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600'}`}>
                    {isTraining ? (
                        <>
                           <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                           {t('ft_training')}
                        </>
                    ) : (
                        <>
                           <span>🚀</span> {t('ft_start_btn')}
                        </>
                    )}
                </button>
            </div>

            {/* --- RIGHT PANEL: TERMINAL & VISUALIZATION --- */}
            <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
                
                {/* Terminal */}
                <div className="bg-[#1e293b] rounded-xl overflow-hidden shadow-xl border border-gray-700 flex flex-col h-[400px]">
                    <div className="bg-[#0f172a] px-4 py-2 border-b border-gray-700 flex justify-between items-center">
                        <div className="flex gap-2">
                             <div className="w-3 h-3 rounded-full bg-red-500"></div>
                             <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                             <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        </div>
                        <span className="text-xs text-gray-400 font-mono">hydro_engine_core v2.4</span>
                    </div>
                    <div className="p-4 font-mono text-xs text-green-400 overflow-y-auto flex-1 space-y-1">
                        {logs.length === 0 && (
                            <div className="text-gray-500 italic opacity-50 mt-10 text-center">
                                System Ready.<br/>Waiting for simulation parameters...
                            </div>
                        )}
                        {logs.map((log, i) => (
                            <div key={i} className="animate-in fade-in slide-in-from-bottom-1 duration-300">
                                <span className="text-gray-500 mr-2">[{new Date().toLocaleTimeString()}]</span>
                                <span className={log.includes('Error') ? 'text-red-400' : (log.includes('WARNING') ? 'text-yellow-400 font-bold' : (log.includes('Complete') ? 'text-blue-400 font-bold' : 'text-green-400'))}>
                                    {log}
                                </span>
                            </div>
                        ))}
                        {isTraining && <div className="animate-pulse">_</div>}
                    </div>
                    {progress > 0 && (
                        <div className="h-1 bg-gray-700 w-full">
                            <div className="h-full bg-sky-500 transition-all duration-300" style={{width: `${progress}%`}}></div>
                        </div>
                    )}
                </div>

                {/* Real-time Charts (Convergence) */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-[300px]">
                    <h3 className="font-bold text-gray-700 mb-4 text-xs uppercase">Model Calibration (Error vs Iteration)</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={CALIBRATION_DATA}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="iter" stroke="#94a3b8" fontSize={12} label={{ value: 'Iteration', position: 'insideBottom', dy: 10, fontSize: 10 }} />
                            <YAxis stroke="#94a3b8" fontSize={12} label={{ value: 'RMSE (m)', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                            <Line type="monotone" dataKey="error" stroke="#ef4444" strokeWidth={2} dot={{r: 4}} activeDot={{r: 6}} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
      ) : (
        <div className="space-y-8">
             {/* List */}
             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg text-gray-800">{t('ft_list_title')}</h3>
                    <div className="relative">
                        <input type="text" placeholder={t('ft_search')} className="pl-8 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-1 focus:ring-sky-500 outline-none w-64" />
                        <svg className="w-4 h-4 text-gray-400 absolute left-2.5 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className={`w-full text-sm ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
                        <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wider">
                            <tr>
                                <th className="p-4 rounded-r-lg">{t('ft_col_name')}</th>
                                <th className="p-4">User</th>
                                <th className="p-4">RMSE (Error)</th>
                                <th className="p-4">Runtime</th>
                                <th className="p-4 rounded-l-lg">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {EXPERIMENTS_DATA.map(run => (
                                <tr key={run.id} className="hover:bg-gray-50 transition-colors group cursor-pointer">
                                    <td className="p-4 font-medium text-gray-900 flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full`} style={{backgroundColor: run.color}}></div>
                                        {run.name}
                                    </td>
                                    <td className="p-4 text-gray-500">{run.user}</td>
                                    <td className="p-4 font-mono font-bold text-gray-700">{run.rmse}m</td>
                                    <td className="p-4 text-gray-500">{run.runtime}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${run.status === 'converged' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {run.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
             </div>

             {/* Comparative Chart */}
             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="mb-6">
                    <h3 className="font-bold text-lg text-gray-800">{t('ft_chart_pred')}</h3>
                    <p className="text-gray-500 text-sm">Comparison of Observed Piezometer Levels vs Model Simulation (Qazvin Plain)</p>
                </div>
                <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={HYDROGRAPH_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorObs" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis domain={['auto', 'auto']} stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} label={{ value: 'Elevation (m)', angle: -90, position: 'insideLeft', style: { fill: '#6b7280' } }} />
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            <Area type="monotone" dataKey="observed" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorObs)" name="Observed Head (m)" />
                            <Line type="monotone" dataKey="simulated" stroke="#f59e0b" strokeWidth={3} strokeDasharray="5 5" dot={false} name="Simulated Head (m)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
             </div>
        </div>
      )}
    </div>
  );
};

export default FineTuning;
